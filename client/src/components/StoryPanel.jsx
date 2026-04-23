export default function StoryPanel({ decision }) {
  if (!decision) return null;

  return (
    <div className="p-4 rounded-xl bg-black/40 border border-gray-700 text-white">
      <h2 className="text-lg font-bold mb-2">📖 Real Impact</h2>

      <p className="text-sm text-gray-300">
        A delivery rider in <strong>{decision.city}</strong> faced a 
        <strong> {decision.triggerType}</strong> disruption.
      </p>

      <p className="mt-2 text-sm">
        Estimated loss: ₹{decision.amount}
      </p>

      <p className="mt-2 text-green-400">
        TriggrPay automatically processed payout — no claim needed.
      </p>
    </div>
  );
}
