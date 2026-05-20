import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

const FLAGS = {
  'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Argentina': '🇦🇷', 'Brazil': '🇧🇷',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Spain': '🇪🇸',
  'Portugal': '🇵🇹', 'Netherlands': '🇳🇱', 'Italy': '🇮🇹', 'Japan': '🇯🇵',
  'South Korea': '🇰🇷', 'Canada': '🇨🇦', 'Morocco': '🇲🇦', 'Senegal': '🇸🇳',
};

const DEMO_MATCHES = [
  { matchId: 1, homeTeam: 'Mexico', awayTeam: 'Canada', kickoffTime: 1749654000, resolved: false },
  { matchId: 2, homeTeam: 'USA', awayTeam: 'Morocco', kickoffTime: 1749740400, resolved: false },
  { matchId: 3, homeTeam: 'Argentina', awayTeam: 'Japan', kickoffTime: 1749826800, resolved: false },
  { matchId: 4, homeTeam: 'Brazil', awayTeam: 'South Korea', kickoffTime: 1749826800, resolved: false },
  { matchId: 5, homeTeam: 'France', awayTeam: 'Germany', kickoffTime: 1749913200, resolved: false },
  { matchId: 6, homeTeam: 'England', awayTeam: 'Spain', kickoffTime: 1749913200, resolved: false },
  { matchId: 7, homeTeam: 'Portugal', awayTeam: 'Netherlands', kickoffTime: 1749999600, resolved: false },
  { matchId: 8, homeTeam: 'Italy', awayTeam: 'Senegal', kickoffTime: 1749999600, resolved: false },
];

function formatDate(ts) {
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Matches() {
  const { data: matchIds, isLoading: isIdsLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllMatchIds',
  });

  const { data: matchesData, isLoading: isMatchesLoading } = useReadContracts({
    contracts: (matchIds || []).map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getMatch',
      args: [id],
    })),
    query: {
      enabled: !!matchIds && matchIds.length > 0,
    }
  });

  const matches = useMemo(() => {
    if (matchesData && matchesData.length > 0) {
      const activeMatches = matchesData
        .filter((res) => res.status === 'success' && res.result)
        .map((res) => {
          const match = res.result;
          return {
            matchId: Number(match.matchId),
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            kickoffTime: Number(match.kickoffTime),
            homeScore: Number(match.homeScore),
            awayScore: Number(match.awayScore),
            resolved: match.resolved,
            result: Number(match.result),
          };
        });
      if (activeMatches.length > 0) return activeMatches;
    }
    return DEMO_MATCHES;
  }, [matchesData]);

  const isDemoMode = !matchesData || matchesData.length === 0 || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000';
  const isLoading = (isIdsLoading || isMatchesLoading) && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

  if (isLoading) {
    return (
      <main className="page-content">
        <section className="section-dark" style={{ paddingBottom: 40 }}>
          <div className="section-inner">
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, textTransform: 'uppercase' }}>
              MATCHES
            </h1>
            <p style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Loading live match schedules from the smart contract...
            </p>
          </div>
        </section>
        <section className="section-dark" style={{ paddingTop: 0 }}>
          <div className="section-inner">
            <div className="match-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="match-card skeleton" style={{ height: 140 }}></div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-content">
      <section className="section-dark" style={{ paddingBottom: 40 }}>
        <div className="section-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{
                fontFamily: 'var(--font)',
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--text-dimmer)',
                marginBottom: 16,
              }}>
                WORLD CUP 2026 // GROUP STAGE
              </p>
              <h1 style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 800,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                marginBottom: 8,
              }}>
                MATCHES
              </h1>
              <p style={{
                fontFamily: 'var(--font)',
                fontSize: '0.78rem',
                color: 'var(--text-dim)',
                maxWidth: '40ch',
                lineHeight: 1.7,
              }}>
                Pick a match to create or join a watch party room.
                Predict scores, stake OKB, win the pot.
              </p>
            </div>
            {isDemoMode && (
              <span className="badge-demo">
                DEMO MODE
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div className="match-grid">
            {matches.map((m) => (
              <Link key={m.matchId} to={`/create-room/${m.matchId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="match-card">
                  <div className="match-teams">
                    <div className="match-team">
                      <div className="match-team-flag">{FLAGS[m.homeTeam] || '⚽'}</div>
                      <div className="match-team-name">{m.homeTeam}</div>
                    </div>
                    <div className="match-vs">VS</div>
                    <div className="match-team">
                      <div className="match-team-flag">{FLAGS[m.awayTeam] || '⚽'}</div>
                      <div className="match-team-name">{m.awayTeam}</div>
                    </div>
                  </div>
                  <div className="match-meta">
                    <span>{formatDate(m.kickoffTime)}</span>
                    <span className={m.resolved ? '' : 'match-rooms-count'}>
                      {m.resolved ? (
                        <span>RESOLVED ({m.homeScore}-{m.awayScore})</span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="pulse-dot"></span>
                          OPEN
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
