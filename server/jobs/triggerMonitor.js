import cron from "node-cron";
import axios from "axios";
import Policy from "../models/Policy.js";
import Rider from "../models/Rider.js";
import { processTrigger } from "../services/triggerEngine.js";
import { getAQI } from "../services/airQualityService.js";
import logger from "../logger.js";

const THRESHOLDS = {
  rainfall: 20, // mm/hr
  heat: 42,     // degree Celsius
  aqi: 150      // US AQI
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Spam Prevention Map: Track last trigger time per city
const recentTriggers = new Map();

/**
 * Fetch weather for a city using OpenWeatherMap fallback
 */
async function fetchWeatherForCity(city) {
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) return null;
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`;
    const { data } = await axios.get(url, { timeout: 5000 });
    return data;
  } catch (err) {
    logger.warn(`[MONITOR] Weather fetch failed for ${city}: ${err.message}`);
    return null;
  }
}

/**
 * Main monitor logic
 */
async function runMonitor(io) {
  try {
    // 1. Fetch active policies
    const activePolicies = await Policy.find({ status: "active" }).select("riderId city").lean();
    if (activePolicies.length === 0) return;

    // 2. Group riders by city
    const ridersByCity = activePolicies.reduce((acc, p) => {
      if (!acc[p.city]) acc[p.city] = [];
      acc[p.city].push(String(p.riderId));
      return acc;
    }, {});

    const cities = Object.keys(ridersByCity);
    logger.info(`[MONITOR] Checking conditions for ${cities.length} cities...`);

    for (const city of cities) {
      // 2a. Spam Prevention (3 min cooldown)
      const now = Date.now();
      const lastTrigger = recentTriggers.get(city);
      if (lastTrigger && now - lastTrigger < 3 * 60 * 1000) {
        logger.info(`[MONITOR] Skipping ${city}, recently triggered`);
        continue;
      }

      await delay(100); 

      // 3. Fetch current conditions (AQI + Weather)
      const [aqi, weather] = await Promise.all([
        getAQI(city),
        fetchWeatherForCity(city)
      ]);

      const rain1h = weather?.rain?.["1h"] || 0;
      const temp = weather?.main?.temp || 0;
      const riderIds = [...new Set(ridersByCity[city])];

      logger.info(
        `[MONITOR] Evaluating city: ${city} | AQI=${aqi || "N/A"} | Rain=${rain1h}mm | Temp=${temp}°C`
      );

      // 4. Priority-Based Threshold Evaluation
      // Priority: Pollution > Rainfall > Heat
      
      let triggered = false;

      if (aqi && aqi > THRESHOLDS.aqi) {
        // POLLUTION (Highest Priority)
        logger.info(`[MONITOR] Poor AQI detected in ${city}: ${aqi}`);
        triggered = true;
        for (const riderId of riderIds) {
          try {
            await processTrigger(io, riderId, "pollution", `AQI: ${aqi}`, city, false);
          } catch (e) {
            logger.error(`[MONITOR] Pollution trigger failed for rider ${riderId}: ${e.message}`);
          }
        }
      } else if (rain1h > THRESHOLDS.rainfall) {
        // RAINFALL (Second Priority)
        logger.info(`[MONITOR] Heavy Rain detected in ${city}: ${rain1h}mm`);
        triggered = true;
        for (const riderId of riderIds) {
          try {
            await processTrigger(io, riderId, "rainfall", `${rain1h}mm/hr`, city, false);
          } catch (e) {
            logger.error(`[MONITOR] Rainfall trigger failed for rider ${riderId}: ${e.message}`);
          }
        }
      } else if (temp > THRESHOLDS.heat) {
        // HEAT (Third Priority)
        logger.info(`[MONITOR] Extreme Heat detected in ${city}: ${temp}°C`);
        triggered = true;
        for (const riderId of riderIds) {
          try {
            await processTrigger(io, riderId, "heat", `${temp}°C`, city, false);
          } catch (e) {
            logger.error(`[MONITOR] Heat trigger failed for rider ${riderId}: ${e.message}`);
          }
        }
      }

      if (triggered) {
        recentTriggers.set(city, now);
      }
    }
    
    logger.info(`[MONITOR] Cycle completed`);
  } catch (err) {
    logger.error(`[MONITOR] Fatal error in monitor loop: ${err.message}`);
  }
}

/**
 * Initialize and start the cron job
 */
export function startTriggerMonitor(io) {
  logger.info("[MONITOR] Initializing Background Trigger Monitoring System...");
  
  // Schedule: Every 5 minutes
  cron.schedule("*/5 * * * *", () => {
    logger.info("[MONITOR] Running scheduled check...");
    runMonitor(io).catch(err => logger.error(`[MONITOR] Cron execution error: ${err.message}`));
  });
}