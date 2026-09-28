# GlitzUp PestCheck — Field Technician Mobile Manual

**Target Audience**: Certified Field Pest Technicians, Applicators, On-Site Leads  
**App Name**: GlitzUp PestCheck (React Native Android & iOS)  
**Company**: GlitzUp Facility Management Services

---

## 1. Daily Sign-In & Offline Readiness

1. **Launch App**: Open **GlitzUp PestCheck** on your Android or iOS device.
2. **Sign In**: Enter your official GlitzUp technician email and password:
   - Example: `tech.rajesh@glitzupfm.in` / `Tech@2026!`
3. **Offline Caching**:
   - The app automatically downloads all active client facilities and checklist protocols to your local device memory.
   - **Important**: If you are entering a basement, server room, or low-signal area, the app will seamlessly switch to **Offline Mode**. All photos, GPS stamps, and signatures will be stored in your local queue and will upload automatically once cellular connection is restored.

---

## 2. Performing a Site Inspection

### Step 1: Select Protocol Template
Choose the appropriate protocol based on your work order:
- **Termite Inspection**: Chemical barrier drilling, perimeter mud tubes, moisture readings.
- **Rodent Control**: Tamper-proof bait station replenishment, burrows, trap reset.
- **14-Day Aftercare**: Post-treatment mortality audit, barrier efficacy.
- **Client Handover**: Property manager review, odor rating, NPS rating.

### Step 2: Live GPS Telemetry
- Stand within the client facility boundaries.
- Tap **Update GPS**. Ensure your device location permission is set to **Precise / Always Allow**.
- The app checks your coordinates against the property geofence. When verified, a green **✓ Geofence Verified** badge appears.

### Step 3: Photographic Evidence & AI Vision Scan
- Aim camera at the affected area (e.g. skirting board mud tubes or bait box).
- Tap **Capture Photo**.
- Tap **✦ AI Vision Scan**: The GlitzUp pest detection model scans the image to identify species (e.g., *Subterranean Termite (98% confidence)*) and adds a permanent GPS watermark.

### Step 4: Checklist & Chemical Records
- Answer all checklist items (toggling between **PASS** and **DEFICIENCY**).
- Verify the active chemical formulation and dilution dosage as per **CIBRC India norms**:
  - Example: *Imidacloprid 30.5% SC @ 10.5 ml per 5L water*.

### Step 5: Dual Digital Signatures & Client Handover
- **Technician Sign-off**: Sign your name in the technician signature box.
- **Client Representative**: Hand device to client property manager / EHS officer to sign and select star satisfaction rating (1 to 5 stars).

---

## 3. Submitting & Offline Queue Sync

- **If Online**: Tap **Submit Inspection (Sync Ready)**. The inspection transmits to the QA Supervisor review portal in real time.
- **If Offline**: Tap **Save to Offline Queue**. When you return to network reception, open the app and tap **Sync Now** to transmit all batched inspections.
