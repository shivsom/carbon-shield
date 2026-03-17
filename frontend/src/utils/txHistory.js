const KEY = "carbonshield_tx_history_v1";
const MAX = 12;

export function loadTxHistory() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveTxHistory(list) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // ignore
  }
}

export function addTx({ hash, label, chainId, status = "pending" }) {
  if (!hash) return;
  const item = {
    hash,
    label: label || "Transaction",
    chainId: chainId || null,
    status,
    ts: Date.now(),
  };
  const list = loadTxHistory();
  const deduped = [item, ...list.filter((x) => x && x.hash !== hash)];
  saveTxHistory(deduped);
}

export function updateTx(hash, patch) {
  if (!hash) return;
  const list = loadTxHistory();
  const next = list.map((x) => (x && x.hash === hash ? { ...x, ...patch } : x));
  saveTxHistory(next);
}

