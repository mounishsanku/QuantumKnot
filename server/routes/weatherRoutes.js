import { Router } from "express";
import axios from "axios";
import { authMiddleware } from "../middleware/authMiddleware.js";
import logger from "../logger.js";

const router = Router();

/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Protected weather proxy
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         example: Hyderabad,IN
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const q = req.query.q || "Hyderabad,IN";
    const key = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHERMAP_KEY;
    
    if (!key || key === "your_openai_api_key_here") {
      return res.status(500).json({ message: "Weather API key not configured on server" });
    }

    // 1. Fetch Current Weather
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${key}&units=metric`
    );
    const weatherData = weatherRes.data;

    // 2. Fetch AQI (Air Pollution) using lat/lon from weather
    const { lat, lon } = weatherData.coord;
    let aqi = "—";
    
    try {
      const aqiRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
      );
      const idx = aqiRes.data.list?.[0]?.main?.aqi;
      const map = { 1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very poor" };
      aqi = idx ? map[idx] || String(idx) : "—";
    } catch (aqiErr) {
      logger.warn(`[weather] AQI fetch failed: ${aqiErr.message}`);
    }

    // 3. Combine Response
    res.json({
      city: weatherData.name,
      temp: weatherData.main?.temp,
      rain: (weatherData.rain && weatherData.rain["1h"]) || 0,
      aqiLabel: aqi,
      coord: weatherData.coord,
      description: weatherData.weather?.[0]?.description,
      status: "success"
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = err.response?.data?.message || err.message;
    logger.error(`[weather] Proxy failed: ${msg}`);
    res.status(status).json({ message: `Weather proxy error: ${msg}` });
  }
});

export default router;
