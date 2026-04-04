import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore.js";

export default function Navbar() {
  const { rider, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Triggr<span className="text-[#3B82F6]">Pay</span>
          </span>
          <span className="hidden sm:inline text-xs text-white/40 uppercase tracking-widest">
            Income intelligence
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 text-sm">
          <Link className="text-white hover:text-[#3B82F6] transition" to="/dashboard">
            Dashboard
          </Link>
          <Link className="text-white hover:text-[#3B82F6] transition" to="/claims">
            Claims
          </Link>
          <Link className="text-white hover:text-[#3B82F6] transition" to="/get-covered">
            Get covered
          </Link>
          {rider && (
            <span className="hidden md:inline text-white/40 truncate max-w-[120px]">{rider.name}</span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border border-white/20 text-white/90 hover:border-[#3B82F6] hover:text-[#3B82F6] transition"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
