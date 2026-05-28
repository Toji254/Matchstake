import React, { useEffect, useMemo, useState } from 'react';
import { formatEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { TARGET_CHAIN_ID } from '../config/wagmi';
import {
  getTrackedTransactions,
  onTrackedTransactionsUpdate,
  patchTrackedTransaction,
} from '../utils/txLedger';

const LOW_FEE_THRESHOLD_WEI = 50_000_000_000_000n; // 0.00005 OKB

function short(v) {
  if (!v) return '-';
  return `${v.slice(0, 6)}...${v.slice(-4)}`;
}

function fmtOkb(wei) {
  if (wei === undefined || wei === null) return '-';
  try {
    return Number(formatEther(BigInt(wei))).toFixed(6);
  } catch {
    return '-';
  }
}

export default function TransactionLedgerPanel() {
  const publicClient = usePublicClient({ chainId: TARGET_CHAIN_ID });
  const [txs, setTxs] = useState(() => getTrackedTransactions());
  const [showLowFeeTx, setShowLowFeeTx] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const refresh = () => setTxs(getTrackedTransactions());
    const off = onTrackedTransactionsUpdate(refresh);
    refresh();
    return off;
  }, []);

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

  const filtered = useMemo(() => {
    if (showLowFeeTx) return txs;
    return txs.filter((tx) => {
      if (!tx.feeWei) return true;
      try {
        return BigInt(tx.feeWei) >= LOW_FEE_THRESHOLD_WEI;
      } catch {
        return true;
      }
    });
  }, [txs, showLowFeeTx]);

  if (txs.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      right: 16,
      bottom: 16,
      zIndex: 9999,
      width: expanded ? 520 : 300,
      maxHeight: expanded ? '70vh' : 'auto',
      overflow: 'hidden',
      border: '1px solid var(--border-light)',
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      color: 'var(--fg)',
      fontFamily: 'var(--font)',
    }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>TX LEDGER ({filtered.length})</strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
            <input
              type="checkbox"
              checked={showLowFeeTx}
              onChange={(e) => setShowLowFeeTx(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Show low-fee tx
          </label>
          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.62rem' }} onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'MIN' : 'EXPAND'}
          </button>
        </div>
      </div>

      <div style={{ maxHeight: expanded ? '58vh' : '180px', overflowY: 'auto' }}>
        {filtered.map((tx) => (
          <div key={tx.hash} style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.66rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-dim)' }}>{tx.action}</span>
              <span style={{ color: tx.status === 'success' ? '#22c55e' : tx.status === 'reverted' ? '#ef4444' : 'var(--gold)' }}>
                {tx.status.toUpperCase()}
              </span>
            </div>
            <div>Hash: <a href={`https://www.oklink.com/xlayer-test/tx/${tx.hash}`} target="_blank" rel="noreferrer">{short(tx.hash)}</a></div>
            {expanded && (
              <>
                <div>From: {short(tx.from)}</div>
                <div>To: {short(tx.to)}</div>
                <div>Value: {fmtOkb(tx.valueWei)} OKB</div>
                <div>Fee: {fmtOkb(tx.feeWei)} OKB</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

