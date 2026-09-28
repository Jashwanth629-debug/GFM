-- ==============================================================================
-- GlitzUp PestCheck - Enterprise Database Schema (PostgreSQL 15+)
-- Client: GlitzUp Facility Management (https://www.glitzupfm.in)
-- Purpose: Field Inspection, Audit Trail, and QA Compliance Management
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
CREATE TYPE user_role_enum AS ENUM ('admin', 'qa_supervisor', 'field_technician', 'client_rep');
CREATE TYPE inspection_status_enum AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'flagged_investigation');
CREATE TYPE pest_category_enum AS ENUM ('termite', 'rodent', 'cockroach', 'bedbug', 'general_insects', 'mosquito_larval');
CREATE TYPE severity_level_enum AS ENUM ('none', 'low', 'moderate', 'high', 'critical');
CREATE TYPE sync_status_enum AS ENUM ('synced', 'pending_sync', 'sync_failed');

-- 2. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),
    role user_role_enum NOT NULL DEFAULT 'field_technician',
    employee_code VARCHAR(50) UNIQUE,
    badge_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 3. CLIENT FACILITIES TABLE
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(200) NOT NULL,
    property_name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Chennai',
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    geofence_radius_meters INTEGER DEFAULT 150,
    contact_person VARCHAR(150),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facilities_client ON facilities(client_name);
CREATE INDEX idx_facilities_coords ON facilities(latitude, longitude);

-- 4. INSPECTION TEMPLATES TABLE
CREATE TABLE inspection_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category pest_category_enum NOT NULL,
    estimated_duration_minutes INTEGER DEFAULT 45,
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TEMPLATE CHECKLIST ITEMS TABLE
CREATE TABLE template_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES inspection_templates(id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL,
    label VARCHAR(255) NOT NULL,
    help_text TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    field_type VARCHAR(50) DEFAULT 'boolean_pass_fail', -- 'boolean_pass_fail', 'slider_severity', 'text', 'photo_required'
    threshold_warning_value VARCHAR(100)
);

CREATE INDEX idx_template_items ON template_checklist_items(template_id, item_order);

-- 6. INSPECTIONS TABLE (MAIN CORE TABLE)
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. GZ-2026-TK-804
    template_id UUID NOT NULL REFERENCES inspection_templates(id),
    facility_id UUID NOT NULL REFERENCES facilities(id),
    technician_id UUID NOT NULL REFERENCES users(id),
    qa_supervisor_id UUID REFERENCES users(id),
    status inspection_status_enum NOT NULL DEFAULT 'pending_review',
    category pest_category_enum NOT NULL,
    
    -- GPS Verification
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    gps_latitude DECIMAL(10, 7) NOT NULL,
    gps_longitude DECIMAL(10, 7) NOT NULL,
    gps_accuracy_meters DECIMAL(6, 2),
    is_geofence_verified BOOLEAN DEFAULT TRUE,
    
    -- Severity & Observations
    overall_severity severity_level_enum DEFAULT 'none',
    technician_notes TEXT,
    supervisor_notes TEXT,
    rejection_reason TEXT,
    chemical_used VARCHAR(200),
    chemical_dosage VARCHAR(100),
    cibrc_registration_no VARCHAR(100), -- Central Insecticides Board & Registration Committee India
    
    -- Sign-offs & Compliance
    technician_signature_url TEXT,
    technician_signed_at TIMESTAMP WITH TIME ZONE,
    client_signature_name VARCHAR(150),
    client_signature_url TEXT,
    client_signed_at TIMESTAMP WITH TIME ZONE,
    client_feedback_rating INTEGER CHECK (client_feedback_rating BETWEEN 1 AND 5),
    
    -- AI Diagnostics
    ai_pest_detected VARCHAR(100),
    ai_confidence_score DECIMAL(5, 2),
    
    -- Sync tracking
    sync_status sync_status_enum DEFAULT 'synced',
    offline_created_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_tech ON inspections(technician_id);
CREATE INDEX idx_inspections_facility ON inspections(facility_id);
CREATE INDEX idx_inspections_dates ON inspections(completed_at);
CREATE INDEX idx_inspections_category ON inspections(category);

-- 7. INSPECTION ITEM RESPONSES TABLE
CREATE TABLE inspection_checklist_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    checklist_item_id UUID REFERENCES template_checklist_items(id),
    item_label VARCHAR(255) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT TRUE,
    value VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inspection_responses ON inspection_checklist_responses(inspection_id);

-- 8. INSPECTION EVIDENCE PHOTOS TABLE
CREATE TABLE inspection_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    photo_type VARCHAR(50) DEFAULT 'evidence', -- 'evidence', 'chemical_bottle', 'trap_verification', 'post_treatment'
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    gps_latitude DECIMAL(10, 7),
    gps_longitude DECIMAL(10, 7),
    ai_detected_pest VARCHAR(100),
    ai_confidence DECIMAL(5, 2),
    ai_bounding_box JSONB, -- Coordinates [ymin, xmin, ymax, xmax]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inspection_photos ON inspection_photos(inspection_id);

-- 9. AUDIT TRAIL LOGS (IMMUTABLE COMPLIANCE LEDGER)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name VARCHAR(50) NOT NULL, -- 'inspections', 'users', 'facilities'
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'CREATED', 'STATUS_CHANGE', 'APPROVED', 'REJECTED', 'FLAGGED', 'EXPORTED'
    performed_by UUID REFERENCES users(id),
    performed_by_name VARCHAR(150),
    previous_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    comments TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- 10. NOTIFICATION DISPATCH LOGS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id),
    inspection_id UUID REFERENCES inspections(id),
    channel VARCHAR(30) NOT NULL, -- 'push', 'email', 'sms'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automatic Updated_At Trigger Function
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_inspections_updated_at BEFORE UPDATE ON inspections FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
