import axios from "axios";

/**
 * Air Quality Service — IQAir Integration
 * 
 * Logic:
 * 1. Fetch current AQI for city
 * 2. Uses default state/country context for the region
 */
export async function getAQI(city) {
  try {
    const API_KEY = process.env.IQAIR_API_KEY;
    if (!API_KEY) {
      console.log("[API] AQI fallback used (No API Key)");
      return null;
    }

    const state = "Andhra Pradesh";
    const country = "India";

    const url = `http://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&key=${API_KEY}`;
    
    const { data } = await axios.get(url, { timeout: 5000 });
    
    if (data?.status === "success") {
      const aqi = data.data.current.pollution.aqius;
      console.log("[API] AQI fetched");
      return aqi;
    }

    return null;
  } catch (error) {
    console.log("[API] AQI fallback used (Error)");
    return null;
  }
}
