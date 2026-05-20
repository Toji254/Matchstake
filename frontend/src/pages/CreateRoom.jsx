import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import AIAgent from '../components/AIAgent';

const DEMO_MATCHES = {
  1: { home: 'Mexico', away: 'Canada' }, 2: { home: 'USA', away: 'Morocco' },
  3: { home: 'Argentina', away: 'Japan' }, 4: { home: 'Brazil', away: 'South Korea' },
  5: { home: 'France', away: 'Germany' }, 6: { home: 'England', away: 'Spain' },
  7: { home: 'Portugal', away: 'Netherlands' }, 8: { home: 'Italy', away: 'Senegal' },
};

export default function CreateRoom() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  const { data: matchData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getMatch',
    args: [BigInt(matchId)],
    query: {
      enabled: !!matchId && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });

  const match = useMemo(() => {
    if (matchData) {
      return {
        home: matchData.homeTeam,
        away: matchData.awayTeam,
      };
    }
    return DEMO_MATCHES[matchId] || { home: 'Team A', away: 'Team B' };
  }, [matchData, matchId]);

  const [minStake, setMinStake] = useState('0.01');
  const [maxStake, setMaxStake] = useState('1');
  const [maxMembers, setMaxMembers] = useState('10');
  const [demoSuccess, setDemoSuccess] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isDemoMode = CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' || !isConnected;

  const handleCreate = () => {
    if (isDemoMode) {
      toast.success('Room created (Demo Mode Simulation)! 🎉');
      setDemoSuccess(true);
      setTimeout(() => {
        navigate(`/room/1`);
      }, 1500);
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createRoom',
      args: [BigInt(matchId), parseEther(minStake), parseEther(maxStake), BigInt(maxMembers)],
    }, {
      onSuccess: () => toast.success('Room created! 🎉'),
      onError: (err) => toast.error(err.shortMessage || 'Transaction failed'),
    });
  };

  return (
    <main className="room-container">
      <div className="room-header">
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <span className="badge-demo">
            MATCH #{matchId}
          </span>
          {isDemoMode && (
            <span className="badge-demo">
              DEMO MODE
            </span>
          )}
        </div>
        <h2>{match.home} VS {match.away}</h2>
        <p style={{
          fontFamily: 'var(--font)',
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
          marginTop: 12,
          lineHeight: 1.7,
        }}>
          Set up your room and invite friends
        </p>
      </div>

      <AIAgent matchId={matchId} homeTeam={match.home} awayTeam={match.away} />

      <div className="glass-strong" style={{ padding: 40 }}>
        <div className="form-group">
          <label className="form-label">Minimum Stake (OKB)</label>
          <input className="form-input" type="number" step="0.01" min="0.001" value={minStake}
            onChange={(e) => setMinStake(e.target.value)} placeholder="0.01" />
        </div>

        <div className="form-group">
          <label className="form-label">Maximum Stake (OKB)</label>
          <input className="form-input" type="number" step="0.1" min="0.01" value={maxStake}
            onChange={(e) => setMaxStake(e.target.value)} placeholder="1" />
        </div>

        <div className="form-group">
          <label className="form-label">Max Members (2–50)</label>
          <input className="form-input" type="number" min="2" max="50" value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)} placeholder="10" />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
          onClick={handleCreate}
          disabled={isPending || isConfirming || demoSuccess}
        >
          {isPending ? 'CONFIRM IN WALLET...' : isConfirming ? 'CONFIRMING...' : demoSuccess ? 'REDIRECTING...' : 'CREATE WATCH PARTY ROOM'}
        </button>

        {(isSuccess || demoSuccess) && (
          <div className="invite-box" style={{ marginTop: 24 }}>
            <span style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--fg)' }}>
              Room created successfully. Redirecting you to the room page...
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
