import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useWallet } from "../context/WalletContext";
import { txExplorerUrl } from "../utils/explorer";
import { addTx, updateTx } from "../utils/txHistory";

export default function Offset() {
  const { account, provider, carbonToken, creditBalance, refreshBalances, chainId } = useWallet();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [tx, setTx] = useState({ status: "idle", hash: null, error: null });

  const submit = async (e) => {
    e.preventDefault();
    if (!carbonToken || !account || !provider) return;
    setTx({ status: "pending", hash: null, error: null });
    try {
      const signer = await provider.getSigner();
      const amt = ethers.parseEther(amount || "0");
      const res = await carbonToken.connect(signer).retire(amt, reason || "Carbon offset");
      addTx({ hash: res.hash, label: "Retire Credits (CSC)", chainId, status: "pending" });
      toast.loading(
        <span>
          Retiring…{" "}
          <a className="underline" href={txExplorerUrl(chainId, res.hash)} target="_blank" rel="noreferrer">
            View
          </a>
        </span>,
        { id: res.hash }
      );
      await res.wait();
      setTx({ status: "success", hash: res.hash, error: null });
      updateTx(res.hash, { status: "success" });
      toast.success("Credits retired", { id: res.hash });
      setAmount("");
      setReason("");
      refreshBalances();
    } catch (err) {
      setTx({
        status: "error",
        hash: null,
        error: err.reason || err.message || "Transaction failed",
      });
      toast.error(err.reason || err.message || "Transaction failed");
    }
  };

  if (!account) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-center text-amber-800">
        Connect your wallet to retire credits.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-forest-800">Retire Credits</h1>
      <p className="text-slate-600">
        Burn (retire) your CarbonShield Credits to offset emissions. The retirement is
        recorded on-chain with an optional reason.
      </p>
      <p className="text-slate-500 text-sm">
        Your balance: <strong className="text-forest-700">{creditBalance} CSC</strong>
      </p>

      <form onSubmit={submit} className="rounded-xl bg-white p-6 shadow border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount to retire (CSC)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
            required
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setAmount(creditBalance)}
              className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Retire all
            </button>
            <button
              type="button"
              onClick={() => setReason("Corporate offset")}
              className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Corporate offset
            </button>
            <button
              type="button"
              onClick={() => setReason("Flight offset")}
              className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Flight
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Flight offset, Event carbon neutral"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
          />
        </div>
        <button
          type="submit"
          disabled={tx.status === "pending"}
          className="w-full bg-forest-600 text-white py-2 rounded-lg font-medium hover:bg-forest-700 disabled:opacity-50"
        >
          {tx.status === "pending" ? "Retiring…" : "Retire Credits"}
        </button>

        {tx.status === "success" && tx.hash && (
          <p className="text-sm text-green-600">
            Retired.{" "}
            <a
              href={txExplorerUrl(chainId, tx.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View transaction
            </a>
          </p>
        )}
        {tx.status === "error" && (
          <p className="text-sm text-red-600">{tx.error}</p>
        )}
      </form>
    </div>
  );
}
