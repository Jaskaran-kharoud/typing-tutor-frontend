import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

// ─── COLOUR SYSTEM ───────────────────────────────────────────────────────────
const R_END   = 10 / 80;
const G_START = 30 / 80;

function rog(pct) {
  const p = Math.max(0, Math.min(1, pct));
  if (p <= R_END) return 'rgb(220,38,38)';
  if (p <= G_START) {
    const t = (p - R_END) / (G_START - R_END);
    return `rgb(${Math.round(220+(249-220)*t)},${Math.round(38+(115-38)*t)},${Math.round(38+(22-38)*t)})`;
  }
  const t = (p - G_START) / (1 - G_START);
  const e = t * t * (3 - 2 * t);
  return `rgb(${Math.round(249+(22-249)*e)},${Math.round(115+(101-115)*e)},${Math.round(22+(52-22)*e)})`;
}

function rogSubtle(pct) {
  const p = Math.max(0, Math.min(1, pct));
  if (p <= R_END) return 'rgb(200,95,95)';
  if (p <= G_START) {
    const t = (p - R_END) / (G_START - R_END);
    return `rgb(${Math.round(200+(215-200)*t)},${Math.round(95+(155-95)*t)},${Math.round(95+(55-95)*t)})`;
  }
  const t = (p - G_START) / (1 - G_START);
  const e = t * t * (3 - 2 * t);
  return `rgb(${Math.round(215+(55-215)*e)},${Math.round(155+(135-155)*e)},${Math.round(55+(85-55)*e)})`;
}

// ─── SPEEDOMETER ─────────────────────────────────────────────────────────────
function Speedometer({ wpm }) {
  const max = 80, pct = Math.min((wpm || 0) / max, 1);
  const size = 220, cx = size / 2, cy = size / 2, r = size * 0.37;

  function xy(a, rad) {
    const angle = (a - 90) * Math.PI / 180;
    return { x: cx + rad * Math.cos(angle), y: cy + rad * Math.sin(angle) };
  }
  function arc(a1, a2, rad) {
    const s = xy(a1, rad), e = xy(a2, rad);
    return `M ${s.x} ${s.y} A ${rad} ${rad} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
  }

  const na      = -135 + pct * 270;
  const tip     = xy(na, r - 12);
  const b1      = xy(na + 90, 6);
  const b2      = xy(na - 90, 6);
  const redEnd  = -135 + R_END * 270;
  const greenSt = -135 + G_START * 270;
  const cc      = rog(pct);

  return (
    <svg width={size} height={size * 0.76} viewBox={`0 0 ${size} ${size * 0.76}`} style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <linearGradient id="dash-sg" gradientUnits="userSpaceOnUse" x1="10" y1={cy} x2={size - 10} y2={cy}>
          <stop offset="0%"    stopColor="#dc2626" />
          <stop offset="12.4%" stopColor="#dc2626" />
          <stop offset="12.6%" stopColor="#f97316" />
          <stop offset="37.4%" stopColor="#f97316" />
          <stop offset="37.6%" stopColor="#22a34a" />
          <stop offset="70%"   stopColor="#166534" />
          <stop offset="100%"  stopColor="#134e2a" />
        </linearGradient>
        <filter id="dash-glow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <path d={arc(-135, 135, r)} fill="none" stroke="#dbeafe" strokeWidth={14} strokeLinecap="round" />
      <path d={arc(-135, redEnd, r)}    fill="none" stroke="#dc2626" strokeWidth={14} strokeLinecap="butt" opacity={0.1} />
      <path d={arc(redEnd, greenSt, r)} fill="none" stroke="#f97316" strokeWidth={14} strokeLinecap="butt" opacity={0.1} />
      <path d={arc(greenSt, 135, r)}    fill="none" stroke="#166534" strokeWidth={14} strokeLinecap="butt" opacity={0.1} />
      <path d={arc(-135, na, r)} fill="none" stroke="url(#dash-sg)" strokeWidth={14} strokeLinecap="round" filter="url(#dash-glow)" />

      {[0,10,20,30,40,50,60,70,80].map(v => {
        const a     = -135 + (v / max) * 270;
        const major = [0, 10, 20, 30, 40, 60, 80].includes(v);
        const inn   = xy(a, r - (major ? 11 : 7));
        const out   = xy(a, r - 5);
        const lp    = xy(a, r - 22);
        return (
          <g key={v}>
            <line x1={inn.x} y1={inn.y} x2={out.x} y2={out.y}
              stroke={rog(v / max)} strokeWidth={major ? 2.5 : 1.5} strokeLinecap="round" opacity={0.7} />
            {major && <text x={lp.x} y={lp.y + 3} textAnchor="middle" fill="#7aa8c0" fontSize={10}>{v}</text>}
          </g>
        );
      })}

      {[10, 30].map(v => {
        const a = -135 + (v / max) * 270;
        const inn = xy(a, r - 26), out = xy(a, r - 6);
        return <line key={v} x1={inn.x} y1={inn.y} x2={out.x} y2={out.y}
          stroke={rog(v / max)} strokeWidth={2.5} strokeLinecap="round" opacity={0.65} />;
      })}

      <polygon points={`${tip.x},${tip.y} ${b1.x},${b1.y} ${b2.x},${b2.y}`} fill="#1e3a5f" opacity={0.8} />
      <circle cx={cx} cy={cy} r={9}   fill="#fff" stroke={cc} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={3.5} fill={cc} />
      <text x={cx} y={cy + 24} textAnchor="middle" fill={cc} fontSize={26} fontWeight={900}>{wpm || 0}</text>
      <text x={cx} y={cy + 38} textAnchor="middle" fill="#94b8cc" fontSize={10} letterSpacing={3}>WPM</text>
    </svg>
  );
}

// ─── RING ─────────────────────────────────────────────────────────────────────
function Ring({ value, total }) {
  const pct  = total > 0 ? Math.min(value / total, 1) : 0;
  const sz   = 150, stroke = 12, r = (sz - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const uid  = `dash-rg${Math.round(pct * 100)}`;

  return (
    <div style={{ position: 'relative', width: sz, height: sz, margin: '0 auto' }}>
      <svg width={sz} height={sz}>
        <defs>
          <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={rogSubtle(Math.max(0, pct - 0.3))} />
            <stop offset="100%" stopColor={rogSubtle(pct)} />
          </linearGradient>
          <filter id={`f-${uid}`}>
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#dbeafe" strokeWidth={stroke} />
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={`url(#${uid})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${sz/2} ${sz/2})`} filter={`url(#f-${uid})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#0c2d48', fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{value}</span>
        <span style={{ color: '#64a0c8', fontSize: 13, marginTop: 2 }}>of {total}</span>
      </div>
    </div>
  );
}

// ─── BAR ─────────────────────────────────────────────────────────────────────
function Bar({ pct, height = 8 }) {
  return (
    <div style={{ background: '#dbeafe', borderRadius: 50, height }}>
      <div style={{
        width: `${Math.min(pct, 1) * 100}%`,
        height: '100%',
        borderRadius: 50,
        background: `linear-gradient(90deg, ${rogSubtle(Math.max(0, pct - 0.4))}, ${rogSubtle(pct)})`,
        transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, changeLanguage } = useLanguage();

  const [progress, setProgress] = useState(null);
  const [practice, setPractice] = useState(null);
  const [loading,  setLoading]  = useState(true);

  const toggleLangs = [ { id: 'english', nativeName: 'English' },
  { id: 'punjabi', nativeName: 'ਪੰਜਾਬੀ' }];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.all([
          api.get(`/progress/lessons?language=${language}`),
          api.get(`/practice?language=${language}`),
        ]);
        setProgress(pRes.data);
        setPractice(sRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language]);

  const lessonsTotal    = progress?.totalLessons     || 0;
  const lessonsDone     = progress?.completedLessons  || 0;
  const challengingKeys = progress?.challengingKeys   || [];
  const avgWpm          = practice?.averageWpm        || 0;
  const avgAccuracy     = practice?.averageAccuracy   || 0;
  const sessionCount    = practice?.totalSessions     || 0;

  const lessonPct = lessonsTotal > 0 ? lessonsDone / lessonsTotal : 0;
  const accPct    = avgAccuracy / 100;
  const sessPct   = Math.min(sessionCount / 50, 1);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e8f4fd',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '40px 48px',
      boxSizing: 'border-box',
    }}>

      {/* ── Language Toggle ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'flex',
          background: '#dff0fb',
          borderRadius: 50,
          padding: 5,
          border: '1px solid #bfdbfe',
        }}>
          {toggleLangs.map(({ id, nativeName }) => (
            <button key={id} onClick={() => changeLanguage(id)} style={{
              padding: '9px 32px',
              borderRadius: 50,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 15,
              transition: 'all 0.25s',
              background: language === id ? 'linear-gradient(135deg,#0284c7,#38bdf8)' : 'transparent',
              color: language === id ? '#fff' : '#64a0c8',
              boxShadow: language === id ? '0 3px 14px rgba(2,132,199,0.3)' : 'none',
            }}>{nativeName}</button>
          ))}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20, maxWidth: 1200, margin: '0 auto 20px' }}>
        <button
          onClick={() => navigate('/learn')}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(2,132,199,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 8px 28px rgba(2,132,199,0.28)'; }}
          style={{
            padding: '32px 36px',
            borderRadius: 20,
            border: 'none',
            background: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '0 8px 28px rgba(2,132,199,0.28)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <span style={{ fontSize: 34 }}>📖</span>
            <span style={{ fontWeight: 800, fontSize: 28 }}>Learn</span>
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
            Follow chapters, master keys step by step
          </div>
        </button>

        <button
          onClick={() => navigate('/practice')}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(2,132,199,0.14)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 4px 16px rgba(2,132,199,0.08)'; }}
          style={{
            padding: '32px 36px',
            borderRadius: 20,
            border: '1.5px solid #bfdbfe',
            background: '#ffffff',
            color: '#0c2d48',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '0 4px 16px rgba(2,132,199,0.08)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <span style={{ fontSize: 34 }}>⌨️</span>
            <span style={{ fontWeight: 800, fontSize: 28 }}>Practice</span>
          </div>
          <div style={{ fontSize: 15, color: '#64a0c8', lineHeight: 1.5 }}>
            Free typing drills to build speed
          </div>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64a0c8', fontSize: 15 }}>
          Loading your stats…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 1200, margin: '0 auto' }}>

          {/* Learn stat */}
          <div style={{
            background: '#ffffff',
            borderRadius: 18,
            border: '1px solid #c2dff5',
            padding: '28px 32px',
            boxShadow: '0 4px 16px rgba(2,132,199,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 16 }}>📖</span>
              <span style={{ color: '#0284c7', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Learn Progress
              </span>
            </div>

            <Ring value={lessonsDone} total={lessonsTotal} />

            <div style={{ marginTop: 20, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#64a0c8', fontSize: 14 }}>Completion</span>
                <span style={{ color: rogSubtle(lessonPct), fontSize: 14, fontWeight: 700 }}>
                  {Math.round(lessonPct * 100)}%
                </span>
              </div>
              <Bar pct={lessonPct} height={8} />
            </div>

            {challengingKeys.length > 0 && (
              <>
                <div style={{ color: '#94b8cc', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  ⚠️ Challenging Keys
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {challengingKeys.slice(0, 8).map(k => (
                    <span key={k} style={{
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      color: '#c2640a',
                      borderRadius: 7,
                      padding: '4px 12px',
                      fontSize: 15,
                      fontWeight: 700,
                    }}>{k}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Practice stat */}
          <div style={{
            background: '#ffffff',
            borderRadius: 18,
            border: '1px solid #c2dff5',
            padding: '28px 32px',
            boxShadow: '0 4px 16px rgba(2,132,199,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>⌨️</span>
              <span style={{ color: '#0369a1', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Practice Stats
              </span>
            </div>

            <Speedometer wpm={avgWpm} />

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ color: '#64a0c8', fontSize: 14 }}>Accuracy</span>
                  <span style={{ color: rogSubtle(accPct), fontSize: 14, fontWeight: 700 }}>{avgAccuracy}%</span>
                </div>
                <Bar pct={accPct} height={7} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ color: '#64a0c8', fontSize: 14 }}>Sessions</span>
                  <span style={{ color: rogSubtle(sessPct), fontSize: 14, fontWeight: 700 }}>{sessionCount}</span>
                </div>
                <Bar pct={sessPct} height={7} />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Dashboard;
