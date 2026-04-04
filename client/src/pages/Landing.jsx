import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Spline = lazy(() => import("@splinetool/react-spline"));

export default function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0A0A0A] to-[#0A0A0A]">
            <div className="text-center space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-white/40">Loading experience</p>
              <p className="text-lg font-semibold text-white">TriggrPay is spinning up…</p>
            </div>
          </div>
        }
      >
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/woOGP8pFupdLnt8g/scene.splinecode" />
        </div>
      </Suspense>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0A0A0A]/95" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="max-w-2xl text-center space-y-6"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#1A1A1A]/80 backdrop-blur-md px-4 py-1 text-xs uppercase tracking-[0.25em] text-white/70"
          >
            <span className="h-1.5 w-1.5 rounded-xl bg-[#3B82F6]" />
            Income intelligence for India&apos;s gig economy
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="text-white">Triggr</span>
            <span className="text-[#3B82F6]">Pay</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70">
            Your income, protected automatically.
          </p>
          <p className="text-sm sm:text-base text-white/50">
            We detect when you lose money — and pay you instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleGetStarted}
              className="pointer-events-auto inline-flex items-center justify-center rounded-xl bg-blue-500 px-8 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 hover:scale-[1.05] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:ring-offset-[#0A0A0A] transition-all duration-300"
            >
              Get Started
            </button>
            <span className="text-xs sm:text-sm text-white/40">
              No paperwork. No claims. Payouts are calculated, not guessed.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

