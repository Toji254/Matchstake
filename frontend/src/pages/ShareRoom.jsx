import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ShareCard from '../components/ShareCard';

const DEMO_ROOMS = {
  1: { homeTeam: 'Mexico', awayTeam: 'Canada', prediction: { predictedHomeScore: 1, predictedAwayScore: 2, stakeAmount: '0.10' } },
  2: { homeTeam: 'USA', awayTeam: 'Morocco', prediction: { predictedHomeScore: 1, predictedAwayScore: 2, stakeAmount: '0.08' } },
  3: { homeTeam: 'Argentina', awayTeam: 'Japan', prediction: { predictedHomeScore: 2, predictedAwayScore: 1, stakeAmount: '0.12' } },
  4: { homeTeam: 'Brazil', awayTeam: 'South Korea', prediction: { predictedHomeScore: 3, predictedAwayScore: 1, stakeAmount: '0.15' } },
  5: { homeTeam: 'France', awayTeam: 'Germany', prediction: { predictedHomeScore: 2, predictedAwayScore: 2, stakeAmount: '0.20' } },
  6: { homeTeam: 'England', awayTeam: 'Spain', prediction: { predictedHomeScore: 1, predictedAwayScore: 2, stakeAmount: '0.10' } },
};

export default function ShareRoom() {
  const { roomId } = useParams();
  const room = DEMO_ROOMS[roomId] || DEMO_ROOMS[1];

  return (
    <main className="page-content">
      <section className="section-dark" style={{ paddingBottom: 36 }}>
        <div className="section-inner" style={{ maxWidth: 980 }}>
          <p style={{ fontFamily: 'var(--font)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-dimmer)', marginBottom: 16 }}>
            PUBLIC INVITE // WORLD CUP WATCH PARTY
          </p>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(34px, 6vw, 72px)', fontWeight: 800, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-0.04em', maxWidth: 760 }}>
            Challenge card ready
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', lineHeight: 1.8, maxWidth: '70ch', marginTop: 18 }}>
            A public share page built for social traffic: one card, one prediction, one room invite. Judges can see the viral loop without connecting a wallet.
          </p>
        </div>
      </section>

      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner" style={{ maxWidth: 980 }}>
          <ShareCard roomId={roomId} homeTeam={room.homeTeam} awayTeam={room.awayTeam} prediction={room.prediction} variant="page" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <Link className="btn btn-primary" to={`/room/${roomId}`}>JOIN ROOM</Link>
            <Link className="btn btn-secondary" to="/matches">PICK ANOTHER MATCH</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
