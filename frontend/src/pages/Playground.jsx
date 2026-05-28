import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, parseContractError } from '../config/contract';
import toast from 'react-hot-toast';
import { trackTransaction } from '../utils/txLedger';

export default function Playground() {
  const { isConnected, address } = useAccount();
  
  // State for creating a match
  const [createHome, setCreateHome] = useState('Argentina');
  const [createAway, setCreateAway] = useState('France');
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);

  // State for resolving a match
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [resolveHomeScore, setResolveHomeScore] = useState('2');
  const [resolveAwayScore, setResolveAwayScore] = useState('1');
  const [isResolvingMatch, setIsResolvingMatch] = useState(false);

  // State for creating a squad
  const [squadName, setSquadName] = useState('');

  // Read matches from the contract
  const { data: matchIds, refetch: refetchMatchIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllMatchIds',
  });

  const { data: matchesData, refetch: refetchMatches } = useReadContracts({
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

  // Read rooms from the contract
  const { data: roomIds, refetch: refetchRoomIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllRoomIds',
  });

  const { data: roomsData, refetch: refetchRooms } = useReadContracts({
    contracts: (roomIds || []).map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getRoom',
      args: [id],
    })),
    query: {
      enabled: !!roomIds && roomIds.length > 0,
    }
  });

  // Read user's current squad
  const { data: userOnChainSquad, refetch: refetchUserSquad } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'userSquad',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Map on-chain matches
  const matches = useMemo(() => {
    if (matchesData && matchesData.length > 0) {
      return matchesData
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
    }
    return [];
  }, [matchesData]);

  // Map on-chain rooms
  const rooms = useMemo(() => {
    if (roomsData && roomsData.length > 0) {
      return roomsData
        .filter((res) => res.status === 'success' && res.result)
        .map((res) => {
          const room = res.result;
          return {
            roomId: Number(room.roomId),
            creator: room.creator,
            matchId: Number(room.matchId),
            minStake: room.minStake,
            maxStake: room.maxStake,
            totalPool: room.totalPool,
            memberCount: Number(room.memberCount),
            status: Number(room.status), // 0 = OPEN, 1 = LOCKED, 2 = RESOLVED
          };
        });
    }
    return [];
  }, [roomsData]);

  // On-chain write for Resolving Room
  const { writeContract: writeResolveRoom, data: resolveRoomHash, isPending: isResolveRoomPending } = useWriteContract();
  const { isLoading: isResolveRoomConfirming } = useWaitForTransactionReceipt({ hash: resolveRoomHash });

  // On-chain write for Claiming Winnings
  const { writeContract: writeClaimWinnings, data: claimHash, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isClaimConfirming } = useWaitForTransactionReceipt({ hash: claimHash });

  // On-chain write for Creating Squad
  const { writeContract: writeCreateSquad, data: createSquadHash, isPending: isCreateSquadPending } = useWriteContract();
  const { isLoading: isCreateSquadConfirming } = useWaitForTransactionReceipt({ hash: createSquadHash });

  // Transaction history tracker state with localStorage persistence
  const [txs, setTxs] = useState(() => {
    try {
      const saved = localStorage.getItem('matchstake_playground_txs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Helper to append a transaction to log and persist it
  const addTx = (hash, type, details, status = 'Confirmed') => {
    trackTransaction({
      hash,
      action: `${type} - ${details}`,
      category: 'main',
      status: status === 'Confirmed' ? 'success' : 'pending',
    });
    setTxs(prev => {
      const updated = [
        {
          hash,
          type,
          details,
          status,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev
      ];
      try {
        localStorage.setItem('matchstake_playground_txs', JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
  };

  // Watch Squad Creation receipt
  useEffect(() => {
    if (createSquadHash && !isCreateSquadConfirming) {
      setTxs(prev => {
        const updated = prev.map(t => t.hash === createSquadHash ? { ...t, status: 'Confirmed' } : t);
        try {
          localStorage.setItem('matchstake_playground_txs', JSON.stringify(updated));
        } catch (e) { }
        return updated;
      });
    }
  }, [createSquadHash, isCreateSquadConfirming]);

  // Watch Resolve Room receipt
  useEffect(() => {
    if (resolveRoomHash && !isResolveRoomConfirming) {
      setTxs(prev => {
        const updated = prev.map(t => t.hash === resolveRoomHash ? { ...t, status: 'Confirmed' } : t);
        try {
          localStorage.setItem('matchstake_playground_txs', JSON.stringify(updated));
        } catch (e) { }
        return updated;
      });
    }
  }, [resolveRoomHash, isResolveRoomConfirming]);

  // Watch Claim receipt
  useEffect(() => {
    if (claimHash && !isClaimConfirming) {
      setTxs(prev => {
        const updated = prev.map(t => t.hash === claimHash ? { ...t, status: 'Confirmed' } : t);
        try {
          localStorage.setItem('matchstake_playground_txs', JSON.stringify(updated));
        } catch (e) { }
        return updated;
      });
    }
  }, [claimHash, isClaimConfirming]);

  // Handle Seeding Match via Backend (signs with Owner key)
  const handleSeedMatch = async (e) => {
    e.preventDefault();
    if (!createHome.trim() || !createAway.trim()) {
      toast.error('Both team names are required.');
      return;
    }
    setIsCreatingMatch(true);
    const loadingToast = toast.loading(`Submitting transaction to seed ${createHome} vs ${createAway} on-chain...`);

    try {
      const response = await fetch('/api/playground/create-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeTeam: createHome, awayTeam: createAway }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to seed match');

      toast.success(`Match created on X Layer! ID: #${data.matchId} 🎉`, { id: loadingToast });
      if (data.txHash) {
        addTx(data.txHash, 'Seed Match', `${createHome} vs ${createAway}`, 'Confirmed');
      }
      setCreateHome('');
      setCreateAway('');
      setTimeout(() => {
        refetchMatchIds();
        refetchMatches();
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to connect to simulation api', { id: loadingToast });
    } finally {
      setIsCreatingMatch(false);
    }
  };

  // Handle Resolving Match via Backend (signs with Owner key)
  const handleResolveMatch = async (e) => {
    e.preventDefault();
    if (!selectedMatchId) {
      toast.error('Please select a match to resolve.');
      return;
    }
    setIsResolvingMatch(true);
    const loadingToast = toast.loading(`Submitting oracle resolve transaction for Match #${selectedMatchId} on-chain...`);

    try {
      const response = await fetch('/api/playground/resolve-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: Number(selectedMatchId),
          homeScore: Number(resolveHomeScore),
          awayScore: Number(resolveAwayScore),
        }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to resolve match');

      toast.success(`Match #${selectedMatchId} resolved successfully on-chain!`, { id: loadingToast });
      if (data.txHash) {
        const matchObj = matches.find(m => String(m.matchId) === String(selectedMatchId));
        const teams = matchObj ? `${matchObj.homeTeam} vs ${matchObj.awayTeam}` : `Match #${selectedMatchId}`;
        addTx(data.txHash, 'Resolve Match', `${teams} (${resolveHomeScore}-${resolveAwayScore})`, 'Confirmed');
      }
      setSelectedMatchId('');
      setTimeout(() => {
        refetchMatchIds();
        refetchMatches();
        refetchRooms();
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to connect to simulation api', { id: loadingToast });
    } finally {
      setIsResolvingMatch(false);
    }
  };

  // Handle Create Squad (Direct on-chain transaction)
  const handleCreateSquad = (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Please connect your wallet first.');
      return;
    }
    if (!squadName.trim()) {
      toast.error('Squad name is required.');
      return;
    }

    writeCreateSquad({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createSquad',
      args: [squadName],
    }, {
      onSuccess: (txHash) => {
        addTx(txHash, 'Create Squad', `Name: ${squadName.toUpperCase()}`, 'Pending');
        toast.success(
          <span>
            Squad creation transaction submitted! {' '}
            <a href={`https://www.oklink.com/xlayer-test/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#22c55e', marginLeft: 8, fontWeight: 700 }}>
              [VIEW TX]
            </a>
          </span>
        );
        setSquadName('');
        setTimeout(() => {
          refetchUserSquad();
        }, 3000);
      },
      onError: (err) => {
        console.error(err);
        toast.error(parseContractError(err, 'Failed to create squad. Did you already join/create a squad?'));
      }
    });
  };

  // Handle Resolve Room (Direct on-chain transaction)
  const handleResolveRoom = (roomId) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first.');
      return;
    }

    writeResolveRoom({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'resolveRoom',
      args: [BigInt(roomId)],
    }, {
      onSuccess: (txHash) => {
        addTx(txHash, 'Resolve Room', `Room ID: #${roomId}`, 'Pending');
        toast.success(
          <span>
            Room resolve transaction submitted! {' '}
            <a href={`https://www.oklink.com/xlayer-test/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#22c55e', marginLeft: 8, fontWeight: 700 }}>
              [VIEW TX]
            </a>
          </span>
        );
        setTimeout(() => {
          refetchRooms();
        }, 3000);
      },
      onError: (err) => {
        console.error(err);
        toast.error(parseContractError(err, 'Failed to resolve room. Make sure the match is resolved first.'));
      }
    });
  };

  // Handle Claim Winnings (Direct on-chain transaction)
  const handleClaimWinnings = (roomId) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first.');
      return;
    }

    writeClaimWinnings({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(roomId)],
    }, {
      onSuccess: (txHash) => {
        addTx(txHash, 'Claim Winnings', `Room ID: #${roomId}`, 'Pending');
        toast.success(
          <span>
            Claim payout transaction submitted! {' '}
            <a href={`https://www.oklink.com/xlayer-test/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#22c55e', marginLeft: 8, fontWeight: 700 }}>
              [VIEW TX]
            </a>
          </span>
        );
        setTimeout(() => {
          refetchRooms();
        }, 3000);
      },
      onError: (err) => {
        console.error(err);
        toast.error(parseContractError(err, 'Failed to claim winnings. Did you make a winning prediction in this room?'));
      }
    });
  };

  const userSquadId = userOnChainSquad !== undefined ? Number(userOnChainSquad) : 0;

  return (
    <main className="page-content">
      {/* Hero Section */}
      <section className="section-dark" style={{ paddingBottom: 40 }}>
        <div className="section-inner">
          <p style={{
            fontFamily: 'var(--font)',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--text-dimmer)',
            marginBottom: 16,
          }}>
            X LAYER // PROTOCOL SIMULATOR // INTERACTIVE SANDBOX
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 800,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                marginBottom: 12,
              }}>
                PLAYGROUND
              </h1>
              <p style={{
                fontFamily: 'var(--font)',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                maxWidth: '75ch',
                lineHeight: 1.8,
              }}>
                This control room allows you to test the complete lifecycle of our smart contracts on the <strong>X Layer Testnet</strong>. 
                Since World Cup matches are scheduled for the future, you can use this sandbox to seed custom matches on-chain, 
                create watch party rooms, simulate scores, build GameFi squads, resolve games, and verify contract payouts in real-time.
              </p>
            </div>
            <button
              onClick={() => {
                refetchMatchIds();
                refetchMatches();
                refetchRoomIds();
                refetchRooms();
                refetchUserSquad();
                toast.success('On-chain playground board refreshed successfully! 🔄');
              }}
              className="btn btn-secondary"
              style={{ padding: '12px 24px', borderColor: 'var(--gold)', color: 'var(--gold)' }}
            >
              REFRESH PLAYGROUND BOARD 🔄
            </button>
          </div>
        </div>
      </section>

      {/* Grid of Control Modules */}
      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
            
            {/* Step 1: Seed Match */}
            <div className="glass-strong" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span className="badge-demo" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>STEP 01</span>
                <h3 style={{ fontFamily: 'var(--font-head)', margin: 0, textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                  Seed Custom Match
                </h3>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 16, height: 48 }}>
                Register a new simulated match directly on the blockchain. Signed using the contract owner's key.
              </p>
              
              <form onSubmit={handleSeedMatch}>
                <div className="form-group">
                  <label className="form-label">Home Team</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={createHome} 
                    onChange={(e) => setCreateHome(e.target.value)} 
                    placeholder="e.g. Argentina"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Away Team</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={createAway} 
                    onChange={(e) => setCreateAway(e.target.value)} 
                    placeholder="e.g. France"
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                  type="submit"
                  disabled={isCreatingMatch}
                >
                  {isCreatingMatch ? 'TRANSACTING ON X LAYER...' : 'SEED MATCH ON-CHAIN'}
                </button>
              </form>
            </div>

            {/* Step 2: Resolve Match */}
            <div className="glass-strong" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span className="badge-demo" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>STEP 02</span>
                <h3 style={{ fontFamily: 'var(--font-head)', margin: 0, textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                  Simulate Match Result
                </h3>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 16, height: 48 }}>
                Act as the oracle. End an active match on-chain with a score to lock predictions in related rooms.
              </p>
              
              <form onSubmit={handleResolveMatch}>
                <div className="form-group">
                  <label className="form-label">Select Active Match</label>
                  <select 
                    className="form-input" 
                    style={{ background: '#000', color: '#fff' }}
                    value={selectedMatchId}
                    onChange={(e) => setSelectedMatchId(e.target.value)}
                  >
                    <option value="">-- Choose Match --</option>
                    {matches.filter(m => !m.resolved).map(m => (
                      <option key={m.matchId} value={m.matchId}>
                        #{m.matchId}: {m.homeTeam} vs {m.awayTeam}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Home Score</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      min="0"
                      value={resolveHomeScore} 
                      onChange={(e) => setResolveHomeScore(e.target.value)} 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Away Score</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      min="0"
                      value={resolveAwayScore} 
                      onChange={(e) => setResolveAwayScore(e.target.value)} 
                    />
                  </div>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                  type="submit"
                  disabled={isResolvingMatch || !selectedMatchId}
                >
                  {isResolvingMatch ? 'TRANSACTING ON X LAYER...' : 'RESOLVE MATCH ON-CHAIN'}
                </button>
              </form>
            </div>

            {/* Step 3: Create Squad */}
            <div className="glass-strong" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span className="badge-demo" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>STEP 03</span>
                <h3 style={{ fontFamily: 'var(--font-head)', margin: 0, textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                  Create Staking Squad
                </h3>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 16, height: 48 }}>
                Initialize your own GameFi staking squad. This executes a real write transaction in your connected wallet.
              </p>

              <form onSubmit={handleCreateSquad}>
                <div className="form-group">
                  <label className="form-label">Squad Name</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={squadName} 
                    onChange={(e) => setSquadName(e.target.value)} 
                    placeholder="e.g. ULTRA STAKERS"
                    disabled={userSquadId !== 0}
                  />
                </div>
                
                <div style={{ minHeight: 63, display: 'flex', alignItems: 'center' }}>
                  {userSquadId !== 0 ? (
                    <div className="badge-demo" style={{ width: '100%', textTransform: 'uppercase', textAlign: 'center', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--gold)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      REPRESENTING SQUAD #{userSquadId}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dimmer)' }}>
                      Note: You can only belong to one squad at a time on-chain.
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                  type="submit"
                  disabled={isCreateSquadPending || isCreateSquadConfirming || userSquadId !== 0 || !isConnected}
                >
                  {isCreateSquadPending || isCreateSquadConfirming ? 'CONFIRMING ON X LAYER...' : 'CREATE SQUAD ON-CHAIN'}
                </button>
              </form>
            </div>
          </div>

          {/* Active Matches & Rooms Lists */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 30 }}>
            
            {/* Matches list */}
            <div className="glass-strong" style={{ padding: 30 }}>
              <h3 style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', marginBottom: 20, fontSize: '1.1rem' }}>
                On-Chain Match List ({matches.length})
              </h3>
              
              <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
                {matches.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dimmer)', textAlign: 'center', padding: '20px 0' }}>
                    No matches found on-chain. Use the panel above to seed your first match.
                  </p>
                ) : (
                  matches.map((m) => (
                    <div key={m.matchId} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: '1px solid var(--border-light)',
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                          {m.homeTeam} vs {m.awayTeam}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
                          Match ID: #{m.matchId} • Status: {m.resolved ? `Resolved (${m.homeScore}-${m.awayScore})` : 'Pending'}
                        </div>
                      </div>
                      {!m.resolved && (
                        <Link to={`/create-room/${m.matchId}`} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '6px 12px' }}>
                          Create Room
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rooms list */}
            <div className="glass-strong" style={{ padding: 30 }}>
              <h3 style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', marginBottom: 20, fontSize: '1.1rem' }}>
                On-Chain Prediction Rooms ({rooms.length})
              </h3>
              
              <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
                {rooms.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dimmer)', textAlign: 'center', padding: '20px 0' }}>
                    No rooms found on-chain. Go to the Matches tab or click "Create Room" next to a match above.
                  </p>
                ) : (
                  rooms.map((r) => {
                    const match = matches.find(m => m.matchId === r.matchId);
                    return (
                      <div key={r.roomId} style={{ 
                        padding: '12px 16px',
                        border: '1px solid var(--border-light)',
                        background: 'rgba(255,255,255,0.02)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                              Room #{r.roomId} • {match ? `${match.homeTeam} vs ${match.awayTeam}` : `Match #${r.matchId}`}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
                              Pool: {(Number(r.totalPool) / 1e18).toFixed(3)} OKB • Members: {r.memberCount}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dimmer)', marginTop: 4 }}>
                              Status: {r.status === 0 ? 'OPEN' : r.status === 1 ? 'LOCKED' : 'RESOLVED'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                            <Link to={`/room/${r.roomId}`} className="btn" style={{ fontSize: '0.68rem', padding: '4px 10px', background: 'transparent', border: '1px solid var(--fg)' }}>
                              View Room
                            </Link>
                            
                            {/* Resolve Room button (if match is resolved but room isn't) */}
                            {match?.resolved && r.status < 2 && (
                              <button 
                                className="btn btn-primary" 
                                style={{ fontSize: '0.68rem', padding: '5px 10px', background: 'var(--gold)', color: '#000' }}
                                onClick={() => handleResolveRoom(r.roomId)}
                                disabled={isResolveRoomPending || isResolveRoomConfirming}
                              >
                                {isResolveRoomPending || isResolveRoomConfirming ? 'RESOLVING...' : 'RESOLVE ROOM'}
                              </button>
                            )}

                            {/* Claim winnings button (if room is resolved) */}
                            {r.status === 2 && (
                              <button 
                                className="btn btn-primary" 
                                style={{ fontSize: '0.68rem', padding: '5px 10px', background: '#22c55e', color: '#000' }}
                                onClick={() => handleClaimWinnings(r.roomId)}
                                disabled={isClaimPending || isClaimConfirming}
                              >
                                {isClaimPending || isClaimConfirming ? 'CLAIMING...' : 'CLAIM PAYOUT'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Transaction Activity Log */}
          <div className="glass-strong" style={{ padding: 30, marginTop: 40, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', margin: 0, fontSize: '1.1rem' }}>
                On-Chain Activity Log ({txs.length})
              </h3>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dimmer)', letterSpacing: '0.1em' }}>
                X LAYER TESTNET EXPLORER INTEGRATION
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              {txs.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dimmer)', textAlign: 'center', padding: '30px 0' }}>
                  No transactions executed in this session yet. Seed a match, simulate results, or create squads to track transactions live!
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-dimmer)', fontSize: '0.7rem' }}>
                      <th style={{ padding: '12px 16px' }}>TIME</th>
                      <th style={{ padding: '12px 16px' }}>ACTION TYPE</th>
                      <th style={{ padding: '12px 16px' }}>DETAILS</th>
                      <th style={{ padding: '12px 16px' }}>STATUS</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>EXPLORER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < txs.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                        <td style={{ padding: '14px 16px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{t.timestamp}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                          <span className="badge-demo" style={{ 
                            background: t.type.includes('Seed') || t.type.includes('Resolve Match') ? 'rgba(217, 119, 6, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: t.type.includes('Seed') || t.type.includes('Resolve Match') ? 'var(--gold)' : '#10b981',
                            padding: '3px 8px',
                            borderRadius: 4
                          }}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-dim)' }}>{t.details}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ 
                            color: t.status === 'Confirmed' ? '#10b981' : 'var(--gold)',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            {t.status === 'Confirmed' ? '✅ CONFIRMED' : '⏳ PENDING'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <a 
                            href={`https://www.oklink.com/xlayer-test/tx/${t.hash}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ 
                              color: 'var(--gold)', 
                              textDecoration: 'underline', 
                              fontWeight: 'bold',
                              fontFamily: 'monospace'
                            }}
                          >
                            {t.hash.slice(0, 6)}...{t.hash.slice(-4)} ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
