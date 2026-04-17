import axios from "axios";

/**
 * Location Service — Google Maps Geocoding Integration
 * 
 * Logic:
 * 1. Validate if current GPS coordinates match the expected city
 * 2. Return false if mismatch detected
 */
export async function validateLocation(lat, lng, city) {
  try {
    // Fail safe if coordinates are missing
    if (!lat || !lng) {
      return true;
    }

    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!API_KEY) {
      console.log("[API] Location fallback used (No API Key)");
      return true; // Fail safe
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
    
    const { data } = await axios.get(url, { timeout: 5000 });

    if (data?.status === "OK") {
      // Find locality or city name in address components
      const components = data.results[0]?.address_components || [];
      const foundCity = components.find(c => 
        c.types.includes("locality") || 
        c.types.includes("administrative_area_level_2") ||
        c.types.includes("administrative_area_level_3")
      )?.long_name;

      if (foundCity && !foundCity.toLowerCase().includes(city.toLowerCase())) {
        console.log("[FRAUD] Location mismatch");
        return false;
      }
    }

    return true;
  } catch (error) {
    console.log("[API] Location fallback used (Error)");
    return true;
  }
}
