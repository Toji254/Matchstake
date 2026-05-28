import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI, parseContractError, checkDemoMode } from '../config/contract';
import { TARGET_CHAIN_ID } from '../config/wagmi';
import AIAgent from '../components/AIAgent';
import { trackTransaction } from '../utils/txLedger';

export default function CreateRoom() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { isConnected: realIsConnected, chain } = useAccount();
  const isDemo = checkDemoMode();
  const isConnected = isDemo ? true : realIsConnected;
  const isWrongChain = !chain || chain.id !== TARGET_CHAIN_ID;

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
        resolved: matchData.resolved,
      };
    }
    return null;
  }, [matchData, isDemo, matchId]);

  const [minStake, setMinStake] = useState('0.01');
  const [maxStake, setMaxStake] = useState('1');
  const [maxMembers, setMaxMembers] = useState('10');
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const submitLockRef = useRef(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  // Navigate to room after successful creation
  useEffect(() => {
    if (isSuccess && hash) {
      let createdRoomId = 1;
      if (receipt && receipt.logs) {
        try {
          const log = receipt.logs.find(
            (l) => l.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
          );
          if (log && log.topics && log.topics.length > 1) {
            createdRoomId = Number(BigInt(log.topics[1]));
          }
        } catch (err) {
          console.error('Failed to parse roomId from receipt:', err);
        }
      }

      toast.success(
        <span>
          Room created on X Layer Testnet! 🏟️{' '}
          <a href={`https://www.oklink.com/xlayer-test/tx/${hash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#22c55e', marginLeft: 8, fontWeight: 700 }}>
            [VIEW TX]
          </a>
        </span>,
        { duration: 8000 }
      );
      setTimeout(() => navigate(`/room/${createdRoomId}${isDemo ? '?demo=true' : ''}`), 2500);
    }
  }, [isSuccess, hash, receipt, navigate, isDemo]);

  const handleCreate = () => {
    if (submitLockRef.current || isSubmittingTx || isPending || isConfirming) {
      toast.error('Transaction already pending in wallet.');
      return;
    }

    if (!isConnected) {
      toast.error('Connect your wallet first!');
      return;
    }
    if (isWrongChain && !isDemo) {
      toast.error('Please switch your wallet network to X Layer Testnet first!');
      return;
    }
    if (match?.resolved) {
      toast.error('This match has already been resolved. You cannot create a room.');
      return;
    }

    // Input validations
    const minStakeNum = parseFloat(minStake);
    const maxStakeNum = parseFloat(maxStake);
    const maxMembersNum = parseInt(maxMembers, 10);

    if (isNaN(minStakeNum) || minStakeNum <= 0) {
      toast.error('Minimum stake must be a positive number greater than 0.');
      return;
    }
    if (isNaN(maxStakeNum) || maxStakeNum < minStakeNum) {
      toast.error('Maximum stake must be greater than or equal to the minimum stake.');
      return;
    }
    if (isNaN(maxMembersNum) || maxMembersNum < 2 || maxMembersNum > 50) {
      toast.error('Max members must be an integer between 2 and 50.');
      return;
    }

    if (!isDemo) {
      // Validate that match actually exists on-chain
      if (!matchData || matchData.matchId === 0n) {
        toast.error('This match does not exist on the smart contract. You cannot create a room for it.');
        return;
      }
    }

    if (isDemo) {
      toast.success('Room creation tx submitted to X Layer Testnet! 🎉 (MOCK)');
      setTimeout(() => {
        toast.success('Room created on X Layer Testnet! Redirecting... (MOCK)');
        navigate('/room/1?demo=true');
      }, 1200);
      return;
    }

    let minStakeWei;
    let maxStakeWei;
    try {
      minStakeWei = parseEther(minStake);
      maxStakeWei = parseEther(maxStake);
    } catch (err) {
      toast.error('Invalid stake format. Please use numeric values only.');
      return;
    }

    submitLockRef.current = true;
    setIsSubmittingTx(true);
    writeContract(
      {
        chainId: TARGET_CHAIN_ID,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createRoom',
        args: [BigInt(matchId), minStakeWei, maxStakeWei, BigInt(maxMembersNum)],
      },
      {
        onSuccess: (txHash) => {
          trackTransaction({ hash: txHash, action: `Create Room #${matchId}`, category: 'main' });
          toast.success(
            <span>
              Room creation tx submitted! 🎉{' '}
              <a href={`https://www.oklink.com/xlayer-test/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#22c55e', marginLeft: 8, fontWeight: 700 }}>
                [VIEW TX]
              </a>
            </span>,
            { duration: 8000 }
          );
        },
        onError: (err) => {
          console.error('CreateRoom error:', err);
          toast.error(parseContractError(err, 'Failed to create room'));
        },
        onSettled: () => {
          submitLockRef.current = false;
          setIsSubmittingTx(false);
        },
      }
    );
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
        {match?.resolved && (
          <div style={{
            padding: '14px 18px',
            border: '1px solid #ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            marginBottom: 24,
            fontFamily: 'var(--font)',
            fontSize: '0.78rem',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            ⚠ MATCH RESOLVED: This match has already concluded. You cannot create new prediction rooms for completed matches.
          </div>
        )}

        {!isConnected && !match?.resolved && (
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
            onChange={(e) => setMinStake(e.target.value)} placeholder="0.01" disabled={!!match?.resolved} />
        </div>

        <div className="form-group">
          <label className="form-label">Maximum Stake (OKB)</label>
          <input className="form-input" type="number" step="0.1" min="0.01" value={maxStake}
            onChange={(e) => setMaxStake(e.target.value)} placeholder="1" disabled={!!match?.resolved} />
        </div>

        <div className="form-group">
          <label className="form-label">Max Members (2–50)</label>
          <input className="form-input" type="number" min="2" max="50" value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)} placeholder="10" disabled={!!match?.resolved} />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 12, justifyContent: 'center', opacity: match?.resolved ? 0.5 : 1 }}
          onClick={handleCreate}
          disabled={isSubmittingTx || isPending || isConfirming || !isConnected || !!match?.resolved}
        >
          {match?.resolved
            ? 'MATCH RESOLVED (CLOSED)'
            : isSubmittingTx || isPending
              ? 'CONFIRM IN WALLET...'
              : isConfirming
                ? 'CONFIRMING ON X LAYER...'
                : isSuccess
                  ? 'ROOM CREATED ✓'
                  : 'CREATE WATCH PARTY ROOM'}
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
