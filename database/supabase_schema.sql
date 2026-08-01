-- ============================================================
-- EcoVision AI – Supabase-Compatible Database Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to create all tables.
-- Uses TEXT with CHECK constraints instead of PostgreSQL ENUMs
-- for simpler Supabase compatibility.
-- ============================================================

-- ─── USERS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            TEXT NOT NULL DEFAULT 'citizen'
                    CHECK (role IN ('citizen', 'municipal', 'admin')),
    phone           VARCHAR(20),
    ward            VARCHAR(50),
    eco_points      INTEGER NOT NULL DEFAULT 0,
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ─── VEHICLES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vehicles (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    license_plate       VARCHAR(20) UNIQUE NOT NULL,
    capacity_tons       FLOAT NOT NULL DEFAULT 5.0,
    vehicle_type        VARCHAR(50) NOT NULL DEFAULT 'garbage_truck',
    current_latitude    FLOAT,
    current_longitude   FLOAT,
    status              TEXT NOT NULL DEFAULT 'available'
                        CHECK (status IN ('available', 'on_route', 'maintenance', 'offline')),
    fuel_level          FLOAT NOT NULL DEFAULT 100.0,
    driver_name         VARCHAR(255),
    driver_phone        VARCHAR(20),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- ─── TEAMS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teams (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    supervisor_name VARCHAR(255),
    supervisor_phone VARCHAR(20),
    member_count    INTEGER NOT NULL DEFAULT 4,
    ward            VARCHAR(50),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AI PREDICTIONS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_predictions (
    id                      SERIAL PRIMARY KEY,
    report_id               INTEGER,

    detected_objects        JSONB,
    waste_types             JSONB,
    primary_waste_type      TEXT
                            CHECK (primary_waste_type IS NULL OR primary_waste_type IN (
                                'plastic', 'organic', 'glass', 'metal',
                                'electronic', 'biomedical', 'construction', 'mixed'
                            )),

    garbage_area_m2         FLOAT,
    coverage_percentage     FLOAT,

    severity                TEXT
                            CHECK (severity IS NULL OR severity IN (
                                'very_low', 'low', 'medium', 'high', 'critical'
                            )),
    pollution_score         FLOAT CHECK (pollution_score IS NULL OR (pollution_score BETWEEN 0 AND 100)),

    illegal_dump_type       TEXT NOT NULL DEFAULT 'unknown'
                            CHECK (illegal_dump_type IN (
                                'authorized_yard', 'illegal_dump', 'temporary_collection',
                                'overflowing_bin', 'unknown'
                            )),
    is_illegal              BOOLEAN NOT NULL DEFAULT FALSE,

    model_version           VARCHAR(50) NOT NULL DEFAULT 'mock-v1.0',
    processing_time_ms      INTEGER,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_severity ON ai_predictions(severity);
CREATE INDEX IF NOT EXISTS idx_predictions_waste_type ON ai_predictions(primary_waste_type);

-- ─── GARBAGE REPORTS ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS garbage_reports (
    id              SERIAL PRIMARY KEY,
    reporter_id     INTEGER NOT NULL REFERENCES users(id),
    image_url       VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),

    latitude        FLOAT NOT NULL,
    longitude       FLOAT NOT NULL,
    address         VARCHAR(500),
    ward            VARCHAR(50),

    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN (
                        'pending', 'under_review', 'assigned',
                        'cleaning_started', 'completed', 'rejected'
                    )),
    prediction_id   INTEGER REFERENCES ai_predictions(id),
    assignment_id   INTEGER,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON garbage_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON garbage_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_ward ON garbage_reports(ward);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON garbage_reports(created_at DESC);

ALTER TABLE ai_predictions
    ADD CONSTRAINT fk_prediction_report
    FOREIGN KEY (report_id) REFERENCES garbage_reports(id);

-- ─── CLEANUP ASSIGNMENTS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cleanup_assignments (
    id                      SERIAL PRIMARY KEY,
    report_id               INTEGER REFERENCES garbage_reports(id),
    vehicle_id              INTEGER REFERENCES vehicles(id),
    team_id                 INTEGER REFERENCES teams(id),
    assigned_by_id          INTEGER REFERENCES users(id),
    notes                   TEXT,
    estimated_duration_hours FLOAT,
    assigned_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at              TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ
);

ALTER TABLE garbage_reports
    ADD CONSTRAINT fk_report_assignment
    FOREIGN KEY (assignment_id) REFERENCES cleanup_assignments(id);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    type        VARCHAR(50) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    report_id   INTEGER REFERENCES garbage_reports(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ─── ECO POINTS LOG ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS eco_points_log (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    points      INTEGER NOT NULL,
    reason      VARCHAR(255) NOT NULL,
    report_id   INTEGER REFERENCES garbage_reports(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eco_points_user ON eco_points_log(user_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
-- Service role key bypasses RLS, so these permissive policies are just safety.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE garbage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanup_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_points_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON ai_predictions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON garbage_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON cleanup_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON eco_points_log FOR ALL USING (true) WITH CHECK (true);
