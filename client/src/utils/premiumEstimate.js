export function estimateWeeklyPremium(rider, tier, addOns = []) {
  const isEv = tier === "ev" || rider?.vehicleType === "ev";
  let base = isEv ? 79 : 49;
  const breakdown = [
    {
      label: "Base premium",
      amount: base,
      reason: isEv ? "EV Shield weekly base" : "Standard Shield weekly base",
    },
  ];

  const city = rider?.city;
  if (city === "Mumbai") {
    breakdown.push({ label: "City adjustment", amount: 5, reason: "Mumbai flood risk" });
    base += 5;
  }
  if (city === "Hyderabad") {
    breakdown.push({ label: "City adjustment", amount: -3, reason: "Hyderabad lower flood risk" });
    base -= 3;
  }
  if (rider?.workingHours === "night") {
    breakdown.push({ label: "Night shift", amount: 3, reason: "Night shift exposure" });
    base += 3;
  }
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) {
    breakdown.push({
      label: "Season adjustment",
      amount: 7,
      reason: "Monsoon season (Jun–Sep)",
    });
    base += 7;
  }

  const addOnPrices = { night: 29, festival: 19, device: 15 };
  for (const a of addOns) {
    if (addOnPrices[a]) {
      breakdown.push({
        label: `Add-on: ${a}`,
        amount: addOnPrices[a],
        reason: "Selected add-on",
      });
      base += addOnPrices[a];
    }
  }

  const va = Math.round(4 * (rider?.vehicleType === "four-wheeler" ? 0.25 : rider?.vehicleType === "ev" ? 0 : 0.1));
  breakdown.push({
    label: "Vehicle adjustment",
    amount: va,
    reason: "Vehicle risk profile",
  });
  base += va;

  return { total: Math.max(0, Math.round(base)), breakdown };
}
