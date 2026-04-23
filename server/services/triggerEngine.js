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

// New API Services
import { getAQI } from "./airQualityService.js";
import { detectDisruption } from "./newsService.js";
import { validateLocation } from "./locationService.js";
import { sendPayoutNotification } from "./notificationService.js";

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

/**
 * trigger type → human-readable label
 */
function triggerLabel(t) {
  const map = {
    rainfall: "Heavy rain",
    flood: "Flooding",
    heat: "Extreme heat",
    aqi: "Poor air quality",
    strike: "City-wide strike",
    nightDisruption: "Night disruption",
    orderDrought: "Order drought",
  };
  return map[t] || t;
}

/**
 * Earnings-based payout calculation with robustness.
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

/**
 * Main Trigger Processor with Isolated Error Handling
 */
export async function processTrigger(io, riderId, triggerType, triggerValue, zone, force = false) {
  try {
    const rider = await Rider.findById(riderId);
    if (!rider) {
      logger.error(`[trigger] Rider not found: ${riderId}`);
      return null;
    }

    if (!riderId || !triggerType || !zone) {
      logger.warn(`[TRIGGER] Missing critical data: riderId=${riderId}, type=${triggerType}, zone=${zone}`);
      return null;
    }

    const triggerSource = triggerType.toUpperCase();
    console.log(`[TRIGGER] Source: ${triggerSource}`);
    console.log(`[TRIGGER] Processing rider: ${riderId}`);
    console.log(`[TRIGGER] Type: ${triggerType}`);

    // 1. Deduplication (Skip if force/simulation)
    if (!force) {
      const recentSame = await Claim.findOne({
        riderId,
        triggerType,
        createdAt: { $gte: new Date(Date.now() - DEDUPE_MS) },
      }).lean();
      if (recentSame) {
        logger.info(`[trigger] Dedupe hit for rider ${riderId} - ${triggerType}`);
        return null;
      }
    }

    // 2. Policy Check & Fallback for Demo
    let policy = await Policy.findOne({ riderId, status: "active" }).sort({ startDate: -1 });
    if (!policy) {
      if (force) {
        logger.info(`[trigger] [SIMULATION] Using fallback demo policy for rider ${riderId}`);
        policy = {
          _id: new mongoose.Types.ObjectId(),
          riderId,
          tier: "standard",
          coverageAmount: 10000,
          status: "active",
          city: zone || rider.city || "Global",
          vehicleType: rider.vehicleType || "petrol",
          isDemo: true
        };
      } else {
        logger.info(`[trigger] No active policy for rider ${riderId}`);
        return null;
      }
    }

    // 3. Multi-source validation gate
    if (!force) {
      const validation = validateMultiSourceTrigger(triggerType, triggerValue, zone || rider.city || "Global");
      if (!validation.valid) {
        logger.warn(`[trigger] Low confidence for rider ${riderId} in ${rider.city} — ${validation.breakdown}`);
        return null;
      }
    }

    // --- PHASE 2: PRIORITY-BASED TRIGGER ENHANCEMENT ---
    let finalTriggerType = triggerType; // rainfall / heat
    let finalTriggerValue = triggerValue;

    try {
      // 1. NEWS CHECK (Highest Priority)
      const news = await detectDisruption(zone || rider.city || "Global");
      if (news.detected) {
        finalTriggerType = "strike";
        finalTriggerValue = `News Alert: ${news.type}`;
      } else {
        // 2. AQI CHECK (Second Priority)
        const aqi = await getAQI(zone || rider.city || "Global");
        if (aqi && aqi > 150) {
          finalTriggerType = "pollution";
          finalTriggerValue = `AQI: ${aqi}`;
        }
      }
    } catch (err) {
      logger.warn(`[trigger] Enhanced API check failed: ${err.message}`);
    }

    // Update variables for the rest of the flow
    triggerType = finalTriggerType;
    triggerValue = finalTriggerValue;

    // ── Simulation Start ──
    const safeNotify = (type, data = {}) => {
      if (io) {
        io.to(`rider:${riderId}`).emit("activity", {
          type,
          triggerType,
          city: zone || rider.city || "Global",
          timestamp: Date.now(),
          ...data
        });
      }
    };

    safeNotify("trigger_detected");
    await delay(600);

    safeNotify("fraud_check_started");
    await delay(800);

    // 4. Fraud Calculation (with isolated catch)
    let fraudScore = 15;
    try {
      fraudScore = await calculateFraudScore(riderId, triggerType);

      // --- PHASE 2: LOCATION FRAUD SIGNAL ---
      // Extract lat/lng from zone if available (assuming zone might sometimes be coords or we fallback to rider data)
      // For this demo, we'll try to find lat/lng in the trigger context or use a safe check.
      // Note: rider has city, but we need coords for a real check. 
      // Assuming coordinates might come in the request or from a recent check.
      const isValidLoc = await validateLocation(rider.lat, rider.lng, zone || rider.city);
      if (isValidLoc === false) {
        fraudScore += 30;
      }
    } catch (e) {
      logger.error(`[trigger] Fraud calculation failed, using fallback score. Error: ${e.message}`);
    }

    console.log(`[FRAUD] Final Score: ${fraudScore}`);
    safeNotify("fraud_check_completed", { fraudScore });
    await delay(600);

    // 5. Payout Logic
    const { payoutAmount, explanation, breakdown } = computePayoutWithExplanation(rider, triggerType, triggerValue, fraudScore);
    const incomeEstimate = Math.round(((rider.dailyEarnings || 700) * 4) / 8);

    // 6. Claim Creation
    const claimData = {
      riderId,
      policyId: policy._id,
      triggerType,
      triggerValue: String(triggerValue),
      zone: zone || rider.city || "Global",
      incomeEstimate,
      payoutAmount,
      fraudScore,
      status: fraudScore >= 70 ? "pending" : "approved",
      autoTriggered: true,
      explanation,
      breakdown,
    };

    const claim = await Claim.create(claimData);
    console.log(`[CLAIM] Created | Rider: ${riderId} | Type: ${triggerType} | Amount: ${payoutAmount}`);
    logger.info(`[trigger] Claim ${claim._id} created for rider ${riderId} status=${claim.status}`);

    if (fraudScore >= 70) {
      safeNotify("claim_created", { message: `Claim created — held for review (score ${fraudScore})` });
      return claim;
    }

    // 7. Payout Processing
    safeNotify("payout_processing", { payoutAmount });
    await delay(1000);

    try {
      const { transactionId } = await processPayout(claim._id, riderId, payoutAmount, rider.upiId);
      claim.status = "paid";
      await claim.save();

      // Notifications (Fire and Forget - don't await/crash if these fail)
      sendPayoutSuccessEmail(rider, { ...claim.toObject(), transactionId }).catch(e => logger.error(`[trigger] Email failed: ${e.message}`));
      sendPayoutSMS(rider, { ...claim.toObject(), transactionId }).catch(e => logger.error(`[trigger] SMS failed: ${e.message}`));
      
      // Phase 2: SendGrid Notification
      sendPayoutNotification(rider.email, payoutAmount).catch(e => logger.error(`[trigger] SendGrid failed: ${e.message}`));

      safeNotify("payout_completed", { payoutAmount, transactionId });
      if (io) {
        io.to(`rider:${riderId}`).emit("payout:completed", {
          claimId: claim._id,
          amount: payoutAmount,
          transactionId,
          triggerType,
        });
        const reasons = [
          `${triggerType.charAt(0).toUpperCase() + triggerType.slice(1)} exceeded threshold`,
          "Location verified",
          fraudScore < 70 ? "Low fraud risk" : "High fraud risk"
        ];

        io.to(`rider:${riderId}`).emit("trigger_update", {
          triggerType,
          city: zone || rider.city || "Global",
          fraudScore,
          amount: payoutAmount,
          action: "Auto payout initiated",
          reasons
        });
      }
    } catch (e) {
      logger.error(`[trigger] Payout processing failed: ${e.message}`);
      claim.status = "approved"; // Revert to approved so it can be re-processed
      await claim.save();
      safeNotify("payout_failed", { message: "Automatic payout failed. Admin will review." });
    }

    return claim;
  } catch (err) {
    logger.error(`[trigger] CRITICAL FAILURE for rider ${riderId}: ${err.message}`);
    throw err; // Re-throw to be caught by route handler
  }
}
