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
router.get("/", async (req, res) => {
  try {
    const q = req.query.q || "Hyderabad,IN";
    logger.info(`[weather] Received request for: ${q}`);
    const key = process.env.OPENWEATHER_API_KEY;
    
    if (!key || key === "your_real_key") {
      return res.status(500).json({ message: "Weather API key not configured on server. Please set OPENWEATHER_API_KEY in .env" });
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

    // 3. Combine Response with safety defaults
    const response = {
      city: weatherData.name || "Unknown",
      temp: typeof weatherData.main?.temp === 'number' ? weatherData.main.temp : null,
      rain: (weatherData.rain && typeof weatherData.rain["1h"] === 'number') ? weatherData.rain["1h"] : 0,
      aqiLabel: aqi,
      coord: weatherData.coord,
      description: weatherData.weather?.[0]?.description || "No description",
      status: "success"
    };

    logger.info(`[weather] Successfully fetched for ${q}: ${response.temp}°C`);
    res.json(response);
  } catch (err) {
    const rawStatus = err.response?.status || 500;
    const msg = err.response?.data?.message || err.message;
    
    // CRITICAL: We map 401/403 from external API to 500
    // so we don't trigger the frontend's "Session expired" logout interceptor.
    const status = (rawStatus === 401 || rawStatus === 403) ? 500 : rawStatus;
    
    logger.error(`[weather] External API failed (${rawStatus}): ${msg}`);
    res.status(status).json({ message: `Weather service error: ${msg}` });
  }
});

export default router;
