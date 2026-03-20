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

## 🌐 Live Prototype

> **[quantum-knot-shield.base44.app](https://quantum-knot-shield.base44.app)**

The Phase 1 prototype demonstrates:
- Rider onboarding with policy selection
- Standard Shield (₹49/week) vs EV Shield (₹79/week) tier selection
- Live weather trigger simulation
- Automated ₹540 UPI payout demo — zero claim filed

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

**Trigger Scenario:** IMD issues a Red Alert for Hyderabad. Rainfall exceeds 35mm/hr. QuantumKnot detects the trigger, cross-checks Ravi's last active GPS zone, calculates 6 lost hours × ₹90/hr = **₹540 auto-paid to his UPI within 15 minutes.** Zero claim needed.

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
|-------------|----------------|-------------:|
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

Parametric insurance pays automatically when a measurable external parameter crosses a threshold. No human adjuster. No claim form. Just **data → decision → payment.**

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
| Frontend Prototype | Base44 (quantum-knot-shield.base44.app) |
| Frontend (Phase 2+) | Vercel (free tier) |
| Backend | Railway / Render (free tier) |
| DB | Supabase (free tier) |
| ML Models | Hugging Face Spaces / Railway |

---

## 🗓️ Development Plan

### Phase 1 (Seed) — March 4–20: Ideation & Foundation ✅
- [x] Repository setup
- [x] README and core documentation
- [x] Adversarial defense & anti-spoofing strategy (Market Crash response)
- [x] Live prototype deployed on Base44
- [x] Onboarding flow with policy selection (Standard Shield vs EV Shield)
- [x] Auto-payout trigger simulation demo
- [x] 2-minute demo video

### Phase 2 (Scale) — March 21 – April 4: Automation & Protection
- [ ] Registration and profile flow (complete)
- [ ] Policy creation with dynamic weekly premium calculation
- [ ] 5 parametric trigger automations (live API + mock)
- [ ] Claims management module
- [ ] EV Shield tier full implementation
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

## 🛡️ Adversarial Defense & Anti-Spoofing Strategy
### Market Crash Response: Operation Fraud Ring Takedown

---

### The Attack We're Defending Against

A coordinated fraud ring is exploiting parametric triggers by:
- **GPS Spoofing** — faking location to appear in a disrupted zone while actually working normally elsewhere
- **Synthetic Disruption Claims** — filing claims during real weather events but from unaffected zones
- **Ring Coordination** — 500+ riders filing identical claims within seconds of each other
- **Ghost Riders** — fake accounts created purely to collect payouts during disruption events

---

### Our 4-Layer Defense Architecture

#### Layer 1 — GPS Authenticity Verification
**Problem:** Rider claims to be in flood-affected Zone A but is actually in Zone C working normally.

**How we catch it:**
- Cross-reference claimed GPS location against **platform order history** — if the rider completed deliveries during the "disruption window," the claim is auto-rejected
- Compare GPS altitude + speed data patterns — a spoofed location shows 0 km/h with zero movement variance; a genuinely stranded rider shows micro-movements (shifting, walking to shelter)
- **Cell tower triangulation cross-check** — GPS coordinates must match the cell tower the rider's device is pinging within a 200m radius
- EV Shield specific: If rider claims heat-battery failure, check if charging station API shows the rider's registered vehicle attempting a charge during that window — a truly stranded rider won't show a charge attempt

**Decision:** GPS + platform activity + cell tower contradiction → fraud score +60 → hold for review

---

#### Layer 2 — Fraud Ring Pattern Detection
**Problem:** 500 riders submit identical claims within 90 seconds of a trigger event.

**How we catch it:**
- **Velocity check** — more than 15 claims from the same 2km² zone within 60 seconds activates ring-detection flag
- **Claim template fingerprinting** — if claim metadata (device model, submission time pattern, network IP range) shows statistical clustering, the entire batch is flagged
- **Social graph analysis** — flagged riders sharing referral codes, onboarding timestamps within 48 hours of each other, or identical UPI bank IFSCs spikes the ring probability score
- **Historical baseline comparison** — a zone that normally generates 8 claims per disruption event suddenly generating 200 triggers a manual review gate

**Decision:** Ring probability score > 75 → entire cluster frozen, individual reviews initiated, payouts held 24 hours

---

#### Layer 3 — Genuine Stranded Worker Protection
**The hardest problem:** How do we catch fraudsters without punishing honest workers?

**Our rules:**
- Riders with **6+ months of clean claim history** get a "Trusted Rider" badge — their claims auto-approve even if zone velocity is high
- First-time claims during genuinely catastrophic events (IMD Red Alert, NDMA flood declaration) get **automatic provisional payout of 50% immediately** — the remaining 50% releases after 24-hour verification. Honest rider gets money fast. Fraudster gets half and faces investigation.
- **Human appeal layer** — any auto-rejected claim can be appealed with a 30-second video of surroundings. Our AI vision model checks if the environment matches the claimed disruption (flooded street, visible rain, stationary vehicle)
- Riders in the system 3+ months with no prior flags are never fully blocked — worst case is a 24-hour hold, never permanent denial

---

#### Layer 4 — Real-Time Fraud Score Engine
Every claim generates a **Fraud Score (0–100)** computed from:

| Signal | Weight | Fraud Indicator |
|--------|--------|----------------|
| GPS vs platform activity match | 25% | Mismatch = high fraud |
| Claim velocity in zone | 20% | Spike = high fraud |
| Rider tenure & history | 20% | New account = higher risk |
| Device fingerprint cluster | 15% | Shared device = high fraud |
| Cell tower vs GPS match | 10% | Mismatch = high fraud |
| EV charging station cross-ref | 10% | Active charge = fraud flag |

**Score thresholds:**

| Score | Action |
|-------|--------|
| 0–40 | Auto-approve, full payout |
| 41–69 | Approve with monitoring flag |
| 70–84 | Provisional 50% payout, 24hr review |
| 85–100 | Hold all payout, manual investigation, rider notified |

---

### Why Our System Doesn't Punish Honest Workers

The key insight: **fraudsters act in clusters. Genuine workers act alone.**

A real stranded rider in Hyderabad during a flood:
- Location matches the flood zone ✅
- No platform deliveries during the event ✅
- Normal GPS movement variance — not perfectly stationary ✅
- NOT part of a 500-person simultaneous claim cluster ✅
- Prior clean history ✅

A fraud ring member:
- Perfect GPS coordinates — too perfect, zero variance ❌
- Platform activity shows they were actively working ❌
- Filed within seconds of 200 others from the same IP range ❌
- Created account within 48 hours of other ring members ❌

Our system scores the **combination** of signals — not any single one. A new rider during a genuine Red Alert still gets their 50% provisional payout. **We never leave a genuinely stranded worker empty-handed.**

---

## 👨‍💻 Team

**QuantumKnot** | Guidewire DEVTrails 2026

---

## 📎 Links

- 🎥 Demo Video: *(add YouTube link here)*
- 🌐 Live Prototype: [quantum-knot-shield.base44.app](https://quantum-knot-shield.base44.app)
- 📄 Pitch Deck: *(to be added in Phase 3)*

---

*Built with ❤️ for India's gig economy workers. QuantumKnot — because every rupee earned deserves protection.*
