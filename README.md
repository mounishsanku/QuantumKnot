# TriggrPay ⚡🛡️
### AI-Powered Parametric Income Insurance for India's Gig Delivery Workers
> *"Your disruption is our trigger. Your payout is automatic."*
> **Guidewire DEVTrails 2026** | Team: QuantumKnot

[![Phase](https://img.shields.io/badge/Phase-2%20Scale-blue)](https://github.com/mounishsanku/QuantumKnot)
[![Status](https://img.shields.io/badge/Status-Building-orange)](https://github.com/mounishsanku/QuantumKnot)
[![Live](https://img.shields.io/badge/Prototype-Live-brightgreen)](https://triggrpay-quantum-knot.base44.app)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 🎯 Problem

India's **10M+ gig delivery workers** lose 20–30% of weekly income when disruptions hit — rain, heat waves, AQI alerts, curfews. No warning. No protection. No safety net. Traditional insurance doesn't work for them — wrong pricing cycle, wrong claim process, wrong product entirely.

> *Arjun, a Zypp EV rider in Hyderabad, loses ₹3,200 in a week when 44°C heat drops his battery range below viable threshold. He files nothing. Nobody pays him back.*

**Traditional insurance fails gig workers because:**
- Claim process takes 30–90 days — they need money today
- Monthly pricing doesn't match weekly gig pay cycles
- No product exists for EV-specific income disruptions
- Zero coverage for platform algorithmic throttling

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
| **Festival Income Guard** | ₹19/week (festival months) | AI-predicted festival disruptions — Diwali, Eid, Holi — 1.5x payout |
| **Device Shield** | ₹15/week | Income loss from verified phone failure (UPI-linked repair proof) |

---

## ⚡ Parametric Triggers

| # | Trigger | Source | Threshold | Coverage |
|---|---------|--------|-----------|----------|
| T1 | Heavy Rainfall | OpenWeatherMap | >20mm/hr | Standard + EV |
| T2 | Flood Alert | NDMA API | Red Alert | Standard + EV |
| T3 | AQI Emergency | SAFAR/CPCB | AQI >300 | Standard + EV |
| T4 | Government Curfew | NewsAPI | Geo-tagged order | Standard + EV |
| T5 | Zone Closure | Mock Platform API | Active zone closed | Standard + EV |
| T6 | Extreme Heat ⚡ | IMD/OpenWeatherMap | Temp >42°C | EV only |
| T7 | Grid Outage ⚡ | DISCOM API (mock) | Outage >2hrs | EV only |
| T8 | Charging Congestion ⚡ | EV Station API (mock) | >85% occupancy | EV only |
| T9 | Night Disruption 🌙 | NewsAPI + GPS | Late-night zone event | Night add-on |
| T10 | Order Drought | Platform API (mock) | 0 orders, 3+ hrs, clear weather | All riders |

---

## 🧠 How It Works

```
Rider registers + selects plan
         ↓
AI calculates personalised weekly premium
         ↓
node-cron polls APIs every 5 minutes
         ↓
Disruption threshold breached
         ↓
GPS zone validated → Fraud scored
         ↓
Claim auto-created in MongoDB
         ↓
Razorpay sandbox payout initiated
         ↓
₹ in rider's UPI in under 15 minutes
         ↓
Socket.io real-time notification sent
```

---

## 🤖 AI/ML Features

### Dynamic Premium (XGBoost)
Personalises ₹49/₹79 base rate using zone disruption history, season, rider tenure, EV battery age, charging station density, and working hours. Every rider gets a different premium with an explainable breakdown.

### EarningsSync — India First
With rider consent, connects to UPI transaction history (NPCI) to calculate verified 90-day average earnings. Premium AND payout based on **real income** — not self-reported. Eliminates moral hazard entirely.

### GeoShift Repricing
When GPS detects consistent activity in a new city for 7 days, AI auto-detects migration and reprices premium for new city's risk profile. Zero manual update needed.

### Festival Predictor
7 days before major festivals, AI predicts disruption probability using historical traffic data and police bandobast announcements. Proactively offers Festival Income Guard to riders.

### Order Drought Detection
If rider is logged in, GPS shows active zone, weather is clear, but receives 0 orders for 3+ hours — platform throttling detected via cross-validation with 5+ riders in same zone. Pays ₹200 flat.

---

## 🛡️ Adversarial Defense & Anti-Spoofing Strategy
### Market Crash Response: Operation Fraud Ring Takedown

A coordinated fraud ring of 500+ delivery workers organized via Telegram exploited parametric triggers by GPS spoofing — faking disruption zone presence while safely at home — draining the liquidity pool. Here is how TriggrPay defends against this.

### Layer 1 — GPS Authenticity Verification
Movement variance + cell tower triangulation + platform order cross-check. A spoofed GPS shows 0 km/h with zero micro-movement variance. A genuinely stranded rider shows natural movements. Cell tower must match GPS within 200m. Active deliveries during claimed disruption window = auto-reject.

**Decision:** Contradiction detected → fraud score +60 → hold for review

### Layer 2 — Fraud Ring Pattern Detection
Velocity check (>15 claims/60sec/2km²) activates ring flag. Device fingerprinting — clustered metadata = batch flagged. Social graph analysis — shared referral codes, UPI IFSCs, accounts created within 48 hours. Historical baseline — 200 claims vs normal 8 in same zone = manual review gate.

**Decision:** Ring probability >75 → cluster frozen → payouts held 24 hours

### Layer 3 — Genuine Stranded Worker Protection
- **Trusted Rider badge** (6+ months clean) → auto-approve even during high-velocity events
- **50% provisional payout immediately** for new riders during genuine Red Alert events
- **Video appeal** → AI vision validates disruption environment
- Riders 3+ months in system → 24hr hold maximum, never permanent denial

### Layer 4 — Real-Time Fraud Score Engine

| Signal | Weight | Fraud Indicator |
|--------|--------|----------------|
| GPS vs platform activity | 25% | Mismatch = high fraud |
| Claim velocity in zone | 20% | Spike = high fraud |
| Rider tenure & history | 20% | New account = higher risk |
| Device fingerprint cluster | 15% | Shared device = high fraud |
| Cell tower vs GPS | 10% | Mismatch = high fraud |
| EV charging cross-ref | 10% | Active charge = fraud flag |

| Score | Action |
|-------|--------|
| 0–40 | Auto-approve, full payout |
| 41–69 | Approve with monitoring flag |
| 70–84 | Provisional 50% payout, 24hr review |
| 85–100 | Hold, manual investigation |

**Key insight: Fraudsters act in clusters. Genuine workers act alone.**

---

## 💼 Business Economics

**Why TriggrPay is profitable:**
- Cost per claim: **<₹1** (API calls only) vs ₹1,000–1,600 for traditional insurers
- Target loss ratio: **55–65%** (industry average: 85–95%)
- Net margin: **₹13/week** per Standard rider | **₹17/week** per EV rider
- Catastrophic risk hedged via **reinsurance** (10% of premiums)

**Unit economics:**
```
Standard Shield rider:
Premium: ₹49 | Payout cost: ₹28 | Margin: ₹13/week ✅

EV Shield rider:
Premium: ₹79 | Payout cost: ₹42 | Margin: ₹17/week ✅

At 1,00,000 riders → ₹13,00,000/week profit
```

**Proven global model:** Pula ($70M, 15M farmers) · Arbol (30+ countries) · FloodFlash (200% YoY) · IFFCO-Tokio (India, govt-backed)

---

## 🚀 Go-To-Market

**Phase 1 — EV Fleet Partnerships:** Zypp Electric + Euler Motors (50,000+ EV riders). We are their welfare layer, not a competitor.

**Phase 2 — Rider Unions:** IFAT (200,000+ gig workers). One deal = instant captive distribution.

**Phase 3 — IRDAI Regulatory Sandbox (2019):** Operate as parametric protection product with licensed insurer as underwriter. Exact model used by Acko and Digit at launch.

**White-label path:** "Powered by TriggrPay" on Zomato's app = zero distribution cost.

---

## 🏗️ Tech Stack (MERN)

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Tailwind CSS, shadcn/ui, Zustand, Recharts, Leaflet.js, React Hook Form + Zod, Axios |
| **Backend** | Node.js 20, Express.js, Mongoose, JWT, bcryptjs, node-cron, Socket.io, Winston, cors, express-validator |
| **Database** | MongoDB Atlas — geospatial indexes for GPS zones, aggregation for loss ratio analytics |
| **ML Service** | Python Flask (port 5001) — XGBoost (premium) + Isolation Forest (fraud) called by Node.js via HTTP |
| **Integrations** | OpenWeatherMap · SAFAR AQI · NewsAPI · Razorpay sandbox · Firebase Auth · Google Maps |
| **Hosting** | Vercel (React) · Render (Node.js + Flask) · MongoDB Atlas M0 |

---

## 🔑 Environment Variables

```bash
# Server
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_here

# External APIs
OPENWEATHERMAP_API_KEY=your_key_here
NEWS_API_KEY=your_key_here

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret_here

# ML Service
ML_SERVICE_URL=http://localhost:5001

# Client
VITE_API_URL=http://localhost:5000
VITE_OPENWEATHERMAP_KEY=your_key_here
```

---

## 🧪 Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/mounishsanku/QuantumKnot.git
cd QuantumKnot
```

### 2. Install dependencies
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install

# ML Service
cd ../ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Add your API keys to .env
```

### 4. Run all services
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev

# Terminal 3 — ML Service
cd ml-service && python app.py
```

---

## 📁 Project Structure

```
TriggrPay/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── pages/             # Login, Register, Dashboard, Claims
│       ├── components/        # PolicyCard, ClaimCard, PremiumCalculator
│       ├── store/             # Zustand state management
│       └── utils/             # Axios API config
│
├── server/                    # Node.js + Express API
│   ├── models/                # Rider, Policy, Claim, Payout schemas
│   ├── routes/                # auth, policies, claims
│   ├── services/              # triggerEngine, premiumService, 
│   │                          # payoutService, fraudService
│   ├── jobs/                  # node-cron trigger monitor (every 5 mins)
│   ├── middleware/            # JWT auth middleware
│   └── index.js               # Express entry point
│
├── ml-service/                # Python Flask microservice
│   ├── app.py                 # Flask API (port 5001)
│   ├── train.py               # XGBoost + Isolation Forest training
│   └── requirements.txt
│
├── .env.example
└── README.md
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|---------|-----|
| Frontend | Vercel | *(Phase 2 deployment)* |
| Backend | Render | *(Phase 2 deployment)* |
| ML Service | Render | *(Phase 2 deployment)* |
| Database | MongoDB Atlas M0 | Cloud hosted |
| Prototype | Base44 | [triggrpay-quantum-knot.base44.app](https://triggrpay-quantum-knot.base44.app) |

---

## 🗓️ Roadmap

### Phase 1 ✅ — Seed (March 4–20) — 4 Star ⭐⭐⭐⭐
- [x] Architecture & README documentation
- [x] Adversarial Defense & Anti-Spoofing Strategy
- [x] Live Base44 prototype (7 pages)
- [x] 10 parametric trigger simulation
- [x] 2-minute demo video

### Phase 2 🔄 — Scale (March 21–April 4)
- [x] MongoDB Atlas + all Mongoose schemas
- [x] Express REST API — registration + auth
- [x] Insurance policy management
- [x] Dynamic XGBoost premium calculation
- [x] 5 live parametric triggers (OpenWeatherMap)
- [x] Claims management module
- [x] Razorpay sandbox UPI payout
- [x] EarningsSync MVP
- [x] Socket.io real-time notifications
- [x] 2-minute demo video

### Phase 3 — Soar (April 5–17)
- [x] Full Isolation Forest fraud detection
- [x] GPS spoofing detection
- [x] Worker + Admin dashboards with Recharts
- [x] Festival Predictor live model
- [x] GeoShift auto-repricing
- [x] Final 5-minute demo video + pitch deck

---

## 🌍 Why Hyderabad

Real data. Real disruptions. 42–45°C summers for EV heat triggers. GHMC flood-prone zones for rainfall triggers. Zypp Electric actively operates here. TSPCB AQI data freely available.

---

## 📊 Impact

TriggrPay aims to:
- Protect 10M+ gig workers from sudden income loss
- Eliminate manual insurance claim process entirely
- Create India's first verified gig worker income profile
- Enable scalable data-driven parametric insurance

---

## 👥 Team

**QuantumKnot** | Guidewire DEVTrails 2026

---

## 📎 Links

- 🎥 Demo Video: *(add YouTube link)*
- 🌐 Live app: [triggrpay-quantum-knot](https://youtu.be/0MRvHf7ilm8)
- 📄 Pitch Deck: *(Phase 3)*

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

*TriggrPay — because the disruption triggers the pay. Built with ❤️ for India's gig economy workers.*
