const statusStyle = {
  paid: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40",
  pending: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40",
  approved: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40",
  rejected: "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40",
};

export default function ClaimCard({ claim, compact }) {
  if (!claim) return null;
  const st = claim.status || "pending";
  const badge = statusStyle[st] || statusStyle.pending;

  return (
    <div
      className={`rounded-xl border p-4 ${compact ? "bg-[#0A0A0A]" : "bg-[#1A1A1A]/80"}`}
    >
      <div className="flex justify-between gap-2 items-start">
        <div>
          <p className="text-xs text-white/40">
            {new Date(claim.createdAt).toLocaleString("en-IN")}
          </p>
          <p className="font-semibold capitalize mt-1">{claim.triggerType?.replace(/([A-Z])/g, " $1")}</p>
          <p className="text-sm text-white/70 mt-1">{claim.triggerValue}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-xl border capitalize ${badge}`}>{st}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <span className="text-white/70">
          Payout: <strong className="text-white">₹{Number(claim.payoutAmount || 0).toFixed(0)}</strong>
        </span>
        <span className="text-white/70">
          Fraud score: <strong className="text-white">{claim.fraudScore}</strong>
        </span>
      </div>
    </div>
  );
}
