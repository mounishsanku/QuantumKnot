import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { api } from "../utils/api.js";
import { useStore } from "../store/useStore.js";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Min 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", data);
      setAuth(res.data.token, res.data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0A0A0A] to-[#0A0A0A]">
      <div className="w-full max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold">
            Triggr<span className="text-[#3B82F6]">Pay</span>
          </h1>
          <p className="text-white/70 mt-2 text-sm">Automated income protection engine</p>
        </motion.div>
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-xl font-semibold mb-4">Log in</h2>
          <label className="block text-sm text-white/70 mb-1">Email</label>
          <input
            type="email"
            autoComplete="email"
            className="w-full rounded-xl bg-[#111111] border border-white/10 px-3 py-2 mb-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && <p className="text-[#EF4444] text-xs mb-3">{errors.email.message}</p>}

          <label className="block text-sm text-white/70 mb-1 mt-2">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl bg-[#111111] border border-white/10 px-3 py-2 mb-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-[#EF4444] text-xs mb-3">{errors.password.message}</p>
          )}

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(59,130,246,0.4)" }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 rounded-xl bg-[#3B82F6] text-[#0A0A0A] font-bold shadow-lg shadow-[#3B82F6]/20 transition-colors hover:bg-[#60A5FA] disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Continue"}
            </motion.button>
            <p className="text-center text-sm text-white/70 mt-4">
              New rider?{" "}
              <Link className="text-[#3B82F6] hover:text-[#2dd4bf] hover:underline transition-colors" to="/register">
                Create account
              </Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
