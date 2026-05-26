import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const ACTIONS = [
  {
    id: 'join-room',
    label: 'Join watch party',
    protocol: 'OnchainOS room agent',
    cost: '0.0000 OKB',
    route: 'x402 zero-gas approval',
    risk: 'LOW',
    tx: '0xa12f...91be',
    note: 'Agent enters the Telegram/Discord watch room and syncs member intent.',
  },
  {
    id: 'suggest-stake',
    label: 'Suggest prediction stake',
    protocol: 'AI co-pilot model',
    cost: '0.0000 OKB',
    route: 'local simulation',
    risk: 'LOW',
    tx: 'off-chain',
    note: 'Agent recommends score, confidence, and stake range before wallet signing.',
  },
  {
    id: 'swap-okb',
    label: 'Route swap to OKB',
    protocol: 'OKX DEX aggregator',
    cost: '0.0031 OKB',
    route: 'OKX DEX → X Layer',
    risk: 'MEDIUM',
    tx: '0x58da...22c0',
    note: 'Agent prepares best route for ETH/USDT/USDC into OKB staking liquidity.',
  },
  {
    id: 'stake-okb',
    label: 'Stake OKB prediction',
    protocol: 'MatchStake contract',
    cost: '0.1000 OKB',
    route: 'user-approved wallet write',
    risk: 'MEDIUM',
    tx: '0x91fb...7a09',
    note: 'Agent can submit only after explicit user approval. No silent spending.',
  },
  {
    id: 'mint-ticket',
    label: 'Mint/update dynamic NFT',
    protocol: 'PredictionTicket NFT',
    cost: 'included',
    route: 'X Layer NFT receipt',
    risk: 'LOW',
    tx: '0x0f73...e331',
    note: 'NFT visual state mutates with room hype, goals, result, and claim status.',
  },
];

const STATUS = {
  pending: 'PENDING APPROVAL',
  approved: 'APPROVED',
  executed: 'EXECUTED',
};

export default function AgentActionConsole({ compact = false, matchLabel = 'France vs Germany' }) {
  const [actionState, setActionState] = useState(() => Object.fromEntries(ACTIONS.map((a) => [a.id, 'pending'])));

  const stats = useMemo(() => {
    const values = Object.values(actionState);
    const approved = values.filter((v) => v === 'approved').length;
    const executed = values.filter((v) => v === 'executed').length;
    return { approved, executed, total: values.length };
  }, [actionState]);

  const updateAction = (id, next) => {
    setActionState((prev) => ({ ...prev, [id]: next }));
    const action = ACTIONS.find((item) => item.id === id);
    toast.success(`${action.label}: ${STATUS[next]}`);
  };

  return (
    <div className="glass-strong agent-console" style={{ padding: compact ? 24 : 32, marginBottom: compact ? 24 : 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <span className="badge-demo">ONCHAINOS // AUTONOMOUS AGENT</span>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: compact ? '1.25rem' : 'clamp(24px, 3vw, 40px)', lineHeight: 1.05, margin: '14px 0 8px', textTransform: 'uppercase' }}>
            Safety-gated match co-pilot
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', maxWidth: '68ch', lineHeight: 1.8 }}>
            Persistent agent flow for {matchLabel} integrated via OKX Onchain OS Skills & Exchange OS permissionless outcome matching engines: 
            room chat sync, prediction advice, OKX DEX routing, OKB staking, reward claims, and dynamic NFT updates. Every value-moving action stays user-approved.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(80px, 1fr))', border: '1px solid var(--border-light)' }}>
          {[
            ['ACTIONS', stats.total],
            ['APPROVED', stats.approved],
            ['EXECUTED', stats.executed],
          ].map(([label, value], i) => (
            <div key={label} style={{ padding: '14px 16px', borderRight: i < 2 ? '1px solid var(--border-light)' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-dimmer)', letterSpacing: '0.12em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {ACTIONS.map((action) => {
          const current = actionState[action.id];
          const statusColor = current === 'executed' ? 'var(--green)' : current === 'approved' ? 'var(--gold)' : 'var(--text-dimmer)';
          return (
            <div key={action.id} className="agent-action-row" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.8fr 0.7fr auto', gap: 16, alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.78rem' }}>{action.label}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginTop: 5, lineHeight: 1.6 }}>{action.note}</div>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', lineHeight: 1.6 }}>
                <div>{action.protocol}</div>
                <div>{action.route}</div>
              </div>
              <div style={{ fontSize: '0.68rem', lineHeight: 1.6 }}>
                <div>Cost: <strong>{action.cost}</strong></div>
                <div>Risk: <strong style={{ color: action.risk === 'LOW' ? 'var(--green)' : 'var(--gold)' }}>{action.risk}</strong></div>
                <div style={{ color: 'var(--text-dimmer)' }}>TX: {action.tx}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <span style={{ alignSelf: 'center', color: statusColor, fontSize: '0.58rem', letterSpacing: '0.1em', minWidth: 92 }}>
                  ● {STATUS[current]}
                </span>
                {current === 'pending' && (
                  <button className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: '0.6rem' }} onClick={() => updateAction(action.id, 'approved')}>
                    APPROVE
                  </button>
                )}
                {current === 'approved' && (
                  <button className="btn btn-primary" style={{ padding: '7px 12px', fontSize: '0.6rem' }} onClick={() => updateAction(action.id, 'executed')}>
                    EXECUTE
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
