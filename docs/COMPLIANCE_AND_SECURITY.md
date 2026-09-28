# GlitzUp PestCheck — Statutory Compliance & Security Architecture

**Client**: GlitzUp Facility Management Services Pvt Ltd  
**Jurisdiction**: India (Tamil Nadu / Central) & International QA Frameworks  
**Applicable Standards**: CIBRC India, Insecticides Act 1968, ISO 9001:2015, ISO 14001:2015, OSHA, DPDP Act 2023

---

## 1. Statutory Pest Control & Chemical Regulations

### 1.1 Central Insecticides Board & Registration Committee (CIBRC)
Under the **Insecticides Act 1968** and **Insecticides Rules 1971**, all chemical formulations deployed across commercial, hospital, and residential properties must strictly adhere to certified dosages and manufacturer dilution ratios:

| Pest Target | Approved Active Ingredient | Certified Concentration | Max Application Dosage | CIBRC Standard |
|---|---|---|---|---|
| **Subterranean Termites** | Imidacloprid | 30.5% SC | 10.5 ml / 5L water | CIR-65239/2018 |
| **Rodent Control** | Bromadiolone | 0.005% RB | 20–40g per bait station | CIR-48192/2016 |
| **Cockroaches (Food Area)** | Fipronil | 0.05% Gel Bait | 0.1g micro-droplets | CIR-55401/2017 |
| **Hospital Aftercare** | Deltamethrin | 2.5% WP / Flowable | 10–20 ml / 1L water | CIR-39210/2014 |

*GlitzUp PestCheck enforces mandatory recording of the active chemical batch number, registration code, and dilution dosage before an inspection can be submitted.*

---

## 2. ISO 9001 & ISO 14001 EHS Protocols

### 2.1 ISO 9001:2015 (Quality Management System)
- **Traceability**: Every inspection generates a cryptographic SHA-256 digital stamp and immutable audit record linking the technician employee code, client signature, and QA supervisor sign-off.
- **SLA Adherence**: Rejections require documented root-cause remarks and trigger automated re-inspection tasks within 48 hours.

### 2.2 ISO 14001:2015 (Environmental Management System)
- **Container Disposal**: Inspection templates require verification of empty pesticide container triple-rinsing and certified hazardous waste disposal.
- **Water Source Protection**: Chemical barrier drill inspections ensure zero contamination of municipal water lines or groundwater aquifers.

---

## 3. Data Privacy, Geolocation & Security (DPDP Act 2023)

### 3.1 Digital Personal Data Protection (DPDP) Act 2023 (India)
- **Consent Architecture**: Client signatures and feedback ratings capture explicit digital consent for service compliance records.
- **Data Minimization**: GPS tracking is strictly constrained to geofenced active service intervals. Background location tracking is automatically deactivated when an inspection form is closed.

### 3.2 Security Controls
- **Authentication**: JWT tokens signed with HMAC-SHA256, strictly expiring after 30 days. Passwords hashed using bcrypt (cost factor 10).
- **Transport Layer Security**: All API communication and media uploads enforced over TLS 1.3 / HTTPS.
- **Audit Immutability**: The `audit_logs` table maintains an insert-only ledger preventing any modification or deletion of historical inspection events.
