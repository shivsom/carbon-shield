import { Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import RegisterLand from "./pages/RegisterLand";
import MintCredits from "./pages/MintCredits";
import Offset from "./pages/Offset";
import Dashboard from "./pages/Dashboard";
import TransferCredits from "./pages/TransferCredits";
import Verify from "./pages/Verify";

export default function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<RegisterLand />} />
          <Route path="mint" element={<MintCredits />} />
          <Route path="transfer" element={<TransferCredits />} />
          <Route path="offset" element={<Offset />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="verify" element={<Verify />} />
        </Route>
      </Routes>
    </WalletProvider>
  );
}
