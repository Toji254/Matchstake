import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, parseContractError } from '../config/contract';
import { formatEther } from 'viem';

export default function Squads() {
  const isDemo = window.location.search.includes('demo=true');
  const { address: realAddress, isConnected: realIsConnected } = useAccount();
  const isConnected = isDemo ? true : realIsConnected;
  const address = isDemo ? (realAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') : realAddress;

  const [squadName, setSquadName] = useState('');
  const [joinSquadId, setJoinSquadId] = useState('');
  const [squads, setSquads] = useState([]);
  const [userSquadId, setUserSquadId] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Read top squads
  const { data: onChainSquads, isError, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTopSquads',
    args: [10n],
  });

  // Read user's squad
  const { data: userOnChainSquad } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'userSquad',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Write contracts
  const { writeContractAsync, data: hash } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isDemo) {
      setSquads([
        { squadId: 1, name: 'X LAYER CHAMPIONS', captain: '0x7099...79C8', memberCount: 14, totalPredictions: 45, totalPoints: 284, totalWinnings: 12500000000000000000n },
        { squadId: 2, name: 'OKX STAKERS', captain: '0x3C44...3BCF', memberCount: 11, totalPredictions: 32, totalPoints: 198, totalWinnings: 8400000000000000000n },
        { squadId: 3, name: 'FIFA ELITE', captain: '0x90F7...b906', memberCount: 8, totalPredictions: 24, totalPoints: 142, totalWinnings: 4200000000000000000n },
        { squadId: 4, name: 'ZK ROLLUP BOYS', captain: '0x15d3...3345', memberCount: 6, totalPredictions: 18, totalPoints: 95, totalWinnings: 2100000000000000000n },
      ]);
      return;
    }
    if (onChainSquads && onChainSquads.length > 0) {
      const formatted = onChainSquads
        .filter(s => s.name && s.squadId !== 0n)
        .map(s => ({
          squadId: Number(s.squadId),
          name: s.name,
          captain: `${s.captain.slice(0, 6)}...${s.captain.slice(-4)}`,
          memberCount: Number(s.memberCount),
          totalPredictions: Number(s.totalPredictions),
          totalPoints: Number(s.totalPoints),
          totalWinnings: s.totalWinnings,
        }));
      setSquads(formatted);
    } else {
      setSquads([]);
    }
  }, [onChainSquads, isDemo]);

  useEffect(() => {
    if (userOnChainSquad !== undefined && !isDemo) {
      setUserSquadId(Number(userOnChainSquad));
    }
  }, [userOnChainSquad, isDemo]);

  useEffect(() => {
    if (isTxSuccess && !isDemo) {
      setSuccessMsg('Transaction completed successfully on X Layer Testnet!');
      setSquadName('');
      setJoinSquadId('');
      refetch();
    }
  }, [isTxSuccess, refetch, isDemo]);

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isConnected) {
      setErrorMsg('Please connect your wallet to create a squad.');
      return;
    }

    if (!squadName.trim()) {
      setErrorMsg('Squad name cannot be empty.');
      return;
    }

    if (isDemo) {
      setSuccessMsg(`Initialized Squad "${squadName.toUpperCase()}" successfully on X Layer Testnet! (MOCK)`);
      setUserSquadId(12);
      setSquads(prev => [
        ...prev,
        { squadId: 12, name: squadName.toUpperCase(), captain: '0xf39F...266', memberCount: 1, totalPredictions: 0, totalPoints: 0, totalWinnings: 0n }
      ]);
      setSquadName('');
      return;
    }

    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createSquad',
        args: [squadName],
      });
    } catch (err) {
      setErrorMsg(parseContractError(err, 'Failed to create squad.'));
    }
  };

  const handleJoinSquad = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isConnected) {
      setErrorMsg('Please connect your wallet to join a squad.');
      return;
    }

    const sId = parseInt(joinSquadId);
    if (isNaN(sId) || sId <= 0) {
      setErrorMsg('Please enter a valid Squad ID.');
      return;
    }

    if (isDemo) {
      setSuccessMsg(`Joined Squad #${sId} successfully on X Layer Testnet! (MOCK)`);
      setUserSquadId(sId);
      setJoinSquadId('');
      return;
    }

    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'joinSquad',
        args: [BigInt(sId)],
      });
    } catch (err) {
      setErrorMsg(parseContractError(err, 'Failed to join squad.'));
    }
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
            <span className="section-label">🏆 GAMEFI LEAGUE</span>
            <h1 style={{
              fontFamily: 'var(--font-head)',
              fontSize: '3rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '8px 0 0 0',
              textTransform: 'uppercase'
            }}>
              Squad Arena
            </h1>
            <p style={{
              color: 'var(--text-dim)',
              fontSize: '0.9rem',
              maxWidth: 600,
              margin: '8px 0 0 0'
            }}>
              Join forces with friends to build the ultimate staking squad. 
              Earn collective points, dominate the squad leaderboard, and split payouts.
            </p>
          </div>

          <span className="badge-demo" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
            X LAYER TESTNET
          </span>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="glass-strong" style={{
            padding: '12px 20px',
            border: '1px solid #ef4444',
            color: '#ef4444',
            marginBottom: 32,
            fontFamily: 'var(--font)',
            fontSize: '0.8rem'
          }}>
            ERROR: {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="glass-strong" style={{
            padding: '12px 20px',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            marginBottom: 32,
            fontFamily: 'var(--font)',
            fontSize: '0.8rem'
          }}>
            SUCCESS: {successMsg}
          </div>
        )}
        {isTxLoading && (
          <div className="glass-strong" style={{
            padding: '12px 20px',
            border: '1px solid var(--border-light)',
            marginBottom: 32,
            fontFamily: 'var(--font)',
            fontSize: '0.8rem'
          }}>
            TRANSACTION PENDING ON X LAYER... PLEASE WAIT.
          </div>
        )}

        {/* Action Panel: Create / Join */}
        {userSquadId === 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            marginBottom: 60
          }}>
            {/* Create Squad */}
            <div className="glass" style={{ padding: 32, border: '1px solid var(--border-light)' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 20px 0' }}>
                CREATE A NEW SQUAD
              </h2>
              <form onSubmit={handleCreateSquad}>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">SQUAD NAME</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="ENTER SQUAD NAME..."
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isTxLoading}>
                  INITIALIZE SQUAD
                </button>
              </form>
            </div>

            {/* Join Squad */}
            <div className="glass" style={{ padding: 32, border: '1px solid var(--border-light)' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 20px 0' }}>
                JOIN AN EXISTING SQUAD
              </h2>
              <form onSubmit={handleJoinSquad}>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">SQUAD ID</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="ENTER SQUAD ID..."
                    value={joinSquadId}
                    onChange={(e) => setJoinSquadId(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled={isTxLoading}>
                  JOIN SQUAD
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="glass-strong" style={{
            padding: 24,
            border: '1px solid var(--gold)',
            marginBottom: 60,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <span className="badge-demo" style={{ backgroundColor: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>
                YOUR SQUAD ID: #{userSquadId}
              </span>
              <p style={{ margin: '8px 0 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                You are currently representing Squad #{userSquadId}. Your predictions and winnings contribute to this squad's leaderboard ranking.
              </p>
            </div>
            <button 
              onClick={() => {
                const tweetText = encodeURIComponent(
                  `🏟️ I just joined Squad #${userSquadId} on @MatchStake! Staking OKB together on @XLayerOfficial. Join us! #WorldCup2026 #MatchStake`
                );
                window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
              }}
              className="btn btn-secondary"
            >
              SHARE SQUAD REPRESENTATION
            </button>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="glass" style={{ border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          <div style={{
            padding: '24px 32px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              SQUAD RANKINGS
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dimmer)', fontFamily: 'var(--font)', letterSpacing: '0.1em' }}>
              ORDERED BY AGGREGATE POINTS
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {squads.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                No squads created yet. Be the first to create one!
              </div>
            ) : (
              <table className="leaderboard-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-dimmer)', fontSize: '0.7rem', fontFamily: 'var(--font)' }}>
                    <th style={{ padding: '16px 32px' }}>RANK</th>
                    <th style={{ padding: '16px 20px' }}>SQUAD</th>
                    <th style={{ padding: '16px 20px' }}>CAPTAIN</th>
                    <th style={{ padding: '16px 20px' }}>MEMBERS</th>
                    <th style={{ padding: '16px 20px' }}>PREDICTIONS</th>
                    <th style={{ padding: '16px 20px' }}>POINTS</th>
                    <th style={{ padding: '16px 32px', textAlign: 'right' }}>TOTAL WINNINGS</th>
                  </tr>
                </thead>
                <tbody>
                  {squads.map((squad, index) => {
                    const isUserSquad = squad.squadId === userSquadId;
                    return (
                      <tr 
                        key={squad.squadId} 
                        style={{ 
                          borderBottom: index < squads.length - 1 ? '1px solid var(--border-light)' : 'none',
                          backgroundColor: isUserSquad ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                          fontWeight: isUserSquad ? 'bold' : 'normal'
                        }}
                      >
                        <td style={{ padding: '20px 32px', fontFamily: 'var(--font)', fontSize: '0.85rem' }}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </td>
                        <td style={{ padding: '20px 20px', fontFamily: 'var(--font)', fontSize: '0.85rem' }}>
                          {squad.name} {isUserSquad && <span style={{ color: 'var(--gold)', fontSize: '0.7rem', marginLeft: 8 }}>[YOU]</span>}
                        </td>
                        <td style={{ padding: '20px 20px', fontFamily: 'var(--font)', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                          {squad.captain}
                        </td>
                        <td style={{ padding: '20px 20px', fontFamily: 'var(--font)', fontSize: '0.85rem' }}>
                          {squad.memberCount}
                        </td>
                        <td style={{ padding: '20px 20px', fontFamily: 'var(--font)', fontSize: '0.85rem' }}>
                          {squad.totalPredictions}
                        </td>
                        <td style={{ padding: '20px 20px', fontFamily: 'var(--font)', fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                          {squad.totalPoints}
                        </td>
                        <td style={{ padding: '20px 32px', fontFamily: 'var(--font)', fontSize: '0.85rem', textAlign: 'right' }}>
                          {formatEther(squad.totalWinnings)} OKB
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
