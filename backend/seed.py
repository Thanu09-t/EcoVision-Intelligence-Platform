"""
EcoVision AI – Supabase Database Seed Script

Populates the Supabase database with realistic demo data.
Creates 200+ reports, 20 users, 15 vehicles, 8 teams.

Usage:
    cd backend
    python seed.py
"""

import asyncio
import random
from datetime import datetime, timedelta
import bcrypt
import httpx
import os
import sys

# Add parent to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

# ── Supabase REST helpers ────────────────────────────────────────────────────

REST_URL = f"{settings.SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": settings.SUPABASE_KEY,
    "Authorization": f"Bearer {settings.SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


async def sb_post(client: httpx.AsyncClient, table: str, data) -> list:
    """Insert into Supabase table and return inserted rows."""
    resp = await client.post(f"{REST_URL}/{table}", json=data, headers=HEADERS)
    if resp.status_code >= 400:
        print(f"  [ERR] POST {table}: {resp.status_code} {resp.text[:200]}")
        resp.raise_for_status()
    return resp.json()


async def sb_delete_all(client: httpx.AsyncClient, table: str):
    """Delete all rows from a table."""
    h = {**HEADERS}
    h.pop("Prefer", None)
    # PostgREST requires a filter for DELETE; use id > 0 to match all
    resp = await client.delete(f"{REST_URL}/{table}?id=gt.0", headers=h)
    if resp.status_code >= 400 and resp.status_code != 404:
        print(f"  [WARN] DELETE {table}: {resp.status_code}")


# ── Worldwide & Bengaluru locations ──────────────────────────────────────────

LOCATIONS = [
    # Global Locations
    (40.7128, -74.0060, "Lower East Side, New York City, USA", "Manhattan Zone 4", "critical"),
    (34.0522, -118.2437, "Skid Row, Los Angeles, USA", "LA District 9", "critical"),
    (51.5074, -0.1278, "Central Westminster, London, UK", "Westminster", "high"),
    (48.8566, 2.3522, "Canal Saint-Martin, Paris, France", "Arrondissement 10", "medium"),
    (52.5200, 13.4050, "Alexanderplatz, Berlin, Germany", "Berlin Mitte", "low"),
    (35.6762, 139.6503, "Kabukicho, Tokyo, Japan", "Shinjuku Ward 1", "very_low"),
    (1.3521, 103.8198, "Jurong West, Singapore", "Jurong Node", "very_low"),
    (30.0444, 31.2357, "Manshiyat Naser, Cairo, Egypt", "Garbage City", "critical"),
    (-1.2921, 36.8219, "Dandora, Nairobi, Kenya", "Dandora Sector 3", "critical"),
    (25.2048, 55.2708, "Deira Commercial, Dubai, UAE", "Al Ras", "medium"),
    (-23.5505, -46.6333, "Sé District, São Paulo, Brazil", "Central Zone 1", "high"),
    (-34.6037, -58.3816, "Puerto Madero, Buenos Aires, Argentina", "San Telmo Border", "medium"),
    (-33.8688, 151.2093, "Darling Harbour, Sydney, Australia", "Pyrmont Precinct", "low"),
    (43.6532, -79.3832, "Spadina Ave, Toronto, Canada", "Ward 10 Toronto", "low"),

    # Local Wards
    (12.9716, 77.5946, "MG Road, Bengaluru", "Ward 76", "high"),
    (12.9542, 77.4980, "Mysuru Road, Bengaluru", "Ward 116", "high"),
    (13.0358, 77.5970, "Hebbal, Bengaluru", "Ward 5", "high"),
    (12.8845, 77.6007, "Electronic City, Bengaluru", "Ward 196", "critical"),
    (13.0100, 77.5400, "Peenya Industrial, Bengaluru", "Ward 11", "critical"),
    (12.9352, 77.6245, "Koramangala, Bengaluru", "Ward 68", "medium"),
    (12.9279, 77.6271, "HSR Layout, Bengaluru", "Ward 150", "medium"),
    (13.0012, 77.5569, "Rajajinagar, Bengaluru", "Ward 27", "medium"),
    (12.9165, 77.6229, "BTM Layout, Bengaluru", "Ward 67", "medium"),
    (13.0478, 77.6211, "KR Puram, Bengaluru", "Ward 24", "medium"),
    (12.9780, 77.6408, "HAL Airport Rd, Bengaluru", "Ward 84", "medium"),
    (12.9102, 77.5531, "Banashankari, Bengaluru", "Ward 130", "medium"),
    (12.9719, 77.6412, "Indiranagar, Bengaluru", "Ward 81", "low"),
    (12.9616, 77.6413, "Domlur, Bengaluru", "Ward 82", "low"),
    (13.0674, 77.5930, "Yelahanka New Town, Bengaluru", "Ward 3", "low"),
]

SEVERITY_PROFILES = {
    "critical": [0.0, 0.05, 0.15, 0.35, 0.45],
    "high":     [0.05, 0.10, 0.25, 0.40, 0.20],
    "medium":   [0.10, 0.20, 0.35, 0.25, 0.10],
    "low":      [0.25, 0.35, 0.25, 0.10, 0.05],
}
SEVERITY_LIST = ["very_low", "low", "medium", "high", "critical"]
WASTE_TYPES_LIST = ["plastic", "organic", "glass", "metal", "electronic", "biomedical", "construction", "mixed"]
ILLEGAL_DUMP_TYPES = ["authorized_yard", "illegal_dump", "temporary_collection", "overflowing_bin", "unknown"]

WASTE_PROFILES = {
    "Ward 196": ["electronic", "construction", "mixed"],
    "Ward 11":  ["construction", "mixed", "metal"],
    "Ward 76":  ["plastic", "mixed", "organic"],
    "Ward 116": ["plastic", "organic", "mixed"],
    "Ward 5":   ["mixed", "organic", "plastic"],
    "_default": ["plastic", "organic", "mixed", "glass", "metal"],
}

DESCRIPTIONS = [
    "Large pile of garbage near the main road",
    "Overflowing bins causing severe health hazard",
    "Illegal dumping spotted near the park",
    "Construction debris blocking footpath for days",
    "Garbage not collected for more than 3 days",
    "Biomedical waste dumped illegally near residential area",
    "Plastic bags scattered across the street",
    "Rotting organic waste creating foul smell",
    "Glass bottles and sharp debris on walkway",
    "Metal scrap abandoned near school",
    "Electronic waste dumped in open area",
    "Multiple black bags of unknown waste left overnight",
    "Garbage overflow from bin spilling onto road",
    "Open burning of waste spotted",
    "Drain blocked by plastic waste",
    None,
    None,
]

YOLO_LABELS = [
    "plastic_bag", "plastic_bottle", "cardboard", "glass_bottle",
    "food_waste", "metal_can", "electronic_waste", "construction_debris",
    "mixed_garbage", "overflowing_bin",
]


async def seed():
    print("[INFO] Seeding EcoVision AI database via Supabase REST API...")
    print(f"  Supabase URL: {settings.SUPABASE_URL}")

    async with httpx.AsyncClient(timeout=30.0) as client:

        # ── Clear existing data (in order to avoid FK violations) ─────────
        print("  Clearing existing data...")
        for table in ["eco_points_log", "notifications", "cleanup_assignments", "garbage_reports", "ai_predictions", "teams", "vehicles", "users"]:
            await sb_delete_all(client, table)

        # ── Users ────────────────────────────────────────────────────────
        users_data = [
            ("admin@ecovision.ai", "EcoVision Admin", "admin1234", "admin", "Ward 76", 500),
            ("officer@demo.com", "Rajesh Kumar", "demo1234", "municipal", "Ward 76", 100),
            ("officer2@demo.com", "Priya Sharma", "demo1234", "municipal", "Ward 68", 100),
            ("officer3@demo.com", "Deepak Naik", "demo1234", "municipal", "Ward 5", 100),
            ("officer4@demo.com", "Kavita Rao", "demo1234", "municipal", "Ward 196", 100),
            ("citizen@demo.com", "Ananya Krishnan", "demo1234", "citizen", "Ward 68", 420),
            ("citizen2@demo.com", "Vikram Patel", "demo1234", "citizen", "Ward 81", 310),
            ("citizen3@demo.com", "Meera Nair", "demo1234", "citizen", "Ward 150", 280),
            ("citizen4@demo.com", "Arjun Singh", "demo1234", "citizen", "Ward 5", 540),
            ("citizen5@demo.com", "Lakshmi Reddy", "demo1234", "citizen", "Ward 27", 190),
            ("ravi@demo.com", "Ravi Shankar", "demo1234", "citizen", "Ward 76", 650),
            ("sunita@demo.com", "Sunita Menon", "demo1234", "citizen", "Ward 116", 120),
            ("arun@demo.com", "Arun Babu", "demo1234", "citizen", "Ward 24", 80),
            ("divya@demo.com", "Divya Iyer", "demo1234", "citizen", "Ward 84", 380),
            ("karan@demo.com", "Karan Mehta", "demo1234", "citizen", "Ward 67", 210),
            ("sneha@demo.com", "Sneha Pillai", "demo1234", "citizen", "Ward 196", 95),
            ("mohan@demo.com", "Mohan Rao", "demo1234", "citizen", "Ward 130", 450),
            ("anita@demo.com", "Anita Kulkarni", "demo1234", "citizen", "Ward 11", 175),
            ("suresh@demo.com", "Suresh Bhat", "demo1234", "citizen", "Ward 3", 60),
            ("pooja@demo.com", "Pooja Desai", "demo1234", "citizen", "Ward 82", 290),
        ]

        user_rows = []
        for email, name, pwd, role, ward, points in users_data:
            hashed = bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            user_rows.append({
                "email": email,
                "full_name": name,
                "password_hash": hashed,
                "role": role,
                "ward": ward,
                "eco_points": points,
                "is_active": True,
            })

        users = await sb_post(client, "users", user_rows)
        print(f"  [OK] Created {len(users)} users")

        # ── Vehicles ─────────────────────────────────────────────────────
        vehicles_data = [
            ("GarbageTruck-01", "KA 01 AB 1234", "garbage_truck", 8.0, "Ravi Kumar", "available"),
            ("GarbageTruck-02", "KA 01 AB 5678", "garbage_truck", 8.0, "Suresh M", "on_route"),
            ("GarbageTruck-03", "KA 01 AB 9012", "garbage_truck", 8.0, "Harish B", "available"),
            ("Compactor-01", "KA 02 CD 9012", "compactor", 12.0, "Mohan Das", "available"),
            ("Compactor-02", "KA 04 GH 1111", "compactor", 12.0, "Prakash V", "available"),
            ("Compactor-03", "KA 04 GH 2222", "compactor", 12.0, "Ramesh S", "on_route"),
            ("MiniTruck-01", "KA 03 EF 3456", "mini", 3.0, "Ganesh Rao", "available"),
            ("MiniTruck-02", "KA 03 EF 7890", "mini", 3.0, "Dinesh K", "maintenance"),
            ("MiniTruck-03", "KA 03 EF 1122", "mini", 3.0, "Santosh P", "available"),
            ("MiniTruck-04", "KA 03 EF 3344", "mini", 3.0, "Nagaraj T", "available"),
            ("Tractor-01", "KA 05 HJ 7788", "tractor", 15.0, "Venkatesha M", "available"),
            ("Tractor-02", "KA 05 HJ 9900", "tractor", 15.0, "Siddesh R", "on_route"),
            ("Loader-01", "KA 06 KL 4455", "loader", 20.0, "Basavanna K", "available"),
            ("Tipper-01", "KA 07 MN 6677", "tipper", 10.0, "Manjunath G", "maintenance"),
            ("WaterTanker-01", "KA 08 PQ 8899", "water_tanker", 5.0, "Krishnamurthy S", "available"),
        ]

        vehicle_rows = []
        for name, plate, vtype, cap, driver, status in vehicles_data:
            loc = random.choice(LOCATIONS)
            vehicle_rows.append({
                "name": name,
                "license_plate": plate,
                "vehicle_type": vtype,
                "capacity_tons": cap,
                "driver_name": driver,
                "status": status,
                "current_latitude": round(loc[0] + random.uniform(-0.02, 0.02), 6),
                "current_longitude": round(loc[1] + random.uniform(-0.02, 0.02), 6),
                "fuel_level": round(random.uniform(35, 100), 1),
            })

        vehicles = await sb_post(client, "vehicles", vehicle_rows)
        print(f"  [OK] Created {len(vehicles)} vehicles")

        # ── Teams ────────────────────────────────────────────────────────
        teams_data = [
            ("Alpha Team", "Suresh Babu", "+91 98765 43210", "Ward 76", 6),
            ("Beta Team", "Kavitha S", "+91 87654 32109", "Ward 68", 5),
            ("Gamma Team", "Ramesh N", "+91 76543 21098", "Ward 81", 4),
            ("Delta Team", "Usha Rani", "+91 65432 10987", "Ward 5", 5),
            ("Epsilon Team", "Prasad K", "+91 54321 09876", "Ward 196", 6),
            ("Zeta Team", "Savitha M", "+91 43210 98765", "Ward 116", 4),
            ("Eta Team", "Nagendra S", "+91 32109 87654", "Ward 27", 5),
            ("Theta Team", "Rekha D", "+91 21098 76543", "Ward 11", 6),
        ]

        team_rows = [
            {"name": n, "supervisor_name": s, "supervisor_phone": p, "ward": w, "member_count": m}
            for n, s, p, w, m in teams_data
        ]
        teams = await sb_post(client, "teams", team_rows)
        print(f"  [OK] Created {len(teams)} teams")

        # ── Reports + Predictions ────────────────────────────────────────
        citizen_users = [u for u in users if u["role"] == "citizen"]
        statuses = [
            "pending", "pending", "pending",
            "under_review", "under_review",
            "assigned",
            "cleaning_started",
            "completed", "completed", "completed",
            "rejected",
        ]

        # Insert predictions in batches, then reports
        BATCH_SIZE = 50
        total_reports = 210
        all_predictions = []
        all_report_rows = []

        for i in range(total_reports):
            loc = random.choice(LOCATIONS)
            lat = round(loc[0] + random.uniform(-0.008, 0.008), 6)
            lng = round(loc[1] + random.uniform(-0.008, 0.008), 6)
            address, ward = loc[2], loc[3]
            severity_profile = loc[4]

            reporter = random.choice(citizen_users)
            days_ago = random.randint(0, 60)
            created = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))

            ward_wastes = WASTE_PROFILES.get(ward, WASTE_PROFILES["_default"])
            waste_type = random.choices(
                ward_wastes + ["mixed"],
                weights=[30] * len(ward_wastes) + [20],
            )[0]

            sev_weights = SEVERITY_PROFILES.get(severity_profile, SEVERITY_PROFILES["medium"])
            severity = random.choices(SEVERITY_LIST, weights=sev_weights)[0]

            area_m2 = round(random.uniform(10, 500), 2)
            score = {"very_low": 12, "low": 28, "medium": 52, "high": 75, "critical": 92}[severity]
            score = min(100.0, max(5.0, round(score + random.uniform(-8, 8), 1)))
            dump_type = random.choices(ILLEGAL_DUMP_TYPES, weights=[30, 15, 25, 20, 10])[0]
            is_illegal = dump_type == "illegal_dump"

            num_objects = random.randint(1, 6)
            detected_objects = [
                {
                    "label": random.choice(YOLO_LABELS),
                    "confidence": round(random.uniform(0.72, 0.99), 2),
                    "bbox": [
                        round(random.uniform(0, 0.4), 3),
                        round(random.uniform(0, 0.4), 3),
                        round(random.uniform(0.5, 1.0), 3),
                        round(random.uniform(0.5, 1.0), 3),
                    ]
                }
                for _ in range(num_objects)
            ]

            waste_breakdown = [{"type": waste_type, "percentage": round(random.uniform(45, 75), 1)}]
            remaining = 100 - waste_breakdown[0]["percentage"]
            secondary = [w for w in WASTE_TYPES_LIST if w != waste_type]
            random.shuffle(secondary)
            for w in secondary[:2]:
                if remaining < 5:
                    break
                pct = round(random.uniform(5, min(remaining - 5, 25)), 1)
                waste_breakdown.append({"type": w, "percentage": pct})
                remaining -= pct
            if remaining > 0:
                waste_breakdown.append({"type": "mixed", "percentage": round(remaining, 1)})

            pred_row = {
                "detected_objects": detected_objects,
                "waste_types": waste_breakdown,
                "primary_waste_type": waste_type,
                "garbage_area_m2": area_m2,
                "coverage_percentage": round(random.uniform(15, 85), 1),
                "severity": severity,
                "pollution_score": score,
                "illegal_dump_type": dump_type,
                "is_illegal": is_illegal,
                "model_version": "mock-v2.0",
                "processing_time_ms": random.randint(350, 1800),
                "created_at": created.isoformat(),
            }
            all_predictions.append(pred_row)

            status = random.choice(statuses)
            report_row = {
                "_idx": i,
                "reporter_id": reporter["id"],
                "image_url": f"/uploads/demo_garbage_{i + 1:03d}.jpg",
                "thumbnail_url": f"/uploads/thumb_{i + 1:03d}.jpg",
                "latitude": lat,
                "longitude": lng,
                "address": address,
                "ward": ward,
                "description": random.choice(DESCRIPTIONS),
                "status": status,
                "created_at": created.isoformat(),
                "updated_at": (created + timedelta(hours=random.randint(1, 48))).isoformat(),
            }
            all_report_rows.append(report_row)

        # Insert predictions in batches
        all_pred_results = []
        for batch_start in range(0, len(all_predictions), BATCH_SIZE):
            batch = all_predictions[batch_start:batch_start + BATCH_SIZE]
            results = await sb_post(client, "ai_predictions", batch)
            all_pred_results.extend(results)
            print(f"    Inserted predictions batch {batch_start // BATCH_SIZE + 1}...")

        # Now link predictions to reports and insert reports
        all_report_inserts = []
        for i, report_row in enumerate(all_report_rows):
            report_row.pop("_idx", None)
            report_row["prediction_id"] = all_pred_results[i]["id"]
            all_report_inserts.append(report_row)

        all_report_results = []
        for batch_start in range(0, len(all_report_inserts), BATCH_SIZE):
            batch = all_report_inserts[batch_start:batch_start + BATCH_SIZE]
            results = await sb_post(client, "garbage_reports", batch)
            all_report_results.extend(results)
            print(f"    Inserted reports batch {batch_start // BATCH_SIZE + 1}...")

        # Update predictions with report_ids
        for i, pred in enumerate(all_pred_results):
            if i < len(all_report_results):
                h = {**HEADERS}
                await client.patch(
                    f"{REST_URL}/ai_predictions?id=eq.{pred['id']}",
                    json={"report_id": all_report_results[i]["id"]},
                    headers=h,
                )

        print(f"  [OK] Created {len(all_report_results)} garbage reports with AI predictions")

        # ── Notifications ────────────────────────────────────────────────
        notif_templates = [
            ("success", "Report Submitted", "Your garbage report has been submitted successfully. AI analysis complete."),
            ("info", "Under Review", "Your report is being reviewed by the municipal team."),
            ("info", "Team Assigned", "A cleanup team has been dispatched to your location."),
            ("success", "Cleanup Completed!", "The garbage at your reported location has been cleared. Points awarded!"),
            ("warning", "Critical Site Alert", "A critical pollution site was detected near your area."),
            ("info", "Points Awarded", "You've earned eco-points for your recent activity."),
            ("info", "Weekly Summary", "Great work this week! You've helped keep Bengaluru cleaner."),
            ("success", "Badge Unlocked!", "Congratulations! You've unlocked a new eco-badge."),
        ]

        notif_rows = []
        for user in citizen_users:
            for _ in range(random.randint(3, 8)):
                title_type, title, msg = random.choice(notif_templates)
                notif_rows.append({
                    "user_id": user["id"],
                    "type": title_type,
                    "title": title,
                    "message": msg,
                    "is_read": random.choice([True, True, True, False]),
                    "created_at": (datetime.utcnow() - timedelta(days=random.randint(0, 30))).isoformat(),
                })

        for batch_start in range(0, len(notif_rows), BATCH_SIZE):
            batch = notif_rows[batch_start:batch_start + BATCH_SIZE]
            await sb_post(client, "notifications", batch)
        print(f"  [OK] Created {len(notif_rows)} notifications")

        # ── Eco Points Logs ──────────────────────────────────────────────
        eco_reasons = [
            ("Submitted a garbage report", 10),
            ("Reported a critical pollution site", 30),
            ("Cleanup completed for your report", 50),
            ("Welcome bonus for joining EcoVision", 10),
            ("Weekly active citizen reward", 20),
            ("First report of the month bonus", 25),
            ("Verified report – confirmed by team", 15),
        ]

        eco_rows = []
        for user in citizen_users:
            for _ in range(random.randint(4, 12)):
                reason, base_pts = random.choice(eco_reasons)
                pts = max(5, base_pts + random.randint(-5, 10))
                eco_rows.append({
                    "user_id": user["id"],
                    "points": pts,
                    "reason": reason,
                    "created_at": (datetime.utcnow() - timedelta(days=random.randint(0, 60))).isoformat(),
                })

        for batch_start in range(0, len(eco_rows), BATCH_SIZE):
            batch = eco_rows[batch_start:batch_start + BATCH_SIZE]
            await sb_post(client, "eco_points_log", batch)
        print(f"  [OK] Created {len(eco_rows)} eco-points log entries")

        print("\n[DONE] Database seeded successfully!")
        print(f"\n[SUMMARY]")
        print(f"   Users:     {len(users)} (1 admin, 4 municipal, 15 citizens)")
        print(f"   Vehicles:  {len(vehicles)}")
        print(f"   Teams:     {len(teams)}")
        print(f"   Reports:   {len(all_report_results)} with full AI predictions")
        print(f"   Notifs:    {len(notif_rows)}")
        print(f"   Eco Logs:  {len(eco_rows)}")
        print("\n[CREDENTIALS]")
        print("   Admin:    admin@ecovision.ai  / admin1234")
        print("   Officer:  officer@demo.com    / demo1234")
        print("   Citizen:  citizen@demo.com    / demo1234")


if __name__ == "__main__":
    asyncio.run(seed())
