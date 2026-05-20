import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import AIAgent from '../components/AIAgent';

const DEMO_ROOMS = {
  1: { home: 'Mexico', away: 'Canada', kickoff: 1749654000, totalPool: '0.45' },
  2: { home: 'USA', away: 'Morocco', kickoff: 1749740400, totalPool: '0.80' },
  3: { home: 'Argentina', away: 'Japan', kickoff: 1749826800, totalPool: '1.20' },
  4: { home: 'Brazil', away: 'South Korea', kickoff: 1749826800, totalPool: '0.95' },
  5: { home: 'France', away: 'Germany', kickoff: 1749913200, totalPool: '2.10' },
  6: { home: 'England', away: 'Spain', kickoff: 1749913200, totalPool: '3.40' },
};

export default function Room() {
  const { roomId } = useParams();
  const { address, isConnected } = useAccount();

  // Prediction form state
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('0.1');

  // Local demo states
  const [demoIsMember, setDemoIsMember] = useState(false);
  const [demoPrediction, setDemoPrediction] = useState(null);
  const [demoClaimed, setDemoClaimed] = useState(false);

  // Wagmi Write hooks
  const { writeContract: joinRoomWrite, isPending: joinPending } = useWriteContract();
  const { writeContract: predictWrite, isPending: predPending } = useWriteContract();
  const { writeContract: claimWrite, isPending: claimPending } = useWriteContract();

  // Wagmi Read hooks
  const { data: roomData, isLoading: isRoomLoading, refetch: refetchRoom } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRoom',
    args: [BigInt(roomId)],
    query: {
      enabled: !!roomId && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });

  const matchId = roomData ? Number(roomData.matchId) : null;

  const { data: matchData, isLoading: isMatchLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getMatch',
    args: [matchId ? BigInt(matchId) : BigInt(0)],
    query: {
      enabled: !!matchId && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });

  const { data: roomMembers, refetch: refetchMembers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRoomMembers',
    args: [BigInt(roomId)],
    query: {
      enabled: !!roomId && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });

  const { data: userPrediction, refetch: refetchPrediction } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPrediction',
    args: [BigInt(roomId), address || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: !!roomId && !!address && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });

  // Determine mode
  const isDemoMode = CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' || !roomData;

  // Derived structures
  const room = useMemo(() => {
    if (roomData) {
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
    }
    const dr = DEMO_ROOMS[roomId] || { home: 'Team A', away: 'Team B', kickoff: 1749654000, totalPool: '0.50' };
    return {
      roomId: Number(roomId),
      creator: '0x0000...0000',
      matchId: 1,
      minStake: '0.01',
      maxStake: '1.0',
      maxMembers: 10,
      totalPool: dr.totalPool,
      memberCount: demoIsMember ? 4 : 3,
      status: 0,
    };
  }, [roomData, roomId, demoIsMember]);

  const match = useMemo(() => {
    if (matchData) {
      return {
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        kickoffTime: Number(matchData.kickoffTime),
        homeScore: Number(matchData.homeScore),
        awayScore: Number(matchData.awayScore),
        resolved: matchData.resolved,
        result: Number(matchData.result),
      };
    }
    const dm = DEMO_ROOMS[roomId] || { home: 'Team A', away: 'Team B', kickoff: 1749654000 };
    return {
      homeTeam: dm.home,
      awayTeam: dm.away,
      kickoffTime: dm.kickoff,
      homeScore: 0,
      awayScore: 0,
      resolved: false,
      result: 0,
    };
  }, [matchData, roomId]);

  const isMember = useMemo(() => {
    if (isDemoMode) return demoIsMember;
    if (roomMembers && address) {
      return roomMembers.some((m) => m.toLowerCase() === address.toLowerCase());
    }
    return false;
  }, [roomMembers, address, isDemoMode, demoIsMember]);

  const prediction = useMemo(() => {
    if (isDemoMode) return demoPrediction;
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
  }, [userPrediction, isDemoMode, demoPrediction]);

  const getResult = (h, a) => {
    if (h > a) return 1; // HOME_WIN
    if (a > h) return 2; // AWAY_WIN
    return 3; // DRAW
  };

  const handleJoin = () => {
    if (!isConnected) { toast.error('Connect wallet first!'); return; }
    if (isDemoMode) {
      toast.success('Joined Room (Demo Mode) 🤝');
      setDemoIsMember(true);
      return;
    }
    joinRoomWrite({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'joinRoom',
      args: [BigInt(roomId)],
    }, {
      onSuccess: () => {
        toast.success('Joined Watch Party! 🤝');
        refetchMembers();
      },
      onError: (err) => toast.error(err.shortMessage || 'Join failed'),
    });
  };

  const handlePredict = () => {
    if (!isConnected) { toast.error('Connect wallet first!'); return; }
    if (Number(stakeAmount) < Number(room.minStake) || Number(stakeAmount) > Number(room.maxStake)) {
      toast.error(`Stake must be between ${room.minStake} and ${room.maxStake} OKB`);
      return;
    }
    if (isDemoMode) {
      const result = getResult(homeScore, awayScore);
      toast.success('Prediction Locked (Demo Mode) 🎯');
      setDemoPrediction({
        predictedResult: result,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
        stakeAmount: stakeAmount,
        claimed: false,
        points: 0,
      });
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
      onSuccess: () => {
        toast.success('Prediction Locked! 🎯');
        refetchPrediction();
        refetchRoom();
      },
      onError: (err) => toast.error(err.shortMessage || 'Failed to submit prediction'),
    });
  };

  const handleClaim = () => {
    if (isDemoMode) {
      toast.success('Winnings claimed (Demo Mode) 💰');
      setDemoClaimed(true);
      return;
    }
    claimWrite({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(roomId)],
    }, {
      onSuccess: () => {
        toast.success('Winnings Claimed! 💰');
        refetchPrediction();
      },
      onError: (err) => toast.error(err.shortMessage || 'Claim failed'),
    });
  };

  if (isRoomLoading || isMatchLoading) {
    return (
      <main className="room-container">
        <div className="glass-strong skeleton" style={{ height: 400 }}></div>
      </main>
    );
  }

  return (
    <main className="room-container">
      <div className="room-header">
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <span className="badge-demo">
            ROOM #{roomId}
          </span>
          {isDemoMode && (
            <span className="badge-demo">
              DEMO MODE
            </span>
          )}
        </div>
        <h2>{match.homeTeam} VS {match.awayTeam}</h2>
        <div className="room-pool">
          <span className="label">TOTAL POT:</span> {room.totalPool} OKB
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dimmer)', marginTop: 8 }}>
          Limit: {room.minStake} – {room.maxStake} OKB // Members: {room.memberCount}/{room.maxMembers}
        </p>
      </div>

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
                const outcome = prediction.predictedResult === 1 ? 'Home Win' : prediction.predictedResult === 2 ? 'Away Win' : 'Draw';
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

      {/* Claim / Resolution Section */}
      {isMember && prediction && (
        <div className="glass" style={{ padding: 32, textAlign: 'center' }}>
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
              
              {demoClaimed || prediction.claimed ? (
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
                      Your prediction did not win this time. Better luck in the next matchWatch!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Invite Link */}
      <div className="invite-box" style={{ marginTop: 24 }}>
        <code>SHARE: {window.location.href}</code>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 16px', fontSize: '0.68rem' }}
          onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
        >
          COPY
        </button>
      </div>
    </main>
  );
}
