import React, { useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { NFT_ADDRESS, NFT_ABI, checkDemoMode } from '../config/contract';
import { formatEther } from 'viem';

export default function Collection() {
  const isDemo = checkDemoMode();
  const { address: realAddress, isConnected: realIsConnected } = useAccount();
  const isConnected = isDemo ? true : realIsConnected;
  const address = isDemo ? (realAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') : realAddress;

  // Read token IDs for connected user
  const { data: userTokenIds, isError, isLoading: isContractLoading } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'getUserTokens',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Read actual nftData for each tokenId
  const { data: nftDataResults, isLoading: isNFTDataLoading } = useReadContracts({
    contracts: (userTokenIds || []).map((id) => ({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'nftData',
      args: [id],
    })),
    query: {
      enabled: !!userTokenIds && userTokenIds.length > 0,
    }
  });

  const loading = (isContractLoading || isNFTDataLoading) && isConnected && !isDemo;

  const tokens = useMemo(() => {
    if (isDemo) {
      return [
        {
          tokenId: 382,
          roomId: 1,
          matchId: 1,
          homeTeam: 'Mexico',
          awayTeam: 'South Africa',
          predictionText: '2-1',
          predictedOutcome: 'HOME_WIN',
          stakeAmount: 100000000000000000n, // 0.1 OKB
          pointsEarned: 0n,
          resolved: false,
          isWinner: false,
        },
        {
          tokenId: 129,
          roomId: 6,
          matchId: 6,
          homeTeam: 'Brazil',
          awayTeam: 'Morocco',
          predictionText: '2-1',
          predictedOutcome: 'HOME_WIN',
          stakeAmount: 500000000000000000n, // 0.5 OKB
          pointsEarned: 8n, // Exact Score points!
          resolved: true,
          isWinner: true,
        },
        {
          tokenId: 95,
          roomId: 5,
          matchId: 5,
          homeTeam: 'Qatar',
          awayTeam: 'Switzerland',
          predictionText: '0-2',
          predictedOutcome: 'AWAY_WIN',
          stakeAmount: 200000000000000000n, // 0.2 OKB
          pointsEarned: 3n, // Correct Result points!
          resolved: true,
          isWinner: true,
        },
      ];
    }
    if (isConnected && userTokenIds && nftDataResults && nftDataResults.length > 0) {
      return nftDataResults
        .map((res, index) => {
          if (res.status !== 'success' || !res.result) return null;
          
          const data = res.result;
          
          const getField = (name, index) => {
            if (data && typeof data === 'object') {
              if (name in data) return data[name];
              if (index in data) return data[index];
            }
            if (Array.isArray(data)) return data[index];
            return undefined;
          };

          return {
            tokenId: Number(userTokenIds[index]),
            roomId: Number(getField('roomId', 0) ?? 0),
            matchId: Number(getField('matchId', 1) ?? 0),
            homeTeam: getField('homeTeam', 2) ?? '',
            awayTeam: getField('awayTeam', 3) ?? '',
            predictionText: getField('predictionText', 4) ?? '',
            predictedOutcome: getField('predictedOutcome', 5) ?? '',
            stakeAmount: getField('stakeAmount', 6) ?? 0n,
            pointsEarned: getField('pointsEarned', 7) ?? 0n,
            resolved: getField('resolved', 8) ?? false,
            isWinner: getField('isWinner', 9) ?? false,
          };
        })
        .filter((t) => t !== null);
    }
    return [];
  }, [isConnected, userTokenIds, nftDataResults, isDemo]);

  const handleShareTweet = (ticket) => {
    const outcome = ticket.predictedOutcome === 'HOME_WIN' ? 'Win' : ticket.predictedOutcome === 'AWAY_WIN' ? 'Win' : 'Draw';
    const tweetText = encodeURIComponent(
      `🏟️ Just checked my on-chain @MatchStake prediction ticket for ${ticket.homeTeam} vs ${ticket.awayTeam}! Predicted: ${ticket.predictionText} (${outcome}). Minted on @XLayerOfficial! #WorldCup2026 #MatchStake`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  return (
    <div className="page-entry" style={{ padding: '100px 20px 60px' }}>
      <div className="section-inner" style={{ maxWidth: 1200 }}>
        
        {/* Header */}
        <div style={{
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: 24,
          marginBottom: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <span className="section-label">⚽ DIGITAL ASSETS</span>
            <h1 style={{
              fontFamily: 'var(--font-head)',
              fontSize: '3rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '8px 0 0 0',
              textTransform: 'uppercase'
            }}>
              Prediction Tickets
            </h1>
            <p style={{
              color: 'var(--text-dim)',
              fontSize: '0.9rem',
              maxWidth: 600,
              margin: '8px 0 0 0'
            }}>
              On-chain dynamic NFT receipts proving your stakes and score predictions. 
              These update automatically after matches are resolved.
            </p>
          </div>

          <span className="badge-demo" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
            X LAYER TESTNET
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="match-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton" style={{ height: 420, borderRadius: 0 }} />
            ))}
          </div>
        )}

        {/* Not Connected */}
        {!isConnected && !loading && (
          <div className="glass-strong" style={{
            padding: '80px 40px',
            textAlign: 'center',
            border: '1px solid var(--border-light)'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>🔗</span>
            <h3 style={{ fontFamily: 'var(--font-head)', margin: '0 0 8px 0' }}>CONNECT YOUR WALLET</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>
              Connect your wallet to view your on-chain prediction NFT tickets.
            </p>
          </div>
        )}

        {/* Collection Grid */}
        {isConnected && !loading && (
          <>
            {tokens.length === 0 ? (
              <div className="glass-strong" style={{
                padding: '80px 40px',
                textAlign: 'center',
                border: '1px solid var(--border-light)'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>🎟️</span>
                <h3 style={{ fontFamily: 'var(--font-head)', margin: '0 0 8px 0' }}>NO NFT TICKETS FOUND</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>
                  {isError
                    ? 'Could not connect to the PredictionNFT contract on X Layer Testnet.'
                    : 'Join a Watch Party room and submit a match prediction to mint your ticket.'
                  }
                </p>
              </div>
            ) : (
              <div className="match-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 32
              }}>
                {tokens.map((ticket) => {
                  const isPending = !ticket.resolved;
                  const isWin = ticket.resolved && ticket.isWinner;
                  const statusLabel = isPending ? 'PENDING' : isWin ? 'WINNER' : 'COMPLETED';
                  const accentColor = isPending ? 'var(--gold)' : isWin ? '#22c55e' : '#ef4444';
                  
                  return (
                    <div key={ticket.tokenId} className="glass" style={{
                      padding: 24,
                      border: `1px solid ${accentColor}`,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 450
                    }}>
                      
                      {/* Ticket Header */}
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px dashed var(--border-light)',
                          paddingBottom: 16,
                          marginBottom: 16
                        }}>
                          <span style={{
                            fontFamily: 'var(--font)',
                            fontSize: '0.7rem',
                            letterSpacing: '0.1em',
                            color: 'var(--text-dimmer)'
                          }}>
                            TICKET #{ticket.tokenId}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            letterSpacing: '0.15em',
                            fontWeight: 'bold',
                            color: accentColor,
                          }}>
                            ● {statusLabel}
                          </span>
                        </div>

                        {/* Match */}
                        <h2 style={{
                          fontFamily: 'var(--font-head)',
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          margin: '0 0 24px 0',
                          letterSpacing: '-0.02em',
                          textTransform: 'uppercase'
                        }}>
                          {ticket.homeTeam} <span style={{ color: 'var(--text-dimmer)', fontSize: '1.1rem' }}>VS</span> {ticket.awayTeam}
                        </h2>

                        {/* Ticket Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 10px', marginBottom: 24 }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-dimmer)', letterSpacing: '0.1em' }}>PREDICTION</span>
                            <span style={{ fontFamily: 'var(--font)', fontSize: '1.05rem', fontWeight: 'bold' }}>
                              {ticket.predictionText} ({ticket.predictedOutcome === 'HOME_WIN' ? 'Home' : ticket.predictedOutcome === 'AWAY_WIN' ? 'Away' : 'Draw'})
                            </span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-dimmer)', letterSpacing: '0.1em' }}>STAKE LOCKED</span>
                            <span style={{ fontFamily: 'var(--font)', fontSize: '1.05rem' }}>
                              {formatEther(ticket.stakeAmount)} OKB
                            </span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-dimmer)', letterSpacing: '0.1em' }}>POINTS EARNED</span>
                            <span style={{ fontFamily: 'var(--font)', fontSize: '1.05rem', color: ticket.pointsEarned > 0 ? '#22c55e' : 'inherit' }}>
                              {Number(ticket.pointsEarned)} PTS
                            </span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-dimmer)', letterSpacing: '0.1em' }}>ROOM</span>
                            <span style={{ fontFamily: 'var(--font)', fontSize: '1.05rem' }}>
                              #{ticket.roomId}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Footer Actions */}
                      <div style={{
                        borderTop: '1px dashed var(--border-light)',
                        paddingTop: 16,
                        display: 'flex',
                        gap: 12
                      }}>
                        <button 
                          onClick={() => handleShareTweet(ticket)}
                          className="btn btn-secondary" 
                          style={{ flex: 1, padding: '10px 0', fontSize: '0.75rem', justifyContent: 'center' }}
                        >
                          SHARE TICKET
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
