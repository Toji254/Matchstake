import React, { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

const DEMO_LEADERBOARD = [
  { player: '0x1234...abcd', totalPoints: 24, totalWinnings: '3.5', roomsJoined: 6, correctPredictions: 5 },
  { player: '0x5678...efgh', totalPoints: 19, totalWinnings: '2.1', roomsJoined: 5, correctPredictions: 4 },
  { player: '0x9abc...ijkl', totalPoints: 16, totalWinnings: '1.8', roomsJoined: 4, correctPredictions: 3 },
  { player: '0xdef0...mnop', totalPoints: 11, totalWinnings: '0.9', roomsJoined: 3, correctPredictions: 2 },
  { player: '0x1111...qrst', totalPoints: 8, totalWinnings: '0.5', roomsJoined: 2, correctPredictions: 1 },
];

const RANK_ICONS = ['01', '02', '03'];

function formatAddress(addr) {
  if (!addr) return '';
  if (addr.length === 42 && addr.startsWith('0x')) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }
  return addr;
}

export default function Leaderboard() {
  const { data: topPlayers, isLoading: isContractLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTopPlayers',
    args: [BigInt(10)],
    query: {
      enabled: CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });

  const leaderboard = useMemo(() => {
    if (topPlayers && topPlayers.length > 0) {
      return topPlayers.map((entry) => ({
        player: entry.player,
        totalPoints: Number(entry.totalPoints),
        totalWinnings: formatEther(entry.totalWinnings),
        roomsJoined: Number(entry.roomsJoined),
        correctPredictions: Number(entry.correctPredictions),
      }));
    }
    return DEMO_LEADERBOARD;
  }, [topPlayers]);

  const isDemoMode = !topPlayers || topPlayers.length === 0 || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000';
  const isLoading = isContractLoading && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

  if (isLoading) {
    return (
      <main className="page-content">
        <section className="section-dark" style={{ paddingBottom: 40 }}>
          <div className="section-inner">
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, textTransform: 'uppercase' }}>
              LEADERBOARD
            </h1>
            <p style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Loading global rankings from the smart contract...
            </p>
          </div>
        </section>
        <section className="section-dark" style={{ paddingTop: 0 }}>
          <div className="section-inner">
            <div style={{ height: 300 }} className="skeleton"></div>
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
                WORLD CUP 2026 // GLOBAL RANKINGS
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
                LEADERBOARD
              </h1>
              <p style={{
                fontFamily: 'var(--font)',
                fontSize: '0.78rem',
                color: 'var(--text-dim)',
                maxWidth: '40ch',
                lineHeight: 1.7,
              }}>
                Top predictors across all watch party rooms.
                Points earned from correct results and exact score predictions.
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
          {/* Top 3 Feature Cards */}
          <div className="leaderboard-podium" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            borderTop: '1px solid var(--border-light)',
            marginBottom: 40,
          }}>
            {leaderboard.slice(0, 3).map((entry, i) => (
              <div key={i} style={{
                padding: '40px 24px',
                borderRight: i < 2 ? '1px solid var(--border-light)' : 'none',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <div style={{
                  fontFamily: 'var(--font)',
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-dimmer)',
                  marginBottom: 8,
                }}>
                  RANK {RANK_ICONS[i]}
                </div>
                <div style={{
                  fontFamily: 'var(--font)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: 'var(--text-dim)',
                  marginBottom: 16,
                  letterSpacing: '0.02em',
                }}>
                  {formatAddress(entry.player)}
                </div>
                <div style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: i === 0 ? 'var(--gold)' : i === 1 ? '#94a3b8' : '#b45309',
                  marginBottom: 8,
                }}>
                  {entry.totalPoints}
                </div>
                <div style={{
                  fontFamily: 'var(--font)',
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-dimmer)',
                }}>
                  POINTS
                </div>
                <div style={{
                  marginTop: 20,
                  display: 'flex',
                  gap: 24,
                  fontFamily: 'var(--font)',
                  fontSize: '0.72rem',
                  color: 'var(--text-dim)',
                }}>
                  <span>{entry.totalWinnings} OKB</span>
                  <span>{entry.correctPredictions}/{entry.roomsJoined} correct</span>
                </div>
              </div>
            ))}
          </div>

          {/* Full Table */}
          <div className="glass-strong" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Points</th>
                  <th>Winnings (OKB)</th>
                  <th>Rooms</th>
                  <th>Correct</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td><span className="leaderboard-address">{formatAddress(entry.player)}</span></td>
                    <td><span className="leaderboard-points">{entry.totalPoints}</span></td>
                    <td style={{ fontWeight: 600 }}>{entry.totalWinnings}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{entry.roomsJoined}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{entry.correctPredictions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <span>MATCHSTAKE © 2026. BUILT FOR OKX X CUP HACKATHON.</span>
        <span>DEPLOYED ON X LAYER</span>
      </footer>
    </main>
  );
}
