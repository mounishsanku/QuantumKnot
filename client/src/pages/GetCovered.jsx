import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import PremiumCalculator from "../components/PremiumCalculator.jsx";
import PolicyCard from "../components/PolicyCard.jsx";
import { api } from "../utils/api.js";
import { useStore } from "../store/useStore.js";
import { estimateWeeklyPremium } from "../utils/premiumEstimate.js";

export default function GetCovered() {
  const navigate = useNavigate();
  const rider = useStore((s) => s.rider);
  const [tier, setTier] = useState(rider?.vehicleType === "ev" ? "ev" : "standard");
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createdPolicy, setCreatedPolicy] = useState(null);
  const [serverBreakdown, setServerBreakdown] = useState(null);
  const [serverTotal, setServerTotal] = useState(null);

  const toggleAddOn = (key) => {
    setAddOns((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  const preview = useMemo(
    () => estimateWeeklyPremium(rider, tier, addOns),
    [rider, tier, addOns]
  );

  const activate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/policies/create", { tier, addOns });
      setCreatedPolicy(res.data.policy);
      setServerBreakdown(res.data.premiumBreakdown);
      setServerTotal(res.data.adjustedPremium);
      toast.success("Coverage activated!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not activate coverage");
    } finally {
      setLoading(false);
    }
  };

  const breakdown = serverBreakdown || preview.breakdown;
  const total = serverTotal != null ? serverTotal : preview.total;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold">Choose your protection tier</h1>
          <p className="text-white/70 mt-1 text-sm sm:text-base">
            Automated income protection — powered by real-world disruption detection.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setTier("standard")}
            className={`text-left rounded-2xl border p-6 transition-all duration-300 ${
              tier === "standard"
                ? "border-[#3B82F6] bg-[#3B82F6]/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                : "border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl hover:bg-white/10"
            }`}
          >
            <h2 className="text-xl font-semibold">Standard Shield</h2>
            <p className="text-3xl font-bold mt-2 text-[#3B82F6]">₹49<span className="text-base font-normal text-white/70">/week</span></p>
            <p className="text-white/70 text-sm mt-2">Core income protection — detects disruptions and pays automatically.</p>
          </button>

          <button
            type="button"
            onClick={() => setTier("ev")}
            className={`text-left rounded-2xl border p-6 transition-all duration-300 relative ${
              rider?.vehicleType === "ev" ? "ring-2 ring-[#3B82F6]/40" : ""
            } ${
              tier === "ev"
                ? "border-[#3B82F6] bg-[#3B82F6]/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                : "border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl hover:bg-white/10"
            }`}
          >
            {rider?.vehicleType === "ev" && (
              <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-xl bg-[#3B82F6]/20 text-[#3B82F6]">
                Recommended for you
              </span>
            )}
            <h2 className="text-xl font-semibold">EV Shield</h2>
            <p className="text-3xl font-bold mt-2 text-[#3B82F6]">₹79<span className="text-base font-normal text-white/70">/week</span></p>
            <p className="text-white/70 text-sm mt-2">Heat &amp; grid-aware intelligence tuned for EV delivery.</p>
          </button>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-5 shadow-lg shadow-black/20">
          <h3 className="font-semibold mb-4">Add-ons</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { key: "night", label: "Night Surge Shield", price: 29 },
              { key: "festival", label: "Festival Income Guard", price: 19 },
              { key: "device", label: "Device Shield", price: 15 },
            ].map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => toggleAddOn(a.key)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition-all duration-300 ${
                  addOns.includes(a.key)
                    ? "border-[#3B82F6] bg-[#3B82F6]/15 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    : "border-white/15 bg-[#1A1A1A]/80 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <div className="font-medium">{a.label}</div>
                <div className="text-[#3B82F6] mt-1">+₹{a.price}/week</div>
              </button>
            ))}
          </div>
        </section>

        <PremiumCalculator breakdown={breakdown} total={total} />

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-white/40 text-sm">
            Running total updates as you toggle add-ons. Final price confirmed on activate (earnings-based intelligence on server).
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={activate}
            className="px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold hover:opacity-90 active:scale-95 transition-all duration-300 shadow-lg shadow-[#3B82F6]/30 disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? "Activating…" : "Activate coverage"}
          </button>
        </div>

        {createdPolicy && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#3B82F6]">You&apos;re covered</h3>
            <PolicyCard policy={createdPolicy} />
          </div>
        )}
      </main>
    </div>
  );
}
