import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";
import Rider from "../models/Rider.js";
import { calculateFraudScore } from "./fraudService.js";
import { processPayout } from "./payoutService.js";
import { validateMultiSourceTrigger } from "./multiSourceValidator.js";
import logger from "../logger.js";
import { sendPayoutSuccessEmail } from "./emailService.js";
import { sendPayoutSMS } from "./smsService.js";
import mongoose from "mongoose";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function policyCoversTrigger(policy, triggerType) {
  const tier = policy.tier;
  const addOns = policy.addOns || [];
  if (triggerType === "rainfall" || triggerType === "flood") return true;
  if (triggerType === "heat") return tier === "ev";
  if (triggerType === "aqi") return true;
  if (triggerType === "strike") return true;
  if (triggerType === "nightDisruption") return addOns.includes("night") || tier === "ev";
  if (triggerType === "orderDrought") return true;
  return false;
}

/* ── trigger → estimated disruption hours ── */
function getDisruptionHours(triggerType) {
  switch (triggerType) {
    case "rainfall":
    case "flood":     return 3;
    case "heat":      return 4;
    case "aqi":       return 2;
    case "strike":    return 5;
    case "nightDisruption": return 3;
    default:          return 2;
  }
}

/* ── trigger type → human-readable label ── */
function triggerLabel(t) {
  const map = {
    rainfall: "Heavy rain",
    flood: "Flooding",
    heat: "Extreme heat",
    aqi: "Poor air quality",
    strike: "City-wide strike",
    nightDisruption: "Night disruption",
    orderDrought: "Order drought",
    gridOutage: "Grid outage",
    chargingCongestion: "Charging congestion",
    zoneClosure: "Zone closure",
    curfew: "Curfew",
  };
  return map[t] || t;
}

const PAYOUT_MIN = 100;
const PAYOUT_MAX = 1000;

/**
 * Earnings-based payout calculation.
 * Formula: hourlyIncome × disruptionHours, clamped [₹100, ₹1000].
 * Returns { payoutAmount, explanation, disruptionHours, hourlyIncome }.
 */
function computePayoutWithExplanation(rider, triggerType, triggerValue, fraudScore) {
  const baseAmount = 200;
  
  const multipliers = {
    rainfall: 1.2,
    flood: 1.2,
    heat: 1.3,
    strike: 1.5
  };
  const severityMultiplier = multipliers[triggerType] || 1.0;
  
  const dailyEarnings = Number(rider.dailyEarnings) || 700;
  const earningsFactor = Math.round((dailyEarnings / 700) * 100) / 100;

  const raw = baseAmount * severityMultiplier * earningsFactor;
  const payoutAmount = Math.round(raw);

  const breakdown = {
    baseAmount,
    severityMultiplier,
    earningsFactor,
    finalAmount: payoutAmount
  };

  const parts = [
    `${triggerLabel(triggerType)} detected (${triggerValue}).`,
    `Calculation: ₹${baseAmount} (Base) × ${severityMultiplier} (Severity) × ${earningsFactor} (Earnings) = ₹${payoutAmount}.`,
  ];

  if (fraudScore >= 70) {
    parts.push(`Fraud score ${fraudScore} — held for manual review.`);
  } else {
    parts.push(`Fraud score ${fraudScore} (low risk). Payout approved.`);
  }

  const explanation = parts.join(" ");

  return { payoutAmount, explanation, breakdown };
}

const DEDUPE_MS = 3 * 60 * 60 * 1000;

export async function processTrigger(io, riderId, triggerType, triggerValue, zone, force = false) {
  const rider = await Rider.findById(riderId);
  if (!rider) {
    logger.warn(`processTrigger: rider not found ${riderId}`);
    return null;
  }

  if (!force) {
    const recentSame = await Claim.findOne({
      riderId,
      triggerType,
      createdAt: { $gte: new Date(Date.now() - DEDUPE_MS) },
    }).lean();
    if (recentSame) {
      logger.info(`processTrigger: dedupe hit for ${riderId} - ${triggerType}`);
      return null;
    }
  } else {
    logger.info(`[SIMULATION MODE] Force trigger executed for rider ${riderId} - ${triggerType}`);
  }

  let policy = await Policy.findOne({ riderId, status: "active" }).sort({ startDate: -1 });
  
  if (!policy) {
    if (force) {
      logger.info(`processTrigger: [FORCE] No active policy found for ${riderId}, using fallback demo policy`);
      policy = {
        _id: new mongoose.Types.ObjectId(),
        riderId,
        tier: "standard",
        coverageAmount: 10000,
        status: "active",
        city: zone || rider.city,
        vehicleType: rider.vehicleType,
        isDemo: true
      };
    } else {
      logger.info(`processTrigger: no active policy for ${riderId}`);
      return null;
    }
  }

  if (!force && !policyCoversTrigger(policy, triggerType)) {
    logger.info(`processTrigger: policy ${policy._id} does not cover ${triggerType}`);
    return null;
  }

  // ── Multi-source validation gate ──
  if (!force) {
    const validation = validateMultiSourceTrigger(triggerType, triggerValue, zone || rider.city);
    if (!validation.valid) {
      logger.warn(`processTrigger: trigger rejected due to low confidence for rider ${riderId} — ${validation.breakdown}`);
      return null;
    }
  }

  // ⚡ Trigger detected
  if (io) {
    io.to(`rider:${riderId}`).emit("activity", {
      type: "trigger_detected",
      triggerType,
      city: zone || rider.city,
      timestamp: Date.now(),
    });
    await delay(600);
  }

  // 🛡️ Fraud check started
  if (io) {
    io.to(`rider:${riderId}`).emit("activity", {
      type: "fraud_check_started",
      triggerType,
      city: zone || rider.city,
      timestamp: Date.now(),
    });
    await delay(800);
  }

  const fraudScore = await calculateFraudScore(riderId, triggerType);
  const incomeEstimate = Math.round(((rider.dailyEarnings || 700) * 4) / 8);

  // ✅ Fraud check completed
  if (io) {
    io.to(`rider:${riderId}`).emit("activity", {
      type: "fraud_check_completed",
      triggerType,
      city: zone || rider.city,
      fraudScore,
      timestamp: Date.now(),
    });
    await delay(600);
  }

  // ── Earnings-based payout + explainable breakdown ──
  const { payoutAmount, explanation, breakdown } = computePayoutWithExplanation(rider, triggerType, triggerValue, fraudScore);
  logger.info(`[payout] rider=${riderId} amount=₹${payoutAmount} | ${explanation}`);

  if (fraudScore >= 70) {
    const claim = await Claim.create({
      riderId,
      policyId: policy._id,
      triggerType,
      triggerValue: String(triggerValue),
      zone: zone || rider.city,
      incomeEstimate,
      payoutAmount,
      fraudScore,
      status: "pending",
      autoTriggered: true,
      explanation,
      breakdown,
    });
    if (io) {
      io.to(`rider:${riderId}`).emit("activity", {
        type: "claim_created",
        message: `Claim created — held for review (fraud score ${fraudScore})`,
        ts: Date.now(),
      });
      io.to(`rider:${riderId}`).emit("claim:update", { claimId: claim._id, status: "pending_review" });
    }
    return claim;
  }

  const claim = await Claim.create({
    riderId,
    policyId: policy._id,
    triggerType,
    triggerValue: String(triggerValue),
    zone: zone || rider.city,
    incomeEstimate,
    payoutAmount,
    fraudScore,
    status: "approved",
    autoTriggered: true,
    explanation,
    breakdown,
  });

  // 🔔 Activity: claim created
  if (io) {
    io.to(`rider:${riderId}`).emit("activity", {
      type: "claim_created",
      message: `Claim approved — ₹${payoutAmount} payout initiated`,
      ts: Date.now(),
    });
  }

  // 💰 Processing payout
  if (io) {
    io.to(`rider:${riderId}`).emit("activity", {
      type: "payout_processing",
      triggerType,
      city: zone || rider.city,
      payoutAmount,
      timestamp: Date.now(),
    });
    await delay(1000);
  }

  const { transactionId } = await processPayout(claim._id, riderId, payoutAmount, rider.upiId);
  claim.status = "paid";
  await claim.save();

  await sendPayoutSuccessEmail(rider, { ...claim.toObject(), transactionId });
  await sendPayoutSMS(rider, { ...claim.toObject(), transactionId });

  // 🎉 Payout completed
  if (io) {
    io.to(`rider:${riderId}`).emit("activity", {
      type: "payout_completed",
      triggerType,
      city: zone || rider.city,
      payoutAmount,
      timestamp: Date.now(),
    });
    io.to(`rider:${riderId}`).emit("payout:completed", {
      claimId: claim._id,
      amount: payoutAmount,
      transactionId,
      triggerType,
    });
  }

  return claim;
}

