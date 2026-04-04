import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { api } from "../utils/api.js";
import { useStore } from "../store/useStore.js";

const cities = ["Hyderabad", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Pune"];
const platforms = ["Zomato", "Swiggy", "Zepto", "Blinkit", "Amazon", "Flipkart"];

const step1Schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^[0-9]{10}$/, "10-digit phone"),
  city: z.enum(cities),
  aadharLast4: z.string().regex(/^[0-9]{4}$/, "Last 4 digits"),
});

const step2Schema = z.object({
  platforms: z.array(z.string()).min(1, "Pick at least one platform"),
  vehicleType: z.enum(["petrol", "ev", "four-wheeler"]),
  workingHours: z.enum(["morning", "afternoon", "night", "flexible"]),
  dailyEarnings: z.coerce.number().min(300).max(1500),
});

const step2FieldsSchema = step2Schema.omit({ platforms: true });

const step3Schema = z
  .object({
    password: z.string().min(6, "Min 6 characters"),
    confirm: z.string(),
    upiId: z.string().min(3, "UPI ID required"),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [platformsSel, setPlatformsSel] = useState([]);

  const form1 = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { city: "Hyderabad" },
  });
  const form2 = useForm({
    resolver: zodResolver(step2FieldsSchema),
    defaultValues: {
      dailyEarnings: 700,
      vehicleType: "petrol",
      workingHours: "flexible",
    },
  });
  const form3 = useForm({ resolver: zodResolver(step3Schema) });

  const progress = (step / 3) * 100;

  const togglePlatform = (p) => {
    setPlatformsSel((prev) => {
      const set = new Set(prev);
      if (set.has(p)) set.delete(p);
      else set.add(p);
      return Array.from(set);
    });
  };

  const onStep1 = (d) => {
    setData1(d);
    setStep(2);
  };
  const onStep2 = (d) => {
    const merged = { ...d, platforms: platformsSel };
    const parsed = step2Schema.safeParse(merged);
    if (!parsed.success) {
      parsed.error.issues.forEach((e) => toast.error(e.message));
      return;
    }
    setData2(parsed.data);
    setStep(3);
  };

  const onStep3 = async (d) => {
    if (!data1 || !data2) {
      toast.error("Please complete all steps");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...data1,
        ...data2,
        password: d.password,
        upiId: d.upiId,
      };
      const res = await api.post("/api/auth/register", payload);
      setAuth(res.data.accessToken, res.data.rider);
      toast.success("Account created!");
      navigate("/get-covered");
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#0A0A0A] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            Join Triggr<span className="text-[#3B82F6]">Pay</span>
          </h1>
          <p className="text-white/70 text-sm mt-1">3 quick steps — your income deserves intelligence</p>
        </div>

        <div className="h-2 rounded-xl bg-white/10 overflow-hidden mb-8">
          <div
            className="h-full bg-[#3B82F6] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {step === 1 && (
          <form
            onSubmit={form1.handleSubmit(onStep1)}
            className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-6 space-y-4"
          >
            <h2 className="font-semibold text-lg">Step 1 — Identity</h2>
            <div>
              <label className="text-sm text-white/70">Full name</label>
              <input
                className="w-full mt-1 rounded-xl bg-[#111111] border border-white/10 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                {...form1.register("name")}
              />
              {form1.formState.errors.name && (
                <p className="text-[#EF4444] text-xs mt-1">{form1.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-white/70">Email</label>
              <input
                type="email"
                autoComplete="email"
                className="w-full mt-1 rounded-xl bg-[#111111] border border-white/10 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                {...form1.register("email")}
              />
              {form1.formState.errors.email && (
                <p className="text-[#EF4444] text-xs mt-1">{form1.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-white/70">Phone</label>
              <input
                className="w-full mt-1 rounded-xl bg-[#0A0A0A] border border-white/10 px-3 py-2"
                {...form1.register("phone")}
              />
              {form1.formState.errors.phone && (
                <p className="text-[#EF4444] text-xs mt-1">{form1.formState.errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-white/70">City</label>
              <select
                className="w-full mt-1 rounded-xl bg-[#0A0A0A] border border-white/10 px-3 py-2"
                {...form1.register("city")}
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70">Aadhaar last 4</label>
              <input
                className="w-full mt-1 rounded-xl bg-[#0A0A0A] border border-white/10 px-3 py-2"
                {...form1.register("aadharLast4")}
              />
              {form1.formState.errors.aadharLast4 && (
                <p className="text-[#EF4444] text-xs mt-1">
                  {form1.formState.errors.aadharLast4.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#3B82F6] text-[#0A0A0A] font-semibold"
            >
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={form2.handleSubmit(onStep2)}
            className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-6 space-y-4"
          >
            <h2 className="font-semibold text-lg">Step 2 — Work profile</h2>
            <div>
              <label className="text-sm text-white/70">Platforms</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {platforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition ${
                      platformsSel.includes(p)
                        ? "border-[#3B82F6] bg-[#3B82F6]/20 text-[#3B82F6]"
                        : "border-white/20 text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Vehicle</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { id: "petrol", icon: "⛽", label: "Petrol" },
                  { id: "ev", icon: "⚡", label: "EV" },
                  { id: "four-wheeler", icon: "🚗", label: "4W" },
                ].map((v) => (
                  <label
                    key={v.id}
                    className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-sm ${
                      form2.watch("vehicleType") === v.id
                        ? "border-[#3B82F6] bg-[#3B82F6]/15"
                        : "border-white/15"
                    }`}
                  >
                    <input type="radio" className="hidden" value={v.id} {...form2.register("vehicleType")} />
                    <div className="text-2xl">{v.icon}</div>
                    <div>{v.label}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Working hours</label>
              <select
                className="w-full mt-1 rounded-xl bg-[#0A0A0A] border border-white/10 px-3 py-2"
                {...form2.register("workingHours")}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night">Night</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">
                Typical daily earnings: ₹{form2.watch("dailyEarnings")}
              </label>
              <input
                type="range"
                min={300}
                max={1500}
                step={50}
                className="w-full mt-2 accent-[#3B82F6]"
                {...form2.register("dailyEarnings", { valueAsNumber: true })}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-white/20"
              >
                Back
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#3B82F6] text-[#0A0A0A] font-semibold">
                Continue
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form
            onSubmit={form3.handleSubmit(onStep3)}
            className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-6 space-y-4"
          >
            <h2 className="font-semibold text-lg">Step 3 — Payouts</h2>
            <div>
              <label className="text-sm text-white/70">Password</label>
              <input
                type="password"
                className="w-full mt-1 rounded-xl bg-[#0A0A0A] border border-white/10 px-3 py-2"
                {...form3.register("password")}
              />
              {form3.formState.errors.password && (
                <p className="text-[#EF4444] text-xs mt-1">{form3.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-white/70">Confirm password</label>
              <input
                type="password"
                className="w-full mt-1 rounded-xl bg-[#0A0A0A] border border-white/10 px-3 py-2"
                {...form3.register("confirm")}
              />
              {form3.formState.errors.confirm && (
                <p className="text-[#EF4444] text-xs mt-1">{form3.formState.errors.confirm.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-white/70">UPI ID</label>
              <input
                className="w-full mt-1 rounded-xl bg-[#0A0A0A] border border-white/10 px-3 py-2"
                placeholder="name@upi"
                {...form3.register("upiId")}
              />
              {form3.formState.errors.upiId && (
                <p className="text-[#EF4444] text-xs mt-1">{form3.formState.errors.upiId.message}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-xl border border-white/20"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#3B82F6] text-[#0A0A0A] font-semibold disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-white/70 mt-6">
          Already registered?{" "}
          <Link className="text-[#3B82F6]" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
