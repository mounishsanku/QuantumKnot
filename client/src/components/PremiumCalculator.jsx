import { useEffect, useState } from "react";

function AnimatedNumber({ value, duration = 500 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = value;
    let frame;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(from + (to - from) * p));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span>{display}</span>;
}

export default function PremiumCalculator({ breakdown = [], total = 0 }) {
  const rows = Array.isArray(breakdown) ? breakdown : [];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-[#3B82F6] mb-3">Your Earnings-Based Premium</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 border-b border-white/10">
              <th className="pb-2 pr-4">Component</th>
              <th className="pb-2">Adjustment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-2 pr-4">
                  <div className="font-medium text-white">{row.label}</div>
                  {row.reason && <div className="text-xs text-white/45">{row.reason}</div>}
                </td>
                <td className="py-2 whitespace-nowrap">₹{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center text-lg font-bold border-t border-white/10 pt-3">
        <span>Total</span>
        <span className="text-[#3B82F6]">
          ₹<AnimatedNumber value={total} />
          <span className="text-sm font-normal text-white/70">/week</span>
        </span>
      </div>
    </div>
  );
}
