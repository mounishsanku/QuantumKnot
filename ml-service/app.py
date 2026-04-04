import os
from datetime import datetime

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "premium_model.pkl")
_model = None


def load_model():
    global _model
    if _model is None and os.path.isfile(MODEL_PATH):
        _model = joblib.load(MODEL_PATH)
    return _model


def encode_city(city: str) -> float:
    m = {
        "Mumbai": 0.95,
        "Delhi": 0.75,
        "Chennai": 0.7,
        "Bengaluru": 0.55,
        "Pune": 0.5,
        "Hyderabad": 0.35,
    }
    return float(m.get(city, 0.5))


def encode_vehicle(vehicle_type: str) -> float:
    m = {"petrol": 0.55, "ev": 0.4, "four-wheeler": 0.65}
    return float(m.get(vehicle_type, 0.5))


def encode_hours(working_hours: str) -> float:
    m = {"morning": 0.35, "afternoon": 0.45, "night": 0.85, "flexible": 0.5}
    return float(m.get(working_hours, 0.5))


def season_risk_now() -> float:
    month = datetime.now().month
    if month in (6, 7, 8, 9):
        return 0.85
    if month in (3, 4, 5):
        return 0.55
    return 0.4


def zone_risk_from_earnings(daily_earnings: float) -> float:
    e = float(daily_earnings or 700)
    return float(np.clip((e - 300) / 1200.0, 0.1, 0.95))


def base_from_tier(tier: str, vehicle_type: str) -> int:
    if tier == "ev" or vehicle_type == "ev":
        return 79
    return 49


def rule_based_breakdown(payload):
    city = payload.get("city", "Hyderabad")
    vehicle_type = payload.get("vehicleType", "petrol")
    working_hours = payload.get("workingHours", "flexible")
    daily_earnings = float(payload.get("dailyEarnings") or 700)
    add_ons = payload.get("addOns") or []
    tier = payload.get("tier", "standard")

    base = base_from_tier(tier, vehicle_type)
    breakdown = [
        {
            "label": "Base premium",
            "amount": base,
            "reason": "EV Shield weekly base" if base == 79 else "Standard Shield weekly base",
        }
    ]
    total = base

    if city == "Mumbai":
        breakdown.append(
            {"label": "City adjustment", "amount": 5, "reason": "Mumbai flood risk"}
        )
        total += 5
    if city == "Hyderabad":
        breakdown.append(
            {
                "label": "City adjustment",
                "amount": -3,
                "reason": "Hyderabad lower flood risk",
            }
        )
        total -= 3
    if working_hours == "night":
        breakdown.append(
            {"label": "Night shift", "amount": 3, "reason": "Night shift exposure"}
        )
        total += 3

    month = datetime.now().month
    if month >= 6 and month <= 9:
        breakdown.append(
            {
                "label": "Season adjustment",
                "amount": 7,
                "reason": "Monsoon season (Jun–Sep)",
            }
        )
        total += 7

    add_on_prices = {"night": 29, "festival": 19, "device": 15}
    for a in add_ons:
        if a in add_on_prices:
            breakdown.append(
                {
                    "label": f"Add-on: {a}",
                    "amount": add_on_prices[a],
                    "reason": "Selected add-on",
                }
            )
            total += add_on_prices[a]

    zr = zone_risk_from_earnings(daily_earnings)
    va = int(round(4 * (encode_vehicle(vehicle_type) - 0.4)))
    breakdown.append(
        {
            "label": "Vehicle adjustment",
            "amount": va,
            "reason": "Vehicle risk profile",
        }
    )
    total += va

    return max(0, int(round(total))), breakdown


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "service": "TriggrPay ML"})


@app.route("/calculate-premium", methods=["POST"])
def calculate_premium():
    payload = request.get_json(silent=True) or {}
    city = payload.get("city", "Hyderabad")
    vehicle_type = payload.get("vehicleType", "petrol")
    working_hours = payload.get("workingHours", "flexible")
    daily_earnings = float(payload.get("dailyEarnings") or 700)
    add_ons = payload.get("addOns") or []
    tier = payload.get("tier", "standard")

    cr = encode_city(city)
    vr = encode_vehicle(vehicle_type)
    hr = encode_hours(working_hours)
    sr = season_risk_now()
    zr = zone_risk_from_earnings(daily_earnings)
    features = np.array([[cr, vr, hr, sr, zr]], dtype=np.float32)

    model = load_model()
    base_premium = base_from_tier(tier, vehicle_type)

    if model is not None:
        adjustment = float(model.predict(features)[0])
        adjustment = float(np.clip(adjustment, -10, 20))
        breakdown = [
            {
                "label": "Base premium",
                "amount": base_premium,
                "reason": "Tier base rate",
            },
            {
                "label": "ML risk adjustment",
                "amount": int(round(adjustment)),
                "reason": "XGBoost model from synthetic risk features",
            },
        ]
        add_on_prices = {"night": 29, "festival": 19, "device": 15}
        total = base_premium + int(round(adjustment))
        for a in add_ons:
            if a in add_on_prices:
                breakdown.append(
                    {
                        "label": f"Add-on: {a}",
                        "amount": add_on_prices[a],
                        "reason": "Selected add-on",
                    }
                )
                total += add_on_prices[a]
        if working_hours == "night" and "night" not in add_ons:
            breakdown.append(
                {
                    "label": "Night shift",
                    "amount": 3,
                    "reason": "Night shift exposure",
                }
            )
            total += 3
        adjusted = max(0, total)
        return jsonify(
            {
                "basePremium": base_premium,
                "adjustedPremium": adjusted,
                "breakdown": breakdown,
                "source": "ml",
            }
        )

    adjusted, breakdown = rule_based_breakdown(payload)
    return jsonify(
        {
            "basePremium": base_premium,
            "adjustedPremium": adjusted,
            "breakdown": breakdown,
            "source": "rule_based",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
