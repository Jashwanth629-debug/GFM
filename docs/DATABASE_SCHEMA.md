# GlitzUp PestCheck — Database Architecture & Schema Documentation

## 1. System Overview
**GlitzUp PestCheck** operates on a robust relational data model designed for high auditability, strict regulatory compliance (Central Insecticides Board & Registration Committee India, ISO 9001:2015 Quality Management, and ISO 14001:2015 Environmental Safety), and offline-first synchronization from field technicians.

The data layer supports both **PostgreSQL 15+** (for enterprise production deployment on AWS RDS / Supabase) and local lightweight embedded persistence for local development.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ INSPECTIONS : "technician performs"
    USERS ||--o{ INSPECTIONS : "qa approves"
    USERS ||--o{ AUDIT_LOGS : "actor triggers"
    FACILITIES ||--o{ INSPECTIONS : "location inspected"
    INSPECTION_TEMPLATES ||--o{ TEMPLATE_CHECKLIST_ITEMS : "contains"
    INSPECTION_TEMPLATES ||--o{ INSPECTIONS : "instantiated by"
    INSPECTIONS ||--o{ INSPECTION_CHECKLIST_RESPONSES : "records"
    INSPECTIONS ||--o{ INSPECTION_PHOTOS : "contains evidence"
    INSPECTIONS ||--o{ NOTIFICATIONS : "triggers alerts"
    INSPECTIONS ||--o{ AUDIT_LOGS : "immutable audit trail"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role "admin | qa_supervisor | field_technician"
        string employee_code UK
        string phone_number
        boolean is_active
        timestamp created_at
    }

    FACILITIES {
        uuid id PK
        string client_name
        string property_name
        text address
        string city
        decimal latitude
        decimal longitude
        int geofence_radius_meters
        string contact_person
        string contact_phone
    }

    INSPECTION_TEMPLATES {
        uuid id PK
        string template_code UK
        string title
        string category "termite | rodent | aftercare | client_feedback"
        int estimated_duration_minutes
        int version
    }

    TEMPLATE_CHECKLIST_ITEMS {
        uuid id PK
        uuid template_id FK
        int item_order
        string label
        string field_type
        boolean is_mandatory
    }

    INSPECTIONS {
        uuid id PK
        string inspection_number UK
        uuid template_id FK
        uuid facility_id FK
        uuid technician_id FK
        uuid qa_supervisor_id FK
        string status "pending_review | approved | rejected | flagged"
        string category
        decimal gps_latitude
        decimal gps_longitude
        decimal gps_accuracy_meters
        boolean is_geofence_verified
        string overall_severity "none | low | moderate | high | critical"
        text technician_notes
        text supervisor_notes
        text rejection_reason
        string chemical_used
        string chemical_dosage
        string cibrc_registration_no
        text technician_signature_url
        text client_signature_url
        string client_signature_name
        int client_feedback_rating
        string ai_pest_detected
        decimal ai_confidence_score
        timestamp started_at
        timestamp completed_at
    }

    INSPECTION_PHOTOS {
        uuid id PK
        uuid inspection_id FK
        text photo_url
        string photo_type
        decimal gps_latitude
        decimal gps_longitude
        string ai_detected_pest
        decimal ai_confidence
        jsonb ai_bounding_box
        timestamp captured_at
    }

    AUDIT_LOGS {
        uuid id PK
        string entity_name
        uuid entity_id
        string action "CREATED | STATUS_CHANGE | APPROVED | REJECTED | FLAGGED"
        uuid performed_by FK
        string performed_by_name
        jsonb previous_state
        jsonb new_state
        text comments
        timestamp timestamp
    }
```

---

## 3. Detailed Data Dictionary

### 3.1 `users`
Represents all system actors with Role-Based Access Control (RBAC).

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique user identifier |
| `email` | VARCHAR(255) | Unique, Not Null | Login email address |
| `password_hash` | VARCHAR(255) | Not Null | Bcrypt hashed password |
| `full_name` | VARCHAR(150) | Not Null | Official legal name |
| `role` | ENUM | Not Null | `admin`, `qa_supervisor`, `field_technician` |
| `employee_code`| VARCHAR(50) | Unique | E.g. `GZ-TECH-042` |
| `phone_number` | VARCHAR(20) | Nullable | For SMS notification dispatches |
| `is_active` | BOOLEAN | Default TRUE | Soft-disable user access |

### 3.2 `facilities`
Commercial properties, hotels, hospitals, and corporate parks serviced by GlitzUp.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique facility ID |
| `client_name` | VARCHAR(200) | Not Null | E.g. `ITC Hotels`, `Apollo Hospitals` |
| `property_name`| VARCHAR(200) | Not Null | E.g. `ITC Grand Chola, Guindy` |
| `latitude` | DECIMAL(10, 7) | Not Null | Expected property latitude |
| `longitude` | DECIMAL(10, 7) | Not Null | Expected property longitude |
| `geofence_radius_meters` | INTEGER | Default 150 | Allowed perimeter buffer |

### 3.3 `inspections`
The central compliance record storing live telemetry, evidence, chemical dosages, and signatures.

| Field | Type | Description |
|---|---|---|
| `inspection_number` | VARCHAR(50) | Human-readable tracking code (e.g. `GZ-2026-TK-804`) |
| `status` | ENUM | `pending_review`, `approved`, `rejected`, `flagged_investigation` |
| `gps_latitude` / `gps_longitude` | DECIMAL | Live coordinates stamped at submission |
| `is_geofence_verified` | BOOLEAN | Verified against facility coordinates within geofence |
| `overall_severity` | ENUM | Pest severity assessment (`none`, `low`, `moderate`, `high`, `critical`) |
| `chemical_used` | VARCHAR(200) | Active chemical compound (e.g. `Imidacloprid 30.5% SC`) |
| `cibrc_registration_no`| VARCHAR(100) | CIBRC statutory registration license number |
| `technician_signature_url` | TEXT | Encoded vector/data URL of technician signature |
| `client_signature_url` | TEXT | Encoded vector/data URL of on-site client sign-off |
| `ai_pest_detected` | VARCHAR(100) | AI classification tag (e.g. `Subterranean Termite`) |
| `ai_confidence_score` | DECIMAL(5, 2)| AI vision confidence percentage (e.g. `98.4%`) |

### 3.4 `audit_logs` (Immutable Ledger)
Guarantees audit traceability for regulatory inspections and compliance audits.

| Field | Type | Description |
|---|---|---|
| `entity_name` | VARCHAR(50) | Table or entity affected (`inspections`) |
| `entity_id` | UUID | ID of the affected inspection |
| `action` | VARCHAR(50) | Action performed (`CREATED`, `STATUS_CHANGE`, `APPROVED`, `REJECTED`, `FLAGGED`) |
| `performed_by_name`| VARCHAR(150) | Full name of actor who approved or modified the record |
| `previous_state`| JSONB | Snapshot before change |
| `new_state` | JSONB | Snapshot after change |
| `comments` | TEXT | QA supervisor remarks or rejection reason |
| `timestamp` | TIMESTAMP | Stamped via server clock (UTC) |
