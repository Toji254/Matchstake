import { Link } from 'react-router-dom';

const STEPS = [
  { num: '01', title: 'Create a Room', desc: 'Pick a World Cup match and set the stake range for your group.' },
  { num: '02', title: 'Invite Your Crew', desc: 'Share the invite link — works with any wallet on X Layer.' },
  { num: '03', title: 'Predict & Stake', desc: 'Everyone picks a winner, predicts the exact score, and stakes OKB.' },
  { num: '04', title: 'Auto-Payout', desc: 'Match ends → smart contract scores predictions → pot splits instantly.' },
];

const SCORING = [
  { label: 'CORRECT RESULT', pts: '3 PTS', desc: 'Predict the match outcome correctly', color: '#22c55e' },
  { label: 'EXACT SCORE', pts: '8 PTS', desc: 'Nail the exact final score', color: '#f59e0b' },
  { label: 'WRONG', pts: '0 PTS', desc: 'Better luck next match', color: '#ef4444' },
  { label: 'BONUS', pts: '+2 PTS', desc: 'First predictor in the room gets extra', color: '#000' },
];

export default function HowItWorks() {
  return (
    <>
      {/* How It Works */}
      <section className="section-light">
        <div className="section-inner">
          <h2 className="section-label">HOW IT WORKS</h2>
          <div className="manifesto-grid">
            <div>
              {STEPS.map((s) => (
                <div key={s.num} style={{
                  display: 'flex', gap: '20px', alignItems: 'flex-start',
                  padding: '24px 0', borderBottom: '1px solid rgba(0,0,0,0.1)',
                }}>
                  <span style={{
                    fontFamily: "var(--font)", fontWeight: 500,
                    fontSize: '0.72rem', color: '#000', minWidth: '28px',
                    textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.4,
                  }}>{s.num}</span>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2, fontSize: '0.88rem', color: '#000' }}>{s.title}</div>
                    <div style={{ color: 'rgba(0,0,0,0.56)', fontSize: '0.82rem', lineHeight: 1.65 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="manifesto-text" style={{ fontSize: '15px', lineHeight: '25px' }}>
                MatchStake brings the social staking experience on-chain — create private rooms
                for your watch party, set custom stake ranges, and let the smart contract handle
                scoring and payouts. No trust required. No excuses. Everyone puts skin in the game.
              </p>
              <p className="manifesto-text" style={{ fontSize: '15px', lineHeight: '25px', marginTop: 24, opacity: 0.7 }}>
                Powered by X Layer for fast, low-cost transactions. Connect your wallet,
                pick a match, and create a room in under 30 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring System */}
      <section className="section-light" style={{ borderTop: '1px solid #000', paddingLeft: 0, paddingRight: 0 }}>
        <div className="section-inner" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
          <h3 className="section-label">SCORING SYSTEM</h3>
        </div>
        <div className="facilities-grid">
          {SCORING.map((s) => (
            <div key={s.label} className="facility-col">
              <div className="facility-meta">{s.label}</div>
              <div className="facility-value" style={{ color: s.color }}>{s.pts}</div>
              <p className="facility-meta" style={{ fontStyle: 'italic', opacity: 0.6, marginTop: 'auto', marginBottom: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-dark" style={{
        textAlign: 'center', minHeight: '40vh', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="section-inner">
          <p style={{
            fontFamily: "var(--font)", fontSize: '0.72rem',
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: 'var(--text-dimmer)', marginBottom: 24,
          }}>
            WORLD CUP 2026 // SOCIAL STAKING PROTOCOL
          </p>
          <h2 style={{
            fontFamily: "var(--font-head)",
            fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800,
            lineHeight: 1.05, textTransform: 'uppercase',
            letterSpacing: '-0.02em', marginBottom: 32,
          }}>
            STAKE YOUR<br />SQUAD
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/matches" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </section>
    </>
  );
}
