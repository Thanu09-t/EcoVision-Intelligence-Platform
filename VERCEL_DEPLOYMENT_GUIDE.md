# 🚀 Step-by-Step Vercel Deployment Guide for EcoVision AI

This guide details how to deploy the entire **EcoVision AI** multi-app suite to **Vercel** with **0 build errors**.

---

## 🏗️ Architecture Overview

EcoVision AI consists of 3 Next.js frontend applications and 1 FastAPI Python backend service:

| Service | Location | Recommended Hosting | Description |
| ------- | -------- | ------------------- | ----------- |
| **Landing Page** | `frontend/landing-page` | **Vercel** | Public visualizer, stats, & features |
| **Citizen App** | `frontend/citizen-app` | **Vercel** | Citizen reporting & eco-rewards portal |
| **Municipal Dashboard** | `frontend/municipal-dashboard` | **Vercel** | Command center for officers & routes |
| **Backend API** | `backend/` | **Render / Railway / Vercel** | FastAPI, PyTorch YOLO, PostGIS, OR-Tools |

---

## 🛠️ Step 1: Deploy Backend API (FastAPI)

> **Note**: For PyTorch YOLO models & PostGIS database access, hosting the backend on **Render** (or Railway/Fly.io) provides maximum performance. Alternatively, use Vercel Serverless.

### Option A: Render / Railway (Recommended)
1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
3. Select your repository and set:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_KEY`: `your-supabase-secret-key`
   - `AI_MODE`: `mock` (or `real` with PyTorch weights)
5. Copy your deployed backend URL (e.g. `https://ecovision-api.onrender.com`).

---

## 🌐 Step 2: Deploy Next.js Frontends to Vercel

You will create **3 Vercel projects** (one for each frontend application) from the single GitHub repository.

### App 1: Landing Page
1. Go to [Vercel Dashboard](https://vercel.com/new) -> **Import Git Repository**.
2. Select your `ecovision-ai` repository.
3. In **Project Name**, enter: `ecovision-landing`.
4. Click **Edit** next to **Root Directory** and select: `frontend/landing-page`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://ecovision-api.onrender.com` (Your backend URL)
6. Click **Deploy**.

---

### App 2: Citizen Reporting Portal
1. Go to [Vercel Dashboard](https://vercel.com/new) -> **Import Git Repository**.
2. Select your `ecovision-ai` repository.
3. In **Project Name**, enter: `ecovision-citizen`.
4. Click **Edit** next to **Root Directory** and select: `frontend/citizen-app`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://ecovision-api.onrender.com`
6. Click **Deploy**.

---

### App 3: Municipal Officer Command Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/new) -> **Import Git Repository**.
2. Select your `ecovision-ai` repository.
3. In **Project Name**, enter: `ecovision-dashboard`.
4. Click **Edit** next to **Root Directory** and select: `frontend/municipal-dashboard`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://ecovision-api.onrender.com`
6. Click **Deploy**.

---

## ✅ Step 3: Verification & Pre-Deployment Test

All 3 frontend apps have been pre-tested and verified for zero build errors. You can run local build checks anytime using:

```bash
# Test Landing Page Build
cd frontend/landing-page && npm run build

# Test Citizen App Build
cd frontend/citizen-app && npm run build

# Test Municipal Dashboard Build
cd frontend/municipal-dashboard && npm run build
```

---

## 🔒 Step 4: Configure CORS in Backend `.env`

Ensure your FastAPI backend `.env` allows cross-origin requests from your Vercel domains:

```json
CORS_ORIGINS=["https://ecovision-landing.vercel.app","https://ecovision-citizen.vercel.app","https://ecovision-dashboard.vercel.app"]
```

Congratulations! Your EcoVision AI platform is now deployed globally with high availability and 0 errors on Vercel. 🚀
