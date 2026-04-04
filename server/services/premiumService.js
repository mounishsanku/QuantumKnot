import axios from "axios";
import logger from "../logger.js";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

function ruleBasedPremium(payload) {
  const { city, vehicleType, workingHours, addOns = [], tier } = payload;
  const isEvTier = tier === "ev" || vehicleType === "ev";
  let base = isEvTier ? 79 : 49;
  const breakdown = [
    { label: "Base premium", amount: base, reason: isEvTier ? "EV Shield weekly base" : "Standard Shield weekly base" },
  ];

  if (city === "Mumbai") {
    breakdown.push({ label: "City adjustment", amount: 5, reason: "Mumbai flood risk" });
    base += 5;
  }
  if (city === "Hyderabad") {
    breakdown.push({ label: "City adjustment", amount: -3, reason: "Hyderabad lower flood risk" });
    base -= 3;
  }
  if (workingHours === "night" || addOns.includes("night")) {
    const nightAdj = workingHours === "night" ? 3 : 0;
    if (nightAdj) {
      breakdown.push({ label: "Night shift", amount: nightAdj, reason: "Night shift exposure" });
      base += nightAdj;
    }
  }
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) {
    breakdown.push({ label: "Season adjustment", amount: 7, reason: "Monsoon season (Jun–Sep)" });
    base += 7;
  }

  const addOnPrices = { night: 29, festival: 19, device: 15 };
  for (const a of addOns) {
    if (addOnPrices[a]) {
      breakdown.push({
        label: `Add-on: ${a}`,
        amount: addOnPrices[a],
        reason: "Selected add-on",
      });
      base += addOnPrices[a];
    }
  }

  return {
    basePremium: isEvTier ? 79 : 49,
    adjustedPremium: Math.max(0, Math.round(base)),
    breakdown,
    source: "rule_based",
  };
}

export async function calculatePremium(payload) {
  try {
    const { data } = await axios.post(`${ML_URL}/calculate-premium`, payload, { timeout: 8000 });
    if (data && typeof data.adjustedPremium === "number") {
      return { ...data, source: data.source || "ml" };
    }
  } catch (err) {
    logger.warn(`ML premium service unavailable: ${err.message}`);
  }
  return ruleBasedPremium(payload);
}

export { ruleBasedPremium };
