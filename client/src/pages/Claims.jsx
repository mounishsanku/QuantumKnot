import { Fragment, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { api } from "../utils/api.js";

const statuses = ["all", "pending", "approved", "rejected", "paid"];

/* ── derive which of the 4 pipeline stages are done / active / upcoming ── */
function getStages(claim) {
  const s = claim.status;
  const rejected = s === "rejected";
  const approved = s === "approved" || s === "paid";
  const paid = s === "paid";

  return [
    { label: "Trigger detected",  icon: "⚡", done: true,     active: false },
    { label: "Fraud check",       icon: "🛡️", done: true,     active: false,
      sub: claim.fraudScore != null ? `Score ${claim.fraudScore}` : null },
    { label: rejected ? "Rejected" : "Approved",
      icon: rejected ? "✕" : "✓",
      done: approved || rejected,
      active: s === "pending",
      error: rejected },
    { label: "Payout processed",  icon: "💸", done: paid,     active: approved && !paid },
  ];
}

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/claims/my-claims");
        setClaims(res.data.claims || []);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load claims");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return claims;
    return claims.filter((c) => c.status === filter);
  }, [claims, filter]);

  const toggle = (id) => setOpenId((x) => (x === id ? null : id));

  const statusColor = (st) => {
    if (st === "paid") return "text-[#3B82F6]";
    if (st === "pending") return "text-[#F59E0B]";
    if (st === "rejected") return "text-[#EF4444]";
    return "text-[#3B82F6]";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Claims history</h1>
            <p className="text-white/70 text-sm mt-1">Real-world disruption detection and payout trail</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-sm border capitalize ${
                  filter === s
                    ? "border-[#3B82F6] bg-[#3B82F6]/15 text-[#3B82F6]"
                    : "border-white/15 text-white/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <p className="text-white/70">Loading claims…</p>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl shadow-lg overflow-hidden mt-6">
            <table className="w-full text-sm">
              <thead className="bg-[#0A0A0A]/40 text-left text-white/70">
                <tr>
                  <th className="px-4 py-3 w-10" />
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Trigger</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const stages = getStages(c);
                  return (
                  <Fragment key={c._id}>
                    <tr
                      className="border-t border-white/5 hover:bg-[#1A1A1A]/80 cursor-pointer transition-colors duration-300"
                      onClick={() => toggle(c._id)}
                    >
                      <td className="px-4 py-3 text-white/40">{openId === c._id ? "▼" : "▶"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 capitalize">{c.triggerType}</td>
                      <td className="px-4 py-3">₹{Number(c.payoutAmount || 0).toFixed(0)}</td>
                      <td className={`px-4 py-3 capitalize font-medium ${statusColor(c.status)}`}>
                        {c.status}
                      </td>
                    </tr>

                    <AnimatePresence>
                    {openId === c._id && (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-[#0A0A0A]/60 border-t border-white/5"
                      >
                        <td colSpan={5} className="px-4 py-6 text-sm text-white">
                          {/* ── horizontal timeline ── */}
                          <div className="flex items-start justify-between mb-6 px-2">
                            {stages.map((st, idx) => {
                              const isLast = idx === stages.length - 1;

                              const dotColor = st.error
                                ? "bg-red-500 shadow-red-500/40"
                                : st.done
                                ? "bg-blue-500 shadow-blue-500/40"
                                : st.active
                                ? "bg-yellow-500 shadow-yellow-500/40 animate-pulse"
                                : "bg-white/20";

                              const lineColor = st.done
                                ? st.error ? "bg-red-500/50" : "bg-blue-500/50"
                                : "bg-white/10";

                              const labelColor = st.error
                                ? "text-red-400"
                                : st.done
                                ? "text-white"
                                : st.active
                                ? "text-yellow-400"
                                : "text-white/30";

                              return (
                                <Fragment key={idx}>
                                  <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                                    className="flex flex-col items-center text-center min-w-[80px]"
                                  >
                                    {/* dot */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg ${dotColor} transition-all duration-500`}>
                                      {st.done || st.error ? (
                                        <span className="text-sm">{st.icon}</span>
                                      ) : st.active ? (
                                        <span className="text-sm">{st.icon}</span>
                                      ) : (
                                        <span className="text-white/40 text-xs">{idx + 1}</span>
                                      )}
                                    </div>
                                    {/* label */}
                                    <p className={`mt-2 text-xs font-medium leading-tight ${labelColor}`}>{st.label}</p>
                                    {/* sub-label */}
                                    {st.sub && (
                                      <p className={`mt-0.5 text-[10px] ${st.done ? "text-white/50" : "text-white/30"}`}>{st.sub}</p>
                                    )}
                                  </motion.div>
                                  {/* connector line */}
                                  {!isLast && (
                                    <div className="flex-1 flex items-center pt-3">
                                      <div className={`h-[2px] w-full rounded-full ${lineColor} transition-all duration-500`} />
                                    </div>
                                  )}
                                </Fragment>
                              );
                            })}
                          </div>

                          {/* ── claim details grid ── */}
                          <div className="grid sm:grid-cols-2 gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                            <div>
                              <p className="text-white/40 text-xs">Trigger value</p>
                              <p>{c.triggerValue}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs">Zone</p>
                              <p>{c.zone}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs">Fraud score</p>
                              <p className={c.fraudScore >= 70 ? "text-red-400 font-semibold" : ""}>{c.fraudScore}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs">Income estimate</p>
                              <p>₹{Number(c.incomeEstimate || 0).toFixed(0)}</p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-white/40 text-xs">Transaction ID</p>
                              <p className="font-mono text-xs break-all">
                                {c.transactionId || "—"}
                              </p>
                            </div>
                          </div>

                          {/* ── Explainable payout breakdown ── */}
                          {c.breakdown && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.3 }}
                              className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-[0_0_20px_rgba(59,130,246,0.05)]"
                            >
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-blue-400 text-sm">💰</span>
                                <h4 className="text-sm font-bold text-blue-100 uppercase tracking-tight">Payout Intelligence Breakdown</h4>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div className="bg-white/5 rounded-xl py-3 border border-white/5">
                                    <p className="text-[10px] text-white/40 uppercase mb-1 font-bold tracking-wider">💰 Base Amount</p>
                                    <p className="text-xl font-black">₹{c.breakdown.baseAmount}</p>
                                  </div>
                                  <div className="bg-white/5 rounded-xl py-3 border border-white/5">
                                    <p className="text-[10px] text-white/40 uppercase mb-1 font-bold tracking-wider">
                                      {c.triggerType === 'rainfall' || c.triggerType === 'flood' ? '🌧' : c.triggerType === 'heat' ? '🔥' : '⚡'} Weather Impact
                                    </p>
                                    <p className="text-xl font-black text-teal-400">+{Math.round((c.breakdown.severityMultiplier - 1) * 100)}%</p>
                                  </div>
                                  <div className="bg-white/5 rounded-xl py-3 border border-white/5">
                                    <p className="text-[10px] text-white/40 uppercase mb-1 font-bold tracking-wider">📊 Earnings Factor</p>
                                    <p className="text-xl font-black text-white/60">{c.breakdown.earningsFactor}x</p>
                                  </div>
                                </div>
                                
                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-xs text-white/50 font-medium">Decision rationale</p>
                                    <p className="text-[10px] text-white/30 italic mt-0.5 max-w-sm">Every payout is dynamically calculated based on live impact severity and your personal income average at that location.</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] text-blue-400/60 uppercase font-black tracking-widest mb-1">Final Disruption Payout</p>
                                    <p className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]">₹{c.breakdown.finalAmount}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* ── Original human-readable explanation fallback ── */}
                          {!c.breakdown && c.explanation && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.3 }}
                              className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-400 text-xs">💡</span>
                                <p className="text-xs font-semibold text-blue-400">Payout rationale</p>
                              </div>
                              <p className="text-xs text-white/70 leading-relaxed">{c.explanation}</p>
                            </motion.div>
                          )}
                        </td>
                      </motion.tr>
                    )}
                    </AnimatePresence>
                  </Fragment>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center">
                      <p className="text-white/40">No claims for this filter.</p>
                      <p className="text-white/30 text-xs mt-2">Simulate a real-world disruption from the Dashboard to generate one.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
