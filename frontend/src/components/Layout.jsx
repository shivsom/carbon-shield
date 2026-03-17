import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import NetworkBanner from "./NetworkBanner";
import { Toaster } from "react-hot-toast";
import OnboardingModal from "./OnboardingModal";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <NetworkBanner />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: { background: "#0f172a", color: "#fff" },
        }}
      />
      <OnboardingModal />
    </div>
  );
}
