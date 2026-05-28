import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI, parseContractError, checkDemoMode } from '../config/contract';
import { TARGET_CHAIN_ID } from '../config/wagmi';
import AIAgent from '../components/AIAgent';
import AgentActionConsole from '../components/AgentActionConsole';
import LiveHypeNFT from '../components/LiveHypeNFT';
import RoomChat from '../components/RoomChat';
import { trackTransaction } from '../utils/txLedger';

export default function Room() {
  const { roomId } = useParams();
  
  const isDemo = checkDemoMode();
  const { address: realAddress, isConnected: realIsConnected, chain } = useAccount();
  const isConnected = isDemo ? true : realIsConnected;
  const address = isDemo ? (realAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') : realAddress;
  const isWrongChain = !chain || chain.id !== TARGET_CHAIN_ID;

  // Demo interactive states
  const [demoJoined, setDemoJoined] = useState(false);
  const [demoPrediction, setDemoPrediction] = useState(null);

  // Prediction form state
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('0.1');

  // Wagmi Write hooks
  const { writeContract: joinRoomWrite, isPending: joinPending } = useWriteContract();
  const { writeContract: predictWrite, isPending: predPending } = useWriteContract();
  const { writeContract: claimWrite, isPending: claimPending } = useWriteContract();

  // Wagmi Read hooks — always enabled, reads go to X Layer Testnet
  const { data: roomData, isLoading: isRoomLoading, isError: isRoomError, refetch: refetchRoom } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRoom',
    args: [BigInt(roomId)],
  });

  const matchId = roomData ? Number(roomData.matchId) : null;

  const { data: matchData, isLoading: isMatchLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getMatch',
    args: [matchId ? BigInt(matchId) : BigInt(0)],
    query: {
      enabled: !!matchId,
    }
  });

  const { data: roomMembers, refetch: refetchMembers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRoomMembers',
    args: [BigInt(roomId)],
  });

  const { data: userPrediction, refetch: refetchPrediction } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPrediction',
    args: [BigInt(roomId), address || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: !!address,
    }
  });

  // Derived structures from on-chain data
  const room = useMemo(() => {
    if (isDemo) {
      return {
        roomId: Number(roomId) || 1,
        creator: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        matchId: 1,
        minStake: '0.01',
        maxStake: '1.0',
        maxMembers: 10,
        totalPool: demoPrediction ? (2.4 + Number(demoPrediction.stakeAmount)).toFixed(2) : '2.40',
        memberCount: demoJoined ? 7 : 6,
        status: 1,
      };
    }
    if (!roomData || Number(roomData.roomId) === 0) return null;
    return {
      roomId: Number(roomData.roomId),
      creator: roomData.creator,
      matchId: Number(roomData.matchId),
      minStake: formatEther(roomData.minStake),
      maxStake: formatEther(roomData.maxStake),
      maxMembers: Number(roomData.maxMembers),
      totalPool: formatEther(roomData.totalPool),
      memberCount: Number(roomData.memberCount),
      status: Number(roomData.status),
    };
  }, [roomData, isDemo, roomId, demoJoined, demoPrediction]);

  const match = useMemo(() => {
    if (isDemo) {
      return {
        homeTeam: 'Mexico',
        awayTeam: 'South Africa',
        kickoffTime: Math.floor(Date.now()/1000) + 3600,
        homeScore: 0,
        awayScore: 0,
        resolved: false,
        result: 0,
      };
    }
    if (!matchData || !matchData.homeTeam) return null;
    return {
      homeTeam: matchData.homeTeam,
      awayTeam: matchData.awayTeam,
      kickoffTime: Number(matchData.kickoffTime),
      homeScore: Number(matchData.homeScore),
      awayScore: Number(matchData.awayScore),
      resolved: matchData.resolved,
      result: Number(matchData.result),
    };
  }, [matchData, isDemo]);

  const isMember = useMemo(() => {
    if (isDemo) return demoJoined;
    if (roomMembers && address) {
      return roomMembers.some((m) => m.toLowerCase() === address.toLowerCase());
    }
    return false;
  }, [roomMembers, address, isDemo, demoJoined]);

  const prediction = useMemo(() => {
    if (isDemo) return demoPrediction;
    if (userPrediction && userPrediction.stakeAmount > 0n) {
      return {
        predictedResult: Number(userPrediction.predictedResult),
        predictedHomeScore: Number(userPrediction.predictedHomeScore),
        predictedAwayScore: Number(userPrediction.predictedAwayScore),
        stakeAmount: formatEther(userPrediction.stakeAmount),
        claimed: userPrediction.claimed,
        points: Number(userPrediction.points),
      };
    }
    return null;
  }, [userPrediction, isDemo, demoPrediction]);

  const getResult = (h, a) => {
    if (h > a) return 1; // HOME_WIN
    if (a > h) return 2; // AWAY_WIN
    return 3; // DRAW
  };

  const handleJoin = () => {
    if (isDemo) {
      toast.success('Joined Watch Party on X Layer! 🤝 (MOCK)');
      setDemoJoined(true);
      return;
    }
    if (!isConnected) { toast.error('Connect wallet first!'); return; }
    if (isWrongChain) {
      toast.error('Please switch your wallet network to X Layer Testnet first!');
      return;
    }
    joinRoomWrite({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'joinRoom',
      args: [BigInt(roomId)],
    }, {
      onSuccess: (hash) => {
        trackTransaction({ hash, action: `Join Room #${roomId}`, category: 'main' });
        toast.success(
          <span>
            Joined Watch Party on X Layer! 🤝{' '}
            <a href={`https://www.oklink.com/xlayer-test/tx/${hash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#22c55e', marginLeft: 8, fontWeight: 700 }}>
              [VIEW TX]
            </a>
          </span>,
          { duration: 8000 }
        );
        refetchMembers();
      },
      onError: (err) => {
        console.error('JoinRoom error:', err);
        toast.error(parseContractError(err, 'Failed to join room'));
      },
    });
  };

  const handlePredict = () => {
    if (!room) { toast.error('Room data not loaded'); return; }
    if (Number(stakeAmount) < Number(room.minStake) || Number(stakeAmount) > Number(room.maxStake)) {
      toast.error(`Stake must be between ${room.minStake} and ${room.maxStake} OKB`);
      return;
    }

    // Input validations
    const stakeNum = parseFloat(stakeAmount);
    if (isNaN(stakeNum) || stakeNum <= 0) {
      toast.error('Stake amount must be a positive number greater than 0.');
      return;
    }
    const homeScoreInt = parseInt(homeScore, 10);
    const awayScoreInt = parseInt(awayScore, 10);
    if (isNaN(homeScoreInt) || homeScoreInt < 0 || isNaN(awayScoreInt) || awayScoreInt < 0) {
      toast.error('Scores must be positive integers.');
      return;
    }

    if (isDemo) {
      toast.success('Prediction Locked on X Layer! 🎯 (MOCK)');
      setDemoPrediction({
        predictedResult: getResult(homeScore, awayScore),
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
        stakeAmount: stakeAmount,
        claimed: false,
        points: 0,
      });
      return;
    }
    if (!isConnected) { toast.error('Connect wallet first!'); return; }
    if (isWrongChain) {
      toast.error('Please switch your wallet network to X Layer Testnet first!');
      return;
    }
    const result = getResult(homeScore, awayScore);
    predictWrite({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'makePrediction',
      args: [BigInt(roomId), result, homeScore, awayScore],
      value: parseEther(stakeAmount),
    }, {
      onSuccess: (hash) => {
        trackTransaction({ hash, action: `Prediction in Room #${roomId}`, category: 'main' });
        toast.success(
          <span>
            Prediction Locked on X Layer! 🎯{' '}
            <a href={`https://www.oklink.com/xlayer-test/tx/${hash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#22c55e', marginLeft: 8, fontWeight: 700 }}>
              [VIEW TX]
            </a>
          </span>,
          { duration: 8000 }
        );
        refetchPrediction();
        refetchRoom();
      },
      onError: (err) => {
        console.error('Prediction error:', err);
        toast.error(parseContractError(err, 'Failed to submit prediction'));
      },
    });
  };

  const handleClaim = () => {
    if (isDemo) {
      toast.success('Winnings Claimed on X Layer! 💰 (MOCK)');
      if (demoPrediction) {
        setDemoPrediction({
          ...demoPrediction,
          claimed: true,
        });
      }
      return;
    }
    if (isWrongChain) {
      toast.error('Please switch your wallet network to X Layer Testnet first!');
      return;
    }
    claimWrite({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(roomId)],
    }, {
      onSuccess: (hash) => {
        trackTransaction({ hash, action: `Claim Winnings Room #${roomId}`, category: 'main' });
        toast.success(
          <span>
            Winnings Claimed on X Layer! 💰{' '}
            <a href={`https://www.oklink.com/xlayer-test/tx/${hash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#22c55e', marginLeft: 8, fontWeight: 700 }}>
              [VIEW TX]
            </a>
          </span>,
          { duration: 8000 }
        );
        refetchPrediction();
      },
      onError: (err) => {
        console.error('Claim error:', err);
        toast.error(parseContractError(err, 'Failed to claim winnings'));
      },
    });
  };

  // Loading state
  const isRoomLoadingActual = (isRoomLoading || isMatchLoading) && !isDemo;
  if (isRoomLoadingActual) {
    return (
      <main className="room-container">
        <div className="glass-strong skeleton" style={{ height: 400 }}></div>
      </main>
    );
  }

  // Error state — room not found on-chain
  const isRoomErrorActual = (isRoomError || !room || !match) && !isDemo;
  if (isRoomErrorActual) {
    return (
      <main className="room-container">
        <div className="glass-strong" style={{ padding: 60, textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: '1.4rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            ROOM NOT FOUND
          </h2>
          <p style={{
            fontFamily: 'var(--font)',
            fontSize: '0.82rem',
            color: 'var(--text-dim)',
            lineHeight: 1.7,
            maxWidth: '40ch',
            margin: '0 auto 24px',
          }}>
            Room #{roomId} does not exist on the X Layer Testnet contract, or the contract is not yet deployed.
            Make sure contracts are deployed via <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px' }}>bash start-testnet.sh</code> and matches/rooms have been created.
          </p>
          <Link to="/matches" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            BROWSE MATCHES
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div className="room-header" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <span className="badge-demo">
            ROOM #{roomId}
          </span>
          <span className="badge-demo" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
            X LAYER TESTNET
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', margin: '14px 0 8px' }}>
          {match.homeTeam} VS {match.awayTeam}
        </h2>
        <div className="room-pool" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontSize: '1.25rem', marginTop: 12, margin: '16px 0' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>TOTAL POT:</span> {room.totalPool} OKB
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dimmer)', marginTop: 8, textAlign: 'center' }}>
          Limit: {room.minStake} – {room.maxStake} OKB // Members: {room.memberCount}/{room.maxMembers}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 32 }} className="room-dashboard-grid">
        {/* Left Column: Form & NFT */}
        <div>
          {!isConnected ? (
            <div className="glass-strong" style={{ padding: 40, textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontFamily: 'var(--font)', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: 12 }}>
                A wallet connection is required to interact with this Watch Party Room.
              </p>
            </div>
          ) : !isMember ? (
            <div className="glass-strong" style={{ padding: 40, textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontFamily: 'var(--font)', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: 20 }}>
                Join the watch party to lock in your predictions and social stakes.
              </p>
              <button
                className="btn btn-primary"
                style={{ margin: '0 auto' }}
                onClick={handleJoin}
                disabled={joinPending}
              >
                {joinPending ? 'JOINING PARTY...' : 'JOIN WATCH PARTY'}
              </button>
            </div>
          ) : !prediction ? (
            /* Prediction Staking Form */
            <div className="glass-strong" style={{ padding: 40, marginBottom: 24 }}>
              <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: 24 }}>
                PREDICT THE FINAL SCORE
              </label>
              <AIAgent 
                matchId={room.matchId} 
                homeTeam={match.homeTeam} 
                awayTeam={match.awayTeam} 
                onSelectPrediction={(home, away) => {
                  setHomeScore(home);
                  setAwayScore(away);
                  toast.success(`Score auto-filled: ${home} - ${away}! 🤖`);
                }}
                autoStart={true}
              />
              <div className="score-inputs" style={{ marginTop: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-dim)',
                    marginBottom: 10,
                    fontFamily: 'var(--font)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>HOME ({match.homeTeam})</div>
                  <input className="form-input score-input" type="number" min="0" max="20"
                    value={homeScore} onChange={(e) => setHomeScore(Number(e.target.value))} />
                </div>
                <div className="score-separator">—</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-dim)',
                    marginBottom: 10,
                    fontFamily: 'var(--font)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>AWAY ({match.awayTeam})</div>
                  <input className="form-input score-input" type="number" min="0" max="20"
                    value={awayScore} onChange={(e) => setAwayScore(Number(e.target.value))} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 28 }}>
                <label className="form-label">STAKE AMOUNT (OKB)</label>
                <input className="form-input" type="number" step="0.01" min={room.minStake} max={room.maxStake}
                  value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} />
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handlePredict}
                disabled={predPending}
              >
                {predPending ? 'LOCKING IN WALLET...' : 'LOCK IN PREDICTION & STAKE'}
              </button>
            </div>
          ) : (
            /* Locked In Prediction Detail Card */
            <div className="glass-strong" style={{ padding: 40, marginBottom: 24, textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font)',
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-dimmer)',
                marginBottom: 12,
              }}>
                YOUR PREDICTION LOCKED
              </p>
              <div style={{
                fontFamily: 'var(--font-head)',
                fontSize: '2.8rem',
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                margin: '16px 0',
              }}>
                {prediction.predictedHomeScore} — {prediction.predictedAwayScore}
              </div>
              <p style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Staked: <strong style={{ color: 'var(--fg)' }}>{prediction.stakeAmount} OKB</strong>
              </p>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link to="/collection" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.72rem' }}>
                  🎟️ VIEW NFT TICKET
                </Link>
                <button
                  onClick={() => {
                    const tweetText = encodeURIComponent(
                      `🏟️ I just locked in a prediction of ${prediction.predictedHomeScore} - ${prediction.predictedAwayScore} on @MatchStake for ${match.homeTeam} vs ${match.awayTeam}! Staked ${prediction.stakeAmount} OKB on @XLayerOfficial! #WorldCup2026 #MatchStake`
                    );
                    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.72rem' }}
                >
                  SHARE TO X
                </button>
              </div>
            </div>
          )}

          <LiveHypeNFT
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            prediction={prediction ? `${prediction.predictedHomeScore} - ${prediction.predictedAwayScore}` : `${homeScore} - ${awayScore}`}
          />
        </div>

        {/* Right Column: Chat & Agent Action Console */}
        <div>
          <RoomChat 
            homeTeam={match.homeTeam} 
            awayTeam={match.awayTeam} 
            onSelectPrediction={(home, away) => {
              setHomeScore(home);
              setAwayScore(away);
            }} 
          />

          <AgentActionConsole compact matchLabel={`${match.homeTeam} vs ${match.awayTeam}`} />

          {/* Claim / Resolution Section */}
          {isMember && prediction && (
            <div className="glass" style={{ padding: 32, textAlign: 'center', marginBottom: 24 }}>
              <h3 style={{
                fontFamily: 'var(--font-head)',
                fontSize: '0.98rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                ORACLE RESOLUTION STATUS
              </h3>
              
              {!match.resolved ? (
                <div>
                  <p style={{
                    color: 'var(--text-dim)',
                    fontSize: '0.78rem',
                    marginBottom: 0,
                    fontFamily: 'var(--font)',
                    lineHeight: 1.7,
                  }}>
                    The match is not resolved yet. Once the score is finalized by the admin oracle, you can claim winnings here.
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{
                    color: 'var(--text-dim)',
                    fontSize: '0.82rem',
                    marginBottom: 20,
                    fontFamily: 'var(--font)',
                    lineHeight: 1.7,
                  }}>
                    Match ended: <strong style={{ color: 'var(--fg)' }}>{match.homeScore} — {match.awayScore}</strong>.
                  </p>
                  
                  {prediction.claimed ? (
                    <div style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.88rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      ✓ Winnings Claimed Successfully
                    </div>
                  ) : (
                    <div>
                      {prediction.predictedResult === match.result ? (
                        <div>
                          <p style={{ color: 'var(--gold)', fontSize: '0.82rem', marginBottom: 20, fontWeight: 500 }}>
                            Your prediction result was correct! Proportional pot is ready.
                          </p>
                          <button
                            className="btn btn-secondary"
                            style={{ margin: '0 auto' }}
                            onClick={handleClaim}
                            disabled={claimPending}
                          >
                            {claimPending ? 'CLAIMING WINNINGS...' : 'CLAIM WINNINGS'}
                          </button>
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-dimmer)', fontSize: '0.78rem' }}>
                        Your prediction did not win this time. Better luck in the next match!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Invite Link */}
          <div className="invite-box" style={{ marginTop: 0 }}>
            <code>SHARE: {window.location.href}</code>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 16px', fontSize: '0.68rem' }}
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
            >
              COPY
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
