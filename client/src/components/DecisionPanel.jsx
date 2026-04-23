export default function DecisionPanel({ decision }) {
  if (!decision) return null;

  return (
    <div className="p-4 rounded-xl bg-black/40 border border-gray-700 text-white">
      <h2 className="text-lg font-bold mb-2">🧠 System Decision</h2>

      <p><strong>Trigger:</strong> {decision.triggerType}</p>
      <p><strong>City:</strong> {decision.city}</p>
      <p><strong>Severity:</strong> {decision.severity || "High"}</p>

      <p className="mt-2">
        <strong>Fraud Score:</strong> {decision.fraudScore}
      </p>

      {decision.reasons && decision.reasons.length > 0 && (
        <>
          <p className="mt-3 text-sm text-gray-300">
            Reason:
          </p>
          <ul className="text-sm text-gray-400 list-disc ml-4">
            {decision.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-2 text-green-400">
        Action: {decision.action}
      </p>

      <p className="mt-3 text-blue-400">
        Estimated Income Saved: ₹{decision.amount}
      </p>

      <div className="mt-4">
        <p className="text-sm text-gray-300">Payout Flow:</p>
        <div className="flex gap-2 mt-2 text-xs">
          <span>Detected</span> →
          <span>Validated</span> →
          <span className="text-yellow-400">Processing</span> →
          <span className="text-green-400">Paid</span>
        </div>
      </div>
    </div>
  );
}
