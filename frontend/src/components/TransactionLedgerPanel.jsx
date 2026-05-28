import React, { useEffect, useMemo, useState } from 'react';
import { formatEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { TARGET_CHAIN_ID } from '../config/wagmi';
import {
  getTrackedTransactions,
  onTrackedTransactionsUpdate,
  patchTrackedTransaction,
} from '../utils/txLedger';

function short(v) {
  if (!v) return '—';
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

function fmtOkb(wei) {
  if (wei === undefined || wei === null) return '—';
  try {
    return Number(formatEther(BigInt(wei))).toFixed(6);
  } catch {
    return '—';
  }
}

function timeAgo(ts) {
  if (!ts) return '';
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const STATUS_CONFIG = {
  pending: { label: 'PENDING', color: 'var(--gold)', icon: '◌', pulse: true },
  success: { label: 'CONFIRMED', color: '#22c55e', icon: '✓', pulse: false },
  reverted: { label: 'REVERTED', color: '#ef4444', icon: '✕', pulse: false },
};

export default function TransactionLedgerPanel() {
  const publicClient = usePublicClient({ chainId: TARGET_CHAIN_ID });
  const [txs, setTxs] = useState(() => getTrackedTransactions());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setTxs(getTrackedTransactions());
    const off = onTrackedTransactionsUpdate(refresh);
    refresh();
    return off;
  }, []);

  // Poll pending transactions for confirmation
  useEffect(() => {
    if (!publicClient) return;
    const pending = txs.filter((t) => t.status === 'pending');
    if (pending.length === 0) return;

    let cancelled = false;
    const run = async () => {
      for (const tx of pending) {
        try {
          const [receipt, rawTx] = await Promise.all([
            publicClient.getTransactionReceipt({ hash: tx.hash }),
            publicClient.getTransaction({ hash: tx.hash }),
          ]);
          if (cancelled || !receipt || !rawTx) continue;

          const feeWei = receipt.gasUsed * receipt.effectiveGasPrice;
          patchTrackedTransaction(tx.hash, {
            status: receipt.status === 'success' ? 'success' : 'reverted',
            from: rawTx.from,
            to: rawTx.to || null,
            valueWei: rawTx.value.toString(),
            feeWei: feeWei.toString(),
            blockNumber: Number(receipt.blockNumber),
          });
        } catch {
          // Keep pending until receipt exists.
        }
      }
      if (!cancelled) setTxs(getTrackedTransactions());
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [publicClient, txs]);

  const pendingCount = useMemo(() => txs.filter((t) => t.status === 'pending').length, [txs]);

  const handleClearAll = () => {
    localStorage.removeItem('matchstake_tx_ledger_v1');
    setTxs([]);
    window.dispatchEvent(new CustomEvent('matchstake:tx-ledger-updated'));
  };

  if (txs.length === 0) return null;

  return (
    <>
      {/* Collapsed pill trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open transaction ledger"
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: 'rgba(10, 10, 10, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-light)',
            borderRadius: 28,
            color: 'var(--fg)',
            fontFamily: 'var(--font)',
            fontSize: '0.68rem',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {pendingCount > 0 && (
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--gold)',
              animation: 'pulse 1.8s infinite',
              flexShrink: 0,
            }} />
          )}
          <span>TX LOG</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            background: pendingCount > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.08)',
            color: pendingCount > 0 ? 'var(--gold)' : 'var(--text-dim)',
            fontSize: '0.6rem',
            fontWeight: 700,
            padding: '0 6px',
          }}>
            {txs.length}
          </span>
        </button>
      )}

      {/* Expanded drawer panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            zIndex: 9999,
            width: 380,
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(8, 8, 8, 0.96)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--border-light)',
            borderRadius: 2,
            color: 'var(--fg)',
            fontFamily: 'var(--font)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
            animation: 'slideUpFade 0.3s ease-out',
          }}
        >
          {/* Panel header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-light)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                TRANSACTION LOG
              </span>
              {pendingCount > 0 && (
                <span style={{
                  fontSize: '0.58rem',
                  color: 'var(--gold)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                }}>
                  {pendingCount} PENDING
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={handleClearAll}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dimmer)',
                  fontSize: '0.58rem',
                  fontFamily: 'var(--font)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--fg)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dimmer)'}
              >
                CLEAR
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close transaction ledger"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-dim)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  padding: '3px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--fg)';
                  e.currentTarget.style.color = 'var(--fg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.color = 'var(--text-dim)';
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Scrollable transaction list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '6px 0',
          }}>
            {txs.map((tx, index) => {
              const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={tx.hash}
                  style={{
                    padding: '14px 18px',
                    borderBottom: index < txs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Row 1: Status indicator + action + time */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: `${cfg.color}15`,
                        border: `1px solid ${cfg.color}40`,
                        color: cfg.color,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        flexShrink: 0,
                        animation: cfg.pulse ? 'pulse 1.8s infinite' : 'none',
                      }}>
                        {cfg.icon}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.03em',
                        color: 'var(--fg)',
                      }}>
                        {tx.action}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.56rem',
                      color: 'var(--text-dimmer)',
                      letterSpacing: '0.06em',
                      flexShrink: 0,
                    }}>
                      {timeAgo(tx.createdAt)}
                    </span>
                  </div>

                  {/* Row 2: Hash + status badge */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <a
                      href={`https://www.oklink.com/xlayer-test/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '0.62rem',
                        color: 'var(--text-dim)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font)',
                        letterSpacing: '0.04em',
                        transition: 'color 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#22c55e'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                    >
                      <span style={{ opacity: 0.5 }}>TX</span>
                      {short(tx.hash)}
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5 }}>
                        <path d="M4 1H11V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </a>
                    <span style={{
                      fontSize: '0.54rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      color: cfg.color,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      background: `${cfg.color}10`,
                      border: `1px solid ${cfg.color}25`,
                      borderRadius: 2,
                    }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Row 3: Details (if available) */}
                  {(tx.from || tx.valueWei || tx.feeWei) && (
                    <div style={{
                      display: 'flex',
                      gap: 16,
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: '1px dashed rgba(255,255,255,0.06)',
                      fontSize: '0.56rem',
                      color: 'var(--text-dimmer)',
                      letterSpacing: '0.04em',
                      flexWrap: 'wrap',
                    }}>
                      {tx.from && (
                        <span>FROM {short(tx.from)}</span>
                      )}
                      {tx.valueWei && tx.valueWei !== '0' && (
                        <span>VALUE {fmtOkb(tx.valueWei)} OKB</span>
                      )}
                      {tx.feeWei && (
                        <span>FEE {fmtOkb(tx.feeWei)} OKB</span>
                      )}
                      {tx.blockNumber && (
                        <span>BLOCK #{tx.blockNumber}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Panel footer */}
          <div style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: '0.54rem',
              color: 'var(--text-dimmer)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {txs.length} TRANSACTION{txs.length !== 1 ? 'S' : ''} • X LAYER TESTNET
            </span>
            <a
              href="https://www.oklink.com/xlayer-test"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.54rem',
                color: 'var(--text-dimmer)',
                textDecoration: 'none',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--fg)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dimmer)'}
            >
              OKLINK EXPLORER ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
