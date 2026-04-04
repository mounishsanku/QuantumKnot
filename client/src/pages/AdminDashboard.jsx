import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api.js";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, claimsRes] = await Promise.all([
          api.get("/api/admin/overview"),
          api.get("/api/admin/claims")
        ]);
        setMetrics(overviewRes.data);
        setClaims(claimsRes.data.claims);
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Operations Dashboard</h1>
          <Link to="/" className="text-sm text-[#3B82F6] hover:underline">
            Back to Home
          </Link>
        </header>

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A]/80 p-6 shadow">
              <h3 className="text-sm uppercase tracking-wider text-white/40">Total Users</h3>
              <p className="mt-2 text-3xl font-bold">{metrics.totalUsers}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A]/80 p-6 shadow">
              <h3 className="text-sm uppercase tracking-wider text-white/40">Total Policies</h3>
              <p className="mt-2 text-3xl font-bold">{metrics.totalPolicies}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A]/80 p-6 shadow">
              <h3 className="text-sm uppercase tracking-wider text-white/40">Total Claims</h3>
              <p className="mt-2 text-3xl font-bold">{metrics.totalClaims}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A]/80 p-6 shadow">
              <h3 className="text-sm uppercase tracking-wider text-white/40">Total Payouts</h3>
              <p className="mt-2 text-3xl font-bold text-[#3B82F6]">₹{metrics.totalPayouts.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-1 border-b border-white/10 pb-2">All Claims</h2>
          <p className="text-xs text-white/40 mb-4">Automatically generated based on real-world disruptions</p>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-[#1E293B]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-white/70 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-white/70 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left font-medium text-white/70 uppercase tracking-wider">Trigger</th>
                  <th className="px-4 py-3 text-left font-medium text-white/70 uppercase tracking-wider">Payout</th>
                  <th className="px-4 py-3 text-left font-medium text-white/70 uppercase tracking-wider">Fraud Score</th>
                  <th className="px-4 py-3 text-left font-medium text-white/70 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {claims.map((claim) => {
                  const isHighFraud = claim.fraudScore > 70;
                  return (
                    <tr key={claim._id} className="hover:bg-[#1A1A1A]/80 transition-colors">
                      <td className="px-4 py-3 text-white whitespace-nowrap">
                        {new Date(claim.createdAt).toLocaleString(undefined, {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{claim.riderId?.name || "Unknown"}</div>
                        <div className="text-xs text-white/40">{claim.riderId?.phone}</div>
                      </td>
                      <td className="px-4 py-3 capitalize text-white">{claim.triggerType}</td>
                      <td className="px-4 py-3 font-medium text-[#3B82F6]">₹{claim.payoutAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-xl px-2 py-0.5 text-xs font-medium ${isHighFraud ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                          {claim.fraudScore || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`lowercase rounded-xl px-2.5 py-0.5 text-xs font-semibold ${
                          claim.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                          claim.status === 'pending' || claim.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {claims.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-white/40">
                      No claims found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
