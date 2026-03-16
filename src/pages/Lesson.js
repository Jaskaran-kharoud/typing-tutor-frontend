import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chaptersAPI, progressAPI } from '../services/api';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { useLanguage } from '../contexts/LanguageContext';
import './Lesson.css';

// ── Punjabi Inscript map: e.key → Gurmukhi character ────────────────────────
const INSCRIPT_MAP = {
  'q':'ੌ','w':'ੈ','e':'ਾ','r':'ੀ','t':'ੂ',
  'y':'ਬ','u':'ਹ','i':'ਗ','o':'ਦ','p':'ਜ',
  '[':'ਡ',']':'਼',
  'a':'ੋ','s':'ੇ','d':'੍','f':'ਿ','g':'ੁ',
  'h':'ਪ','j':'ਰ','k':'ਕ','l':'ਤ',';':'ਚ',"'":'ਟ',
  'z':'ੱ','x':'ਂ','c':'ਮ','v':'ਨ','b':'ਵ',
  'n':'ਲ','m':'ਸ',',':',','.':'.','/':'ਯ',' ':' ',
  'Q':'ਔ','W':'ਐ','E':'ਆ','R':'ਈ','T':'ਊ',
  'Y':'ਭ','U':'ਙ','I':'ਘ','O':'ਧ','P':'ਝ',
  '{':'ਢ','}':'ਞ',
  'A':'ਓ','S':'ਏ','D':'ਅ','F':'ਇ','G':'ਉ',
  'H':'ਫ','J':'ੜ','K':'ਖ','L':'ਥ',':':'ਛ','"':'ਠ',
  'Z':'ਃ','X':'ਁ','C':'ਣ','V':'ੲ','B':'ੳ',
  'N':'ਲ਼','M':'ਸ਼','>':'।',
};

const BLOCKING_TYPES = ['intro', 'random-words', 'meaningful-words'];

// ── Count errors (paragraph mode) ────────────────────────────────────────────
const countErrors = (typed, target) => {
  let errs = 0;
  const maxLen = Math.max(typed.length, target.length);
  for (let i = 0; i < maxLen; i++) {
    if (typed[i] !== target[i]) errs++;
  }
  return errs;
};

// ── Split content into chunks ─────────────────────────────────────────────────
const splitIntoLines = (text, lessonType) => {
  if (lessonType === 'paragraph') {
    // Identical to PracticeSession: 5 sentences per chunk
    const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
    const chunks = [];
    for (let i = 0; i < sentences.length; i += 5)
      chunks.push(sentences.slice(i, i + 5).join(' '));
    return chunks.length > 0 ? chunks : [text];
  }

  if (lessonType === 'sentences') {
    const MAX = 52;
    const raw = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
    const sentences = raw.length > 0 ? raw : [text];
    const chunks = [];
    for (const sentence of sentences) {
      if (sentence.length <= MAX) { chunks.push(sentence); continue; }
      const words = sentence.split(/\s+/);
      let cur = '';
      for (const w of words) {
        const cand = cur ? cur + ' ' + w : w;
        if (cand.length > MAX && cur) { chunks.push(cur); cur = w; }
        else cur = cand;
      }
      if (cur) chunks.push(cur);
    }
    return chunks.length > 0 ? chunks : [text];
  }

  // intro / random-words / meaningful-words — character-length chunks
  const MAX = 48;
  const words = text.trim().split(/\s+/);
  const chunks = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? cur + ' ' + w : w;
    if (cand.length > MAX && cur) { chunks.push(cur); cur = w; }
    else cur = cand;
  }
  if (cur) chunks.push(cur);
  return chunks.length > 0 ? chunks : [text];
};

const Lesson = () => {
  const { chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [lessonData, setLessonData]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lines, setLines]             = useState([]);
  const [lineIndex, setLineIndex]     = useState(0);
  const [linePhase, setLinePhase]     = useState('visible');
  const [charIndex, setCharIndex]     = useState(0);
  const [wrongChar, setWrongChar]     = useState(false);
  const [chunkErrors, setChunkErrors] = useState([]);
  const [userInput, setUserInput]     = useState('');
  const [totalChars, setTotalChars]   = useState(0);
  const [errors, setErrors]           = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isComplete, setIsComplete]   = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastKeyCorrect, setLastKeyCorrect] = useState(null);

  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const startRef  = useRef(null);
  const errorsRef = useRef(0);
  const charsRef  = useRef(0);

  // ─── Load ────────────────────────────────────────────────
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await chaptersAPI.getLesson(chapterId, lessonId);
        const data = res.data;
        setLessonData(data);
        setLines(splitIntoLines(data.lesson.content, data.lesson.lessonType));
      } catch {
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
    return () => clearInterval(timerRef.current);
  }, [chapterId, lessonId]);

  useEffect(() => {
    if (!isComplete && inputRef.current) inputRef.current.focus();
  }, [isComplete, lineIndex]);

  // ─── Timer ───────────────────────────────────────────────
  const startTimer = () => {
    if (startRef.current) return;
    startRef.current = Date.now();
    timerRef.current = setInterval(() =>
      setTimeElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 500);
  };
  const calcWpm = () => {
    if (!startRef.current || charsRef.current === 0) return 0;
    const mins = (Date.now() - startRef.current) / 60000;
    return mins < 0.01 ? 0 : Math.round((charsRef.current / 5) / mins);
  };
  const formatTime = (secs) => `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;

  // ─── Submit ───────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current);
    const elapsed = startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0;
    setTimeElapsed(elapsed);
    const mins = elapsed / 60 || 0.1;
    const wpm = Math.round((charsRef.current / 5) / mins);
    const totalLen = lines.join(' ').length || 1;
    const accuracy = Math.max(0, Math.round(((totalLen - errorsRef.current) / totalLen) * 100));
    try { await progressAPI.submitLesson({ chapterId, lessonId, wpm, accuracy }); }
    catch (e) { console.error('Submit failed', e); }
    setIsComplete(true);
    setShowResults(true);
  }, [chapterId, lessonId, lines]);

  // ─── Advance line (non-paragraph) ────────────────────────
  const advanceToNextLine = useCallback(() => {
    setLinePhase('fadeout');
    setTimeout(() => {
      setLineIndex(prev => {
        const next = prev + 1;
        if (next >= lines.length) { handleSubmit(); return prev; }
        return next;
      });
      setCharIndex(0);
      setUserInput('');
      setWrongChar(false);
      setLinePhase('fadein');
      setTimeout(() => setLinePhase('visible'), 250);
    }, 280);
  }, [lines.length, handleSubmit]);

  // ─── Advance chunk (paragraph — exact PracticeSession logic) ─────────────
  const advanceChunk = useCallback((currentInput, currentIdx) => {
    const currentChunk = lines[currentIdx] || '';
    const errs = countErrors(currentInput.trim(), currentChunk.replace(/\s+$/, ''));
    errorsRef.current += errs;
    charsRef.current  += currentChunk.length;
    setErrors(errorsRef.current);
    setTotalChars(charsRef.current);
    setChunkErrors(prev => [...prev, errs]);
    const next = currentIdx + 1;
    if (next >= lines.length) {
      setLinePhase('fadeout');
      setTimeout(() => handleSubmit(), 300);
      return;
    }
    setLinePhase('fadeout');
    setTimeout(() => {
      setLineIndex(next);
      setUserInput('');
      setLinePhase('fadein');
      setTimeout(() => setLinePhase('visible'), 250);
    }, 280);
  }, [lines, handleSubmit]);

  // ─── Input change ─────────────────────────────────────────
  const handleInputChange = (e) => {
    if (linePhase !== 'visible' || isComplete) return;
    if (language === 'punjabi') return;
    if (BLOCKING_TYPES.includes(lessonData?.lesson?.lessonType)) return;
    const value = e.target.value;
    const lessonType = lessonData?.lesson?.lessonType;
    if (!startRef.current) startTimer();
    if (lessonType === 'paragraph') { setUserInput(value); return; }
    // Sentences
    const currentLine = lines[lineIndex] || '';
    const isDeleting = value.length < userInput.length;
    if (isDeleting) {
      setUserInput(value);
      if (!wrongChar) setCharIndex(prev => Math.max(0, prev - 1));
      setWrongChar(false); setLastKeyCorrect(null); return;
    }
    if (wrongChar) return;
    const typedChar    = value[value.length - 1];
    const expectedChar = currentLine[charIndex];
    if (typedChar !== expectedChar) {
      errorsRef.current += 1; setErrors(errorsRef.current);
      setWrongChar(true); setLastKeyCorrect(false); setUserInput(value); return;
    }
    setWrongChar(false); setLastKeyCorrect(true); setUserInput(value);
    charsRef.current += 1; setTotalChars(charsRef.current);
    const newCI = charIndex + 1; setCharIndex(newCI);
    if (newCI >= currentLine.length) advanceToNextLine();
  };

  // ─── Key handler ──────────────────────────────────────────
  const handleKeyDown = (e) => {
    const lessonType  = lessonData?.lesson?.lessonType;
    const isParagraph = lessonType === 'paragraph';
    const isPunjabi   = language === 'punjabi';
    const isBlocking  = BLOCKING_TYPES.includes(lessonType);

    // Paragraph Enter — both English and Punjabi
    if (isParagraph && e.key === 'Enter') {
      e.preventDefault();
      if (linePhase !== 'visible' || isComplete || !userInput.trim()) return;
      advanceChunk(userInput, lineIndex);
      return;
    }

    if (isPunjabi) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter') return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (linePhase !== 'visible' || isComplete) return;
        if (!isParagraph && isBlocking) return;
        setUserInput(prev => prev.slice(0, -1));
        if (!isParagraph && !wrongChar) setCharIndex(prev => Math.max(0, prev - 1));
        setWrongChar(false); setLastKeyCorrect(null); return;
      }
      if (e.key === 'Enter') return;

      e.preventDefault();
      if (linePhase !== 'visible' || isComplete) return;
      const mapped = INSCRIPT_MAP[e.key];
      if (!mapped) return;
      if (!startRef.current) startTimer();

      if (isParagraph) { setUserInput(prev => prev + mapped); return; }

      const currentLine  = lines[lineIndex] || '';
      const expectedChar = currentLine[charIndex];

      if (isBlocking) {
        if (wrongChar) {
          if (mapped === expectedChar) {
            setWrongChar(false); setLastKeyCorrect(true);
            setUserInput(prev => prev + mapped);
            charsRef.current += 1; setTotalChars(charsRef.current);
            const newCI = charIndex + 1; setCharIndex(newCI);
            if (newCI >= currentLine.length) advanceToNextLine();
          }
          return;
        }
        if (mapped !== expectedChar) {
          errorsRef.current += 1; setErrors(errorsRef.current);
          setWrongChar(true); setLastKeyCorrect(false); return;
        }
        setWrongChar(false); setLastKeyCorrect(true);
        setUserInput(prev => prev + mapped);
        charsRef.current += 1; setTotalChars(charsRef.current);
        const newCI = charIndex + 1; setCharIndex(newCI);
        if (newCI >= currentLine.length) advanceToNextLine();
        return;
      }
      // Sentences Punjabi
      if (wrongChar) return;
      if (mapped !== expectedChar) {
        errorsRef.current += 1; setErrors(errorsRef.current);
        setWrongChar(true); setLastKeyCorrect(false);
        setUserInput(prev => prev + mapped); return;
      }
      setWrongChar(false); setLastKeyCorrect(true);
      setUserInput(prev => prev + mapped);
      charsRef.current += 1; setTotalChars(charsRef.current);
      const newCI = charIndex + 1; setCharIndex(newCI);
      if (newCI >= currentLine.length) advanceToNextLine();
      return;
    }

    // English blocking
    if (!isPunjabi && isBlocking) {
      if (e.key === 'Backspace') { e.preventDefault(); return; }
      if (e.key.length !== 1) return;
      e.preventDefault();
      if (linePhase !== 'visible' || isComplete) return;
      if (!startRef.current) startTimer();
      const currentLine  = lines[lineIndex] || '';
      const expectedChar = currentLine[charIndex];
      if (wrongChar) {
        if (e.key === expectedChar) {
          setWrongChar(false); setLastKeyCorrect(true);
          setUserInput(prev => prev + e.key);
          charsRef.current += 1; setTotalChars(charsRef.current);
          const newCI = charIndex + 1; setCharIndex(newCI);
          if (newCI >= currentLine.length) advanceToNextLine();
        }
        return;
      }
      if (e.key !== expectedChar) {
        errorsRef.current += 1; setErrors(errorsRef.current);
        setWrongChar(true); setLastKeyCorrect(false); return;
      }
      setWrongChar(false); setLastKeyCorrect(true);
      setUserInput(prev => prev + e.key);
      charsRef.current += 1; setTotalChars(charsRef.current);
      const newCI = charIndex + 1; setCharIndex(newCI);
      if (newCI >= currentLine.length) advanceToNextLine();
    }
  };

  // ─── Render ───────────────────────────────────────────────
  const renderLine = () => {
    const line = lines[lineIndex] || '';
    if (lessonData?.lesson?.lessonType === 'paragraph') {
      return (<>{line}<span className="enter-hint">↵</span></>);
    }
    return line.split('').map((char, i) => {
      let cls = '';
      if (i < charIndex)        cls = 'correct';
      else if (i === charIndex) cls = wrongChar ? 'incorrect' : 'current';
      return <span key={i} className={cls}>{char}</span>;
    });
  };

  const getCurrentKey = () => {
    if (isComplete || !lines[lineIndex]) return null;
    return lines[lineIndex][charIndex] || null;
  };

  // ─── Loading / Error ──────────────────────────────────────
  if (loading) return <div className="loading">Loading lesson...</div>;
  if (error || !lessonData) return (
    <div className="container">
      <div className="error">{error || 'Lesson not found'}</div>
      <button className="btn btn-primary" onClick={() => navigate('/learn')}>Back to Lessons</button>
    </div>
  );

  const { chapter, lesson } = lessonData;
  const isParagraphLesson = lesson.lessonType === 'paragraph';
  const liveAccuracy = totalChars > 0 ? Math.round(((totalChars - errors) / totalChars) * 100) : 100;
  const progressPct  = lines.length > 0 ? Math.round((lineIndex / lines.length) * 100) : 0;
  const resultElapsed  = timeElapsed;
  const resultWpm      = (() => { const m = resultElapsed/60||0.1; return Math.round((charsRef.current/5)/m); })();
  const resultAccuracy = lines.length > 0
    ? Math.max(0, Math.round(((lines.join(' ').length - errorsRef.current) / lines.join(' ').length) * 100))
    : 100;

  // ════════════════════════════════════════════════════════════
  // PARAGRAPH LESSON — identical layout & logic to PracticeSession
  // ════════════════════════════════════════════════════════════
  if (isParagraphLesson) {
    return (
      <div className="ps-container">
        <div className="ps-header">
          <h3>Chapter {chapter.chapterNumber} • Lesson {lesson.lessonNumber}</h3>
          <span className="ps-divider">|</span>
          <p>{lesson.lessonTitle}</p>
        </div>

        <div className="ps-main">
          <div className="ps-progress-wrap">
            <div className="ps-progress-bar">
              <div className="ps-progress-fill" style={{ height: `${progressPct}%` }} />
            </div>
            <div className="ps-progress-label">{progressPct}%</div>
          </div>

          <div className="ps-typing-area">
            <div
              className={`ps-target chunk-${linePhase}`}
              style={language === 'punjabi' ? { fontFamily: "'Raavi','Noto Sans Gurmukhi',sans-serif" } : undefined}
            >
              {renderLine()}
            </div>

            {!isComplete && (
              <textarea
                ref={inputRef}
                className="ps-input"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type here… press Enter ↵ when done"
                autoFocus spellCheck="false" autoComplete="off"
                autoCorrect="off" autoCapitalize="off"
                style={language === 'punjabi' ? { fontFamily: "'Raavi','Noto Sans Gurmukhi',sans-serif", fontSize: '1.2rem' } : undefined}
              />
            )}

            {chunkErrors.length > 0 && (
              <div className="ps-chunk-feedback">
                {chunkErrors.map((e, i) => (
                  <div key={i} className={`ps-chunk-badge ${e===0?'perfect':e<=2?'good':'poor'}`}>
                    S{i+1}: {e===0?'✓':`${e}err`}
                  </div>
                ))}
              </div>
            )}

            {!isComplete && (
              <div className="ps-buttons">
                <button className="btn-control btn-submit" onClick={handleSubmit}>Submit</button>
                <button className="btn-control btn-exit" onClick={() => navigate('/learn')}>Exit</button>
              </div>
            )}
          </div>

          {!isComplete && (
            <div className="ps-stats-panel">
              <div className="ps-stat"><div className="ps-stat-label">⏱️ TIME</div><div className="ps-stat-value timer-color">{formatTime(timeElapsed)}</div></div>
              <div className="ps-stat"><div className="ps-stat-label">✓ ACCURACY</div><div className="ps-stat-value accuracy-color">{liveAccuracy}%</div></div>
              <div className="ps-stat"><div className="ps-stat-label">❌ ERRORS</div><div className="ps-stat-value error-color">{errors}</div></div>
              <div className="ps-stat"><div className="ps-stat-label">⚡ WPM</div><div className="ps-stat-value wpm-color">{calcWpm()}</div></div>
            </div>
          )}
        </div>

        {showResults && (
          <div className="results-modal">
            <div className="results-content">
              <h2>Lesson Complete! 🎉</h2>
              <div className="results-stats">
                <div className="result-stat"><h3>{resultWpm}</h3><p>Words Per Minute</p></div>
                <div className="result-stat"><h3>{resultAccuracy}%</h3><p>Accuracy</p></div>
                <div className="result-stat"><h3>{formatTime(resultElapsed)}</h3><p>Time Taken</p></div>
                <div className="result-stat"><h3>{errorsRef.current}</h3><p>Total Errors</p></div>
              </div>
              <div className="results-actions">
                <button className="btn btn-primary" onClick={() => navigate('/learn')}>Back to Lessons</button>
                <button className="btn btn-secondary" onClick={() => window.location.reload()}>Try Again</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ALL OTHER LESSONS (intro / random-words / meaningful-words / sentences)
  // ════════════════════════════════════════════════════════════
  return (
    <div className="lesson-container-with-panel">
      <div className="lesson-main-area">
        <div className="lesson-header-compact">
          <h3>Chapter {chapter.chapterNumber} • Lesson {lesson.lessonNumber}</h3>
          <span className="header-divider">|</span>
          <p>{lesson.lessonTitle}</p>
        </div>

        <div className="line-progress-bar">
          <div className="line-progress-fill" style={{ width: `${progressPct}%` }} />
          <span className="line-counter-inline">Line {lineIndex + 1}/{lines.length}</span>
        </div>

        <div
          className={`typing-content line-${linePhase}`}
          style={language === 'punjabi' ? { fontFamily: "'Raavi','Noto Sans Gurmukhi',sans-serif" } : undefined}
        >
          {renderLine()}
        </div>

        {!isComplete && (
          <textarea
            ref={inputRef}
            className="typing-input"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Start typing..."
            autoComplete="off" autoCorrect="off" autoCapitalize="off"
            spellCheck="false" autoFocus
            style={language === 'punjabi' ? { fontFamily: "'Raavi','Noto Sans Gurmukhi',sans-serif", fontSize: '2rem' } : undefined}
          />
        )}

        {!isComplete && (
          <VirtualKeyboard
            activeKey={getCurrentKey()}
            isCorrect={lastKeyCorrect}
            targetKeys={lesson.targetKeys || []}
          />
        )}
      </div>

      {!isComplete && (
        <div className="control-panel-right">
          <div className="control-stat"><div className="stat-label">⏱️ TIMER</div><div className="stat-value-large timer-color">{timeElapsed}s</div></div>
          <div className="control-stat"><div className="stat-label">✓ ACCURACY</div><div className="stat-value-large accuracy-color">{liveAccuracy}%</div></div>
          <div className="control-stat"><div className="stat-label">❌ ERRORS</div><div className="stat-value-large error-color">{errors}</div></div>
          <div className="control-stat"><div className="stat-label">⚡ WPM</div><div className="stat-value-large wpm-color">{calcWpm()}</div></div>
          <div className="control-buttons">
            <button className="btn-control btn-submit" onClick={handleSubmit}>Submit</button>
            <button className="btn-control btn-exit" onClick={() => navigate('/learn')}>Exit</button>
          </div>
        </div>
      )}

      {showResults && (
        <div className="results-modal">
          <div className="results-content">
            <h2>Lesson Complete! 🎉</h2>
            <div className="results-stats">
              <div className="result-stat"><h3>{resultWpm}</h3><p>Words Per Minute</p></div>
              <div className="result-stat"><h3>{resultAccuracy}%</h3><p>Accuracy</p></div>
              <div className="result-stat"><h3>{resultElapsed}s</h3><p>Time Taken</p></div>
              <div className="result-stat"><h3>{errorsRef.current}</h3><p>Errors</p></div>
            </div>
            <div className="results-actions">
              <button className="btn btn-primary" onClick={() => navigate('/learn')}>Back to Lessons</button>
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>Try Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lesson;
