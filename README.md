# GlitzUp PestCheck 🐜🛡️
### Field Service Compliance & Inspection Platform for GlitzUp Facility Management

[![Website: glitzupfm.in](https://img.shields.io/badge/GlitzUp-Facility%20Management-012341?style=flat&logo=google-chrome&logoColor=white)](https://www.glitzupfm.in/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20PostgreSQL-2C3E50)](backend/)
[![Web Admin](https://img.shields.io/badge/Admin%20Web-React%20%7C%20Tailwind%20%7C%20Chart.js-E74C3C)](web/)
[![Mobile App](https://img.shields.io/badge/Mobile%20App-React%20Native%20%7C%20Expo-F1C40F)](mobile/)
[![Compliance](https://img.shields.io/badge/Compliance-CIBRC%20%7C%20ISO%209001%20%7C%20ISO%2014001-10B981)](docs/COMPLIANCE_AND_SECURITY.md)

---

## 📖 Overview

**GlitzUp PestCheck** is a full-stack, enterprise-grade field service compliance and pest control inspection system purpose-built for **GlitzUp Facility Management**'s pest control division in Chennai & South India.

The platform provides a seamless digital workflow between:
1. **Field Technicians (Mobile)**: Conducting on-site inspections, capturing GPS geotags with geofence verification, taking evidence photos with AI pest bounding-box detection, logging CIBRC chemical dosages, recording voice notes, capturing dual digital signatures, and working offline with auto-sync.
2. **Admins / QA Supervisors (Web Dashboard)**: Reviewing real-time inspection queues, auditing GPS location tags, verifying chemical safety standards, approving/rejecting/flagging inspections, tracking technician performance analytics, and exporting certified PDF compliance certificates or Excel audit ledgers.

---

## 🎨 UI/UX Wireframes

### Mobile Inspection Terminal (React Native)
![Mobile Wireframe](file:///C:/Users/Jashwanth/.gemini/antigravity-ide/brain/32b08ee1-7666-48af-8ee0-516f6130d3e7/mobile_wireframe_1789927755034.jpg)

### Web Admin QA Dashboard (React + Tailwind)
![Admin Wireframe](file:///C:/Users/Jashwanth/.gemini/antigravity-ide/brain/32b08ee1-7666-48af-8ee0-516f6130d3e7/admin_wireframe_1789927771292.jpg)

---

## 🗂️ Project Structure

```
glitzup-pestcheck/
├── backend/                  # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/           # Database setup, migrations, and seed data
│   │   ├── controllers/      # Auth, Inspections, Analytics, Reports, AI Vision
│   │   ├── middleware/       # JWT Authentication & RBAC guards
│   │   ├── routes/           # REST API Route declarations
│   │   └── server.js         # Server bootstrap
│   └── package.json
│
├── web/                      # React 18 + Vite + Tailwind CSS Admin Portal
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, KpiCards, InspectionTable,
│   │   │                     # InspectionModal, AnalyticsCharts, MobileSimulator
│   │   ├── App.jsx           # Application state & dashboard view router
│   │   └── index.css         # GlitzUp brand palette design system
│   ├── vite.config.js
│   └── package.json
│
├── mobile/                   # React Native (Expo) Native Mobile App
│   ├── src/
│   │   ├── screens/          # Login, InspectionList, InspectionForm
│   │   └── services/         # Offline storage queue & API sync client
│   ├── app.json              # Expo configuration (Camera, Location permissions)
│   └── App.js
│
└── docs/                     # Enterprise Documentation Deliverables
    ├── schema.sql            # Production PostgreSQL 15 DDL
    ├── DATABASE_SCHEMA.md    # Schema definitions & ER diagram
    ├── API_DOCUMENTATION.md  # Complete REST API specification
    ├── DEPLOYMENT_GUIDE.md   # AWS ECS, RDS, S3, Docker, & EAS guide
    ├── ADMIN_USER_MANUAL.md  # QA Supervisor & Facility Manager manual
    ├── TECHNICIAN_USER_MANUAL.md # Field Technician mobile handbook
    └── COMPLIANCE_AND_SECURITY.md # CIBRC, ISO 9001/14001, DPDP Act
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js LTS (v20+ or v24+) & npm

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000 (Database auto-migrates and seeds!)
# Health Check: http://localhost:5000/api/health
```

### 2. Start the Web Admin Dashboard
```bash
cd web
npm install
npm run dev
# Dashboard runs on http://localhost:3000
```

### 3. Native Mobile App (Expo)
```bash
cd mobile
npm install
npm start
# Run on Android emulator: 'npm run android'
# Run on iOS simulator: 'npm run ios'
```

> **Instant In-Browser Mobile Testing**: The Web Dashboard includes an integrated **Field Mobile Simulator Modal** so QA managers and clients can test the complete field technician mobile experience directly inside the web browser!

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin / QA Supervisor** | `admin@glitzupfm.in` | `GlitzUp@2026!` | S. Karthikeyan (QA Lead, GZ-QA-001) |
| **QA Supervisor** | `qa.priya@glitzupfm.in` | `GlitzUp@2026!` | Priya Sundaram (QA-SUP-14) |
| **Field Technician** | `tech.rajesh@glitzupfm.in` | `Tech@2026!` | Rajesh Kumar (GZ-TECH-042) |
| **Field Technician** | `tech.anand@glitzupfm.in` | `Tech@2026!` | Anand Murugan (GZ-TECH-088) |

---

## 🏢 Pre-Configured GlitzUp Client Facilities (Chennai)
1. **ITC Grand Chola Luxury Hotel** — Guindy, Chennai
2. **Apollo Main Hospital** — Greams Road, Thousand Lights, Chennai
3. **DLF Cybercity IT Park** — Manapakkam, Chennai
4. **Hyatt Regency Chennai** — Anna Salai, Teynampet, Chennai
5. **TCS Signature Campus** — SIPCOT IT Park, Siruseri, Chennai
