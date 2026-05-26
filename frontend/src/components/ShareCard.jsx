import React from 'react';
import toast from 'react-hot-toast';

export function buildShareText({ homeTeam, awayTeam, prediction, stakeAmount, roomId }) {
  const score = prediction ? `${prediction.predictedHomeScore}-${prediction.predictedAwayScore}` : 'my score';
  const stake = prediction?.stakeAmount || stakeAmount || '0.1';
  return `I locked ${score} for ${homeTeam} vs ${awayTeam} in MatchStake room #${roomId}. ${stake} OKB staked on @XLayerOfficial. World Cup watch parties, AI picks, dynamic NFT tickets. #WorldCup2026 #MatchStake`;
}

export default function ShareCard({ roomId, homeTeam, awayTeam, prediction, stakeAmount, variant = 'room' }) {
  const score = prediction ? `${prediction.predictedHomeScore} - ${prediction.predictedAwayScore}` : 'PICK PENDING';
  const shareUrl = `${window.location.origin}/share/${roomId}`;
  const tweetText = encodeURIComponent(buildShareText({ homeTeam, awayTeam, prediction, stakeAmount, roomId }));
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`;

  const copyInvite = async () => {
    await navigator.clipboard.writeText(`${buildShareText({ homeTeam, awayTeam, prediction, stakeAmount, roomId })}\n${shareUrl}`);
    toast.success('Share card copied. Paste it into X, Telegram, or Discord.');
  };

  return (
    <div className="glass-strong share-card" style={{ padding: 28, border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.12, background: 'radial-gradient(circle at 20% 10%, rgba(245,158,11,0.45), transparent 28%), radial-gradient(circle at 80% 70%, rgba(34,197,94,0.30), transparent 30%)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 18 }}>
          <span className="badge-demo">VIRAL MATCH CARD</span>
          <span style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.12em' }}>ROOM #{roomId}</span>
        </div>

        <div style={{ border: '1px solid var(--border-light)', padding: 22, background: 'rgba(0,0,0,0.35)' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-dimmer)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
            MatchStake // X Layer World Cup pool
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'left', fontFamily: 'var(--font-head)', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>
              {homeTeam}
            </div>
            <div style={{ color: 'var(--text-dimmer)', fontSize: '0.72rem' }}>VS</div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-head)', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>
              {awayTeam}
            </div>
          </div>
          <div style={{ textAlign: 'center', margin: '24px 0 12px' }}>
            <div style={{ color: 'var(--text-dimmer)', fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Predicted score</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(38px, 7vw, 76px)', fontWeight: 800, lineHeight: 0.9 }}>{score}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border-light)', marginTop: 22, paddingTop: 16, gap: 12 }}>
            <div><div className="mini-label">STAKE</div><strong>{prediction?.stakeAmount || stakeAmount || '0.1'} OKB</strong></div>
            <div><div className="mini-label">NETWORK</div><strong>X LAYER</strong></div>
            <div><div className="mini-label">NFT</div><strong>{prediction ? 'MINTED' : 'READY'}</strong></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href={tweetUrl} target="_blank" rel="noreferrer" style={{ flex: variant === 'page' ? '0 0 auto' : 1, justifyContent: 'center' }}>
            POST TO X
          </a>
          <button className="btn btn-secondary" onClick={copyInvite} style={{ flex: variant === 'page' ? '0 0 auto' : 1, justifyContent: 'center' }}>
            COPY CARD TEXT
          </button>
        </div>
      </div>
    </div>
  );
}
