import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, checkDemoMode } from '../config/contract';

const TEAM_CODES = {
  mexico: 'MX',
  usa: 'US',
  'united states': 'US',
  argentina: 'AR',
  brazil: 'BR',
  france: 'FR',
  germany: 'DE',
  england: 'GB',
  spain: 'ES',
  portugal: 'PT',
  netherlands: 'NL',
  italy: 'IT',
  japan: 'JP',
  'south korea': 'KR',
  'korea republic': 'KR',
  canada: 'CA',
  morocco: 'MA',
  senegal: 'SN',
  'south africa': 'ZA',
  czechia: 'CZ',
  'bosnia and herzegovina': 'BA',
  paraguay: 'PY',
  qatar: 'QA',
  switzerland: 'CH',
  haiti: 'HT',
  scotland: 'GB',
  australia: 'AU',
  türkiye: 'TR',
  turkey: 'TR',
  curaçao: 'CW',
};

const GROUP_BY_MATCH_ID = {
  1: 'GROUP A',
  2: 'GROUP A',
  3: 'GROUP B',
  4: 'GROUP B',
  5: 'GROUP C',
  6: 'GROUP C',
  7: 'GROUP D',
  8: 'GROUP D',
  9: 'GROUP E',
  10: 'GROUP E',
};

function formatDate(ts) {
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toFlagEmoji(code) {
  if (!code || code.length !== 2) return '⚽';
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt()))
    .join('');
}

function getFlagForTeam(teamName) {
  const key = String(teamName || '').trim().toLowerCase();
  return toFlagEmoji(TEAM_CODES[key]);
}

export default function Matches() {
  const navigate = useNavigate();
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());

  const { data: matchIds, isLoading: isIdsLoading, isError: isIdsError, refetch: refetchMatchIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllMatchIds',
  });

  const { data: matchesData, isLoading: isMatchesLoading, refetch: refetchMatches } = useReadContracts({
    contracts: (matchIds || []).map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getMatch',
      args: [id],
    })),
    query: {
      enabled: !!matchIds && matchIds.length > 0,
    },
  });

  const isDemo = checkDemoMode();
  const isLoading = (isIdsLoading || isMatchesLoading) && !isDemo && !isIdsError;

  const refreshFixtures = () => {
    refetchMatchIds();
    refetchMatches();
    setLastUpdatedAt(Date.now());
  };

  useEffect(() => {
    if (isDemo) return;
    const interval = setInterval(() => {
      refreshFixtures();
    }, 15000);
    return () => clearInterval(interval);
  }, [isDemo]);

  const matches = useMemo(() => {
    const useFallback = isDemo || isIdsError || !matchesData || matchesData.length === 0;

    if (useFallback) {
      return [
        { matchId: 1, homeTeam: 'Mexico', awayTeam: 'South Africa', kickoffTime: Math.floor(Date.now() / 1000) + 3600, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
        { matchId: 2, homeTeam: 'Korea Republic', awayTeam: 'Czechia', kickoffTime: Math.floor(Date.now() / 1000) + 14400, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
        { matchId: 3, homeTeam: 'Canada', awayTeam: 'Bosnia and Herzegovina', kickoffTime: Math.floor(Date.now() / 1000) + 28800, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
        { matchId: 4, homeTeam: 'USA', awayTeam: 'Paraguay', kickoffTime: Math.floor(Date.now() / 1000) + 86400, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
        { matchId: 5, homeTeam: 'Qatar', awayTeam: 'Switzerland', kickoffTime: Math.floor(Date.now() / 1000) + 100800, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
        { matchId: 6, homeTeam: 'Brazil', awayTeam: 'Morocco', kickoffTime: Math.floor(Date.now() / 1000) + 172800, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
        { matchId: 7, homeTeam: 'Haiti', awayTeam: 'Scotland', kickoffTime: Math.floor(Date.now() / 1000) + 259200, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
        { matchId: 8, homeTeam: 'Australia', awayTeam: 'Türkiye', kickoffTime: Math.floor(Date.now() / 1000) + 273600, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
        { matchId: 9, homeTeam: 'Germany', awayTeam: 'Curaçao', kickoffTime: Math.floor(Date.now() / 1000) + 345600, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
        { matchId: 10, homeTeam: 'Netherlands', awayTeam: 'Japan', kickoffTime: Math.floor(Date.now() / 1000) + 360000, homeScore: 0, awayScore: 0, resolved: false, result: 0 },
      ];
    }

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
  }, [matchesData, isDemo, isIdsError]);

  const groupedFixtures = useMemo(() => {
    const groups = new Map();
    matches.forEach((m) => {
      const groupName = GROUP_BY_MATCH_ID[m.matchId] || 'CUSTOM / OTHER';
      if (!groups.has(groupName)) groups.set(groupName, []);
      groups.get(groupName).push(m);
    });
    return Array.from(groups.entries()).map(([group, items]) => ({
      group,
      items: [...items].sort((a, b) => a.kickoffTime - b.kickoffTime),
    }));
  }, [matches]);

  if (isLoading) {
    return (
      <main className="page-content">
        <section className="section-dark" style={{ paddingBottom: 40 }}>
          <div className="section-inner">
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, textTransform: 'uppercase' }}>
              MATCHES
            </h1>
            <p style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Loading live match schedules from X Layer Testnet...
            </p>
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
              <p style={{ fontFamily: 'var(--font)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-dimmer)', marginBottom: 16 }}>
                WORLD CUP 2026 // GROUP STAGE
              </p>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>
                MATCHES
              </h1>
              <p style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--text-dim)', maxWidth: '44ch', lineHeight: 1.7 }}>
                Fixture board auto-refreshes from on-chain match state and is grouped by stage buckets for easier navigation.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <span className="badge-demo" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                X LAYER TESTNET
              </span>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.68rem' }} onClick={refreshFixtures}>
                REFRESH FIXTURES
              </button>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-dimmer)', letterSpacing: '0.08em' }}>
                AUTO-UPDATES EVERY 15S • {new Date(lastUpdatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          {matches.length === 0 ? (
            <div className="glass-strong" style={{ padding: '60px 40px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 16 }}>⚽</span>
              <h3 style={{ fontFamily: 'var(--font-head)', margin: '0 0 8px 0', textTransform: 'uppercase' }}>NO MATCHES FOUND ON-CHAIN</h3>
            </div>
          ) : (
            <>
              {groupedFixtures.map((groupBlock) => (
                <div key={groupBlock.group} style={{ marginBottom: 22 }}>
                  <div style={{ marginBottom: 10, fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--text-dimmer)', textTransform: 'uppercase' }}>
                    {groupBlock.group}
                  </div>
                  <div className="match-grid">
                    {groupBlock.items.map((m) => (
                      <div
                        key={m.matchId}
                        className="match-card"
                        style={{ opacity: m.resolved ? 0.65 : 1, cursor: m.resolved ? 'default' : 'pointer' }}
                        onClick={() => {
                          if (m.resolved) return;
                          navigate(`/create-room/${m.matchId}${isDemo ? '?demo=true' : ''}`);
                        }}
                      >
                        <div className="match-teams">
                          <div className="match-team">
                            <div className="match-team-flag">{getFlagForTeam(m.homeTeam)}</div>
                            <div className="match-team-name">{m.homeTeam}</div>
                          </div>
                          <div className="match-vs">VS</div>
                          <div className="match-team">
                            <div className="match-team-flag">{getFlagForTeam(m.awayTeam)}</div>
                            <div className="match-team-name">{m.awayTeam}</div>
                          </div>
                        </div>
                        <div className="match-meta">
                          <span>{formatDate(m.kickoffTime)}</span>
                          <span className={m.resolved ? '' : 'match-rooms-count'}>
                            {m.resolved ? (
                              <span style={{ color: 'var(--text-dimmer)', fontWeight: 700 }}>RESOLVED ({m.homeScore}-{m.awayScore})</span>
                            ) : (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="pulse-dot" />
                                OPEN
                              </span>
                            )}
                          </span>
                        </div>
                        {!m.resolved && (
                          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.66rem', letterSpacing: '0.08em' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/match/${m.matchId}/rooms${isDemo ? '?demo=true' : ''}`);
                              }}
                            >
                              VIEW ROOMS
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.66rem', letterSpacing: '0.08em' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/create-room/${m.matchId}${isDemo ? '?demo=true' : ''}`);
                              }}
                            >
                              CREATE ROOM
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

