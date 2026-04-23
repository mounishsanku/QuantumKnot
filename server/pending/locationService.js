import axios from "axios";

/**
 * Location Service — OpenStreetMap Nominatim (No API Key Required)
 * 
 * Logic:
 * 1. Reverse geocode GPS coordinates via Nominatim
 * 2. Compare detected city with user's registered city
 * 3. Return false if mismatch detected (fraud signal)
 * 4. Always fail safe — return true on any error
 */
export async function validateLocation(lat, lng, userCity) {
  try {
    // Fail safe if coordinates are missing
    if (!lat || !lng) {
      return true;
    }

    const res = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json",
        },
        headers: {
          "User-Agent": "triggrpay-app",
        },
        timeout: 5000,
      }
    );

    const address = res.data.address || {};

    const detectedCity =
      address.city ||
      address.town ||
      address.village ||
      address.state;

    if (!detectedCity) return true;

    const isMatch =
      detectedCity.toLowerCase() === userCity.toLowerCase();

    if (!isMatch) {
      console.log("[FRAUD] Location mismatch");
    }

    return isMatch;
  } catch (err) {
    console.log("[API] Location fallback used");
    return true;
  }
}
