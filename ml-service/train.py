import os
import random

import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

random.seed(42)
np.random.seed(42)

CITIES = ["Hyderabad", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Pune"]
VEHICLES = ["petrol", "ev", "four-wheeler"]
HOURS = ["morning", "afternoon", "night", "flexible"]


def city_risk(city: str) -> float:
    m = {
        "Mumbai": 0.95,
        "Delhi": 0.75,
        "Chennai": 0.7,
        "Bengaluru": 0.55,
        "Pune": 0.5,
        "Hyderabad": 0.35,
    }
    return m.get(city, 0.5)


def vehicle_risk(v: str) -> float:
    m = {"petrol": 0.55, "ev": 0.4, "four-wheeler": 0.65}
    return m.get(v, 0.5)


def hour_risk(h: str) -> float:
    m = {"morning": 0.35, "afternoon": 0.45, "night": 0.85, "flexible": 0.5}
    return m.get(h, 0.5)


def season_risk(month: int) -> float:
    if month in (6, 7, 8, 9):
        return 0.85
    if month in (3, 4, 5):
        return 0.55
    return 0.4


def zone_risk() -> float:
    return float(np.clip(np.random.normal(0.5, 0.15), 0.1, 0.95))


def synthetic_row():
    city = random.choice(CITIES)
    vehicle = random.choice(VEHICLES)
    hour = random.choice(HOURS)
    month = random.randint(1, 12)
    cr = city_risk(city)
    vr = vehicle_risk(vehicle)
    hr = hour_risk(hour)
    sr = season_risk(month)
    zr = zone_risk()
    noise = random.uniform(-2, 2)
    adjustment = (
        -10
        + 25 * cr
        + 12 * hr
        + 10 * sr
        + 8 * vr
        + 6 * zr
        + noise
    )
    adjustment = float(np.clip(adjustment, -10, 20))
    return [cr, vr, hr, sr, zr], adjustment


def main():
    n = 1000
    X = []
    y = []
    for _ in range(n):
        feats, adj = synthetic_row()
        X.append(feats)
        y.append(adj)

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.float32)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = XGBRegressor(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=42,
    )
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    print(f"Model R^2 on holdout: {score:.4f}")

    out_path = os.path.join(os.path.dirname(__file__), "premium_model.pkl")
    joblib.dump(model, out_path)
    print(f"Saved model to {out_path}")


if __name__ == "__main__":
    main()
