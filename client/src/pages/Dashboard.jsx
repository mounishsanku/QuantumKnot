import { useEffect, useMemo, useState, useCallback } from "react";
import { io as socketIo } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import PolicyCard from "../components/PolicyCard.jsx";
import TriggerAlert from "../components/TriggerAlert.jsx";
import { api } from "../utils/api.js";
import { useStore } from "../store/useStore.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const rider = useStore((s) => s.rider);
  const token = useStore((s) => s.token);
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [aqiLabel, setAqiLabel] = useState("—");
  const [feed, setFeed] = useState([]);
  const [simulating, setSimulating] = useState(null); // null | "rainfall" | "heat" | "strike"
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          api.get("/api/policies/active"),
          api.get("/api/claims/my-claims"),
        ]);
        setPolicy(pRes.data.policy);
        setClaims(cRes.data.claims || []);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!token) return;
    const socket = socketIo(API_BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socket.on("payout:completed", () => {
      toast.success("Payout completed!");
      api.get("/api/claims/my-claims").then((r) => setClaims(r.data.claims || []));
    });
    socket.on("activity", (evt) => {
      setFeed((prev) => {
        const newItem = { ...evt, id: `${evt.type}-${Date.now()}` };
        return [newItem, ...prev].slice(0, 10);
      });
    });
    return () => socket.disconnect();
  }, [token]);

  /* ── Trigger simulator ── */
  const simulateTrigger = useCallback(async (triggerType) => {
    setSimulating(triggerType);
    setSimResult(null);
    const loadingToast = toast.loading("Processing trigger...");
    
    try {
      // 2-3 second aesthetic delay requested for demo
      await new Promise(r => setTimeout(r, 2000));

      const res = await api.post("/api/admin/simulate-trigger", { triggerType, force: true });
      
      if (res.data.success && res.data.claimCreated) {
        toast.dismiss(loadingToast);
        const amount = res.data.payoutAmount;
        setSimResult({ type: "success", amount, trigger: triggerType });
        toast.success(`Payout completed ₹${amount} ✅`, { duration: 5000 });
        
        // Auto-refresh data
        const [cr, pr] = await Promise.all([
          api.get("/api/claims/my-claims"),
          api.get("/api/policies/active")
        ]);
        setClaims(cr.data.claims || []);
        setPolicy(pr.data.policy);
      } else {
        toast.dismiss(loadingToast);
        toast.error(res.data.message || "Simulation failed. Try again.");
        setSimResult({ type: "error", message: res.data.message });
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      const msg = e.response?.data?.message || "Simulation failed. Try again.";
      toast.error(msg);
      setSimResult({ type: "error", message: msg });
    } finally {
      setSimulating(null);
      setTimeout(() => setSimResult(null), 5000);
    }
  }, []);

  useEffect(() => {
    const key = import.meta.env.VITE_OPENWEATHERMAP_KEY;
    const city = rider?.city || "Hyderabad";
    const q = `${encodeURIComponent(city)},IN`;
    const run = async () => {
      setWeatherLoading(true);
      try {
        const key = import.meta.env.VITE_OPENWEATHERMAP_KEY;
        if (!key || key === "your_openai_api_key_here") {
          console.warn("Weather API key missing. Skipping fetch.");
          setWeather({ temp: "--", desc: "Key missing", city: q });
          return;
        }

        const w = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${key}&units=metric`
        );
        const data = await w.json();
        const rain = data.rain && data.rain["1h"] != null ? data.rain["1h"] : 0;
        const temp = data.main?.temp;
        const lat = data.coord?.lat;
        const lon = data.coord?.lon;
        let aqi = null;
        if (lat != null && lon != null) {
          const ap = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
          );
          const aj = await ap.json();
          const idx = aj.list?.[0]?.main?.aqi;
          const map = { 1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very poor" };
          aqi = idx ? map[idx] || String(idx) : "—";
        }
        setAqiLabel(aqi || "—");
        setWeather({ rain, temp, city });
      } catch {
        toast.error("Weather unavailable");
      } finally {
        setWeatherLoading(false);
      }
    };
    run();
  }, [rider?.city]);

  const stats = useMemo(() => {
    const paidTotal = claims
      .filter((c) => c.status === "paid")
      .reduce((s, c) => s + (Number(c.payoutAmount) || 0), 0);
    const pendingTriggers = claims.filter((c) => c.status === "pending").length;
    return {
      coverage: policy?.coverageAmount || 0,
      premium: policy?.weeklyPremium || 0,
      payouts: paidTotal,
      pending: pendingTriggers,
    };
  }, [claims, policy]);

  const disruption =
    weather && (Number(weather.rain) > 20 || Number(weather.temp) > 42);

  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d, i) => ({
      day: d,
      premium: (policy?.weeklyPremium || 49) + i * 2,
    }));
  }, [policy?.weeklyPremium]);

  const statusColor = (st) => {
    if (st === "paid") return "text-[#3B82F6]";
    if (st === "pending") return "text-[#F59E0B]";
    if (st === "rejected") return "text-[#EF4444]";
    return "text-white";
  };

  /* ── Smart Insights (rule-based) ── */
  const insights = useMemo(() => {
    let score = 0;
    const reasons = [];

    // weather signals
    if (weather) {
      if (Number(weather.rain) > 20) { score += 35; reasons.push("Heavy rainfall detected in your zone"); }
      else if (Number(weather.rain) > 5) { score += 15; reasons.push("Moderate rain activity nearby"); }
      if (Number(weather.temp) > 42) { score += 30; reasons.push("Extreme heat alert — EV battery risk"); }
      else if (Number(weather.temp) > 38) { score += 10; reasons.push("High temperature trending"); }
    }
    if (aqiLabel === "Poor" || aqiLabel === "Very poor") { score += 15; reasons.push("Air quality is degraded"); }

    // city risk
    const highRiskCities = ["Mumbai", "Chennai", "Delhi"];
    if (highRiskCities.includes(rider?.city)) { score += 10; reasons.push(`${rider.city} has historically higher claim frequency`); }

    // vehicle
    if (rider?.vehicleType === "ev" && Number(weather?.temp) > 35) { score += 10; reasons.push("EV riders face elevated heat-related downtime"); }

    // working hours
    if (rider?.workingHours === "night") { score += 10; reasons.push("Night shifts carry higher disruption probability"); }

    // recent claim velocity
    const recentPaid = claims.filter(c => c.status === "paid" && new Date(c.createdAt) > new Date(Date.now() - 7 * 86400000)).length;
    if (recentPaid >= 3) { score += 15; reasons.push(`${recentPaid} payouts in the last 7 days`); }
    else if (recentPaid >= 1) { score += 5; reasons.push(`${recentPaid} recent payout this week`); }

    // clamp
    score = Math.min(score, 100);

    let level, color, bg, border;
    if (score >= 50) { level = "High"; color = "text-red-400"; bg = "bg-red-500/10"; border = "border-red-500/30"; }
    else if (score >= 25) { level = "Medium"; color = "text-yellow-400"; bg = "bg-yellow-500/10"; border = "border-yellow-500/30"; }
    else { level = "Low"; color = "text-emerald-400"; bg = "bg-emerald-500/10"; border = "border-emerald-500/30"; }

    if (reasons.length === 0) reasons.push("No active risk signals — conditions are stable");

    return { score, level, color, bg, border, reasons };
  }, [weather, aqiLabel, rider, claims]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-white/70">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-12">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {greeting()}, {rider?.name}! <span aria-hidden>☀️</span>
            </h1>
            <p className="text-white/70 text-sm mt-1">We don&apos;t just automate claims. We understand income loss.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {rider?.kycStatus === "verified" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-400 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                KYC Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 text-xs font-semibold animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                KYC Pending
              </span>
            )}
            {policy && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/40 text-[#3B82F6] text-sm font-semibold">
                Active policy
              </span>
            )}
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "This Week's Coverage", value: `₹${stats.coverage.toLocaleString("en-IN")}` },
            { label: "Weekly Premium", value: `₹${stats.premium.toLocaleString("en-IN")}` },
            { label: "Payouts Received", value: `₹${Math.round(stats.payouts).toLocaleString("en-IN")}` },
            { label: "Disruptions Detected", value: String(stats.pending) },
          ].map((c, i) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59,130,246,0.15)" }}
              key={c.label}
              className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-4 shadow-lg shadow-black/20"
            >
              <p className="text-xs uppercase tracking-wide text-white/40">{c.label}</p>
              <p className="text-2xl font-bold mt-2 text-[#3B82F6]">{c.value}</p>
            </motion.div>
          ))}
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {policy ? (
              <PolicyCard policy={policy} />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-white/70">
                No active policy yet.{" "}
                <a className="text-[#3B82F6]" href="/get-covered">
                  Get covered
                </a>
              </div>
            )}

            <motion.div 
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.4 }}
               whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(59,130,246,0.08)" }}
               className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-4 h-64 shadow-lg"
            >
              <h3 className="text-sm font-semibold text-white mb-2">Earnings-based intelligence (illustrative)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ background: "#0A0A0A", border: "1px solid #334155" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="premium"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorPrem)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="space-y-4"
          >
            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59,130,246,0.1)" }}
              className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-5 shadow-lg"
            >
              <h3 className="font-semibold mb-3">Disruption monitor — {rider?.city}</h3>
              {weatherLoading ? (
                <p className="text-white/70 text-sm">Loading weather…</p>
              ) : !weather ? (
                <p className="text-white/70 text-sm">Add VITE_OPENWEATHERMAP_KEY to show live weather.</p>
              ) : (
                <ul className="text-sm space-y-2 text-white">
                  <li>Temperature: {weather.temp?.toFixed(1)}°C</li>
                  <li>Rain (1h): {weather.rain} mm</li>
                  <li>AQI band: {aqiLabel}</li>
                </ul>
              )}
              <div className="mt-4">
                <TriggerAlert active={!!disruption} />
              </div>
            </motion.div>

            {/* ── Smart Insights ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59,130,246,0.1)" }}
              className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Risk Intelligence</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${insights.bg} ${insights.border} ${insights.color}`}>
                  {insights.level} Risk
                </span>
              </div>

              {/* risk gauge bar */}
              <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${insights.score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                  className={`h-full rounded-full ${
                    insights.score >= 50 ? "bg-red-500" : insights.score >= 25 ? "bg-yellow-500" : "bg-emerald-500"
                  }`}
                />
              </div>

              {/* reasons */}
              <ul className="space-y-2">
                {insights.reasons.map((r, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                    className="flex items-start gap-2 text-xs text-white/70"
                  >
                    <span className={`mt-0.5 flex-shrink-0 h-1.5 w-1.5 rounded-full ${insights.score >= 50 ? "bg-red-500" : insights.score >= 25 ? "bg-yellow-500" : "bg-emerald-500"}`} />
                    {r}
                  </motion.li>
                ))}
              </ul>

              <p className="text-[10px] text-white/30 mt-4">Every decision is explainable. Risk derived from weather, location, vehicle type, and claim patterns.</p>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Trigger Simulator ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Disruption Simulator</h3>
              <p className="text-xs text-white/40 mt-0.5">Simulate real-world disruptions — payouts are calculated, not guessed</p>
            </div>
            {simResult?.type === "success" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400"
              >
                ₹{simResult.amount} paid ✅
              </motion.span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {["rainfall", "heat", "strike"].map((t) => (
              <button
                key={t}
                type="button"
                disabled={!!simulating}
                onClick={() => simulateTrigger(t)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 ${
                  simulating === t
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-400 animate-pulse"
                    : "border-white/15 bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 text-white hover:text-blue-400"
                } disabled:opacity-50`}
              >
                {simulating === t ? "Processing…" : `⚡ Simulate ${t.charAt(0).toUpperCase() + t.slice(1)}`}
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── Activity Feed ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-5 shadow-lg"
        >
          <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Live Activity Breakdown
          </h3>
          <div className="space-y-3 min-h-[300px]">
            <AnimatePresence initial={false} mode="popLayout">
              {feed.map((evt, idx) => {
                const icons = {
                  trigger_detected: "⚡",
                  fraud_check_started: "🛡️",
                  fraud_check_completed: "✅",
                  payout_processing: "💰",
                  payout_completed: "🎉",
                };

                const formatMessage = (item) => {
                  const type = item.type;
                  const tType = item.triggerType?.charAt(0).toUpperCase() + item.triggerType?.slice(1);
                  
                  if (type === "trigger_detected") return `Disruption detected: ${tType} in ${item.city}`;
                  if (type === "fraud_check_started") return `Fraud-resistant payout engine: Initializing checks...`;
                  if (type === "fraud_check_completed") return `Fraud check passed (Score: ${item.fraudScore || 0})`;
                  if (type === "payout_processing") return `Earnings-based intelligence: Calculating ₹${item.payoutAmount || 0} payout`;
                  if (type === "payout_completed") return `Success! ₹${item.payoutAmount || 0} transferred via UPI`;
                  return "Activity update";
                };

                return (
                  <motion.div
                    key={evt.id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ 
                      opacity: idx === 0 ? 1 : 1 - (idx * 0.08), 
                      y: 0, 
                      scale: 1,
                      backgroundColor: idx === 0 ? "rgba(59, 130, 246, 0.08)" : "rgba(255, 255, 255, 0.03)"
                    }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className={`flex items-start gap-4 rounded-xl border p-3 ${
                      idx === 0 ? "border-blue-500/30 ring-1 ring-blue-500/20" : "border-white/5"
                    }`}
                  >
                    <div className={`text-xl mt-0.5 flex-shrink-0 ${idx === 0 ? "scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "opacity-60"}`}>
                      {icons[evt.type] || "🔔"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-relaxed ${idx === 0 ? "text-blue-100" : "text-white/60"}`}>
                        {formatMessage(evt)}
                      </p>
                      <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        {new Date(evt.timestamp || evt.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {feed.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <span className="text-xl rotate-12 opacity-50">🧭</span>
                </div>
                <p className="text-sm text-white/30 max-w-[200px]">Simulate a trigger to see live system events</p>
              </div>
            )}
          </div>
        </motion.section>

        <section className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 font-semibold bg-[#1A1A1A]/80">
            Recent claims
            <span className="block text-xs font-normal text-white/40 mt-0.5">Automatically generated based on real-world disruptions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0A0A0A]/40 text-left text-white/70">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Trigger</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                 {claims.slice(0, 8).map((c) => (
                   <tr key={c._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                     <td className="px-4 py-3 whitespace-nowrap text-white/50">
                       {new Date(c.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                     </td>
                     <td className="px-4 py-3 capitalize font-medium">{c.triggerType}</td>
                     <td className="px-4 py-3 relative group/tip">
                       <div className="flex items-center gap-2">
                         <span className="font-semibold text-blue-400">₹{Number(c.payoutAmount || 0).toFixed(0)}</span>
                         <span className="text-[10px] text-white/20 cursor-help group-hover/tip:text-blue-400/60 transition-colors">ℹ️</span>
                       </div>
                       
                       {/* ── Tooltip breakdown ── */}
                       {c.breakdown && (
                         <div className="absolute bottom-full left-4 mb-2 w-56 p-3 rounded-xl bg-[#121212] border border-white/10 shadow-2xl opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-all duration-300 translate-y-1 group-hover/tip:translate-y-0 z-50">
                            <p className="text-xs font-bold text-white mb-3">Payout Intelligence</p>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/50 flex items-center gap-2">💰 Base Amount</span>
                                <span className="text-white">₹{c.breakdown.baseAmount}</span>
                              </div>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/50 flex items-center gap-2">
                                  {c.triggerType === 'rainfall' || c.triggerType === 'flood' ? '🌧' : c.triggerType === 'heat' ? '🔥' : '⚡'} {c.triggerType.charAt(0).toUpperCase() + c.triggerType.slice(1)} Impact
                                </span>
                                <span className="text-blue-400 font-bold">+{Math.round((c.breakdown.severityMultiplier - 1) * 100)}%</span>
                              </div>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/50 flex items-center gap-2">📊 Earnings Factor</span>
                                <span className="text-white/80">{c.breakdown.earningsFactor}x</span>
                              </div>
                            </div>

                            <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                              <span className="text-[11px] font-medium text-white/50">Final Payout</span>
                              <span className="text-sm font-bold text-blue-400">₹{c.breakdown.finalAmount}</span>
                            </div>
                            
                            <div className="absolute top-full left-4 border-8 border-transparent border-t-[#121212]" />
                         </div>
                       )}
                     </td>
                     <td className={`px-4 py-3 capitalize font-medium ${statusColor(c.status)}`}>
                       <span className="flex items-center gap-1.5">
                         <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'paid' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                         {c.status}
                       </span>
                     </td>
                   </tr>
                 ))}
                {claims.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-white/40">
                      No claims yet — simulate a disruption above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
