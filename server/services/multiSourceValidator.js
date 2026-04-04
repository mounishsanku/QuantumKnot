import logger from "../logger.js";

/**
 * Multi-source trigger validation.
 * Combines weather data, simulated traffic conditions, and simulated city alerts
 * to determine whether a trigger has sufficient confidence to proceed.
 *
 * Returns { valid, breakdown } where breakdown shows each source's verdict.
 * A trigger requires at least 2 of 3 sources confirming disruption.
 */
export function validateMultiSourceTrigger(triggerType, triggerValue, city) {
  // ── Source 1: Weather validation (real data thresholds) ──
  let weatherValid = false;
  const val = parseFloat(String(triggerValue)) || 0;

  switch (triggerType) {
    case "rainfall":
    case "flood":
      weatherValid = val > 15; // mm/hr
      break;
    case "heat":
      weatherValid = val > 40; // °C
      break;
    case "aqi":
      weatherValid = val > 200;
      break;
    case "strike":
      weatherValid = true; // no weather data for strikes; always pass
      break;
    default:
      weatherValid = val > 0;
  }

  // ── Source 2: Simulated traffic disruption ──
  // In production this would call Google Maps / HERE traffic API.
  // For demo: use deterministic mock based on city + trigger type.
  const trafficSeed = (city || "").length + triggerType.length;
  const trafficValid = trafficSeed % 3 !== 0; // ~67% pass rate, deterministic

  // ── Source 3: Simulated city alert feed ──
  // In production this would pull from government / municipal alert APIs.
  // For demo: high-risk cities always confirm, others use a stable mock.
  const highAlertCities = ["Mumbai", "Chennai", "Delhi"];
  const cityAlertValid = highAlertCities.includes(city) || city?.length % 2 === 0;

  // ── Confidence evaluation ──
  const sources = [
    { name: "weather",    valid: weatherValid },
    { name: "traffic",    valid: trafficValid },
    { name: "cityAlert",  valid: cityAlertValid },
  ];

  const confirmedCount = sources.filter((s) => s.valid).length;
  const valid = confirmedCount >= 2;

  const breakdown = sources.map(s => `${s.name}: ${s.valid ? "✓" : "✕"}`).join(" | ");

  if (valid) {
    logger.info(
      `[multiSource] PASS (${confirmedCount}/3) for ${triggerType} in ${city} — ${breakdown}`
    );
  } else {
    logger.warn(
      `[multiSource] REJECTED — low confidence (${confirmedCount}/3) for ${triggerType} in ${city} — ${breakdown}`
    );
  }

  return { valid, confirmedCount, breakdown, sources };
}
