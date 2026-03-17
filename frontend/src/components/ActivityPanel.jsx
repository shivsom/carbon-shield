import { useEffect, useState } from "react";
import { txExplorerUrl } from "../utils/explorer";
import { loadTxHistory } from "../utils/txHistory";

function statusColor(status) {
  if (status === "success") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "error") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default function ActivityPanel() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const refresh = () => setItems(loadTxHistory());
    refresh();
    const id = window.setInterval(refresh, 1500);
    return () => window.clearInterval(id);
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow border border-slate-200">
      <h3 className="font-semibold text-forest-800">Recent activity</h3>
      <p className="text-xs text-slate-500 mt-1">
        Stored locally for demo stability (no subgraph required).
      </p>
      <div className="mt-3 space-y-2">
        {items.slice(0, 6).map((x) => (
          <div key={x.hash} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-slate-800 truncate">{x.label}</div>
              <div className="text-xs text-slate-500 font-mono truncate">
                {x.hash.slice(0, 10)}…{x.hash.slice(-6)}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full border ${statusColor(x.status)}`}>
                {x.status}
              </span>
              <a
                className="text-xs text-forest-600 hover:underline"
                href={txExplorerUrl(x.chainId, x.hash)}
                target="_blank"
                rel="noreferrer"
              >
                View →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

