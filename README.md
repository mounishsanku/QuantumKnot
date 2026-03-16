# QuantumKnot ⚡🛡️
### AI-Powered Parametric Income Insurance for India's Gig Delivery Workers
> Built for **Guidewire DEVTrails 2026** | Team: QuantumKnot

[![Phase](https://img.shields.io/badge/Phase-1%20Seed-yellow)](https://github.com/mounishsanku/QuantumKnot)
[![Status](https://img.shields.io/badge/Status-Active-green)](https://github.com/mounishsanku/QuantumKnot)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 🎯 The Problem We're Solving

India has **10+ million platform-based delivery workers** riding for Zomato, Swiggy, Zepto, Blinkit, Amazon, and Flipkart. When external disruptions hit — extreme rain, heat waves, AQI emergencies, sudden curfews — these workers simply stop earning. No warning. No protection. No safety net.

> *"Arjun rides an EV for Zepto in Hyderabad. In May, when temperatures hit 44°C, his bike's battery range drops from 80km to 55km — not enough to complete his shift. He loses ₹800 that day. Then the next day too. By week's end, he's lost ₹3,200 with zero recourse."*

**QuantumKnot changes this.** We automatically detect the disruption, calculate the income loss, and pay Arjun before he even thinks of filing a claim.

---

## 🧩 Our Solution: Two-Tier Parametric Insurance

QuantumKnot is a **web-based AI-powered parametric insurance platform** that covers ALL delivery partners — not just one segment. We offer two tiers to serve the broadest possible market while innovating at the premium layer.

```
QuantumKnot Platform
│
├── 🟢 Standard Shield (₹49/week)
│   → For ALL delivery riders: Food, Grocery, E-commerce
│   → Covers: Heavy rain, floods, AQI alerts, curfews, zone closures
│   → Auto-payout when triggers breach defined thresholds
│
└── ⚡ EV Shield Premium (₹79/week)
    → Exclusively for EV-powered delivery riders (Zypp, Rapido EV, own EVs)
    → Covers everything in Standard PLUS:
       → Extreme heat (battery range degradation threshold)
       → Power grid outages (charging infra down)
       → EV-specific microzone disruptions
    → Higher payout multiplier due to compounded disruption risk
```

---

## 👥 Personas & Scenarios

### Persona 1 — Ravi | Food Delivery | Zomato | Hyderabad (Standard Shield)

| Attribute | Detail |
|-----------|--------|
| Age | 28 |
| Vehicle | Petrol two-wheeler |
| Daily earnings | ₹700–900 |
| Weekly premium | ₹49 |
| Coverage | ₹3,500/week income protection |
| Pain point | Loses 3–4 working days during Hyderabad monsoon flooding |

**Trigger Scenario:** IMD issues a Red Alert for Hyderabad. Rainfall exceeds 35mm/hr. QuantumKnot detects the trigger, cross-checks Ravi's last active GPS zone, calculates 6 lost hours × ₹90/hr = **₹540 auto-paid to his UPI** within 15 minutes. Zero claim needed.

---

### Persona 2 — Meena | Grocery Delivery | Zepto | Bengaluru (Standard Shield)

| Attribute | Detail |
|-----------|--------|
| Age | 32 |
| Vehicle | Petrol scooter |
| Daily earnings | ₹600–800 |
| Weekly premium | ₹49 |
| Coverage | ₹3,000/week income protection |
| Pain point | AQI-related advisories and bandhs in Bengaluru shut her zone |

**Trigger Scenario:** BBMP announces sudden micro-zone shutdown in Koramangala due to civic unrest. QuantumKnot detects zone closure via geofencing + news API, validates Meena was scheduled to work that zone, and auto-triggers a proportional payout.

---

### Persona 3 — Arjun | Q-Commerce Delivery | Blinkit | Hyderabad (EV Shield ⚡)

| Attribute | Detail |
|-----------|--------|
| Age | 24 |
| Vehicle | Zypp Electric scooter |
| Daily earnings | ₹750–950 |
| Weekly premium | ₹79 |
| Coverage | ₹4,500/week income protection |
| Pain point | Summer heat degrades EV range + charging stations go offline |

**Trigger Scenario:** Temperature hits 43°C in Hyderabad. EV range model predicts battery operates at 65% capacity. Charging station API shows 2 of 3 nearby stations at >90% occupancy. Combined disruption score crosses threshold — **EV Shield triggers automatically, Arjun receives ₹720 payout.** He never filed anything.

---

## 💰 Weekly Premium Model

We deliberately chose **weekly pricing** because delivery workers are paid weekly by platforms. Insurance must match their cash flow cycle.

### Standard Shield — ₹49/week
| Payout Tier | Disruption Duration | Weekly Payout |
|-------------|--------------------|--------------:|
| Partial | 2–4 hours lost | ₹350 |
| Major | 4–8 hours lost | ₹700 |
| Full Day | Full day lost | ₹1,100 |
| Multi-Day | 2+ days lost | Up to ₹3,500 |

### EV Shield Premium — ₹79/week
| Payout Tier | Disruption Type | Weekly Payout |
|-------------|----------------|--------------|
| Heat Partial | Range drop >25% | ₹400 |
| Grid Outage | Charging down >4hrs | ₹600 |
| Compound Event | Heat + Grid + Rain | Up to ₹4,500 |

### AI-Driven Dynamic Pricing Factors
The ₹49 and ₹79 are **base rates**. Our ML model adjusts the weekly premium up/down based on:
- Historical disruption frequency in the rider's operating zone
- Season (monsoon = higher risk adjustment)
- Rider tenure on platform (proxy for earnings stability)
- EV battery age & model (for EV Shield only)
- Charging station density in operating radius (for EV Shield only)

---

## ⚡ Parametric Triggers

Parametric insurance pays automatically when a measurable external parameter crosses a threshold. No human adjuster. No claim form. Just data → decision → payment.

### Standard Shield Triggers

| # | Trigger | Data Source | Threshold | Payout Initiated |
|---|---------|-------------|-----------|-----------------|
| T1 | Heavy Rainfall | IMD / OpenWeatherMap API | > 20mm/hr | Proportional to hours lost |
| T2 | Severe Flood Alert | NDMA / State Disaster API | Red Alert issued | Full day payout |
| T3 | AQI Emergency | SAFAR / CPCB API | AQI > 300 (Hazardous) | Partial to full |
| T4 | Government Curfew | NewsAPI / mock | Geo-tagged curfew order | Full day payout |
| T5 | Zone/Market Closure | Mock platform API | Rider's active zone closed | Proportional payout |

### EV Shield Additional Triggers

| # | Trigger | Data Source | Threshold | Payout Initiated |
|---|---------|-------------|-----------|-----------------|
| T6 | Extreme Heat | IMD / OpenWeatherMap | Temp > 42°C | Range-loss payout |
| T7 | Power Grid Outage | State DISCOM API (mock) | Outage > 2hrs in zone | Grid-loss payout |
| T8 | Charging Infra Congestion | EV station API (mock) | >85% occupancy nearby | Compound payout |

---

## 🤖 AI/ML Architecture

### 1. Dynamic Premium Calculation (Pre-Policy)
**Model:** Gradient Boosted Trees (XGBoost)  
**Features:**
- Zone-level historical disruption frequency (last 12 months)
- Seasonal risk multiplier (monsoon, summer heatwave months)
- Platform delivery density in zone (proxy for income potential)
- EV-specific: battery health model, charging station density radius
- Rider's registered operating hours (morning vs night shift risk profile)

**Output:** Personalized weekly premium with explainable adjustment breakdown shown to rider at signup.

### 2. Claim Trigger Validation (Real-Time)
**Model:** Rule-based engine + anomaly scoring  
**Process:**
1. External API fires a potential trigger event
2. Rules engine checks if threshold is breached
3. Cross-validation: Is the rider's last known GPS zone affected?
4. If yes → claim auto-initiated, payout calculated, sent to payment gateway

### 3. Fraud Detection (Anomaly Detection)
**Model:** Isolation Forest + Rule-based flags  
**Detection patterns:**
- Rider claims disruption but GPS shows active movement during event window → **flag**
- EV rider claims heat-battery trigger but temperature data shows 32°C, not 42°C → **flag**
- Multiple riders in the same zone all file within seconds (coordinated fraud ring) → **flag**
- Rider's platform order data (mocked) shows active deliveries during claimed outage → **flag**
- Same rider claims EV outage while 3 nearby charging stations show normal uptime → **flag**

**Output:** Fraud Score 0–100. Score > 70 → hold for manual review. Score < 70 → auto-approve.

---

## 🏗️ Tech Stack

### Frontend
| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | React + Next.js | SSR for fast load on mobile networks |
| UI Library | Tailwind CSS + shadcn/ui | Rapid, accessible UI |
| State Management | Zustand | Lightweight, sufficient for scope |
| Maps/Geo | Leaflet.js | Zone visualization, free tier |

### Backend
| Layer | Technology | Reason |
|-------|-----------|--------|
| API Server | FastAPI (Python) | ML-native, fast async |
| Auth | JWT + OTP via Firebase | Gig worker-friendly onboarding |
| Database | PostgreSQL (Supabase) | Relational + real-time subscriptions |
| Queue | Redis | Trigger event processing pipeline |

### AI/ML
| Component | Technology |
|-----------|-----------|
| Premium Model | XGBoost (scikit-learn) |
| Fraud Detection | Isolation Forest (scikit-learn) |
| Trigger Engine | Python rule-based + API polling |
| Model Serving | FastAPI ML endpoints |

### Integrations
| Integration | API / Tool | Tier |
|------------|-----------|------|
| Weather | OpenWeatherMap API | Free tier |
| AQI | SAFAR CPCB API | Free tier |
| News/Curfew | NewsAPI | Free tier |
| Platform Data | Mock/Simulated | Simulated |
| EV Charging | PlugShare API / Mock | Mock |
| Power Grid | DISCOM API | Mock |
| Payments | Razorpay Test Mode | Sandbox |

### Hosting
| Service | Platform |
|---------|---------|
| Frontend | Vercel (free tier) |
| Backend | Railway / Render (free tier) |
| DB | Supabase (free tier) |
| ML Models | Hugging Face Spaces / Railway |

---

## 🗓️ Development Plan

### Phase 1 (Seed) — March 4–20: Ideation & Foundation ✅
- [x] Repository setup
- [x] README and core documentation
- [ ] UI wireframes and component scaffolding
- [ ] Basic onboarding flow (web)
- [ ] Mock API integrations for weather and AQI
- [ ] 2-minute prototype video

### Phase 2 (Scale) — March 21 – April 4: Automation & Protection
- [ ] Registration and profile flow (complete)
- [ ] Policy creation with dynamic weekly premium calculation
- [ ] 5 parametric trigger automations (live API + mock)
- [ ] Claims management module
- [ ] EV Shield tier implementation
- [ ] Basic ML premium model (trained on synthetic data)

### Phase 3 (Soar) — April 5–17: Scale & Optimise
- [ ] Full fraud detection module (Isolation Forest)
- [ ] Razorpay sandbox payout integration
- [ ] Worker dashboard (earnings protected, active coverage)
- [ ] Admin/Insurer dashboard (loss ratios, predictive analytics)
- [ ] GPS spoofing detection
- [ ] Historical weather-based fraud validation
- [ ] Final demo video + pitch deck

---

## 📁 Repository Structure (Planned)

```
QuantumKnot/
├── frontend/               # Next.js React app
│   ├── components/         # UI components
│   ├── pages/              # App routes
│   └── styles/             # Tailwind config
├── backend/                # FastAPI server
│   ├── api/                # Route handlers
│   ├── models/             # DB models
│   ├── services/           # Trigger engine, payment service
│   └── ml/                 # ML model training + inference
├── data/                   # Synthetic training data
├── docs/                   # Architecture diagrams, wireframes
└── README.md
```

---

## 🌍 Why Hyderabad? (Hyperlocal Relevance)

- **Extreme Summers:** Temperatures regularly hit 42–45°C in April–May — ideal for validating EV heat triggers with real IMD data
- **Monsoon Flooding:** GHMC flood-prone zones provide real disruption geography for weather triggers
- **EV Ecosystem:** Zypp Electric actively operates in Hyderabad — real persona, real disruption data
- **AQI Data:** TSPCB provides city-level AQI data freely — feeds our pollution trigger model

---

## 📊 Business Viability

| Metric | Estimate |
|--------|---------|
| Total addressable market | 10M+ gig delivery workers in India |
| EV delivery segment growth | 40% YoY (2024–2026) |
| Average weekly premium | ₹49–79 |
| Break-even loss ratio target | <65% |
| Distribution channel | Direct through delivery platform SDKs |

**Why this works financially:**
- Parametric model eliminates loss adjustment costs (no adjusters, no paperwork)
- Weekly churn is lower than monthly (aligns with pay cycle)
- EV tier commands premium pricing with better fraud detectability (verifiable sensor data)

---

## 👨‍💻 Team

**QuantumKnot** | Guidewire DEVTrails 2026

---

## 📎 Links

- 🎥 Demo Video: *(to be added by March 20)*
- 🌐 Live App: *(to be added in Phase 2)*
- 📄 Pitch Deck: *(to be added in Phase 3)*

---

*Built with ❤️ for India's gig economy workers. QuantumKnot — because every rupee earned deserves protection.*
