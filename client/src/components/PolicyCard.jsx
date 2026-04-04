const tierLabel = { standard: "Standard Shield", ev: "EV Shield" };

export default function PolicyCard({ policy }) {
  if (!policy) return null;
  const renewal = policy.nextRenewalDate
    ? new Date(policy.nextRenewalDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="rounded-2xl border border-[#3B82F6]/40 bg-[#1A1A1A]/80 p-5 shadow-lg shadow-black/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">Policy</p>
          <p className="font-mono text-sm text-[#3B82F6] break-all">{String(policy._id)}</p>
        </div>
        <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/40">
          ACTIVE
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-white/40 text-xs">Tier</p>
          <p className="font-medium">{tierLabel[policy.tier] || policy.tier}</p>
        </div>
        <div>
          <p className="text-white/40 text-xs">Coverage</p>
          <p className="font-medium">₹{policy.coverageAmount?.toLocaleString("en-IN")}</p>
        </div>
        <div className="col-span-2">
          <p className="text-white/40 text-xs">Add-ons</p>
          <p className="font-medium">
            {policy.addOns?.length ? policy.addOns.join(", ") : "None"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-white/40 text-xs">Next renewal</p>
          <p className="font-medium">{renewal}</p>
        </div>
      </div>
    </div>
  );
}
