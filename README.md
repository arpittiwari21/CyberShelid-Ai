# CyberShield AI - Intelligent Cybersecurity & Fraud Detection System

> **Detect • Explain • Protect**  
> *Smarter Detection. Safer Tomorrow.*  
> Project specification based on `Final_Project.pdf` (MCA, Skill Drona / KIET Deemed to be University).

---

## 🛡️ Project Overview

**CyberShield AI** is an intelligent, full-stack cybersecurity and fraud detection platform engineered to protect everyday users—students, online shoppers, digital payment users, and small businesses—from deceptive URLs, phishing sites, and financial fraud messages.

### Key Capabilities
1. **Threat Scanner**: Input suspicious URLs or SMS/message text for automated rule-based analysis.
2. **Detection Engine**:
   - URL structure examination (IP host, unusual TLDs like `.xyz`/`.top`, embedded `@` redirects, domain entropy, brand typosquatting, path keywords).
   - Message & SMS scam heuristics (coercive urgency, artificial deadlines, OTP/PIN/CVV credential harvesting, institution impersonation).
   - Embedded link extraction with recursive URL security analysis.
3. **Calibrated Risk Assessment**: Categorizes threats as **Low**, **Medium**, or **High** risk with a numerical 0-100 score.
4. **Transparent Explainability UI**: Surfaces precise rule triggers, category classifications, and non-technical explanations.
5. **Practical Safety Recommendations**: Real-world actionable precautions (e.g., *"Do not share your OTP"*, *"Verify through official banking portal"*).
6. **Safety Dashboard**: Interactive guidance modules for **Students**, **Online Shoppers**, **Digital Payment Users**, **Small Businesses**, and **General Users**, plus a 5-point Threat Self-Check tool.
7. **Scan History**: Review past scans, search and filter by risk level or type, inspect deep findings, and delete records (single delete or clear all).
8. **Privacy by Design**: Input sanitization, credential masking, zero password retention, and no sensitive data collection.

---

## 🏗️ Architecture & Tech Stack

```
d:\cybershelid\
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── detectors/
│   │   │   ├── url_detector.py        # URL heuristics & domain checks
│   │   │   ├── message_detector.py    # Urgency & credential harvesting
│   │   │   └── scoring.py             # Score calculation & recommendations
│   │   ├── routers/
│   │   │   ├── scan.py                # POST /api/scan, GET /api/stats
│   │   │   ├── history.py             # GET /api/history, DELETE /api/history/{id}
│   │   │   └── guidance.py            # GET /api/guidance
│   │   ├── database.py                # SQLite engine & session setup
│   │   ├── models.py                  # SQLAlchemy & Pydantic schemas
│   │   └── main.py                    # FastAPI application & CORS
│   ├── test_backend.py                # Automated backend test suite
│   ├── cybershield.db                 # SQLite database
│   └── requirements.txt
├── frontend/                 # React + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Top navigation & system status
│   │   │   ├── ScannerCard.jsx        # Dual-mode input & demo presets
│   │   │   ├── RiskGauge.jsx          # Radial SVG risk score gauge
│   │   │   ├── ResultView.jsx         # Indicators breakdown & recommendations
│   │   │   ├── SafetyDashboard.jsx    # Persona playbooks & threat encyclopedia
│   │   │   ├── HistoryView.jsx        # Scan history viewer & deletion controls
│   │   │   ├── PrivacyModal.jsx       # Privacy pledge & ethics modal
│   │   │   └── Footer.jsx             # Academic attribution
│   │   ├── services/
│   │   │   └── api.js                 # API client
│   │   ├── App.jsx                    # Root application component
│   │   └── index.css                  # Tailwind styles & theme tokens
│   ├── vite.config.js                 # Tailwind v4 plugin & /api proxy
│   └── package.json
└── tasks.md                           # Mission Control tracking
```

---

## 🚀 Running the Project

### 1. Backend (FastAPI + SQLite)
```powershell
cd d:\cybershelid\backend
.\venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`

### 2. Frontend (React + Vite)
```powershell
cd d:\cybershelid\frontend
npm run dev
```
- Web Application: `http://127.0.0.1:5173` (Vite proxies all `/api/*` calls to the FastAPI backend)

---

## 🧪 Automated Testing
Run the comprehensive test suite verifying detection rules, scoring, and database persistence:
```powershell
cd d:\cybershelid\backend
.\venv\Scripts\python.exe test_backend.py
```

---

## 🔒 Privacy & Ethical Disclosure
- **Zero Credential Harvesting**: CyberShield AI never asks for or stores passwords, OTPs, PINs, CVVs, or bank numbers.
- **Data Minimization**: Content previews are sanitized and masked before persisting to the local SQLite database.
- **Advisory Scope**: The platform serves as an assistive security tool and does not guarantee 100% detection of zero-day exploits.
