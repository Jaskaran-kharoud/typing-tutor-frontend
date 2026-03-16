import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chaptersAPI, progressAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import './Learn.css';

const Learn = () => {
  const [chapters, setChapters]               = useState([]);
  const [userProgress, setUserProgress]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});
  const navigate  = useNavigate();
  const { language } = useLanguage();

  useEffect(() => { fetchData(); }, [language]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Chapters are required — if this fails we show an error
      const chaptersRes = await chaptersAPI.getAll(language);
      setChapters(chaptersRes.data);

      // Progress is optional — if it fails we just show no progress, not an error
      try {
        const progressRes = await progressAPI.getLessonProgress(language);
        setUserProgress(progressRes.data || []);
      } catch {
        setUserProgress([]);
      }

      // Auto-expand first chapter
      if (chaptersRes.data.length > 0) {
        setExpandedChapters({ [chaptersRes.data[0]._id]: true });
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setError('Failed to load chapters. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (chapterId, lessonId) =>
    userProgress.find(
      p => p.chapterId === chapterId && p.lessonId?.toString() === lessonId?.toString()
    );

  const getChapterProgress = (chapter) => {
    const total = chapter.lessons?.length || 0;
    if (total === 0) return { done: 0, total: 0, pct: 0, status: 'not-started' };
    const done = chapter.lessons.filter(l => getLessonProgress(chapter._id, l._id)).length;
    const pct  = Math.round((done / total) * 100);
    const status = done === 0 ? 'not-started' : done === total ? 'completed' : 'in-progress';
    return { done, total, pct, status };
  };

  const toggleChapter = (id) =>
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Status colours ────────────────────────────────────────
  const STATUS = {
    completed:   { color: '#16a34a', bg: '#dcfce7', label: 'Completed' },
    'in-progress':{ color: '#2563eb', bg: '#dbeafe', label: 'In progress' },
    'not-started':{ color: '#94a3b8', bg: '#f1f5f9', label: 'Not started' },
  };

  const TYPE_COLOR = {
    intro:              { color: '#7c3aed', bg: '#ede9fe' },
    'random-words':     { color: '#2563eb', bg: '#dbeafe' },
    'meaningful-words': { color: '#0891b2', bg: '#cffafe' },
    sentences:          { color: '#d97706', bg: '#fef3c7' },
    paragraph:          { color: '#16a34a', bg: '#dcfce7' },
  };

  const typeStyle = (t) => TYPE_COLOR[t] || { color: '#64748b', bg: '#f1f5f9' };

  // ── Caret-circle arrow (Arrow C) ──────────────────────────
  const Arrow = ({ open, color, border }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
      style={{ transition: 'transform 0.2s', transform: `rotate(${open ? 180 : 0}deg)`, flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" stroke={border} strokeWidth="1" />
      <path d="M6.5 8.5l3.5 3.5 3.5-3.5" stroke={color}
        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const Check = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  // ── Loading ───────────────────────────────────────────────
  if (loading) return <div className="learn-loading">Loading chapters…</div>;
  if (error) return (
    <div className="learn-error-wrap">
      <div className="learn-error">{error}</div>
      <button className="learn-btn-secondary" onClick={fetchData}>Try Again</button>
      <button className="learn-btn-outline" onClick={() => navigate('/dashboard')}>Dashboard</button>
    </div>
  );

  return (
    <div className="learn-page">
      <div className="learn-inner">

        {/* Header */}
        <div className="learn-header">
          <h2 className="learn-title">Learn Mode</h2>
          <p className="learn-sub">Progress through structured lessons to master touch typing</p>
        </div>

        {/* Chapter list */}
        <div className="learn-chapters">
          {chapters.map((chapter) => {
            const prog   = getChapterProgress(chapter);
            const st     = STATUS[prog.status];
            const isOpen = !!expandedChapters[chapter._id];

            return (
              <div key={chapter._id} className="learn-chapter">

                {/* Chapter header */}
                <div className="learn-ch-header" onClick={() => toggleChapter(chapter._id)}>
                  {/* Circle number */}
                  <div className="learn-ch-num" style={{ background: st.bg, color: st.color }}>
                    {chapter.chapterNumber}
                  </div>

                  {/* Title + progress bar */}
                  <div className="learn-ch-info">
                    <div className="learn-ch-title">{chapter.chapterTitle}</div>
                    <div className="learn-ch-bar-row">
                      <div className="learn-ch-bar-track">
                        <div className="learn-ch-bar-fill"
                          style={{ width: `${prog.pct}%`, background: st.color }} />
                      </div>
                      <span className="learn-ch-pct" style={{ color: st.color }}>{prog.pct}%</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className="learn-ch-badge" style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>

                  {/* Arrow C */}
                  <Arrow open={isOpen} color={st.color} border={st.color + '55'} />
                </div>

                {/* Lessons panel */}
                {isOpen && (
                  <div className="learn-lessons">
                    {chapter.lessons?.map((lesson, li) => {
                      const lp   = getLessonProgress(chapter._id, lesson._id);
                      const done = !!lp;
                      const ts   = typeStyle(lesson.lessonType);

                      return (
                        <div key={lesson._id} className="learn-lesson-row">
                          {/* Number */}
                          <span className="learn-lesson-num">{li + 1}</span>

                          {/* Tick */}
                          <div className="learn-lesson-tick"
                            style={{ background: done ? '#16a34a' : '#e2e8f0' }}>
                            {done && <Check />}
                          </div>

                          {/* Title */}
                          <span className="learn-lesson-title"
                            style={{ color: done ? '#1e293b' : '#64748b' }}>
                            {lesson.lessonTitle}
                          </span>

                          {/* Best WPM if done */}
                          {done && lp.bestWPM > 0 && (
                            <span className="learn-lesson-wpm" style={{ color: st.color }}>
                              {lp.bestWPM} wpm
                            </span>
                          )}

                          {/* Type badge */}
                          <span className="learn-lesson-type"
                            style={{ background: ts.bg, color: ts.color }}>
                            {lesson.lessonType}
                          </span>

                          {/* Button */}
                          <button
                            className="learn-lesson-btn"
                            style={done
                              ? { border: `1px solid ${st.color}`, background: '#fff', color: st.color }
                              : { background: '#3b82f6', color: '#fff', border: 'none' }}
                            onClick={() => navigate(`/lesson/${chapter._id}/${lesson._id}`)}>
                            {done ? 'Retake' : 'Start'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button className="learn-btn-outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Learn;
