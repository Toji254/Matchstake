import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI, parseContractError } from '../config/contract';
import AIAgent from '../components/AIAgent';

export default function CreateRoom() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { isConnected: realIsConnected } = useAccount();
  const isDemo = window.location.search.includes('demo=true');
  const isConnected = isDemo ? true : realIsConnected;

  const { data: matchData, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getMatch',
    args: [BigInt(matchId)],
  });

  const match = useMemo(() => {
    if (isDemo) {
      const demoMatches = {
        1: { home: 'Mexico', away: 'South Africa' },
        2: { home: 'Korea Republic', away: 'Czechia' },
        3: { home: 'Canada', away: 'Bosnia and Herzegovina' },
        4: { home: 'USA', away: 'Paraguay' },
        5: { home: 'Qatar', away: 'Switzerland' },
        6: { home: 'Brazil', away: 'Morocco' },
        7: { home: 'Haiti', away: 'Scotland' },
        8: { home: 'Australia', away: 'Türkiye' },
        9: { home: 'Germany', away: 'Curaçao' },
        10: { home: 'Netherlands', away: 'Japan' },
      };
      return demoMatches[matchId] || { home: 'Mexico', away: 'South Africa' };
    }
    if (matchData && matchData.homeTeam) {
      return {
        home: matchData.homeTeam,
        away: matchData.awayTeam,
      };
    }
    return null;
  }, [matchData, isDemo, matchId]);

  const [minStake, setMinStake] = useState('0.01');
  const [maxStake, setMaxStake] = useState('1');
  const [maxMembers, setMaxMembers] = useState('10');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Navigate to room after successful creation
  useEffect(() => {
    if (isSuccess && hash) {
      toast.success('Room created on X Layer Testnet! Redirecting...');
      setTimeout(() => navigate('/matches'), 2000);
    }
  }, [isSuccess, hash, navigate]);

  const handleCreate = () => {
    if (!isConnected) {
      toast.error('Connect your wallet first!');
      return;
    }
    if (isDemo) {
      toast.success('Room creation tx submitted to X Layer Testnet! 🎉 (MOCK)');
      setTimeout(() => {
        toast.success('Room created on X Layer Testnet! Redirecting... (MOCK)');
        navigate('/room/1?demo=true');
      }, 1200);
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createRoom',
      args: [BigInt(matchId), parseEther(minStake), parseEther(maxStake), BigInt(maxMembers)],
    }, {
      onSuccess: () => toast.success('Room creation tx submitted to X Layer Testnet! 🎉'),
      onError: (err) => {
        console.error('CreateRoom error:', err);
        toast.error(parseContractError(err, 'Failed to create room'));
      },
    });
  };

  const isLoadingActual = isLoading && !isDemo;

  if (isLoadingActual) {
    return (
      <main className="room-container">
        <div className="glass-strong skeleton" style={{ height: 300 }}></div>
      </main>
    );
  }

  const isErrorActual = isError && !isDemo;

  if (isErrorActual || !match) {
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
            MATCH NOT FOUND
          </h2>
          <p style={{
            fontFamily: 'var(--font)',
            fontSize: '0.82rem',
            color: 'var(--text-dim)',
            lineHeight: 1.7,
            maxWidth: '40ch',
            margin: '0 auto 24px',
          }}>
            Match #{matchId} was not found on the X Layer Testnet contract.
            Ensure contracts are deployed and matches have been seeded.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="room-container">
      <div className="room-header">
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <span className="badge-demo">
            MATCH #{matchId}
          </span>
          <span className="badge-demo" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
            X LAYER TESTNET
          </span>
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
        {!isConnected && (
          <div style={{
            padding: '12px 16px',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            marginBottom: 24,
            fontFamily: 'var(--font)',
            fontSize: '0.75rem',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}>
            ⚠ CONNECT YOUR WALLET TO CREATE A ROOM ON X LAYER TESTNET
          </div>
        )}

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
          disabled={isPending || isConfirming || !isConnected}
        >
          {isPending ? 'CONFIRM IN WALLET...' : isConfirming ? 'CONFIRMING ON X LAYER...' : isSuccess ? 'ROOM CREATED ✓' : 'CREATE WATCH PARTY ROOM'}
        </button>

        {isSuccess && (
          <div className="invite-box" style={{ marginTop: 24 }}>
            <span style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--fg)' }}>
              Room created successfully on X Layer Testnet! Redirecting...
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
