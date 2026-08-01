# Contributing to EcoVision AI 🌍

Thank you for your interest in contributing to **EcoVision AI**! We welcome contributions from municipal developers, AI engineers, GIS specialists, and open-source enthusiasts.

---

## 📜 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [How Can I Contribute?](#-how-can-i-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Enhancements](#suggesting-enhancements)
   - [Pull Requests](#pull-requests)
3. [Development Environment Setup](#-development-environment-setup)
4. [Project Architecture & Structure](#-project-architecture--structure)
5. [Coding & Style Guidelines](#-coding--style-guidelines)
6. [Commit Message Conventions](#-commit-message-conventions)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [EcoVision AI Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, please include:
- A clear, descriptive title.
- Exact steps to reproduce the issue.
- Expected behavior vs. actual behavior.
- Relevant screenshots, terminal outputs, or logs.
- System specifications (OS, Python version, Node.js version).

### Suggesting Enhancements

Feature requests are tracked as GitHub Issues. Please include:
- A clear title and summary.
- The rationale or problem the feature addresses.
- Proposed implementation or user experience flow.

### Pull Requests

1. Fork the repository and create a new branch from `main` (e.g. `feature/yolo-model-upgrade` or `fix/jwt-auth-expiry`).
2. Follow code formatting and typing conventions.
3. Test your changes locally (both backend and frontend apps).
4. Ensure all CI checks pass.
5. Submit a Pull Request targeting `main` using our [PR Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## ⚙️ Development Environment Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher
- **Docker & Docker Compose**: (Optional, for full containerized stack)

### 1. Clone & Set Up Environment
```bash
git clone https://github.com/your-org/ecovision-ai.git
cd ecovision-ai
cp .env.example .env
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
EcoVision AI features 3 specialized web apps under `frontend/`:
- **Landing Page**: `cd frontend/landing-page && npm install && npm run dev` (Port 3000)
- **Citizen App**: `cd frontend/citizen-app && npm install && npm run dev -- --port 3001` (Port 3001)
- **Municipal Dashboard**: `cd frontend/municipal-dashboard && npm install && npm run dev -- --port 3002` (Port 3002)

---

## 🏗️ Project Architecture & Structure

- `/backend`: FastAPI service, PostGIS/SQLite database integrations, YOLO/SAM AI inference pipelines, and OR-Tools routing engine.
- `/frontend/landing-page`: Public Next.js portal highlighting features, GIS map visualizer, and system metrics.
- `/frontend/citizen-app`: Citizen reporting portal with image uploads, GPS geolocation, and status tracking.
- `/frontend/municipal-dashboard`: Officer command center for ticket triage, SLA monitoring, and route optimization.
- `/docker`: Dockerfiles and multi-stage container configurations.

---

## 🎨 Coding & Style Guidelines

### Backend (Python / FastAPI)
- Adhere to **PEP 8** standards.
- Use explicit type hints (`pydantic` schemas, TypeAliases).
- Maintain async handling where applicable (`async def` for FastAPI endpoints).

### Frontend (Next.js / TypeScript / React)
- Use **TypeScript** strictly without implicit `any`.
- TailwindCSS for styling with custom dark-mode / glassmorphism design tokens.
- Follow Next.js App Router conventions (`app/` directory).

---

## 🔀 Commit Message Conventions

We follow Conventional Commits:
- `feat:` A new feature for the user or system.
- `fix:` A bug fix.
- `docs:` Documentation-only changes.
- `style:` Formatting or design changes that do not affect code logic.
- `refactor:` Code restructuring without functional changes.
- `test:` Adding or updating automated tests.
- `chore:` Maintenance tasks, dependency updates, configuration changes.

Example:
```bash
git commit -m "feat(backend): implement PostGIS spatial clustering for illegal dump hotspots"
```

Thank you for building the future of municipal waste management with EcoVision AI! 🚀
