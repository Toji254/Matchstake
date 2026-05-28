import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, checkDemoMode } from '../config/contract';

export default function MatchRooms() {
  const { matchId } = useParams();
  const numericMatchId = Number(matchId || 0);
  const isDemo = checkDemoMode();
  const demoQs = isDemo ? '?demo=true' : '';

  const { data: roomIds, isLoading: isRoomsLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRoomsByMatch',
    args: [BigInt(numericMatchId || 0)],
    query: { enabled: Number.isFinite(numericMatchId) && numericMatchId > 0 },
  });

  const { data: roomsData, isLoading: isRoomDetailsLoading } = useReadContracts({
    contracts: (roomIds || []).map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getRoom',
      args: [id],
    })),
    query: { enabled: !!roomIds && roomIds.length > 0 },
  });

  const rooms = useMemo(() => {
    if (!roomsData || roomsData.length === 0) return [];
    return roomsData
      .filter((r) => r.status === 'success' && r.result)
      .map((r) => ({
        roomId: Number(r.result.roomId),
        memberCount: Number(r.result.memberCount),
        totalPool: r.result.totalPool,
        status: Number(r.result.status), // 0 OPEN, 1 LOCKED, 2 RESOLVED
      }));
  }, [roomsData]);

  const isLoading = isRoomsLoading || isRoomDetailsLoading;

  return (
    <main className="page-content">
      <section className="section-dark" style={{ paddingBottom: 20 }}>
        <div className="section-inner">
          <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-dimmer)', marginBottom: 12 }}>
            MATCH #{numericMatchId} // ON-CHAIN ROOMS
          </p>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px, 4vw, 48px)', textTransform: 'uppercase', marginBottom: 8 }}>
            VIEW ROOMS
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            Real rooms fetched from the deployed MatchStake contract.
          </p>
          <div style={{ marginTop: 16 }}>
            <Link to={`/create-room/${numericMatchId}${demoQs}`} className="btn btn-primary">
              CREATE NEW ROOM
            </Link>
          </div>
        </div>
      </section>

      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          {isLoading ? (
            <div className="glass-strong skeleton" style={{ height: 160 }} />
          ) : rooms.length === 0 ? (
            <div className="glass-strong" style={{ padding: 28 }}>
              <p style={{ margin: 0, color: 'var(--text-dim)' }}>No rooms created yet for this match.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {rooms.map((room) => (
                <div key={room.roomId} className="glass-strong" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Room #{room.roomId}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
                      Members: {room.memberCount} • Status: {room.status === 0 ? 'OPEN' : room.status === 1 ? 'LOCKED' : 'RESOLVED'}
                    </div>
                  </div>
                  <Link to={`/room/${room.roomId}${demoQs}`} className="btn btn-secondary">
                    OPEN ROOM
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

