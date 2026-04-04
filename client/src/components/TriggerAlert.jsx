export default function TriggerAlert({ active }) {
  if (active) {
    return (
      <div className="rounded-xl border border-[#EF4444]/50 bg-[#EF4444]/10 px-4 py-3 text-[#fecaca] flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          ⚠️
        </span>
        <span className="font-medium">Disruption detected — income protection may activate.</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[#3B82F6]/40 bg-[#3B82F6]/10 px-4 py-3 text-[#bbf7d0] flex items-center gap-2">
      <span className="text-lg" aria-hidden>
        ✓
      </span>
      <span className="font-medium">No active disruptions. Your income is stable.</span>
    </div>
  );
}
