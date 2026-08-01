# 🌍 EcoVision AI

**Intelligent Garbage Pollution Mapping & Municipal Waste Management Platform**

> *Detect. Analyze. Prioritize. Clean.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.1-EE4C2C?style=flat-square&logo=pytorch)](https://pytorch.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL+PostGIS-15-336791?style=flat-square&logo=postgresql)](https://postgis.net)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)

---

## 🏗️ Architecture

```
Satellite / Drone / Citizen Images
            │
            ▼
  Image Validation & Storage
            │
            ▼
     Deep Learning Pipeline
  ┌─────────────────────────────┐
  │  Garbage Detection (YOLO)   │
  │  Waste Segmentation (SAM)   │
  │  Waste Classification       │
  │  Pollution Severity         │
  │  Illegal Dump Detection     │
  └─────────────────────────────┘
            │
            ▼
   GPS + GIS Mapping Engine
            │
            ▼
  Route Optimization (OR-Tools)
            │
            ▼
    AI Report Generation (LLM)
            │
            ▼
 Municipal Dashboard & Citizen Portal
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### Run with Docker
```bash
git clone https://github.com/your-org/ecovision-ai
cd ecovision-ai
cp .env.example .env
docker-compose up --build
```

**Access:**
- Landing Page: http://localhost:3000
- Citizen Portal: http://localhost:3001
- Municipal Dashboard: http://localhost:3002
- API Docs: http://localhost:8000/docs

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Landing Page:**
```bash
cd frontend/landing-page
npm install && npm run dev
```

**Citizen Portal:**
```bash
cd frontend/citizen-app
npm install && npm run dev -- --port 3001
```

**Municipal Dashboard:**
```bash
cd frontend/municipal-dashboard
npm install && npm run dev -- --port 3002
```

---

## 📦 Project Structure

```
EcoVision-AI/
├── frontend/
│   ├── landing-page/         # Public homepage (Next.js)
│   ├── citizen-app/          # Citizen portal (Next.js)
│   └── municipal-dashboard/  # Municipal officer dashboard (Next.js)
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── routers/          # API route handlers
│   │   ├── services/         # Business logic
│   │   └── schemas/          # Pydantic schemas
│   └── requirements.txt
├── ai/
│   ├── yolo/                 # YOLOv11 garbage detector
│   ├── segmentation/         # SAM2 / U-Net segmentor
│   ├── classifier/           # EfficientNet waste classifier
│   ├── severity/             # Pollution severity model
│   └── llm/                  # LLM report generator
├── database/
│   └── schema.sql            # PostgreSQL + PostGIS schema
├── datasets/                 # Training data (not tracked in git)
├── docker/
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

---

## 🤖 AI Models

| Model | Architecture | Task | Output |
|-------|-------------|------|--------|
| Garbage Detector | YOLOv11 | Object Detection | Bounding boxes + class |
| Segmentor | SAM 2 / U-Net | Instance Segmentation | Area in m² |
| Waste Classifier | EfficientNet-B4 | Classification | Plastic/Glass/Metal/... |
| Severity Estimator | Custom MLP | Regression | Score 0–100 |
| Illegal Dump | YOLOv11 + Rules | Classification | Dump type |

### Plugging in Real Weights
Each AI module has `# INTEGRATION POINT` markers. Replace mock inference with:
```python
# ai/yolo/detector.py
# INTEGRATION POINT: Load real weights
model = YOLO("weights/best.pt")
results = model(image_path)
```

---

## 🛢️ Database

PostgreSQL 15 + PostGIS 3.4 for geospatial data.

Key tables: `users`, `garbage_reports`, `ai_predictions`, `cleanup_assignments`, `vehicles`, `teams`, `notifications`, `eco_points_log`

---

## 📡 API Reference

Full interactive docs at `http://localhost:8000/docs`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register user |
| `/api/auth/login` | POST | JWT token |
| `/api/reports/upload` | POST | Upload garbage image |
| `/api/reports` | GET | List reports |
| `/api/predictions/analyze` | POST | Run AI inference |
| `/api/map/sites` | GET | GeoJSON pollution sites |
| `/api/routes/optimize` | POST | VRP route optimization |
| `/api/analytics/overview` | GET | KPI data |
| `/api/ai-reports/generate` | POST | Generate LLM report |

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Citizen** | Upload reports, track status, earn eco-points |
| **Municipal Officer** | View dashboard, assign teams, view analytics |
| **Admin** | Manage users, vehicles, teams, AI settings |

---

## 🏆 What Makes This Unique

- **Production-grade**: Not a demo — real auth, real DB, real API contracts
- **GIS-native**: PostGIS for spatial queries, Leaflet for visualization
- **AI-ready**: All 5 model modules scaffolded with realistic mock inference
- **Route Optimization**: Google OR-Tools VRP solver for vehicle assignment
- **Gamification**: Eco-points system for citizen engagement
- **LLM Reports**: Automated ward/daily/weekly reports with PDF export

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

*Built for Smart City AI Hackathons & Final Year Projects*
