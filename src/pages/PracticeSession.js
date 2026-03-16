import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { practiceAPI, progressAPI } from '../services/api';
import './PracticeSession.css';

// ── Split content into 5-sentence chunks (UPDATED VERSION) ──
const splitContentIntoChunks = (text) => {
  console.log('🔄 Splitting text into 5-sentence chunks...');
  
  // Split into sentences
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  
  console.log(`📝 Found ${sentences.length} sentences total`);
  
  // Group into chunks of 5 sentences each
  const chunks = [];
  const SENTENCES_PER_CHUNK = 5;
  
  for (let i = 0; i < sentences.length; i += SENTENCES_PER_CHUNK) {
    const chunk = sentences.slice(i, i + SENTENCES_PER_CHUNK).join(' ');
    chunks.push(chunk);
  }
  
  console.log(`📦 Created ${chunks.length} chunks of ${SENTENCES_PER_CHUNK} sentences each`);
  console.log('First chunk:', chunks[0]);
  
  return chunks.length > 0 ? chunks : [text];
};

// ── Count errors between typed and target ─────────────────
const countErrors = (typed, target) => {
  let errs = 0;
  const maxLen = Math.max(typed.length, target.length);
  for (let i = 0; i < maxLen; i++) {
    if (typed[i] !== target[i]) errs++;
  }
  return errs;
};

const PracticeSession = () => {
  const { sessionNumber } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // Chunk state
  const [chunks, setChunks]             = useState([]);
  const [chunkIndex, setChunkIndex]     = useState(0);
  const [userInput, setUserInput]       = useState('');
  const [chunkPhase, setChunkPhase]     = useState('visible'); // visible | fadeout | fadein
  const [chunkErrors, setChunkErrors]   = useState([]); // errors per chunk

  // Stats
  const [totalErrors, setTotalErrors]   = useState(0);
  const [totalChars, setTotalChars]     = useState(0);
  const [timeElapsed, setTimeElapsed]   = useState(0);
  const [isComplete, setIsComplete]     = useState(false);
  const [showResults, setShowResults]   = useState(false);

  const inputRef   = useRef(null);
  const timerRef   = useRef(null);
  const startRef   = useRef(null);
  const errorsRef  = useRef(0);
  const charsRef   = useRef(0);

  // ── Load session ─────────────────────────────────────────
  useEffect(() => {
    fetchSession();
    return () => clearInterval(timerRef.current);
  }, [sessionNumber]);

  const fetchSession = async () => {
    try {
      const res = await practiceAPI.getSession(sessionNumber);
      const data = res.data;
      setSessionData(data);
      setChunks(splitContentIntoChunks(data.content));
    } catch {
      setError('Failed to load practice session');
    } finally {
      setLoading(false);
    }
  };

  // Keep input focused
  useEffect(() => {
    if (!isComplete && inputRef.current) inputRef.current.focus();
  }, [isComplete, chunkIndex]);

  // ── Timer ────────────────────────────────────────────────
  const startTimer = () => {
    if (startRef.current) return;
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
  };

  // ── WPM ──────────────────────────────────────────────────
  const calcWpm = () => {
    if (!startRef.current || charsRef.current === 0) return 0;
    const mins = (Date.now() - startRef.current) / 60000;
    if (mins < 0.01) return 0;
    return Math.round((charsRef.current / 5) / mins);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current);
    const elapsed = startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0;
    setTimeElapsed(elapsed);

    const mins = elapsed / 60 || 0.1;
    const wpm = Math.round((charsRef.current / 5) / mins);
    const totalLen = chunks.join(' ').length || 1;
    const accuracy = Math.max(0, Math.round(((totalLen - errorsRef.current) / totalLen) * 100));

    try {
      await progressAPI.submitPractice({
        sessionNumber: parseInt(sessionNumber),
        wpm,
        accuracy
      });
    } catch (e) {
      console.error('Submit error', e);
    }
    setIsComplete(true);
    setShowResults(true);
  }, [chunks, sessionNumber]);

  // ── Advance to next chunk ─────────────────────────────────
  const advanceChunk = useCallback(() => {
    const currentChunk = chunks[chunkIndex] || '';

    // Calculate errors for this chunk
    const errs = countErrors(userInput.trim(), currentChunk.replace(/\s+$/, ''));
    errorsRef.current += errs;
    charsRef.current  += currentChunk.length;
    setTotalErrors(errorsRef.current);
    setTotalChars(charsRef.current);
    setChunkErrors(prev => [...prev, errs]);

    const next = chunkIndex + 1;

    if (next >= chunks.length) {
      // Last chunk done
      setChunkPhase('fadeout');
      setTimeout(() => handleSubmit(), 300);
      return;
    }

    // Fade out → swap → fade in
    setChunkPhase('fadeout');
    setTimeout(() => {
      setChunkIndex(next);
      setUserInput('');
      setChunkPhase('fadein');
      setTimeout(() => setChunkPhase('visible'), 250);
    }, 280);
  }, [chunkIndex, chunks, userInput, handleSubmit]);

  // ── Input handler ─────────────────────────────────────────
  const handleInputChange = (e) => {
    if (isComplete) return;
    if (!startRef.current) startTimer();
    setUserInput(e.target.value);
  };

  // ── Enter key → advance chunk ─────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (chunkPhase !== 'visible') return;
      if (!userInput.trim()) return; // don't advance on empty
      advanceChunk();
    }
  };

  // ── Render target chunk text ──────────────────────────────
  // Show plain text + ↵ symbol at end to signal Enter
  const renderChunk = () => {
    const chunk = chunks[chunkIndex] || '';
    return (
      <>
        {chunk}
        <span className="enter-hint">↵</span>
      </>
    );
  };

  // ── Loading / Error ───────────────────────────────────────
  if (loading) return <div className="loading">Loading practice session...</div>;
  if (error || !sessionData) return (
    <div className="ps-container">
      <div className="error">{error || 'Session not found'}</div>
      <button className="btn btn-primary" onClick={() => navigate('/practice')}>Back to Practice</button>
    </div>
  );

  const progressPct  = chunks.length > 0 ? Math.round((chunkIndex / chunks.length) * 100) : 0;
  const liveAccuracy = charsRef.current > 0
    ? Math.max(0, Math.round(((charsRef.current - errorsRef.current) / charsRef.current) * 100))
    : 100;

  // Final result stats
  const resultElapsed  = timeElapsed;
  const resultWpm      = (() => {
    const mins = resultElapsed / 60 || 0.1;
    return Math.round((charsRef.current / 5) / mins);
  })();
  const resultAccuracy = chunks.length > 0
    ? Math.max(0, Math.round(((chunks.join(' ').length - errorsRef.current) / chunks.join(' ').length) * 100))
    : 100;

  return (
    <div className="ps-container">
      {/* ── Header ── */}
      <div className="ps-header">
        <h3>Practice Session {sessionData.sessionNumber}</h3>
        <span className="ps-divider">|</span>
        <p>{sessionData.title}</p>
      </div>

      <div className="ps-main">

        {/* ── Left Vertical Progress Bar ── */}
        <div className="ps-progress-wrap">
          <div className="ps-progress-bar">
            <div className="ps-progress-fill" style={{ height: `${progressPct}%` }} />
          </div>
          <div className="ps-progress-label">{progressPct}%</div>
        </div>

        {/* ── Main typing area ── */}
        <div className="ps-typing-area">

          {/* Target chunk */}
          <div className={`ps-target chunk-${chunkPhase}`}>
            {renderChunk()}
          </div>

          {/* Input */}
          {!isComplete && (
            <textarea
              ref={inputRef}
              className="ps-input"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type here… press Enter ↵ when done with this sentence"
              autoFocus
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          )}

          {/* Chunk error feedback strip */}
          {chunkErrors.length > 0 && (
            <div className="ps-chunk-feedback">
              {chunkErrors.map((e, i) => (
                <div key={i} className={`ps-chunk-badge ${e === 0 ? 'perfect' : e <= 2 ? 'good' : 'poor'}`}>
                  S{i + 1}: {e === 0 ? '✓' : `${e}err`}
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          {!isComplete && (
            <div className="ps-buttons">
              <button className="btn-control btn-submit" onClick={handleSubmit}>Submit</button>
              <button className="btn-control btn-exit" onClick={() => navigate('/practice')}>Exit</button>
            </div>
          )}
        </div>

        {/* ── Right Stats Panel ── */}
        {!isComplete && (
          <div className="ps-stats-panel">
            <div className="ps-stat">
              <div className="ps-stat-label">⏱️ TIME</div>
              <div className="ps-stat-value timer-color">{formatTime(timeElapsed)}</div>
            </div>
            <div className="ps-stat">
              <div className="ps-stat-label">✓ ACCURACY</div>
              <div className="ps-stat-value accuracy-color">{liveAccuracy}%</div>
            </div>
            <div className="ps-stat">
              <div className="ps-stat-label">❌ ERRORS</div>
              <div className="ps-stat-value error-color">{totalErrors}</div>
            </div>
            <div className="ps-stat">
              <div className="ps-stat-label">⚡ WPM</div>
              <div className="ps-stat-value wpm-color">{calcWpm()}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Results Modal ── */}
      {showResults && (
        <div className="results-modal">
          <div className="results-content">
            <h2>Practice Complete! 🎉</h2>
            <div className="results-stats">
              <div className="result-stat"><h3>{resultWpm}</h3><p>Words Per Minute</p></div>
              <div className="result-stat"><h3>{resultAccuracy}%</h3><p>Accuracy</p></div>
              <div className="result-stat"><h3>{formatTime(resultElapsed)}</h3><p>Time Taken</p></div>
              <div className="result-stat"><h3>{errorsRef.current}</h3><p>Total Errors</p></div>
            </div>
            <div className="results-actions">
              <button className="btn btn-primary" onClick={() => navigate('/practice')}>Back to Practice</button>
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>Try Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeSession;
