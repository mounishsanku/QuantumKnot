# TriggrPay ⚡🛡️
### AI-Powered Parametric Income Insurance for India's Gig Delivery Workers
> *"Your disruption is our trigger. Your payout is automatic."*
> **Guidewire DEVTrails 2026** | Team: QuantumKnot

[![Phase](https://img.shields.io/badge/Phase-1%20Seed-yellow)](https://github.com/mounishsanku/QuantumKnot)
[![Status](https://img.shields.io/badge/Status-Active-green)](https://github.com/mounishsanku/QuantumKnot)
[![Live](https://img.shields.io/badge/Prototype-Live-brightgreen)](https://triggrpay-quantum-knot.base44.app)

---

## 🎯 Problem

India's **10M+ gig delivery workers** lose 20–30% of weekly income when disruptions hit — rain, heat waves, AQI alerts, curfews. No warning. No protection. No safety net. Traditional insurance doesn't work for them — wrong pricing cycle, wrong claim process, wrong product entirely.

> *Arjun, a Zypp EV rider in Hyderabad, loses ₹3,200 in a week when 44°C heat drops his battery range below viable threshold. He files nothing. Nobody pays him back.*

---

## 💡 Solution

**TriggrPay** is parametric income insurance where **the event is the claim.** When a disruption threshold is breached, our AI detects it, validates the rider's zone, scores fraud risk, and sends UPI payout — in under 15 minutes. Zero forms. Zero waiting.

---

## 🧩 Coverage Tiers

| | 🟢 Standard Shield | ⚡ EV Shield Premium |
|---|---|---|
| **Price** | ₹49/week | ₹79/week |
| **For** | All delivery riders | EV riders only |
| **Covers** | Rain, floods, AQI, curfews, zone closures | Everything + extreme heat, grid outages, charging infra failure |
| **Max Payout** | ₹3,500/week | ₹4,500/week |

### 🔌 Add-On Shields
| Add-On | Price | Covers |
|---|---|---|
| **Night Surge Shield** | ₹29/week | Late-night curfews, nakabandi, crowd dispersal (10 PM–6 AM) with 1.4x payout multiplier |
| **Festival Income Guard** | ₹19/event week | AI-predicted festival disruptions — Diwali, Eid, Holi — 1.5x payout |
| **Device Shield** | ₹15/week | Income loss from verified phone failure (UPI-linked repair proof) |

---

## ⚡ Parametric Triggers

| # | Trigger | Source | Threshold |
|---|---------|--------|-----------|
| T1 | Heavy Rainfall | OpenWeatherMap | >20mm/hr |
| T2 | Flood Alert | NDMA API | Red Alert |
| T3 | AQI Emergency | SAFAR/CPCB | AQI >300 |
| T4 | Government Curfew | NewsAPI | Geo-tagged order |
| T5 | Zone Closure | Mock Platform API | Active zone closed |
| T6 | Extreme Heat ⚡ | IMD/OpenWeatherMap | Temp >42°C |
| T7 | Grid Outage ⚡ | DISCOM API (mock) | Outage >2hrs |
| T8 | Charging Congestion ⚡ | EV Station API (mock) | >85% occupancy |
| T9 | Night Disruption 🌙 | NewsAPI + GPS | Late-night zone event |
| T10 | Order Drought | Platform API (mock) | 0 orders, 3+ hrs, clear weather |

---

## 🤖 AI/ML Features

### Dynamic Premium (XGBoost)
Personalises ₹49/₹79 base rate using zone disruption history, season, rider tenure, EV battery age, charging station density, and working hours (night shift = different risk profile).

### EarningsSync — India First
With rider consent, connects to UPI transaction history (NPCI) to calculate verified 90-day average earnings. Premium AND payout based on **real income** — not self-reported. Eliminates moral hazard. Creates India's first verified gig worker income profile.

### GeoShift Repricing
When GPS detects consistent activity in a new city for 7 days, AI auto-detects migration and reprices premium for new city's risk profile. No manual update needed.

### Festival Predictor
7 days before major festivals, AI predicts disruption probability using historical traffic data, police bandobast announcements, and city-specific patterns. Proactively offers Festival Income Guard upgrade to riders.

### Order Drought Detection
If rider is logged in, GPS shows active zone, weather is clear, but receives 0 orders for 3+ hours — platform throttling detected via cross-validation with 5+ riders in same zone. Pays ₹200 flat.

---

## 🛡️ Fraud Defense (4-Layer)

**Layer 1 — GPS Authenticity:** Movement variance + cell tower triangulation + platform order cross-check. Spoofed GPS = zero micro-movement variance. Caught.

**Layer 2 — Ring Detection:** Velocity check (>15 claims/60sec/2km²) + device fingerprinting + social graph analysis (shared UPI IFSCs, referral codes, onboarding within 48hrs).

**Layer 3 — Worker Protection:** Trusted Rider badge (6+ months clean) = auto-approve. New riders get 50% provisional payout immediately during genuine Red Alerts. Video appeal available for any rejected claim.

**Layer 4 — Fraud Score Engine:**

| Signal | Weight |
|--------|--------|
| GPS vs platform activity | 25% |
| Claim velocity in zone | 20% |
| Rider tenure & history | 20% |
| Device fingerprint | 15% |
| Cell tower vs GPS | 10% |
| EV charging cross-ref | 10% |

Score 0–40 = auto-approve | 41–69 = monitor | 70–84 = 50% provisional | 85–100 = hold

---

## 💼 Business Economics

**Why TriggrPay is profitable:**
- Cost per claim: **<₹1** (API calls only) vs ₹1,000–1,600 for traditional insurers
- Target loss ratio: **55–65%** (industry average: 85–95%)
- Net margin: **₹13/week** per Standard rider | **₹17/week** per EV rider
- Catastrophic risk hedged via **reinsurance** (10% of premiums)

**Proven global model:** Pula ($70M, 15M farmers) · Arbol (30+ countries) · FloodFlash (200% YoY) · IFFCO-Tokio (India, govt-backed)

---

## 🚀 Go-To-Market

**Phase 1 — EV Fleet Partnerships:** Zypp Electric + Euler Motors (50,000+ EV riders). We are their welfare layer, not a competitor.

**Phase 2 — Rider Unions:** IFAT (200,000+ gig workers). One deal = instant captive distribution.

**Phase 3 — IRDAI Regulatory Sandbox (2019):** Operate as parametric protection product with licensed insurer as underwriter. Exact model used by Acko and Digit at launch.

**White-label path:** "Powered by TriggrPay" on Zomato's app = zero distribution cost.

---

## 🏗️ Tech Stack (MERN)

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18 + Vite, Tailwind CSS, shadcn/ui, Zustand, Recharts, Leaflet.js, React Hook Form + Zod |
| **Backend** | Node.js 20, Express.js, node-cron (trigger polling), Socket.io (real-time payouts), Winston (logging) |
| **Database** | MongoDB Atlas — geospatial indexes for GPS zones, aggregation for loss ratio analytics |
| **ML Service** | Python Flask microservice — XGBoost (premium) + Isolation Forest (fraud) called by Node.js |
| **Integrations** | OpenWeatherMap · SAFAR AQI · NewsAPI · Razorpay sandbox · Firebase Auth · Google Maps |
| **Hosting** | Vercel (React) · Render (Node.js + Flask) · MongoDB Atlas M0 |

---

## 🗓️ Roadmap

**Phase 1 ✅** — Architecture · README · Fraud defense · Live Base44 prototype · Trigger simulation · Video

**Phase 2** — MongoDB schemas · Express API · XGBoost premium model · 5 live triggers · Razorpay sandbox · EarningsSync MVP

**Phase 3** — Full fraud detection · GPS spoofing detection · Worker + Admin dashboards · Festival Predictor · GeoShift repricing · Final demo

---

## 📁 Structure

```
TriggrPay/
├── client/          # React + Vite frontend
├── server/          # Express + Node.js API
│   ├── models/      # Mongoose schemas
│   ├── services/    # triggerEngine, payoutService, fraudService
│   └── jobs/        # node-cron trigger monitor
├── ml-service/      # Python Flask — XGBoost + Isolation Forest
└── docs/            # Architecture diagrams
```

---

## 🌍 Why Hyderabad

Real data. Real disruptions. 42–45°C summers for EV heat triggers. GHMC flood zones for rainfall triggers. Zypp Electric operates here. TSPCB AQI data freely available.

---

## 📎 Links

- 🎥 Demo Video: *(add YouTube link)*
- 🌐 Live Prototype: [triggrpay-quantum-knot.base44.app](https://triggrpay-quantum-knot.base44.app)
- 📄 Pitch Deck: *(Phase 3)*

---

*TriggrPay — because the disruption triggers the pay. Built for India's gig economy workers. ❤️*
