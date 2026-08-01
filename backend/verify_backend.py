"""
EcoVision AI – Complete Backend Verification Suite
Runs mock-patched integration tests to verify all routes, schemas, serializers,
auth logic, and service layers without requiring a live Supabase connection.
"""

import sys
import os
import unittest
from unittest.mock import AsyncMock
from datetime import datetime
from typing import Optional, Any
import bcrypt

# --- IN-MEMORY DB STATE FOR MOCKING ---
DB = {
    "users": [
        {
            "id": 1,
            "email": "officer@demo.com",
            "full_name": "Rajesh Kumar",
            "password_hash": "",  # Will be hashed dynamically
            "role": "municipal",
            "ward": "Ward 76",
            "eco_points": 100,
            "is_active": True,
            "created_at": "2026-07-19T18:00:00Z"
        },
        {
            "id": 2,
            "email": "citizen@demo.com",
            "full_name": "Ananya Krishnan",
            "password_hash": "",  # Will be hashed dynamically
            "role": "citizen",
            "ward": "Ward 68",
            "eco_points": 420,
            "is_active": True,
            "created_at": "2026-07-19T18:00:00Z"
        }
    ],
    "vehicles": [
        {
            "id": 10,
            "name": "GarbageTruck-01",
            "license_plate": "KA 01 AB 1234",
            "vehicle_type": "garbage_truck",
            "capacity_tons": 8.0,
            "status": "available",
            "current_latitude": 12.9716,
            "current_longitude": 77.5946,
            "fuel_level": 85.5,
            "driver_name": "Ravi Kumar",
            "created_at": "2026-07-19T18:00:00Z",
            "updated_at": "2026-07-19T18:00:00Z"
        }
    ],
    "teams": [
        {
            "id": 1,
            "name": "Alpha Team",
            "supervisor_name": "Suresh Babu",
            "supervisor_phone": "+91 98765 43210",
            "member_count": 6,
            "ward": "Ward 76",
            "is_active": True,
            "created_at": "2026-07-19T18:00:00Z"
        }
    ],
    "ai_predictions": [
        {
            "id": 100,
            "report_id": 200,
            "detected_objects": [{"label": "plastic_bottle", "confidence": 0.95, "bbox": [0.1, 0.1, 0.4, 0.4]}],
            "waste_types": [{"type": "plastic", "percentage": 85.0}],
            "primary_waste_type": "plastic",
            "garbage_area_m2": 25.0,
            "coverage_percentage": 65.0,
            "severity": "medium",
            "pollution_score": 55.0,
            "illegal_dump_type": "overflowing_bin",
            "is_illegal": False,
            "model_version": "mock-v2.0",
            "processing_time_ms": 450,
            "created_at": "2026-07-19T18:10:00Z"
        }
    ],
    "garbage_reports": [
        {
            "id": 200,
            "reporter_id": 2,
            "image_url": "/uploads/test.jpg",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "address": "MG Road, Bengaluru",
            "ward": "Ward 76",
            "description": "Test report",
            "status": "pending",
            "prediction_id": 100,
            "created_at": "2026-07-19T18:10:00Z",
            "updated_at": "2026-07-19T18:10:00Z",
            "ai_predictions": {
                "id": 100,
                "detected_objects": [{"label": "plastic_bottle", "confidence": 0.95, "bbox": [0.1, 0.1, 0.4, 0.4]}],
                "waste_types": [{"type": "plastic", "percentage": 85.0}],
                "primary_waste_type": "plastic",
                "garbage_area_m2": 25.0,
                "coverage_percentage": 65.0,
                "severity": "medium",
                "pollution_score": 55.0,
                "illegal_dump_type": "overflowing_bin",
                "is_illegal": False,
                "model_version": "mock-v2.0",
                "processing_time_ms": 450,
                "created_at": "2026-07-19T18:10:00Z"
            }
        }
    ],
    "notifications": [],
    "eco_points_log": []
}

# Dynamically populate password hashes to match 'demo1234'
pwd_hash = bcrypt.hashpw(b"demo1234", bcrypt.gensalt()).decode("utf-8")
for u in DB["users"]:
    u["password_hash"] = pwd_hash


# --- MOCK CLIENT FUNCTIONS ---
async def mock_supabase_get(table: str, params: Optional[dict] = None, single: bool = False) -> Any:
    rows = DB.get(table, [])
    filtered_rows = rows.copy()

    if params:
        for k, v in params.items():
            if k in ("select", "order", "limit", "offset"):
                continue

            # Basic eq matching
            if isinstance(v, str) and v.startswith("eq."):
                val = v[3:]
                if val.isdigit():
                    val = int(val)
                elif val.lower() == "true":
                    val = True
                elif val.lower() == "false":
                    val = False
                filtered_rows = [r for r in filtered_rows if r.get(k) == val]

            # Basic in matching
            elif isinstance(v, str) and v.startswith("in."):
                vals = v[4:-1].split(",")
                vals = [int(x) if x.isdigit() else x for x in vals]
                filtered_rows = [r for r in filtered_rows if r.get(k) in vals]

            # Basic gte matching (used in reports date filter)
            elif isinstance(v, str) and v.startswith("gte."):
                val = v[4:]
                filtered_rows = [r for r in filtered_rows if r.get(k, "") >= val]

    if single:
        return filtered_rows[0] if filtered_rows else None
    return filtered_rows


async def mock_supabase_post(table: str, data: Any, return_data: bool = True) -> Any:
    if isinstance(data, list):
        inserted = []
        for d in data:
            new_id = len(DB[table]) + 1
            row = {
                "id": new_id,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                **d
            }
            DB[table].append(row)
            inserted.append(row)
        return inserted
    else:
        new_id = len(DB[table]) + 1
        row = {
            "id": new_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            **data
        }
        DB[table].append(row)
        return row


async def mock_supabase_patch(table: str, params: dict, data: dict, return_data: bool = True) -> Any:
    target_id = None
    for k, v in params.items():
        if k == "id" and v.startswith("eq."):
            target_id = int(v[3:])
        elif k == "user_id" and v.startswith("eq."):
            # simple matching by user_id if id not present
            target_id = None

    updated_rows = []
    for r in DB[table]:
        # matching logic
        match = True
        for pk, pv in params.items():
            if pv.startswith("eq."):
                p_val = pv[3:]
                if p_val.isdigit():
                    p_val = int(p_val)
                elif p_val.lower() == "true":
                    p_val = True
                elif p_val.lower() == "false":
                    p_val = False
                if r.get(pk) != p_val:
                    match = False

        if match:
            r.update(data)
            updated_rows.append(r)

    if return_data:
        return updated_rows[0] if updated_rows else {}
    return None


async def mock_supabase_delete(table: str, params: dict) -> None:
    target_id = None
    for k, v in params.items():
        if k == "id" and v.startswith("eq."):
            target_id = int(v[3:])
    
    DB[table] = [r for r in DB[table] if r.get("id") != target_id]


async def mock_supabase_count(table: str, params: Optional[dict] = None) -> int:
    res = await mock_supabase_get(table, params)
    return len(res)


# --- MONKEYPATCH SUPABASE CLIENT BEFORE IMPORTS ---
import app.supabase_client
app.supabase_client.supabase_get = mock_supabase_get
app.supabase_client.supabase_post = mock_supabase_post
app.supabase_client.supabase_patch = mock_supabase_patch
app.supabase_client.supabase_delete = mock_supabase_delete
app.supabase_client.supabase_count = mock_supabase_count
app.supabase_client.supabase_head = mock_supabase_count

# Now safely import backend main
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import app.main as app_main
fastapi_app = app_main.app
from fastapi.testclient import TestClient


# --- MOCK AI INFERENCE OR SERVICES TO BYPASS EXTERNAL CALLS ---
async def mock_run_inference(filepath: str):
    return {
        "detected_objects": [{"label": "construction_debris", "confidence": 0.88, "bbox": [0,0,1,1]}],
        "waste_types": [{"type": "construction", "percentage": 100.0}],
        "primary_waste_type": "construction",
        "garbage_area_m2": 150.0,
        "coverage_percentage": 75.0,
        "severity": "high",
        "pollution_score": 80.0,
        "illegal_dump_type": "illegal_dump",
        "is_illegal": True,
        "model_version": "mock-v2.0",
        "processing_time_ms": 600
    }

import app.routers.reports
app.routers.reports.run_inference = mock_run_inference


# --- TEST CASES ---
class TestBackendEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(fastapi_app)
        cls.officer_token = None
        cls.citizen_token = None

    def test_01_health_and_configuration(self):
        """Verify server starts, healthcheck is active, config maps database."""
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "healthy")
        self.assertEqual(resp.json()["database"], "supabase")

    def test_02_authentication_and_registration(self):
        """Verify user login and registration validation paths."""
        # 1. Login Failure
        resp = self.client.post("/api/auth/login", json={"email": "wrong@demo.com", "password": "wrong"})
        self.assertEqual(resp.status_code, 401)

        # 2. Login Success (Officer)
        resp = self.client.post("/api/auth/login", json={"email": "officer@demo.com", "password": "demo1234"})
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access_token", resp.json())
        self.__class__.officer_token = resp.json()["access_token"]

        # 3. Login Success (Citizen)
        resp = self.client.post("/api/auth/login", json={"email": "citizen@demo.com", "password": "demo1234"})
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access_token", resp.json())
        self.__class__.citizen_token = resp.json()["access_token"]

        # 4. User registration duplicate check
        resp = self.client.post("/api/auth/register", json={
            "email": "citizen@demo.com", "full_name": "New User", "password": "password123"
        })
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["detail"], "Email already registered")

    def test_03_reports_endpoints(self):
        """Verify reports GET operations."""
        headers = {"Authorization": f"Bearer {self.officer_token}"}
        
        # List Reports
        resp = self.client.get("/api/reports?limit=10", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 1)
        self.assertEqual(resp.json()[0]["id"], 200)
        self.assertEqual(resp.json()[0]["status"], "pending")

        # Get Single Report
        resp = self.client.get("/api/reports/200", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["id"], 200)

    def test_04_reports_creation_and_ai_predictions(self):
        """Verify submitting report runs AI inference, writes to Supabase, awards points."""
        headers = {"Authorization": f"Bearer {self.citizen_token}"}
        
        # Submit report
        import io
        dummy_file = io.BytesIO(b"fake image bytes")
        resp = self.client.post(
            "/api/reports/upload",
            data={"latitude": 12.9102, "longitude": 77.5531, "description": "Construction waste on road"},
            files={"image": ("test.jpg", dummy_file, "image/jpeg")},
            headers=headers
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()["status"], "pending")
        self.assertEqual(resp.json()["prediction"]["primary_waste_type"], "construction")
        self.assertEqual(resp.json()["prediction"]["severity"], "high")

    def test_05_vehicles_and_teams(self):
        """Verify vehicles & teams CRUD operations."""
        headers = {"Authorization": f"Bearer {self.officer_token}"}

        # List Vehicles
        resp = self.client.get("/api/vehicles", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 1)

        # Create Vehicle
        resp = self.client.post("/api/vehicles", json={
            "name": "MiniTruck-02",
            "license_plate": "KA 03 EF 3456",
            "vehicle_type": "mini",
            "capacity_tons": 3.0
        }, headers=headers)
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()["name"], "MiniTruck-02")

        # Update Vehicle
        v_id = resp.json()["id"]
        resp = self.client.patch(f"/api/vehicles/{v_id}", json={
            "status": "on_route"
        }, headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "on_route")

    def test_06_route_optimization(self):
        """Verify VRP solver outputs correct stop sequences."""
        headers = {"Authorization": f"Bearer {self.officer_token}"}
        
        resp = self.client.post("/api/routes/optimize", json={
            "vehicle_ids": [10],
            "report_ids": [200],
            "depot_lat": 12.9716,
            "depot_lng": 77.5946
        }, headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()["routes"]), 1)
        self.assertEqual(resp.json()["routes"][0]["vehicle_id"], 10)
        self.assertEqual(len(resp.json()["routes"][0]["stops"]), 1)
        self.assertEqual(resp.json()["routes"][0]["stops"][0]["report_id"], 200)

    def test_07_analytics_kpi_metrics(self):
        """Verify analytics computations, KPI aggregations, and insights."""
        headers = {"Authorization": f"Bearer {self.officer_token}"}

        # Overview Stats
        resp = self.client.get("/api/analytics/overview", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["total_sites"] >= 1)

        # Ward rankings
        resp = self.client.get("/api/analytics/ward-rankings", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()[0]["ward"], "Ward 76")

        # Leaderboard
        resp = self.client.get("/api/analytics/leaderboard", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()[0]["full_name"], "Ananya Krishnan")

        # Insights
        resp = self.client.get("/api/analytics/ai-insights", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.json()) > 0)

    def test_08_map_gis_endpoints(self):
        """Verify GeoJSON and Heatmap layers."""
        headers = {"Authorization": f"Bearer {self.citizen_token}"}

        # GeoJSON sites
        resp = self.client.get("/api/map/sites", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["type"], "FeatureCollection")
        self.assertTrue(len(resp.json()["features"]) >= 1)

        # Heatmap intensity points
        resp = self.client.get("/api/map/heatmap", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.json()["points"]) >= 1)

    def test_09_notifications(self):
        """Verify notifications endpoints."""
        headers = {"Authorization": f"Bearer {self.citizen_token}"}

        # Get notifications
        resp = self.client.get("/api/notifications", headers=headers)
        self.assertEqual(resp.status_code, 200)

    def test_10_ai_reports_pdf(self):
        """Verify AI reports text summary generation and PDF download response."""
        headers = {"Authorization": f"Bearer {self.officer_token}"}

        # Text Generate report
        resp = self.client.post("/api/ai-reports/generate", json={
            "report_type": "weekly",
            "ward": "Ward 76"
        }, headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn("EcoVision AI Weekly Pollution Report", resp.json()["title"])

        # PDF Download
        resp = self.client.post("/api/ai-reports/download-pdf", json={
            "report_type": "weekly",
            "ward": "Ward 76"
        }, headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("content-type"), "application/pdf")


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestBackendEndpoints)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
