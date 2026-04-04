import cron from "node-cron";
import axios from "axios";
import Policy from "../models/Policy.js";
import Rider from "../models/Rider.js";
// import { triggerQueue } from "./triggerQueue.js";
import logger from "../logger.js";

const CITY_NAMES = {
  Hyderabad: "Hyderabad,IN",
  Bengaluru: "Bengaluru,IN",
  Mumbai: "Mumbai,IN",
  Delhi: "Delhi,IN",
  Chennai: "Chennai,IN",
  Pune: "Pune,IN",
};

async function fetchWeatherForCity(cityLabel) {
  const q = CITY_NAMES[cityLabel] || `${cityLabel},IN`;
  const key = process.env.OPENWEATHERMAP_API_KEY;
  if (!key) {
    logger.warn("OPENWEATHERMAP_API_KEY missing; skipping weather fetch");
    return null;
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${key}&units=metric`;
  const { data } = await axios.get(url, { timeout: 12000 });
  return data;
}

async function runMonitor(io) {
  try {
    const activePolicies = await Policy.find({ status: "active" }).select("riderId city").lean();
    const cities = [...new Set(activePolicies.map((p) => p.city).filter(Boolean))];
    if (cities.length === 0) return;

    for (const city of cities) {
      let weather;
      try {
        weather = await fetchWeatherForCity(city);
      } catch (e) {
        logger.warn(`Weather fetch failed for ${city}: ${e.message}`);
        continue;
      }
      if (!weather) continue;

      const rain1h = weather.rain && weather.rain["1h"] != null ? Number(weather.rain["1h"]) : 0;
      const temp = weather.main && weather.main.temp != null ? Number(weather.main.temp) : null;

      const riderIdsInCity = [
        ...new Set(
          activePolicies.filter((p) => p.city === city).map((p) => String(p.riderId))
        ),
      ];

      if (rain1h > 20) {
        for (const rid of riderIdsInCity) {
          logger.info(`[REDIS-DISABLED] Rainfall detected for rider: ${rid} in ${city}`);
          // await triggerQueue.add("trigger-job", {
          //   riderId: rid,
          //   triggerType: "rainfall",
          //   triggerValue: `${rain1h}mm/hr`,
          //   zone: city,
          //   timestamp: Date.now()
          // });
        }
      }

      if (temp != null && temp > 42) {
        for (const rid of riderIdsInCity) {
          const rider = await Rider.findById(rid).lean();
          if (rider && rider.vehicleType === "ev") {
            logger.info(`[REDIS-DISABLED] Heat detected for rider: ${rid} in ${city}`);
            // await triggerQueue.add("trigger-job", {
            //   riderId: rid,
            //   triggerType: "heat",
            //   triggerValue: `${temp}°C`,
            //   zone: city,
            //   timestamp: Date.now()
            // });
          }
        }
      }
    }
  } catch (err) {
    logger.error(`triggerMonitor run error: ${err.message}`);
  }
}

export function startTriggerMonitor(io) {
  cron.schedule("*/5 * * * *", () => {
    runMonitor(io);
  });
  logger.info("Trigger monitor scheduled every 5 minutes");
}
