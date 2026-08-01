-- EcoVision AI – PostgreSQL + PostGIS Database Schema
-- Run: psql -d ecovision_db -f schema.sql

-- Enable PostGIS extension for geospatial support
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('citizen', 'municipal', 'admin');
CREATE TYPE report_status AS ENUM (
    'pending', 'under_review', 'assigned',
    'cleaning_started', 'completed', 'rejected'
);
CREATE TYPE severity_level AS ENUM ('very_low', 'low', 'medium', 'high', 'critical');
CREATE TYPE waste_type AS ENUM (
    'plastic', 'organic', 'glass', 'metal',
    'electronic', 'biomedical', 'construction', 'mixed'
);
CREATE TYPE illegal_dump_type AS ENUM (
    'authorized_yard', 'illegal_dump', 'temporary_collection',
    'overflowing_bin', 'unknown'
);
CREATE TYPE vehicle_status AS ENUM ('available', 'on_route', 'maintenance', 'offline');

-- ─── USERS ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'citizen',
    phone           VARCHAR(20),
    ward            VARCHAR(50),
    eco_points      INTEGER NOT NULL DEFAULT 0,
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ─── VEHICLES ─────────────────────────────────────────────────────────────────

CREATE TABLE vehicles (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    license_plate       VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type        VARCHAR(50) NOT NULL DEFAULT 'garbage_truck',
    capacity_tons       FLOAT NOT NULL DEFAULT 5.0,
    current_location    GEOGRAPHY(POINT, 4326),  -- PostGIS point
    current_latitude    FLOAT,
    current_longitude   FLOAT,
    status              vehicle_status NOT NULL DEFAULT 'available',
    fuel_level          FLOAT NOT NULL DEFAULT 100.0,
    driver_name         VARCHAR(255),
    driver_phone        VARCHAR(20),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_location ON vehicles USING GIST(current_location);

-- ─── TEAMS ───────────────────────────────────────────────────────────────────

CREATE TABLE teams (
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

CREATE TABLE ai_predictions (
    id                      SERIAL PRIMARY KEY,
    report_id               INTEGER,  -- FK added after garbage_reports table

    -- Detection (YOLO)
    detected_objects        JSONB,   -- [{label, confidence, bbox}]

    -- Classification (EfficientNet)
    waste_types             JSONB,   -- [{type, percentage}]
    primary_waste_type      waste_type,

    -- Segmentation (SAM2)
    garbage_area_m2         FLOAT,
    coverage_percentage     FLOAT,

    -- Severity
    severity                severity_level,
    pollution_score         FLOAT CHECK (pollution_score BETWEEN 0 AND 100),

    -- Illegal Dump
    illegal_dump_type       illegal_dump_type NOT NULL DEFAULT 'unknown',
    is_illegal              BOOLEAN NOT NULL DEFAULT FALSE,

    -- Meta
    model_version           VARCHAR(50) NOT NULL DEFAULT 'mock-v1.0',
    processing_time_ms      INTEGER,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictions_severity ON ai_predictions(severity);
CREATE INDEX idx_predictions_waste_type ON ai_predictions(primary_waste_type);

-- ─── GARBAGE REPORTS ─────────────────────────────────────────────────────────

CREATE TABLE garbage_reports (
    id              SERIAL PRIMARY KEY,
    reporter_id     INTEGER NOT NULL REFERENCES users(id),
    image_url       VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),

    -- Location (stored as both lat/lng and PostGIS point for spatial queries)
    latitude        FLOAT NOT NULL,
    longitude       FLOAT NOT NULL,
    location        GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
                        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
                    ) STORED,
    address         VARCHAR(500),
    ward            VARCHAR(50),

    description     TEXT,
    status          report_status NOT NULL DEFAULT 'pending',
    prediction_id   INTEGER REFERENCES ai_predictions(id),
    assignment_id   INTEGER,  -- FK added after cleanup_assignments

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_reporter ON garbage_reports(reporter_id);
CREATE INDEX idx_reports_status ON garbage_reports(status);
CREATE INDEX idx_reports_ward ON garbage_reports(ward);
CREATE INDEX idx_reports_location ON garbage_reports USING GIST(location);
CREATE INDEX idx_reports_created_at ON garbage_reports(created_at DESC);

-- Add FK for predictions
ALTER TABLE ai_predictions ADD CONSTRAINT fk_prediction_report
    FOREIGN KEY (report_id) REFERENCES garbage_reports(id);

-- ─── CLEANUP ASSIGNMENTS ─────────────────────────────────────────────────────

CREATE TABLE cleanup_assignments (
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

-- Add assignment FK back to reports
ALTER TABLE garbage_reports ADD CONSTRAINT fk_report_assignment
    FOREIGN KEY (assignment_id) REFERENCES cleanup_assignments(id);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    type        VARCHAR(50) NOT NULL,  -- info | warning | critical | success
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    report_id   INTEGER REFERENCES garbage_reports(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ─── ECO POINTS LOG ───────────────────────────────────────────────────────────

CREATE TABLE eco_points_log (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    points      INTEGER NOT NULL,
    reason      VARCHAR(255) NOT NULL,
    report_id   INTEGER REFERENCES garbage_reports(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eco_points_user ON eco_points_log(user_id);

-- ─── USEFUL VIEWS ────────────────────────────────────────────────────────────

-- Active pollution sites with severity
CREATE VIEW v_pollution_sites AS
SELECT
    r.id,
    r.latitude,
    r.longitude,
    r.ward,
    r.address,
    r.status,
    r.created_at,
    p.severity,
    p.pollution_score,
    p.primary_waste_type,
    p.garbage_area_m2,
    p.is_illegal,
    p.illegal_dump_type
FROM garbage_reports r
LEFT JOIN ai_predictions p ON r.prediction_id = p.id
WHERE r.status NOT IN ('completed', 'rejected');

-- Ward-level stats
CREATE VIEW v_ward_stats AS
SELECT
    r.ward,
    COUNT(*) AS total_reports,
    SUM(CASE WHEN p.severity = 'critical' THEN 1 ELSE 0 END) AS critical_count,
    SUM(CASE WHEN p.severity = 'high' THEN 1 ELSE 0 END) AS high_count,
    AVG(p.pollution_score) AS avg_pollution_score,
    MODE() WITHIN GROUP (ORDER BY p.primary_waste_type) AS dominant_waste_type
FROM garbage_reports r
LEFT JOIN ai_predictions p ON r.prediction_id = p.id
WHERE r.ward IS NOT NULL
GROUP BY r.ward
ORDER BY avg_pollution_score DESC NULLS LAST;

-- ─── SPATIAL QUERY EXAMPLES ──────────────────────────────────────────────────
-- Find reports within 2km of a point:
-- SELECT * FROM garbage_reports
-- WHERE ST_DWithin(location, ST_MakePoint(77.5946, 12.9716)::geography, 2000);

-- Find the nearest garbage site to a vehicle:
-- SELECT r.id, ST_Distance(r.location, v.current_location) AS dist
-- FROM garbage_reports r, vehicles v
-- WHERE v.id = 1
-- ORDER BY dist LIMIT 10;
