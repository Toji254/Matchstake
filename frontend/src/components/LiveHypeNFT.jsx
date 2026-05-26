import React, { useEffect, useMemo, useState } from 'react';

const HYPE_EVENTS = [
  { minute: '00', label: 'KICKOFF', score: '0 - 0', pulse: 22, mood: 'PENDING', detail: 'Ticket waiting for match signal.' },
  { minute: '18', label: 'BIG CHANCE', score: '0 - 0', pulse: 46, mood: 'HEATING', detail: 'Room chat velocity rising; NFT glow expands.' },
  { minute: '37', label: 'GOAL', score: '1 - 0', pulse: 88, mood: 'LIVE HYPE', detail: 'Oracle event morphs metadata and animation layer.' },
  { minute: '64', label: 'EQUALIZER', score: '1 - 1', pulse: 95, mood: 'CHAOS', detail: 'Group NFT reacts to score swing and social volume.' },
  { minute: '90+', label: 'FINAL', score: '1 - 1', pulse: 67, mood: 'CLAIMABLE', detail: 'Ticket settles into result state; claim path unlocked.' },
];

export default function LiveHypeNFT({ homeTeam = 'France', awayTeam = 'Germany', prediction = '2 - 2' }) {
  const [eventIndex, setEventIndex] = useState(0);
  const event = HYPE_EVENTS[eventIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setEventIndex((prev) => (prev + 1) % HYPE_EVENTS.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const rings = useMemo(() => {
    const opacity = Math.min(0.45, 0.12 + event.pulse / 260);
    return {
      boxShadow: `0 0 ${event.pulse}px rgba(245, 158, 11, ${opacity}), inset 0 0 ${Math.floor(event.pulse / 2)}px rgba(255,255,255,0.05)`,
      borderColor: event.mood === 'CLAIMABLE' ? 'var(--green)' : event.mood === 'CHAOS' ? 'var(--red)' : 'var(--gold)',
    };
  }, [event]);

  return (
    <div className="glass live-hype-card" style={{ padding: 24, border: `1px solid ${rings.borderColor}`, ...rings }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <span className="badge-demo">LIVE HYPE NFT</span>
        <span style={{ color: rings.borderColor, fontSize: '0.62rem', letterSpacing: '0.14em' }}>● {event.mood}</span>
      </div>

      <div style={{ minHeight: 250, display: 'grid', placeItems: 'center', border: '1px solid var(--border-light)', background: 'radial-gradient(circle at center, rgba(245,158,11,0.12), rgba(255,255,255,0.025) 45%, transparent 70%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-dimmer)', letterSpacing: '0.18em', marginBottom: 12 }}>TOKEN #2026 // ROOM HYPE INDEX {event.pulse}</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px, 7vw, 64px)', fontWeight: 800, lineHeight: 0.95 }}>{event.score}</div>
          <div style={{ marginTop: 12, fontSize: '0.74rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{homeTeam} vs {awayTeam}</div>
          <div style={{ marginTop: 24, color: 'var(--gold)', fontSize: '0.72rem' }}>[{event.minute}'] {event.label}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--border-light)', borderTop: 'none' }}>
        {[
          ['PREDICTION', prediction],
          ['ORACLE', 'SYNCED'],
          ['CLAIM', event.mood === 'CLAIMABLE' ? 'READY' : 'LOCKED'],
        ].map(([label, value], i) => (
          <div key={label} style={{ padding: 14, borderRight: i < 2 ? '1px solid var(--border-light)' : 'none' }}>
            <div style={{ color: 'var(--text-dimmer)', fontSize: '0.56rem', letterSpacing: '0.12em' }}>{label}</div>
            <div style={{ marginTop: 4, fontWeight: 700, fontSize: '0.74rem' }}>{value}</div>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', lineHeight: 1.7, marginTop: 16 }}>
        {event.detail} Dynamic SVG state updates automatically via on-chain oracle events on X Layer.
      </p>
    </div>
  );
}
