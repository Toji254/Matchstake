const STORAGE_KEY = 'matchstake_tx_ledger_v1';
const UPDATE_EVENT = 'matchstake:tx-ledger-updated';

function readLedger() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLedger(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function getTrackedTransactions() {
  return readLedger();
}

export function onTrackedTransactionsUpdate(handler) {
  window.addEventListener(UPDATE_EVENT, handler);
  return () => window.removeEventListener(UPDATE_EVENT, handler);
}

export function trackTransaction(entry) {
  if (!entry?.hash) return;
  const now = Date.now();
  const nextEntry = {
    hash: entry.hash,
    action: entry.action || 'Transaction',
    category: entry.category || 'main',
    createdAt: entry.createdAt || now,
    updatedAt: now,
    status: entry.status || 'pending',
  };

  const current = readLedger();
  const idx = current.findIndex((tx) => tx.hash.toLowerCase() === entry.hash.toLowerCase());
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...nextEntry };
  } else {
    current.unshift(nextEntry);
  }
  writeLedger(current.slice(0, 200));
}

export function patchTrackedTransaction(hash, patch) {
  if (!hash) return;
  const current = readLedger();
  const idx = current.findIndex((tx) => tx.hash.toLowerCase() === hash.toLowerCase());
  if (idx < 0) return;
  current[idx] = { ...current[idx], ...patch, updatedAt: Date.now() };
  writeLedger(current);
}

