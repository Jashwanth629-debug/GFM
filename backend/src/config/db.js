const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../../glitzup_pestcheck.db');
const db = new sqlite3.Database(dbPath);

// Helper for promise-based queries
db.asyncRun = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

db.asyncGet = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.asyncAll = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initDatabase() {
  console.log('Initializing GlitzUp PestCheck Database...');

  // Create Users Table
  await db.asyncRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone_number TEXT,
      role TEXT NOT NULL DEFAULT 'field_technician',
      employee_code TEXT UNIQUE,
      badge_number TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Facilities Table
  await db.asyncRun(`
    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      property_name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT DEFAULT 'Chennai',
      state TEXT DEFAULT 'Tamil Nadu',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      geofence_radius_meters INTEGER DEFAULT 150,
      contact_person TEXT,
      contact_phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Inspection Templates Table
  await db.asyncRun(`
    CREATE TABLE IF NOT EXISTS inspection_templates (
      id TEXT PRIMARY KEY,
      template_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      estimated_duration_minutes INTEGER DEFAULT 45,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Template Checklist Items Table
  await db.asyncRun(`
    CREATE TABLE IF NOT EXISTS template_checklist_items (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      item_order INTEGER NOT NULL,
      label TEXT NOT NULL,
      help_text TEXT,
      field_type TEXT DEFAULT 'boolean_pass_fail',
      is_mandatory INTEGER DEFAULT 1,
      FOREIGN KEY (template_id) REFERENCES inspection_templates(id)
    )
  `);

  // Create Inspections Table
  await db.asyncRun(`
    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY,
      inspection_number TEXT UNIQUE NOT NULL,
      template_id TEXT NOT NULL,
      facility_id TEXT NOT NULL,
      technician_id TEXT NOT NULL,
      qa_supervisor_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending_review',
      category TEXT NOT NULL,
      scheduled_at TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      gps_latitude REAL NOT NULL,
      gps_longitude REAL NOT NULL,
      gps_accuracy_meters REAL DEFAULT 4.2,
      is_geofence_verified INTEGER DEFAULT 1,
      overall_severity TEXT DEFAULT 'none',
      technician_notes TEXT,
      supervisor_notes TEXT,
      rejection_reason TEXT,
      chemical_used TEXT,
      chemical_dosage TEXT,
      cibrc_registration_no TEXT,
      technician_signature_url TEXT,
      technician_signed_at TEXT,
      client_signature_name TEXT,
      client_signature_url TEXT,
      client_signed_at TEXT,
      client_feedback_rating INTEGER DEFAULT 5,
      ai_pest_detected TEXT,
      ai_confidence_score REAL,
      sync_status TEXT DEFAULT 'synced',
      offline_created_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES inspection_templates(id),
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (technician_id) REFERENCES users(id)
    )
  `);

  // Create Inspection Checklist Responses Table
  await db.asyncRun(`
    CREATE TABLE IF NOT EXISTS inspection_checklist_responses (
      id TEXT PRIMARY KEY,
      inspection_id TEXT NOT NULL,
      item_label TEXT NOT NULL,
      passed INTEGER NOT NULL DEFAULT 1,
      value TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
    )
  `);

  // Create Inspection Photos Table
  await db.asyncRun(`
    CREATE TABLE IF NOT EXISTS inspection_photos (
      id TEXT PRIMARY KEY,
      inspection_id TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      caption TEXT,
      photo_type TEXT DEFAULT 'evidence',
      captured_at TEXT NOT NULL,
      gps_latitude REAL,
      gps_longitude REAL,
      ai_detected_pest TEXT,
      ai_confidence REAL,
      ai_bounding_box TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
    )
  `);

  // Create Audit Logs Table
  await db.asyncRun(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      entity_name TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      performed_by TEXT,
      performed_by_name TEXT,
      previous_state TEXT,
      new_state TEXT,
      comments TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Notifications Table
  await db.asyncRun(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_id TEXT,
      inspection_id TEXT,
      channel TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      sent_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default data if empty
  await seedInitialData();
}

async function seedInitialData() {
  const userCount = await db.asyncGet('SELECT count(*) as count FROM users');
  if (userCount && userCount.count > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial GlitzUp enterprise data...');

  // 1. Seed Users
  const adminPass = await bcrypt.hash('GlitzUp@2026!', 10);
  const techPass = await bcrypt.hash('Tech@2026!', 10);

  const users = [
    {
      id: 'usr-admin-01',
      email: 'admin@glitzupfm.in',
      password_hash: adminPass,
      full_name: 'S. Karthikeyan (QA Lead)',
      phone_number: '+91 98401 23456',
      role: 'admin',
      employee_code: 'GZ-QA-001',
      badge_number: 'QA-LEAD-99'
    },
    {
      id: 'usr-supervisor-01',
      email: 'qa.priya@glitzupfm.in',
      password_hash: adminPass,
      full_name: 'Priya Sundaram (QA Supervisor)',
      phone_number: '+91 98402 34567',
      role: 'qa_supervisor',
      employee_code: 'GZ-QA-012',
      badge_number: 'QA-SUP-14'
    },
    {
      id: 'usr-tech-01',
      email: 'tech.rajesh@glitzupfm.in',
      password_hash: techPass,
      full_name: 'Rajesh Kumar',
      phone_number: '+91 98403 45678',
      role: 'field_technician',
      employee_code: 'GZ-TECH-042',
      badge_number: 'TECH-42'
    },
    {
      id: 'usr-tech-02',
      email: 'tech.anand@glitzupfm.in',
      password_hash: techPass,
      full_name: 'Anand Murugan',
      phone_number: '+91 98404 56789',
      role: 'field_technician',
      employee_code: 'GZ-TECH-088',
      badge_number: 'TECH-88'
    },
    {
      id: 'usr-tech-03',
      email: 'tech.selvam@glitzupfm.in',
      password_hash: techPass,
      full_name: 'Selvam Perumal',
      phone_number: '+91 98405 67890',
      role: 'field_technician',
      employee_code: 'GZ-TECH-103',
      badge_number: 'TECH-103'
    }
  ];

  for (const u of users) {
    await db.asyncRun(
      `INSERT INTO users (id, email, password_hash, full_name, phone_number, role, employee_code, badge_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.email, u.password_hash, u.full_name, u.phone_number, u.role, u.employee_code, u.badge_number]
    );
  }

  // 2. Seed Facilities
  const facilities = [
    {
      id: 'fac-01',
      client_name: 'ITC Hotels Group',
      property_name: 'ITC Grand Chola Luxury Hotel',
      address: '63, Mount Road, Guindy, Chennai, Tamil Nadu 600032',
      latitude: 13.0105,
      longitude: 80.2207,
      contact_person: 'Mr. V. Ramanathan (Facility Director)',
      contact_phone: '+91 44 2220 0000'
    },
    {
      id: 'fac-02',
      client_name: 'Apollo Hospitals Enterprise',
      property_name: 'Apollo Main Hospital - Greams Road',
      address: '21, Greams Lane, Thousand Lights, Chennai, Tamil Nadu 600006',
      latitude: 13.0604,
      longitude: 80.2508,
      contact_person: 'Dr. Meenakshi Sundaram (Operations Head)',
      contact_phone: '+91 44 2829 0200'
    },
    {
      id: 'fac-03',
      client_name: 'DLF Cybercity Assets',
      property_name: 'DLF Cybercity IT Park - Block 5',
      address: '1/124, Mount Poonamallee Road, Manapakkam, Chennai 600089',
      latitude: 13.0189,
      longitude: 80.1706,
      contact_person: 'Mr. K. Narayanan (EHS Lead)',
      contact_phone: '+91 44 4299 8000'
    },
    {
      id: 'fac-04',
      client_name: 'Hyatt Hotels',
      property_name: 'Hyatt Regency Chennai',
      address: '365, Anna Salai, Teynampet, Chennai, Tamil Nadu 600018',
      latitude: 13.0450,
      longitude: 80.2482,
      contact_person: 'Chef Vikram Roy (F&B QA Manager)',
      contact_phone: '+91 44 6100 1234'
    },
    {
      id: 'fac-05',
      client_name: 'Tata Consultancy Services',
      property_name: 'TCS Signature Campus - Siruseri SIPCOT',
      address: 'SIPCOT IT Park, Siruseri, Old Mahabalipuram Rd, Chennai 603103',
      latitude: 12.8257,
      longitude: 80.2185,
      contact_person: 'Mr. Dinesh Balan (Estate Officer)',
      contact_phone: '+91 44 6790 0000'
    }
  ];

  for (const f of facilities) {
    await db.asyncRun(
      `INSERT INTO facilities (id, client_name, property_name, address, latitude, longitude, contact_person, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [f.id, f.client_name, f.property_name, f.address, f.latitude, f.longitude, f.contact_person, f.contact_phone]
    );
  }

  // 3. Seed Templates
  const templates = [
    {
      id: 'tmpl-termite',
      template_code: 'TERMITE_INSPECT',
      title: 'Termite Inspection & Chemical Barrier Verification',
      description: 'Comprehensive subterranean and drywood termite inspection for perimeter, wooden baseboards, expansion joints, and sub-soil barrier integrity.',
      category: 'termite',
      estimated_duration_minutes: 60
    },
    {
      id: 'tmpl-rodent',
      template_code: 'RODENT_VERIFY',
      title: 'Rodent Control & Bait Station Audit',
      description: 'Perimeter bait station inspection, tamper-resistant box check, droppings/runways identification, and mechanical trap resetting.',
      category: 'rodent',
      estimated_duration_minutes: 45
    },
    {
      id: 'tmpl-aftercare',
      template_code: 'AFTERCARE_CHECK',
      title: '14-Day Post-Treatment Efficacy Audit',
      description: 'Post-application inspection to audit pest mortality rates, residual chemical effectiveness, and secondary infestation risks.',
      category: 'aftercare',
      estimated_duration_minutes: 30
    },
    {
      id: 'tmpl-feedback',
      template_code: 'CLIENT_SATISFACTION',
      title: 'Client Satisfaction & Service Handover Feedback',
      description: 'On-site digital debrief with facility property manager, safety sign-off, odor/ventilation rating, and client NPS scoring.',
      category: 'client_feedback',
      estimated_duration_minutes: 20
    }
  ];

  for (const t of templates) {
    await db.asyncRun(
      `INSERT INTO inspection_templates (id, template_code, title, description, category, estimated_duration_minutes) VALUES (?, ?, ?, ?, ?, ?)`,
      [t.id, t.template_code, t.title, t.description, t.category, t.estimated_duration_minutes]
    );
  }

  // Checklist Items for Termite
  const termiteItems = [
    { id: 'chk-t1', template_id: 'tmpl-termite', item_order: 1, label: 'Perimeter Wall & Expansion Joint Inspection', help_text: 'Inspect foundation cracks and expansion joints for mud shelter tubes.' },
    { id: 'chk-t2', template_id: 'tmpl-termite', item_order: 2, label: 'Moisture Level Reading (< 18% Required)', help_text: 'Check skirting boards and damp walls with acoustic/moisture probe.' },
    { id: 'chk-t3', template_id: 'tmpl-termite', item_order: 3, label: 'Subterranean Mud Tubes Detected', help_text: 'Look for active mud tube pathways along walls or electrical conduits.' },
    { id: 'chk-t4', template_id: 'tmpl-termite', item_order: 4, label: 'Chemical Barrier Drill Integrity Check', help_text: 'Verify 30cm interval drill holes have intact chemical seal plugs.' },
    { id: 'chk-t5', template_id: 'tmpl-termite', item_order: 5, label: 'CIBRC Registered Imidacloprid 30.5% SC Dispensed', help_text: 'Ensure certified dosage (10.5 ml per 5L water) adheres to safety norms.' }
  ];

  for (const item of termiteItems) {
    await db.asyncRun(
      `INSERT INTO template_checklist_items (id, template_id, item_order, label, help_text) VALUES (?, ?, ?, ?, ?)`,
      [item.id, item.template_id, item.item_order, item.label, item.help_text]
    );
  }

  // Checklist Items for Rodent
  const rodentItems = [
    { id: 'chk-r1', template_id: 'tmpl-rodent', item_order: 1, label: 'Exterior Rodent Bait Stations Locked & Intact', help_text: 'Confirm all key-operated tamper-resistant bait boxes are sealed.' },
    { id: 'chk-r2', template_id: 'tmpl-rodent', item_order: 2, label: 'Bromadiolone 0.005% RB Wax Blocks Replenished', help_text: 'Record gnawing activity and replace weathered or consumed blocks.' },
    { id: 'chk-r3', template_id: 'tmpl-rodent', item_order: 3, label: 'Interior Glue Traps Inspected (Kitchen & Store)', help_text: 'Check glue boards along baseboards, cables, and false ceilings.' },
    { id: 'chk-r4', template_id: 'tmpl-rodent', item_order: 4, label: 'Burrows or Structural Entry Gaps Sealed (> 6mm)', help_text: 'Inspect pipe penetrations and HVAC duct surrounds.' }
  ];

  for (const item of rodentItems) {
    await db.asyncRun(
      `INSERT INTO template_checklist_items (id, template_id, item_order, label, help_text) VALUES (?, ?, ?, ?, ?)`,
      [item.id, item.template_id, item.item_order, item.label, item.help_text]
    );
  }

  // 4. Seed Historical & Live Inspections
  const sampleInspections = [
    {
      id: 'insp-01',
      inspection_number: 'GZ-2026-TK-804',
      template_id: 'tmpl-termite',
      facility_id: 'fac-01',
      technician_id: 'usr-tech-01',
      qa_supervisor_id: 'usr-supervisor-01',
      status: 'pending_review',
      category: 'termite',
      started_at: '2026-03-20T09:15:00Z',
      completed_at: '2026-03-20T10:20:00Z',
      gps_latitude: 13.0108,
      gps_longitude: 80.2209,
      is_geofence_verified: 1,
      overall_severity: 'high',
      technician_notes: 'Active subterranean termite mud tube detected along Ballroom B perimeter skirting. Drilled 6 holes at 30cm spacing and injected 12L Imidacloprid solution. Client representative Mr. Ramanathan attended.',
      supervisor_notes: '',
      chemical_used: 'Imidacloprid 30.5% SC (Bayer Premise)',
      chemical_dosage: '10.5 ml / 5 Litres water',
      cibrc_registration_no: 'CIR-65239/2018-Imidacloprid-SC-194',
      technician_signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 40 T 170 30" fill="none" stroke="%23012341" stroke-width="3"/></svg>',
      technician_signed_at: '2026-03-20T10:18:00Z',
      client_signature_name: 'V. Ramanathan (Dir. Ops)',
      client_signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M15 35 Q 60 5 110 35 T 185 25" fill="none" stroke="%232C3E50" stroke-width="3"/></svg>',
      client_signed_at: '2026-03-20T10:20:00Z',
      client_feedback_rating: 5,
      ai_pest_detected: 'Subterranean Termite (Coptotermes formosanus)',
      ai_confidence_score: 98.4
    },
    {
      id: 'insp-02',
      inspection_number: 'GZ-2026-RD-792',
      template_id: 'tmpl-rodent',
      facility_id: 'fac-02',
      technician_id: 'usr-tech-02',
      qa_supervisor_id: 'usr-admin-01',
      status: 'approved',
      category: 'rodent',
      started_at: '2026-03-19T14:00:00Z',
      completed_at: '2026-03-19T15:10:00Z',
      gps_latitude: 13.0602,
      gps_longitude: 80.2505,
      is_geofence_verified: 1,
      overall_severity: 'low',
      technician_notes: '16 exterior rodent bait stations checked. Box #04 and #09 had slight bait gnawing. Replenished with 2x 20g Bromadiolone wax blocks. Kitchen glue boards clean.',
      supervisor_notes: 'Verified against Apollo Hospital QA protocols. Excellent documentation and photo evidence.',
      chemical_used: 'Bromadiolone 0.005% RB Wax Blocks',
      chemical_dosage: '40 grams per station',
      cibrc_registration_no: 'CIR-48192/2016-Bromadiolone-RB-88',
      technician_signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 30 Q 70 5 130 35 T 180 30" fill="none" stroke="%23012341" stroke-width="3"/></svg>',
      technician_signed_at: '2026-03-19T15:05:00Z',
      client_signature_name: 'Dr. Meenakshi Sundaram',
      client_signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M20 40 Q 80 15 140 40 T 190 20" fill="none" stroke="%232C3E50" stroke-width="3"/></svg>',
      client_signed_at: '2026-03-19T15:10:00Z',
      client_feedback_rating: 5,
      ai_pest_detected: 'Norway Rat (Rattus norvegicus) gnaw marks',
      ai_confidence_score: 94.2
    },
    {
      id: 'insp-03',
      inspection_number: 'GZ-2026-CK-761',
      template_id: 'tmpl-termite',
      facility_id: 'fac-03',
      technician_id: 'usr-tech-03',
      qa_supervisor_id: 'usr-supervisor-01',
      status: 'flagged_investigation',
      category: 'termite',
      started_at: '2026-03-18T11:00:00Z',
      completed_at: '2026-03-18T12:30:00Z',
      gps_latitude: 13.0195,
      gps_longitude: 80.1712,
      is_geofence_verified: 1,
      overall_severity: 'critical',
      technician_notes: 'Server Room 4 false floor support struts show heavy hollow timber damage. Evidence of swarmers found inside optical fiber raceways.',
      supervisor_notes: 'Flagged for urgent joint review with DLF Building Engineering lead. High risk of electrical conduit corrosion.',
      chemical_used: 'Chlorpyrifos 20% EC Barrier Infiltration',
      chemical_dosage: '20 ml / 1 Litre solvent',
      cibrc_registration_no: 'CIR-32110/2015-Chlorpyrifos-EC-12',
      technician_signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 35 Q 50 15 100 40 T 170 30" fill="none" stroke="%23012341" stroke-width="3"/></svg>',
      technician_signed_at: '2026-03-18T12:25:00Z',
      client_signature_name: 'K. Narayanan (EHS)',
      client_signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M15 30 Q 70 10 120 30 T 180 35" fill="none" stroke="%232C3E50" stroke-width="3"/></svg>',
      client_signed_at: '2026-03-18T12:30:00Z',
      client_feedback_rating: 4,
      ai_pest_detected: 'Drywood Termite (Cryptotermes brevis)',
      ai_confidence_score: 97.1
    },
    {
      id: 'insp-04',
      inspection_number: 'GZ-2026-AF-755',
      template_id: 'tmpl-aftercare',
      facility_id: 'fac-04',
      technician_id: 'usr-tech-01',
      qa_supervisor_id: null,
      status: 'pending_review',
      category: 'aftercare',
      started_at: '2026-03-20T16:00:00Z',
      completed_at: '2026-03-20T16:40:00Z',
      gps_latitude: 13.0452,
      gps_longitude: 80.2480,
      is_geofence_verified: 1,
      overall_severity: 'none',
      technician_notes: '14-Day post-gel treatment follow-up in main pastry kitchen. Zero German cockroach activity recorded on monitoring sticky pads. Residual barrier intact.',
      supervisor_notes: '',
      chemical_used: 'Fipronil 0.05% Cockroach Gel Bait (Goliath)',
      chemical_dosage: '0.1g spots applied in hinges & electrical cracks',
      cibrc_registration_no: 'CIR-55401/2017-Fipronil-GEL-45',
      technician_signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 40 T 170 30" fill="none" stroke="%23012341" stroke-width="3"/></svg>',
      technician_signed_at: '2026-03-20T16:38:00Z',
      client_signature_name: 'Chef Vikram Roy',
      client_signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 30 Q 70 5 130 35 T 180 30" fill="none" stroke="%232C3E50" stroke-width="3"/></svg>',
      client_signed_at: '2026-03-20T16:40:00Z',
      client_feedback_rating: 5,
      ai_pest_detected: 'No Active Pest Detected (Pass)',
      ai_confidence_score: 99.1
    }
  ];

  for (const ins of sampleInspections) {
    await db.asyncRun(
      `INSERT INTO inspections (
        id, inspection_number, template_id, facility_id, technician_id, qa_supervisor_id,
        status, category, started_at, completed_at, gps_latitude, gps_longitude, is_geofence_verified,
        overall_severity, technician_notes, supervisor_notes, chemical_used, chemical_dosage,
        cibrc_registration_no, technician_signature_url, technician_signed_at,
        client_signature_name, client_signature_url, client_signed_at, client_feedback_rating,
        ai_pest_detected, ai_confidence_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ins.id, ins.inspection_number, ins.template_id, ins.facility_id, ins.technician_id, ins.qa_supervisor_id,
        ins.status, ins.category, ins.started_at, ins.completed_at, ins.gps_latitude, ins.gps_longitude, ins.is_geofence_verified,
        ins.overall_severity, ins.technician_notes, ins.supervisor_notes, ins.chemical_used, ins.chemical_dosage,
        ins.cibrc_registration_no, ins.technician_signature_url, ins.technician_signed_at,
        ins.client_signature_name, ins.client_signature_url, ins.client_signed_at, ins.client_feedback_rating,
        ins.ai_pest_detected, ins.ai_confidence_score
      ]
    );

    // Seed sample checklist answers
    await db.asyncRun(
      `INSERT INTO inspection_checklist_responses (id, inspection_id, item_label, passed, value, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [`res-${ins.id}-1`, ins.id, 'Structural Perimeter Inspection', 1, 'PASS', 'Thorough perimeter sweep completed']
    );
    await db.asyncRun(
      `INSERT INTO inspection_checklist_responses (id, inspection_id, item_label, passed, value, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [`res-${ins.id}-2`, ins.id, 'Moisture & Dampness Verification', ins.overall_severity === 'high' ? 0 : 1, ins.overall_severity === 'high' ? 'HIGH (21%)' : 'NORMAL (11%)', 'Skirting inspection verified']
    );

    // Seed sample photos
    await db.asyncRun(
      `INSERT INTO inspection_photos (id, inspection_id, photo_url, caption, photo_type, captured_at, gps_latitude, gps_longitude, ai_detected_pest, ai_confidence)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `ph-${ins.id}-1`,
        ins.id,
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        'Inspection location evidence with timestamp & GPS watermark',
        'evidence',
        ins.completed_at,
        ins.gps_latitude,
        ins.gps_longitude,
        ins.ai_pest_detected,
        ins.ai_confidence_score
      ]
    );

    // Seed Audit Log
    await db.asyncRun(
      `INSERT INTO audit_logs (id, entity_name, entity_id, action, performed_by_name, comments, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${ins.id}`,
        'inspections',
        ins.id,
        ins.status === 'approved' ? 'APPROVED' : (ins.status === 'flagged_investigation' ? 'FLAGGED' : 'CREATED'),
        ins.status === 'approved' ? 'S. Karthikeyan (QA Lead)' : 'Rajesh Kumar (Field Tech)',
        ins.technician_notes,
        ins.completed_at
      ]
    );
  }

  // Seed Notifications
  await db.asyncRun(
    `INSERT INTO notifications (id, recipient_id, inspection_id, channel, title, message)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['notif-01', 'usr-admin-01', 'insp-01', 'push', 'New Termite Inspection Pending Review', 'Technician Rajesh Kumar submitted inspection #GZ-2026-TK-804 for ITC Grand Chola.']
  );
  await db.asyncRun(
    `INSERT INTO notifications (id, recipient_id, inspection_id, channel, title, message)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['notif-02', 'usr-admin-01', 'insp-03', 'email', 'URGENT: Inspection Flagged for QA Investigation', 'DLF Cybercity Block 5 inspection #GZ-2026-CK-761 flagged critical severity drywood termite swarmers.']
  );

  console.log('GlitzUp enterprise seed completed successfully.');
}

module.exports = {
  db,
  initDatabase
};
