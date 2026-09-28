# GlitzUp PestCheck — Admin & QA Supervisor Operating Manual

**Target Audience**: QA Supervisors, Facility Operations Managers, EHS Officers  
**Entity**: GlitzUp Facility Management (Chennai & South India Division)  
**Portal URL**: `http://localhost:3000` (or `https://pestcheck.glitzupfm.in`)

---

## 1. Overview & System Objectives

The **GlitzUp PestCheck** Admin Portal empowers QA supervisors to review, audit, and certify all pest control and environmental sanitization services performed across commercial accounts (hotels, hospitals, corporate IT parks, residential complexes).

Key objectives:
1. Ensure 100% adherence to **Central Insecticides Board & Registration Committee (CIBRC)** chemical formulation standards.
2. Confirm field technicians are physically on-site via **tamper-proof GPS Geotagging**.
3. Verify pest mortality and treatment efficacy with **AI Vision Recognition**.
4. Maintain an **immutable audit ledger** for client SLAs and ISO 9001:2015 quality audits.

---

## 2. Access & Dashboard Orientation

### 2.1 Default Credentials
- **Email**: `admin@glitzupfm.in`
- **Password**: `GlitzUp@2026!`
- **Role**: `QA Supervisor / Lead`

### 2.2 Executive KPI Strip
- **Total Inspections**: Cumulative inspections logged across all properties.
- **Compliance Rate**: Percentage of completed checks approved without safety violations (Target: $\ge 95\%$).
- **Pending QA Approvals**: Inspections awaiting QA sign-off (SLA: $< 4\text{ hours}$).
- **Rejection Rate**: Ratio of inspections returned for correction or re-check.

---

## 3. Inspection Review & Decision Workflow

When a field technician completes a check, the record enters the **Active Field Inspection Review Queue**:

1. **Open Record**: Click **Review & Sign** on any row in the queue.
2. **Review Telemetry**:
   - Verify the **GPS Geotag** coordinates match the registered client facility.
   - Look for the green **Geofence Verified On-Site** badge.
3. **Verify Chemical & Dosage**:
   - Ensure the chemical compound matches the pest type (e.g. *Imidacloprid 30.5% SC* for Termites; *Bromadiolone 0.005% RB* for Rodents).
   - Check that the statutory CIBRC Registration number is recorded.
4. **Inspect Photo & AI Vision Box**:
   - The system highlights detected pests (e.g., *Subterranean Termite*, *German Cockroach*, *Norway Rat*) along with the computer vision confidence score.
5. **Verify Signatures**:
   - Ensure both the **Technician Signature** and the **Client Authorized Representative** sign-offs are present.
6. **Execute Decision**:
   - **Approve Inspection**: Commits the audit record, marks the inspection as officially certified, and updates the client SLA.
   - **Reject & Request Re-Check**: Prompts for a mandatory rejection reason (e.g. *blurry photo, incorrect dilution, client signature absent*). The technician will be notified immediately to re-perform the check.
   - **Flag for Investigation**: Used for severe structural or infestation risks requiring a joint site inspection with the client's Chief Engineer.

---

## 4. Generating Reports & Certificates

- **Print / Save PDF Certificate**:
  Click **Print Certificate** in the modal or table. This renders an official compliance certificate with company headers, GPS watermark, checklist, chemical dosage, and digital seal.
- **Export Excel Ledger**:
  Click **Export Excel** in the top navigation bar to download the raw compliance ledger (CSV format) for quarterly audits and insurer reviews.

---

## 5. Task Assignment & Technician Reminders

1. Click **Assign Task** in the top navigation bar.
2. Select the target property (e.g., *ITC Grand Chola*, *Apollo Hospitals*).
3. Assign the certified field specialist and target completion date.
4. Choose the dispatch channel (**SMS via Twilio**, **Push Notification**, or **Email**).
5. Click **Dispatch Task** to transmit the work order directly to the technician's mobile terminal.
