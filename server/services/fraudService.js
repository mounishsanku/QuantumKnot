import axios from "axios";
import Claim from "../models/Claim.js";
import Rider from "../models/Rider.js";

const MS_DAY = 24 * 60 * 60 * 1000;
const MS_WEEK = 7 * MS_DAY;
const MS_HOUR = 60 * 60 * 1000;

/**
 * Fraud Scoring Service — 
 * Combined Rule-Based and ML-Driven Analysis
 */
export async function calculateFraudScore(riderId, triggerType) {
  let ruleBasedScore = 15;
  const rider = await Rider.findById(riderId);
  if (!rider) return 100;

  // 1. Rule: Account Age Check
  const ageDays = (Date.now() - new Date(rider.createdAt).getTime()) / MS_DAY;
  if (ageDays < 30) {
    ruleBasedScore += 20;
  }

  // 2. Rule: Claim Frequency Check (Weekly)
  const weekAgo = new Date(Date.now() - MS_WEEK);
  const claimFrequency = await Claim.countDocuments({
    riderId,
    triggerType,
    createdAt: { $gte: weekAgo },
  });
  if (claimFrequency >= 1) {
    ruleBasedScore += 30;
  }

  // 3. Rule: City-wide Activity Spike
  const oneHourAgo = new Date(Date.now() - MS_HOUR);
  const city = rider.city;
  let citySpike = false;
  if (city) {
    const claimsLastHourSameCity = await Claim.countDocuments({
      zone: city,
      createdAt: { $gte: oneHourAgo },
    });
    if (claimsLastHourSameCity >= 10) {
      ruleBasedScore += 25;
      citySpike = true;
    }
  }

  // --- PHASE 1: ML BRIDGE INTEGRATION ---
  let mlScore = 0;
  try {
    // 1. Validation before ML call
    if (!riderId || claimFrequency == null) {
      console.log("[ML] Invalid payload, skipping ML");
      return ruleBasedScore;
    }

    console.log("[ML] Calling ML service...");
    const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";
    
    // Preparing ML Input Features
    const payload = {
      riderId,
      claimFrequency,
      citySpike,
      triggerType,
      accountAgeDays: Math.round(ageDays)
    };

    const response = await axios.post(`${ML_URL}/predict`, payload, { timeout: 2000 });
    
    if (response.data && typeof response.data.fraudScore === 'number') {
      mlScore = response.data.fraudScore;
      console.log(`[ML] Fraud score from model: ${mlScore}`);
    }
  } catch (err) {
    console.log("[ML] Fallback to rule-based scoring only (Service unreachable)");
  }

  // 2. Weighted Scoring (60% Rule-based, 40% ML)
  const finalScore = mlScore > 0 
    ? Math.round((ruleBasedScore * 0.6) + (mlScore * 0.4))
    : ruleBasedScore;

  return Math.min(100, Math.max(0, finalScore));
}
