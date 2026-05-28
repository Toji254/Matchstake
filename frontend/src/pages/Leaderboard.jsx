import React, { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI, checkDemoMode } from '../config/contract';

const RANK_ICONS = ['01', '02', '03'];

function formatAddress(addr) {
  if (!addr) return '';
  if (addr.length === 42 && addr.startsWith('0x')) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }
  return addr;
}

export default function Leaderboard() {
  const isDemo = checkDemoMode();

  const { data: topPlayers, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTopPlayers',
    args: [BigInt(10)],
  });

  const leaderboard = useMemo(() => {
    if (isDemo) {
      return [
        { player: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', totalPoints: 63, totalWinnings: '2.80', roomsJoined: 10, correctPredictions: 7 },
        { player: '0x3C44CdDB6a900fa2b585dd299e03d12FA4293BCF', totalPoints: 48, totalWinnings: '1.90', roomsJoined: 8, correctPredictions: 5 },
        { player: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', totalPoints: 41, totalWinnings: '1.20', roomsJoined: 9, correctPredictions: 4 },
        { player: '0x15d34AAf54a61C543761b63007d465cc7f2d3345', totalPoints: 32, totalWinnings: '0.80', roomsJoined: 6, correctPredictions: 3 },
        { player: '0xBcd4042DE499D14e55001CcbB24a551F3b9d4096', totalPoints: 25, totalWinnings: '0.40', roomsJoined: 5, correctPredictions: 2 },
      ];
    }
    if (topPlayers && topPlayers.length > 0) {
      return topPlayers
        .filter((entry) => entry.player !== '0x0000000000000000000000000000000000000000')
        .map((entry) => ({
          player: entry.player,
          totalPoints: Number(entry.totalPoints),
          totalWinnings: formatEther(entry.totalWinnings),
          roomsJoined: Number(entry.roomsJoined),
          correctPredictions: Number(entry.correctPredictions),
        }));
    }
    return [];
  }, [topPlayers, isDemo]);

  const isLoadingActual = isLoading && !isDemo;

  if (isLoadingActual) {
    return (
      <main className="page-content">
        <section className="section-dark" style={{ paddingBottom: 40 }}>
          <div className="section-inner">
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, textTransform: 'uppercase' }}>
              LEADERBOARD
            </h1>
            <p style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Loading global rankings from X Layer Testnet...
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
            <span className="badge-demo" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
              X LAYER TESTNET
            </span>
          </div>
        </div>
      </section>

      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          {leaderboard.length === 0 ? (
            <div className="glass-strong" style={{
              padding: '60px 40px',
              textAlign: 'center',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 16 }}>🏆</span>
              <h3 style={{ fontFamily: 'var(--font-head)', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                NO RANKINGS YET
              </h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: 0, maxWidth: '42ch', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
                {isError
                  ? 'Could not connect to the smart contract on X Layer Testnet.'
                  : 'The leaderboard will populate once players join rooms and make predictions on-chain.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Top 3 Feature Cards */}
              {leaderboard.length >= 3 && (
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
              )}

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
            </>
          )}
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
