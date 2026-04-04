import Claim from "../models/Claim.js";
import Rider from "../models/Rider.js";

const MS_DAY = 24 * 60 * 60 * 1000;
const MS_WEEK = 7 * MS_DAY;
const MS_HOUR = 60 * 60 * 1000;

export async function calculateFraudScore(riderId, triggerType) {
  let score = 10;
  const rider = await Rider.findById(riderId);
  if (!rider) return 100;

  const ageDays = (Date.now() - new Date(rider.createdAt).getTime()) / MS_DAY;
  if (ageDays < 30) {
    score += 20;
  }

  const weekAgo = new Date(Date.now() - MS_WEEK);
  const sameTriggerThisWeek = await Claim.countDocuments({
    riderId,
    triggerType,
    createdAt: { $gte: weekAgo },
  });
  if (sameTriggerThisWeek >= 1) {
    score += 30;
  }

  const oneHourAgo = new Date(Date.now() - MS_HOUR);
  const riderDoc = await Rider.findById(riderId).lean();
  const city = riderDoc?.city;
  if (city) {
    const claimsLastHourSameCity = await Claim.countDocuments({
      zone: city,
      createdAt: { $gte: oneHourAgo },
    });
    if (claimsLastHourSameCity >= 10) {
      score += 25;
    }
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}
