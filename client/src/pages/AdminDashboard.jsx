import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import DecisionPanel from "../components/DecisionPanel.jsx";
import SystemLogs from "../components/SystemLogs.jsx";
import { api } from "../utils/api.js";

export default function AdminDashboard() {
  const [decision, setDecision] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") }
    });

    socket.on("trigger_update", (data) => {
      setDecision(data);
      const time = new Date().toLocaleTimeString();
      setLogs((prev) => [
        `${time} | [TRIGGER] ${data.triggerType} in ${data.city}`,
        `${time} | [FRAUD] Score ${data.fraudScore}`,
        `${time} | [PAYOUT] ₹${data.amount}`,
        ...prev.slice(0, 20),
      ]);
    });

    return () => socket.disconnect();
  }, []);

  const simulate = async (type) => {
    try {
      await api.post("/api/admin/simulate-trigger", {
        triggerType: type,
        force: true
      });
    } catch (err) {
      console.error("Simulation failed", err);
    }
  };

  return (
    <div className="p-6 text-white space-y-6 pt-24 max-w-6xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold">🛠 Admin Control Panel</h1>

      {/* Simulation Controls */}
      <div className="flex flex-wrap gap-4">
        <button onClick={() => simulate("rainfall")} className="bg-[#111] px-5 py-2.5 rounded-xl border border-[#444] hover:bg-[#222] transition-colors font-semibold shadow-lg">
          🌧 Rainfall
        </button>
        <button onClick={() => simulate("heat")} className="bg-[#111] px-5 py-2.5 rounded-xl border border-[#444] hover:bg-[#222] transition-colors font-semibold shadow-lg">
          🔥 Heat
        </button>
        <button onClick={() => simulate("strike")} className="bg-[#111] px-5 py-2.5 rounded-xl border border-[#444] hover:bg-[#222] transition-colors font-semibold shadow-lg">
          ⚡ Strike
        </button>
      </div>

      {/* Decision + Logs */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <DecisionPanel decision={decision} />
        <SystemLogs logs={logs} />
      </div>
    </div>
  );
}
