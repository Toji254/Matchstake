import React, { useState, useEffect, useRef } from 'react';

const ANALYSIS_DATA = {
  'mexico_vs_canada': {
    h2h: 'MEXICO LEADS 12-8-5 HISTORICALLY, BUT CANADA WON THE LAST COMPETITIVE CLASH 2-1.',
    form: 'MEXICO: W-D-L-W-D (SOLID LOW-BLOCK DEFENSE). CANADA: W-W-D-W-L (HIGH INTENSITY PRESSING).',
    keyPlayer: 'JONATHAN DAVID (CANADA) - EXTREMELY CLINICAL EXPLOITING HIGH DEFENSIVE LINES.',
    predictedScore: '1 - 2',
    predictedHome: 1,
    predictedAway: 2,
    confidence: '72'
  },
  'usa_vs_morocco': {
    h2h: 'MOROCCO WON THE ONLY RECENT CLASH 3-0. HIGHLY COMPETITIVE ON PAPER.',
    form: 'USA: W-W-L-D-W (STRONG TRANSITIONAL PLAY). MOROCCO: W-W-W-D-W (EXCEPTIONAL MIDFIELD CONTROL).',
    keyPlayer: 'ACHRAF HAKIMI (MOROCCO) - CRITICAL IN OVERLAPPING FLANK TRANSITIONS.',
    predictedScore: '1 - 2',
    predictedHome: 1,
    predictedAway: 2,
    confidence: '64'
  },
  'argentina_vs_japan': {
    h2h: 'ARGENTINA LEADS 6-1-1. JAPAN SECURED A 1-0 SHOCK WIN IN THE LAST FRIENDLY.',
    form: 'ARGENTINA: W-W-W-W-D (DOMINANT BALL POSSESSION). JAPAN: W-W-L-W-W (LETHAL COUNTER-ATTACK SPEED).',
    keyPlayer: 'LIONEL MESSI (ARGENTINA) - UNMATCHED PLAYMAKING BETWEEN DEFENSIVE LINES.',
    predictedScore: '2 - 1',
    predictedHome: 2,
    predictedAway: 1,
    confidence: '78'
  },
  'brazil_vs_south korea': {
    h2h: 'BRAZIL DOMINATED THE LAST ROUND-OF-16 MATCHUP 4-1 IN QATAR.',
    form: 'BRAZIL: W-D-W-L-W (CREATIVE FLAIR, DEFENSIVE GAPS). SOUTH KOREA: W-L-W-D-W (OUTSTANDING ENDURANCE).',
    keyPlayer: 'VINICIUS JR. (BRAZIL) - UNSTOPPABLE ISOLATION THREAT ON THE LEFT FLANK.',
    predictedScore: '3 - 1',
    predictedHome: 3,
    predictedAway: 1,
    confidence: '81'
  },
  'france_vs_germany': {
    h2h: 'FRANCE 15 WINS, GERMANY 17 WINS, 8 DRAWS. CLASSIC EUROPEAN POWERHOUSE CLASH.',
    form: 'FRANCE: W-W-D-L-W (ELITE DEPTH, PHYSICAL DOMINANCE). GERMANY: D-W-W-W-L (NAGELSMANN ROTATIONAL INTERCHANGING).',
    keyPlayer: 'KYLIAN MBAPPÉ (FRANCE) - DEVASTATING ACCELERATION IN VERTICAL ATTACKS.',
    predictedScore: '2 - 2',
    predictedHome: 2,
    predictedAway: 2,
    confidence: '58'
  },
  'england_vs_spain': {
    h2h: 'SPAIN WON 2-1 IN THE EURO 2024 FINAL. ENGLAND SEEKING TACTICAL REPARATION.',
    form: 'ENGLAND: W-D-W-W-D (RESILIENT OUTLET STRUCTURE). SPAIN: W-W-W-W-W (MASTERFUL POSITIONAL OVERLOADS).',
    keyPlayer: 'LAMINE YAMAL (SPAIN) - GENERATES CRITICAL OFF-BALANCE ADVANTAGES.',
    predictedScore: '1 - 2',
    predictedHome: 1,
    predictedAway: 2,
    confidence: '69'
  },
  'portugal_vs_netherlands': {
    h2h: 'PORTUGAL LEADS 8-2-5. HISTORICALLY FEISTY, HIGH-CARDS ENCOUNTER.',
    form: 'PORTUGAL: W-W-W-D-W (COMPACT TACTICAL BLOCK). NETHERLANDS: W-D-W-L-W (THREE-BACK TRANSITIONS).',
    keyPlayer: 'BRUNO FERNANDES (PORTUGAL) - HIGH-RISK CREATIVE PASSING HUB.',
    predictedScore: '2 - 1',
    predictedHome: 2,
    predictedAway: 1,
    confidence: '71'
  },
  'italy_vs_senegal': {
    h2h: 'FIRST HISTORICAL COMPETITIVE MEETING BETWEEN THESE NATIONS.',
    form: 'ITALY: D-W-W-L-D (ORGANIZED DEFENSIVE SYSTEM). SENEGAL: W-W-D-W-W (SUPERIOR PHYSICAL MIDFIELD DOMINANCE).',
    keyPlayer: 'SADIO MANÉ (SENEGAL) - EXPERIENCED ATTACKER EXCELLING IN TRANSITION.',
    predictedScore: '1 - 0',
    predictedHome: 1,
    predictedAway: 0,
    confidence: '63'
  }
};

const getFallbackAnalysis = (home, away) => {
  const h = (home || 'TEAM A').trim().toLowerCase();
  const a = (away || 'TEAM B').trim().toLowerCase();

  for (const key of Object.keys(ANALYSIS_DATA)) {
    if (key.includes(h) && key.includes(a)) {
      return ANALYSIS_DATA[key];
    }
  }

  return {
    h2h: 'STYLISH TACTICAL MATCHUP. HISTORICAL RECORDS ARE ROUGHLY BALANCED.',
    form: `${home.toUpperCase()}: W-D-L-W-D (TACTICAL STABILIZATION). ${away.toUpperCase()}: W-W-D-L-W (FAST COUNTER-OUTLETS).`,
    keyPlayer: 'MIDFIELD GENERAL ROLE WILL BE THE DECISIVE FACTOR IN SETTING TEMPO.',
    predictedScore: '2 - 1',
    predictedHome: 2,
    predictedAway: 1,
    confidence: '62',
    provider: 'local',
  };
};

function mapPredictionToAnalysis(home, away, prediction) {
  const homeScore = Number(prediction.homeScore);
  const awayScore = Number(prediction.awayScore);
  const confidence = Number(prediction.confidence);
  const reasoning = prediction.reasoning || '';
  const keyPlayer = prediction.keyPlayer || 'Key midfielder — tempo control.';

  return {
    h2h: reasoning.toUpperCase(),
    form: `${home.toUpperCase()} VS ${away.toUpperCase()} — AI MODEL CONFIDENCE ${confidence}%.`,
    keyPlayer: keyPlayer.toUpperCase(),
    predictedScore: `${homeScore} - ${awayScore}`,
    predictedHome: homeScore,
    predictedAway: awayScore,
    confidence: String(confidence),
    provider: prediction.provider || 'gemini',
  };
}

async function fetchLiveAnalysis(home, away) {
  const url = `/api/prediction/${encodeURIComponent(home)}/${encodeURIComponent(away)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data?.prediction) {
    throw new Error(data?.error || 'Prediction API failed');
  }
  return mapPredictionToAnalysis(home, away, data.prediction);
}

export default function AIAgent({ matchId, homeTeam, awayTeam, onSelectPrediction, autoStart = false }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [status, setStatus] = useState('idle'); // 'idle' | 'thinking' | 'typing' | 'done'
  const [autoMode, setAutoMode] = useState(autoStart);
  const [analysis, setAnalysis] = useState(() => getFallbackAnalysis(homeTeam || 'TEAM A', awayTeam || 'TEAM B'));

  const [logs, setLogs] = useState([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [spinnerChar, setSpinnerChar] = useState('/');

  const consoleBottomRef = useRef(null);
  const terminalRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  const home = homeTeam || 'TEAM A';
  const away = awayTeam || 'TEAM B';

  // Risk Rating calculation
  const confidenceNum = Number(analysis.confidence);
  const riskLabel = confidenceNum > 75 ? 'LOW' : confidenceNum > 65 ? 'MEDIUM' : 'HIGH';
  const riskColor = riskLabel === 'LOW' ? '#22c55e' : riskLabel === 'MEDIUM' ? 'var(--gold)' : '#ef4444';

  // Spinner animation
  useEffect(() => {
    if (status !== 'thinking' && status !== 'typing') return;
    const chars = ['/', '-', '\\', '|'];
    let idx = 0;
    const interval = setInterval(() => {
      setSpinnerChar(chars[idx % 4]);
      idx++;
    }, 150);
    return () => clearInterval(interval);
  }, [status]);

  // Auto-scroll only the internal terminal container.
  // Uses requestAnimationFrame to avoid synchronous layout thrashing that can
  // cause the browser to yank the outer page scroll position.
  useEffect(() => {
    if (!terminalRef.current) return;
    // Never auto-scroll if the user has intentionally scrolled up
    if (userScrolledUpRef.current) return;
    const terminal = terminalRef.current;
    requestAnimationFrame(() => {
      if (!terminal) return;
      terminal.scrollTop = terminal.scrollHeight;
    });
  }, [logs, charIndex, status]);

  // Detect when the user scrolls up inside the terminal and stop auto-scrolling.
  // Reset when analysis restarts.
  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) return;
    const handleScroll = () => {
      const nearBottom =
        terminal.scrollHeight - terminal.scrollTop - terminal.clientHeight < 60;
      userScrolledUpRef.current = !nearBottom;
    };
    terminal.addEventListener('scroll', handleScroll, { passive: true });
    return () => terminal.removeEventListener('scroll', handleScroll);
  }, [status]);

  // Autostart simulation trigger
  useEffect(() => {
    if (autoMode && status === 'idle') {
      handleStartSimulation();
    }
  }, [autoMode]);

  const steps = [
    { type: 'sys', text: `[SYSTEM] INITIALIZING PREDICTION AGENT FOR MATCH ID: #${matchId}...` },
    { type: 'sys', text: `[SYSTEM] CONNECTING GEMINI CO-PILOT (${analysis.provider || 'gemini'})...` },
    { type: 'agent', text: `[AGENT] FETCHING HISTORICAL H2H DATA...` },
    { type: 'data', text: `[H2H] ${analysis.h2h}` },
    { type: 'agent', text: `[AGENT] ANALYZING TEAM FORM STATISTICS...` },
    { type: 'data', text: `[FORM] ${analysis.form}` },
    { type: 'agent', text: `[AGENT] PARSING KEY PLAYER THREAT METRICS...` },
    { type: 'data', text: `[IMPACT] ${analysis.keyPlayer}` },
    { type: 'agent', text: `[AGENT] RE-EVALUATING UPSET PROBABILITY...` },
    { type: 'data', text: `[RISK] UPSET PROBABILITY ASSESSED AS ${riskLabel} RISK.` },
    { type: 'result', text: `[RESULT] ${home.toUpperCase()} ${analysis.predictedScore} ${away.toUpperCase()} (CONFIDENCE: ${analysis.confidence}%)` },
  ];

  // Typewriter effect controller
  useEffect(() => {
    if (status !== 'typing') return;

    if (currentLogIndex >= steps.length) {
      setStatus('done');
      return;
    }

    const currentStep = steps[currentLogIndex];
    const speed = currentStep.type === 'result' ? 30 : 15;
    
    const interval = setInterval(() => {
      if (charIndex < currentStep.text.length) {
        setCharIndex(prev => prev + 1);
      } else {
        clearInterval(interval);
        setLogs(prev => [...prev, currentStep]);
        setCharIndex(0);
        setCurrentLogIndex(prev => prev + 1);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [status, currentLogIndex, charIndex]);

  const handleStartSimulation = async () => {
    setStatus('thinking');
    setLogs([]);
    setCurrentLogIndex(0);
    setCharIndex(0);
    userScrolledUpRef.current = false;

    try {
      const live = await fetchLiveAnalysis(home, away);
      setAnalysis(live);
    } catch (err) {
      console.warn('[AIAgent] Live prediction failed, using fallback:', err.message);
      setAnalysis(getFallbackAnalysis(home, away));
    }

    setTimeout(() => {
      setStatus('typing');
    }, 600);
  };

  const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().slice(11, 19);
  };

  return (
    <div className="ai-agent-wrapper" style={{ marginBottom: 24 }}>
      <div 
        className="ai-agent-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-light)',
          cursor: 'pointer',
          fontFamily: 'var(--font)',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex', alignContent: 'center', gap: 10 }}>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>●</span>
          <span>MATCHSTAKE AI CO-PILOT AGENT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dimmer)' }}>
            {status === 'idle' ? '[READY]' : status === 'done' ? '[COMPLETED]' : '[ANALYZING]'}
          </span>
          <svg 
            width="10" 
            height="6" 
            viewBox="0 0 10 6" 
            fill="none" 
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease-in-out',
            }}
          >
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div 
          className="ai-agent-body"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid var(--border-light)',
            borderTop: 'none',
            fontFamily: 'var(--font)',
            padding: 20,
            fontSize: '0.75rem',
            lineHeight: 1.6,
          }}
        >
          {status === 'idle' && (
            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <p style={{ color: 'var(--text-dim)', margin: 0, letterSpacing: '0.05em' }}>
                  GENERATE PREDICTION ANALYSES & RISK PROJECTIONS FOR THIS CLASH
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-dimmer)' }}>AUTO-AGENT MODE</label>
                  <input 
                    type="checkbox" 
                    checked={autoMode} 
                    onChange={(e) => setAutoMode(e.target.checked)}
                    style={{ accentColor: 'var(--gold)', cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleStartSimulation}
                  style={{ display: 'inline-flex', alignSelf: 'center', minWidth: 200, justifyContent: 'center' }}
                >
                  GENERATE ANALYSIS
                </button>
              </div>
            </div>
          )}

          {(status === 'thinking' || status === 'typing' || status === 'done') && (
            <div 
              className="terminal-console"
              ref={terminalRef}
              style={{
                height: 280,
                overflowY: 'auto',
                overflowAnchor: 'none',
                paddingRight: 10,
                marginBottom: status === 'done' ? 16 : 0,
              }}
            >
              {logs.map((log, i) => {
                const isResult = log.type === 'result';
                return (
                  <div key={i} style={{ marginBottom: 6, display: 'flex', gap: 10 }}>
                    <span style={{ color: 'var(--text-dimmer)' }}>[{getTimestamp()}]</span>
                    {isResult ? (
                      <span style={{ color: 'var(--fg)', fontWeight: 600 }}>
                        {log.text.split('(CONFIDENCE:')[0]}
                        <span style={{ color: 'var(--gold)' }}>
                          (CONFIDENCE: {analysis.confidence}%)
                        </span>
                      </span>
                    ) : (
                      <span style={{ 
                        color: log.type === 'sys' ? 'var(--text-dimmer)' : log.type === 'agent' ? 'var(--fg)' : 'var(--text-dim)' 
                      }}>
                        {log.text}
                      </span>
                    )}
                  </div>
                );
              })}

              {status === 'typing' && currentLogIndex < steps.length && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: 'var(--text-dimmer)' }}>[{getTimestamp()}]</span>
                  <span style={{
                    color: steps[currentLogIndex].type === 'sys' ? 'var(--text-dimmer)' : steps[currentLogIndex].type === 'agent' ? 'var(--fg)' : 'var(--text-dim)'
                  }}>
                    {steps[currentLogIndex].text.slice(0, charIndex)}
                    <span className="terminal-cursor">▋</span>
                  </span>
                </div>
              )}

              {status === 'thinking' && (
                <div style={{ display: 'flex', gap: 10, color: 'var(--text-dim)' }}>
                  <span style={{ color: 'var(--text-dimmer)' }}>[{getTimestamp()}]</span>
                  <span>[AGENT] RUNNING CLASSIFIER AND AGGREGATING STATISTICS... {spinnerChar}</span>
                </div>
              )}

              <div ref={consoleBottomRef} />
            </div>
          )}

          {status === 'done' && (
            <div 
              className="ai-agent-summary"
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: '1px dashed var(--border-light)',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 16,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-dimmer)', letterSpacing: '0.08em', marginBottom: 4 }}>FORM ANALYSIS</div>
                  <div style={{ color: 'var(--fg)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{analysis.form}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-dimmer)', letterSpacing: '0.08em', marginBottom: 4 }}>PLAYER TO WATCH</div>
                  <div style={{ color: 'var(--fg)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{analysis.keyPlayer}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-dimmer)', letterSpacing: '0.08em', marginBottom: 4 }}>UPSET RISK RATING</div>
                  <div style={{ color: riskColor, fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {riskLabel} ({100 - confidenceNum}% PROBABILITY)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 12 }}>
                {onSelectPrediction ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => onSelectPrediction(analysis.predictedHome, analysis.predictedAway)}
                    style={{ padding: '8px 20px', fontSize: '0.7rem' }}
                  >
                    🎯 USE SUGGESTED SCORE: {analysis.predictedScore}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-dimmer)', letterSpacing: '0.08em' }}>
                    AI PREDICTIONS ARE FOR SOCIAL ENTERTAINMENT ONLY.
                  </span>
                )}
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleStartSimulation}
                    style={{ padding: '6px 16px', fontSize: '0.62rem' }}
                  >
                    RE-RUN ANALYZER
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
