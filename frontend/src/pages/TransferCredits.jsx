import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useWallet } from "../context/WalletContext";
import { txExplorerUrl } from "../utils/explorer";
import { addTx, updateTx } from "../utils/txHistory";

export default function TransferCredits() {
  const { account, provider, carbonToken, creditBalance, chainId, refreshBalances } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!carbonToken || !account || !provider) return;
    try {
      const signer = await provider.getSigner();
      const tx = await carbonToken.connect(signer).transfer(to, ethers.parseEther(amount || "0"));
      addTx({ hash: tx.hash, label: "Transfer Credits (CSC)", chainId, status: "pending" });
      toast.loading(
        <span>
          Sending…{" "}
          <a className="underline" href={txExplorerUrl(chainId, tx.hash)} target="_blank" rel="noreferrer">
            View
          </a>
        </span>,
        { id: tx.hash }
      );
      await tx.wait();
      updateTx(tx.hash, { status: "success" });
      toast.success("Transfer confirmed", { id: tx.hash });
      setTo("");
      setAmount("");
      refreshBalances();
    } catch (err) {
      toast.error(err.reason || err.message || "Transfer failed");
    }
  };

  if (!account) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-center text-amber-800">
        Connect your wallet to transfer credits.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">Transfer Credits</h1>
        <p className="text-slate-600 mt-1">
          Send CarbonShield Credits (CSC) to another wallet (simple P2P transfer).
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">Your balance</div>
          <div className="font-mono text-lg text-forest-700">{creditBalance} CSC</div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-xl bg-white p-6 shadow border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Recipient address</label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (CSC)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 10"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-forest-600 text-white py-2 rounded-lg font-medium hover:bg-forest-700"
        >
          Send credits
        </button>
      </form>
    </div>
  );
}

