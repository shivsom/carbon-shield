import { Link } from "react-router-dom";
import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useDemoMode } from "../hooks/useDemoMode";

export default function Navbar() {
  const { account, creditBalance, connect, loading } = useWallet();
  const { demoMode, toggleDemoMode } = useDemoMode();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-forest-800 text-white shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between h-14 max-w-6xl">
        <Link to="/" className="font-bold text-lg flex items-center gap-2">
          <span className="text-earth-400">🌿</span> CarbonShield
        </Link>
        <div className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-earth-400 transition">Home</Link>
          <Link to="/register" className="hover:text-earth-400 transition">Register Land</Link>
          <Link to="/mint" className="hover:text-earth-400 transition">Mint Credits</Link>
          <Link to="/transfer" className="hover:text-earth-400 transition">Transfer</Link>
          <Link to="/offset" className="hover:text-earth-400 transition">Retire</Link>
          <Link to="/dashboard" className="hover:text-earth-400 transition">Dashboard</Link>
          <Link to="/verify" className="hover:text-earth-400 transition">Verify</Link>
          <button
            onClick={toggleDemoMode}
            className={`px-2 py-1 rounded-md text-xs border ${
              demoMode ? "bg-earth-500 text-forest-900 border-earth-400" : "bg-transparent border-slate-500 text-slate-200"
            }`}
            title="Demo Mode keeps UI populated"
          >
            Demo Mode: {demoMode ? "On" : "Off"}
          </button>
          {account ? (
            <div className="flex items-center gap-3">
              <span className="text-earth-400 text-sm">
                {creditBalance} CSC
              </span>
              <span className="text-slate-300 text-sm font-mono truncate max-w-[120px]">
                {account.slice(0, 6)}…{account.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={loading}
              className="bg-earth-500 hover:bg-earth-400 text-forest-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleDemoMode}
            className={`px-2 py-1 rounded-md text-xs border ${
              demoMode ? "bg-earth-500 text-forest-900 border-earth-400" : "bg-transparent border-slate-500 text-slate-200"
            }`}
          >
            Demo {demoMode ? "On" : "Off"}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="px-3 py-2 rounded-lg bg-forest-700 hover:bg-forest-600 text-sm"
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-forest-700">
          <div className="container mx-auto px-4 max-w-6xl py-3 flex flex-col gap-3 text-sm">
            <Link onClick={() => setOpen(false)} to="/" className="hover:text-earth-400 transition">Home</Link>
            <Link onClick={() => setOpen(false)} to="/register" className="hover:text-earth-400 transition">Register Land</Link>
            <Link onClick={() => setOpen(false)} to="/mint" className="hover:text-earth-400 transition">Mint Credits</Link>
            <Link onClick={() => setOpen(false)} to="/transfer" className="hover:text-earth-400 transition">Transfer</Link>
            <Link onClick={() => setOpen(false)} to="/offset" className="hover:text-earth-400 transition">Retire</Link>
            <Link onClick={() => setOpen(false)} to="/dashboard" className="hover:text-earth-400 transition">Dashboard</Link>
            <Link onClick={() => setOpen(false)} to="/verify" className="hover:text-earth-400 transition">Verify</Link>
            {account ? (
              <div className="flex items-center justify-between pt-2 border-t border-forest-700">
                <span className="text-earth-400 text-sm">{creditBalance} CSC</span>
                <span className="text-slate-300 text-sm font-mono">
                  {account.slice(0, 6)}…{account.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  connect();
                }}
                disabled={loading}
                className="bg-earth-500 hover:bg-earth-400 text-forest-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
