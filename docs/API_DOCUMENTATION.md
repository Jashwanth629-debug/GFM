# GlitzUp PestCheck — Enterprise REST API Documentation

**Base URL**: `http://localhost:5000/api` (or `https://api.pestcheck.glitzupfm.in/api`)  
**Authorization**: `Authorization: Bearer <JWT_TOKEN>` (passed in HTTP request headers)

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a QA Supervisor or Field Technician.

**Request Body**:
```json
{
  "email": "admin@glitzupfm.in",
  "password": "GlitzUp@2026!"
}
```

**Response (200 OK)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-admin-01",
    "email": "admin@glitzupfm.in",
    "full_name": "S. Karthikeyan (QA Lead)",
    "role": "admin",
    "employee_code": "GZ-QA-001",
    "phone_number": "+91 98401 23456"
  }
}
```

---

## 2. Inspections & Field Service

### `GET /api/inspections`
Retrieves a filterable list of all field inspections.

**Query Parameters**:
- `status`: `pending_review` | `approved` | `rejected` | `flagged_investigation`
- `category`: `termite` | `rodent` | `aftercare` | `client_feedback`
- `facility_id`: UUID of property
- `technician_id`: UUID of technician
- `search`: Search text (Client name, inspection ID, technician name)

**Response (200 OK)**:
```json
{
  "inspections": [
    {
      "id": "insp-01",
      "inspection_number": "GZ-2026-TK-804",
      "client_name": "ITC Hotels Group",
      "property_name": "ITC Grand Chola Luxury Hotel",
      "technician_name": "Rajesh Kumar",
      "technician_code": "GZ-TECH-042",
      "category": "termite",
      "status": "pending_review",
      "gps_latitude": 13.0108,
      "gps_longitude": 80.2209,
      "is_geofence_verified": 1,
      "ai_pest_detected": "Subterranean Termite (Coptotermes formosanus)",
      "ai_confidence_score": 98.4,
      "completed_at": "2026-03-20T10:20:00Z"
    }
  ],
  "total": 1
}
```

---

### `POST /api/inspections`
Submits a field inspection from mobile (online or batched offline queue).

**Request Body**:
```json
{
  "template_id": "tmpl-termite",
  "facility_id": "fac-01",
  "category": "termite",
  "gps_latitude": 13.0108,
  "gps_longitude": 80.2209,
  "overall_severity": "high",
  "technician_notes": "Active mud tube along baseboard. Injected 12L Imidacloprid.",
  "chemical_used": "Imidacloprid 30.5% SC",
  "chemical_dosage": "10.5 ml / 5L water",
  "cibrc_registration_no": "CIR-65239/2018-SC-194",
  "technician_signature_url": "data:image/svg+xml;utf8,...",
  "client_signature_name": "V. Ramanathan",
  "client_signature_url": "data:image/svg+xml;utf8,...",
  "client_feedback_rating": 5,
  "checklist_responses": [
    { "item_label": "Mud tubes detected", "passed": false, "notes": "Active mud tube found" },
    { "item_label": "Chemical Barrier Intact", "passed": true, "notes": "Drill holes sealed" }
  ],
  "photos": [
    {
      "photo_url": "https://storage.glitzupfm.in/inspections/evidence_01.jpg",
      "caption": "Baseboard termite gallery evidence",
      "ai_detected_pest": "Subterranean Termite",
      "ai_confidence": 98.4
    }
  ]
}
```

---

### `PUT /api/inspections/:id/status`
Updates status upon QA supervisor review (Approve / Reject / Flag).

**Request Body**:
```json
{
  "status": "approved",
  "supervisor_notes": "Audited and verified against ISO 9001 SOP. Photo evidence clear.",
  "rejection_reason": null
}
```

---

## 3. Analytics & Export Reports

### `GET /api/analytics`
Fetches executive KPI figures, compliance rate, recurrence trends, and technician rankings.

### `GET /api/reports/pdf/:id`
Returns a print-ready, high-resolution compliance certificate with digital seal, CIBRC chemical verification, GPS watermark, and technician/client signatures.

### `GET /api/reports/excel`
Streams a standard CSV compliance ledger export formatted for auditors, insurance carriers, and corporate clients.

---

## 4. AI Vision Inference

### `POST /api/ai/pest-detect`
Submits an image for urban pest identification and bounding box inference.

**Response**:
```json
{
  "success": true,
  "detection": {
    "pest_identified": "Subterranean Termite (Coptotermes formosanus)",
    "confidence_score": 98.4,
    "severity": "high",
    "recommended_chemical": "Imidacloprid 30.5% SC",
    "recommended_action": "Perform sub-slab chemical barrier drilling at 30cm spacing.",
    "model_name": "GlitzUp-UrbanPestNet-v3.2"
  }
}
```
