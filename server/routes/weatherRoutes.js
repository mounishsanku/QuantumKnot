import { Router } from "express";
import axios from "axios";
import logger from "../logger.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const q = req.query.q || "Hyderabad,IN";
    const key = process.env.OPENWEATHER_API_KEY;

    if (!key) {
      return res.status(500).json({ message: "Weather API key missing" });
    }

    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${key}&units=metric`
    );

    const data = weatherRes.data;

    const { lat, lon } = data.coord;

    let aqi = "—";

    try {
      const aqiRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
      );

      const idx = aqiRes.data.list?.[0]?.main?.aqi;
      const map = {
        1: "Good",
        2: "Fair",
        3: "Moderate",
        4: "Poor",
        5: "Very poor",
      };

      aqi = idx ? map[idx] : "—";
    } catch (e) {
      logger.warn(`[weather] AQI failed: ${e.message}`);
    }

    res.json({
      city: data.name,
      temp: data.main?.temp ?? null,
      rain: data.rain?.["1h"] ?? 0,
      aqiLabel: aqi,
      description: data.weather?.[0]?.description ?? "N/A",
    });
  } catch (err) {
    const msg = err.response?.data?.message || err.message;

    logger.error(`[weather] Failed: ${msg}`);

    // ✅ ALWAYS 500 (never 401)
    res.status(500).json({ message: `Weather error: ${msg}` });
  }
});

export default router;