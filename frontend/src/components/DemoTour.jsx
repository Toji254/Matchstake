import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DEMO_STEPS = [
  {
    path: '/',
    title: 'MATCHSTAKE — LANDING PAGE',
    description: 'Premium editorial design built for World Cup 2026. Social staking protocol on X Layer.',
    scrollTo: 'hero',
    duration: 5000,
    badge: 'UI / UX DESIGN',
  },
  {
    path: '/',
    title: 'HOW IT WORKS — 4-STEP FLOW',
    description: 'Create rooms → Invite friends → Predict & Stake → Auto-payout via smart contract.',
    scrollToSelector: '.section-light',
    duration: 4500,
    badge: 'USER FLOW',
  },
  {
    path: '/',
    title: 'HOST STADIUMS — WORLD CUP 2026',
    description: 'Interactive venue explorer with detailed stadium profiles and match schedules.',
    scrollToId: 'facilities',
    duration: 4500,
    badge: 'CONTENT LAYER',
  },
  {
    path: '/matches',
    title: 'MATCH SCHEDULE — ON-CHAIN DATA',
    description: 'Live match data fetched from the MatchStake smart contract. Fallback to demo data when offline.',
    duration: 4500,
    badge: 'SMART CONTRACT READ',
  },
  {
    path: '/agent-ops',
    title: 'AGENT OPS — OKX OS INTEGRATION HUB',
    description: 'Deploy permissionless World Cup outcome markets via Exchange OS. Compile natural language commands and plug-and-play agent Skills via Onchain OS.',
    duration: 6500,
    badge: 'EXCHANGE OS / ONCHAIN OS',
  },
  {
    path: '/create-room/5',
    title: 'CREATE WATCH PARTY ROOM',
    description: 'Pick a match, set stake ranges (min/max OKB), and invite friends. Room params stored on-chain.',
    duration: 3500,
    badge: 'ROOM CREATION',
  },
  {
    path: '/create-room/5',
    title: 'AI CO-PILOT AGENT — PREDICTION ANALYSIS',
    description: 'On-device AI agent analyzes H2H records, team form, key players, and generates risk projections.',
    clickSelector: '.ai-agent-header',
    waitForSelector: '.ai-agent-body',
    duration: 8000,
    badge: 'AI AGENT TRACK',
  },
  {
    path: '/create-room/5',
    title: 'ROOM CONFIGURATION',
    description: 'Setting stake range: 0.01–1 OKB. Max 10 members. Creating room via smart contract write.',
    action: 'fillCreateRoom',
    duration: 3500,
    badge: 'SMART CONTRACT WRITE',
  },
  {
    path: '/room/1',
    title: 'WATCH PARTY ROOM — JOIN & PREDICT',
    description: 'Room detail page with pool size, member count, and invite sharing. Members can join and predict.',
    duration: 4000,
    badge: 'ROOM INTERACTION',
  },
  {
    path: '/room/1',
    title: 'PREDICTION + STAKING FLOW',
    description: 'Join the room → Set prediction (home score, away score) → Stake OKB → Receive NFT ticket.',
    action: 'joinAndPredict',
    duration: 5000,
    badge: 'PREDICTION + NFT MINT',
  },
  {
    path: '/collection',
    title: 'DYNAMIC NFT PREDICTION TICKETS',
    description: 'On-chain NFT receipts proving stakes. Status updates automatically: Pending 🟡 → Winner 🟢 / Completed 🔴.',
    duration: 4500,
    badge: 'NFT TRACK',
  },
  {
    path: '/leaderboard',
    title: 'GLOBAL LEADERBOARD — ON-CHAIN RANKINGS',
    description: 'Top predictors ranked by points. Correct result = 3pts, exact score = 8pts. Weighted payout distribution.',
    duration: 4500,
    badge: 'GAMIFICATION',
  },
  {
    path: '/squads',
    title: 'SQUAD ARENA — TEAM GAMEFI',
    description: 'Create or join squads. Collective prediction stats, squad rankings, and shared reputation on-chain.',
    action: 'createSquad',
    duration: 5000,
    badge: 'GAMEFI / SQUADS',
  },
  {
    path: '/share/5',
    title: 'VIRAL SHARE CARD — SOCIAL LOOP',
    description: 'Public challenge page with team matchup, predicted score, stake amount, and one-click X/Twitter post. The viral acquisition funnel for watch parties.',
    duration: 4000,
    badge: 'VIRALITY / SOCIALFI',
  },
  {
    path: '/submission',
    title: 'SUBMISSION PROOF ROOM — JUDGE PACK',
    description: 'Single-page hackathon requirements map: Exchange OS venues, Onchain OS Skills, FanLiquidityHook, deployed contract addresses, and demo links.',
    duration: 5000,
    badge: 'SUBMISSION PROOF',
  },
  {
    path: '/swap',
    title: 'OKX DEX INTEGRATION — GET OKB',
    description: 'Swap ETH/USDT/USDC to OKB via OKX DEX aggregator. Best route auto-calculated across 100+ DEXs.',
    action: 'demoSwap',
    duration: 4500,
    badge: 'OKX DEX API',
  },
  {
    path: '/',
    title: 'MATCHSTAKE — BUILT ON X LAYER',
    description: 'Social staking • AI predictions • Dynamic NFTs • Squad GameFi • OKX DEX — All on X Layer.',
    scrollTo: 'hero',
    duration: 6000,
    badge: 'HACKATHON SUBMISSION',
    isFinal: true,
  },
];

export default function DemoTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  // Check for ?demo=true param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === 'true' && !isActive) {
      setIsActive(true);
      setCurrentStep(0);
      sessionStorage.setItem('matchstake_demo_mode', 'true');
    }
  }, [location.search]);

  // Execute current step
  useEffect(() => {
    if (!isActive) return;
    if (currentStep >= DEMO_STEPS.length) {
      setIsActive(false);
      sessionStorage.removeItem('matchstake_demo_mode');
      return;
    }

    const step = DEMO_STEPS[currentStep];

    // Navigate if needed
    if (step.path !== location.pathname) {
      navigate(step.path);
    }

    // Scroll after navigation settles
    const scrollTimer = setTimeout(() => {
      if (step.scrollTo) {
        const el = document.getElementById(step.scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (step.scrollToId) {
        const el = document.getElementById(step.scrollToId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (step.scrollToSelector) {
        const el = document.querySelector(step.scrollToSelector);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 300);

    // Click actions
    const actionTimer = setTimeout(() => {
      if (step.clickSelector) {
        const el = document.querySelector(step.clickSelector);
        if (el) el.click();
      }
      if (step.action) {
        executeAction(step.action);
      }
    }, 800);

    // Progress animation
    startTimeRef.current = Date.now();
    progressRef.current = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / step.duration, 1);
      setProgress(pct * 100);
      if (pct < 1) {
        progressRef.current = requestAnimationFrame(tick);
      }
    });

    // Auto-advance
    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setProgress(0);
    }, step.duration);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(actionTimer);
      clearTimeout(timerRef.current);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [isActive, currentStep, navigate]);

  const executeAction = useCallback((action) => {
    switch (action) {
      case 'fillCreateRoom': {
        const btn = document.querySelector('.btn-primary');
        if (btn && !btn.disabled) {
          setTimeout(() => btn.click(), 1500);
        }
        break;
      }
      case 'joinAndPredict': {
        const joinBtn = document.querySelector('.btn-primary');
        if (joinBtn && joinBtn.textContent.includes('JOIN')) {
          joinBtn.click();
        }
        break;
      }
      case 'createSquad': {
        const input = document.querySelector('input[placeholder="ENTER SQUAD NAME..."]');
        if (input) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          ).set;
          nativeInputValueSetter.call(input, 'X LAYER CHAMPIONS');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        break;
      }
      case 'demoSwap': {
        break;
      }
      default:
        break;
    }
  }, []);

  const handleSkip = () => {
    clearTimeout(timerRef.current);
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
    setIsActive(false);
    sessionStorage.removeItem('matchstake_demo_mode');
    navigate('/');
  };

  const handleNext = () => {
    clearTimeout(timerRef.current);
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
    setProgress(0);
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep === 0) return;
    clearTimeout(timerRef.current);
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
    setProgress(0);
    setCurrentStep((prev) => prev - 1);
  };

  if (!isActive || currentStep >= DEMO_STEPS.length) {
    return null;
  }

  const step = DEMO_STEPS[currentStep];

  return (
    <>
      {/* Top progress bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'rgba(255,255,255,0.08)',
        zIndex: 10001,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #f59e0b, #ffffff)',
          transition: 'width 0.1s linear',
        }} />
      </div>

      {/* Step counter pills */}
      <div style={{
        position: 'fixed',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10001,
        display: 'flex',
        gap: 4,
      }}>
        {DEMO_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === currentStep ? 24 : 8,
            height: 4,
            borderRadius: 2,
            background: i < currentStep ? '#f59e0b' : i === currentStep ? '#ffffff' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Bottom info panel */}
      {isVisible && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.92) 80%, transparent 100%)',
          padding: '40px 40px 32px',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 40,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.62rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  STEP {String(currentStep + 1).padStart(2, '0')} / {String(DEMO_STEPS.length).padStart(2, '0')}
                </span>
                <span style={{
                  padding: '3px 10px',
                  fontSize: '0.58rem',
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 2,
                }}>
                  {step.badge}
                </span>
                {step.isFinal && (
                  <span style={{
                    padding: '3px 10px',
                    fontSize: '0.58rem',
                    fontFamily: "'IBM Plex Mono', monospace",
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: 2,
                  }}>
                    ✓ COMPLETE
                  </span>
                )}
              </div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(18px, 2.5vw, 26px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: '#ffffff',
                marginBottom: 6,
                lineHeight: 1.2,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.76rem',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.7,
                maxWidth: '60ch',
              }}>
                {step.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                style={{
                  padding: '8px 16px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  color: currentStep === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  borderRadius: 2,
                }}
              >
                ← PREV
              </button>
              <button
                onClick={handleNext}
                style={{
                  padding: '8px 16px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: '#ffffff',
                  color: '#000000',
                  border: '1px solid #ffffff',
                  cursor: 'pointer',
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                NEXT →
              </button>
              <button
                onClick={() => setIsVisible(false)}
                style={{
                  padding: '8px 12px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.65rem',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  borderRadius: 2,
                }}
                title="Hide overlay"
              >
                ✕
              </button>
              <button
                onClick={handleSkip}
                style={{
                  padding: '8px 16px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  cursor: 'pointer',
                  borderRadius: 2,
                }}
              >
                END TOUR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show/hide toggle when hidden */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 10000,
            padding: '8px 16px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.9)',
            color: '#f59e0b',
            border: '1px solid rgba(245,158,11,0.3)',
            cursor: 'pointer',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
          }}
        >
          ● SHOW TOUR
        </button>
      )}
    </>
  );
}
