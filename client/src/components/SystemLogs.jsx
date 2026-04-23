export default function SystemLogs({ logs }) {
  return (
    <div className="p-4 rounded-xl bg-black/40 border border-gray-700 text-white h-64 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">📊 System Logs</h2>
        <span className="text-xs font-semibold text-green-400 flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Monitoring Active
        </span>
      </div>

      <div className="overflow-y-auto flex-1 space-y-1.5">
        {logs.length === 0 && (
          <p className="text-sm text-gray-500 italic">System Status: 🟢 Monitoring Active...</p>
        )}
        {logs.map((log, i) => (
          <div key={i} className="text-sm text-gray-300 font-mono">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
