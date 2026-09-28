const { db } = require('../config/db');

// List inspections with flexible enterprise filters
exports.getInspections = async (req, res) => {
  try {
    const { technician_id, facility_id, status, category, search, start_date, end_date } = req.query;

    let query = `
      SELECT 
        i.*,
        f.client_name,
        f.property_name,
        f.address as facility_address,
        u.full_name as technician_name,
        u.employee_code as technician_code,
        t.title as template_title
      FROM inspections i
      JOIN facilities f ON i.facility_id = f.id
      JOIN users u ON i.technician_id = u.id
      JOIN inspection_templates t ON i.template_id = t.id
      WHERE 1=1
    `;
    const params = [];

    // Role guard: Field technicians only see their own inspections unless they are admin/QA
    if (req.user && req.user.role === 'field_technician') {
      query += ` AND i.technician_id = ?`;
      params.push(req.user.id);
    } else if (technician_id) {
      query += ` AND i.technician_id = ?`;
      params.push(technician_id);
    }

    if (facility_id) {
      query += ` AND i.facility_id = ?`;
      params.push(facility_id);
    }

    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
    }

    if (category) {
      query += ` AND i.category = ?`;
      params.push(category);
    }

    if (start_date) {
      query += ` AND date(i.completed_at) >= date(?)`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND date(i.completed_at) <= date(?)`;
      params.push(end_date);
    }

    if (search) {
      query += ` AND (i.inspection_number LIKE ? OR f.client_name LIKE ? OR f.property_name LIKE ? OR u.full_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY i.completed_at DESC`;

    const inspections = await db.asyncAll(query, params);
    res.json({ inspections, total: inspections.length });
  } catch (err) {
    console.error('Error fetching inspections:', err);
    res.status(500).json({ error: 'Failed to retrieve inspections' });
  }
};

// Retrieve single inspection with deep relation data
exports.getInspectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const inspection = await db.asyncGet(
      `SELECT 
        i.*,
        f.client_name,
        f.property_name,
        f.address as facility_address,
        f.contact_person,
        f.contact_phone,
        f.latitude as facility_lat,
        f.longitude as facility_lng,
        f.geofence_radius_meters,
        u.full_name as technician_name,
        u.employee_code as technician_code,
        u.phone_number as technician_phone,
        t.title as template_title,
        t.category as template_category
      FROM inspections i
      JOIN facilities f ON i.facility_id = f.id
      JOIN users u ON i.technician_id = u.id
      JOIN inspection_templates t ON i.template_id = t.id
      WHERE i.id = ?`,
      [id]
    );

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Fetch checklist responses
    const checklist = await db.asyncAll(
      'SELECT * FROM inspection_checklist_responses WHERE inspection_id = ? ORDER BY id ASC',
      [id]
    );

    // Fetch photos
    const photos = await db.asyncAll(
      'SELECT * FROM inspection_photos WHERE inspection_id = ? ORDER BY captured_at ASC',
      [id]
    );

    // Fetch audit trail
    const auditLogs = await db.asyncAll(
      'SELECT * FROM audit_logs WHERE entity_id = ? ORDER BY timestamp DESC',
      [id]
    );

    res.json({
      inspection: {
        ...inspection,
        checklist_responses: checklist,
        photos,
        audit_trail: auditLogs
      }
    });
  } catch (err) {
    console.error('Error fetching inspection details:', err);
    res.status(500).json({ error: 'Failed to retrieve inspection details' });
  }
};

// Create / Submit inspection from Mobile (handles offline sync queue payloads)
exports.createInspection = async (req, res) => {
  try {
    const {
      id,
      template_id,
      facility_id,
      category,
      started_at,
      completed_at,
      gps_latitude,
      gps_longitude,
      gps_accuracy_meters,
      overall_severity,
      technician_notes,
      chemical_used,
      chemical_dosage,
      cibrc_registration_no,
      technician_signature_url,
      client_signature_name,
      client_signature_url,
      client_feedback_rating,
      ai_pest_detected,
      ai_confidence_score,
      checklist_responses = [],
      photos = [],
      offline_created_at
    } = req.body;

    const technicianId = req.user ? req.user.id : (req.body.technician_id || 'usr-tech-01');
    const technicianName = req.user ? req.user.full_name : 'Rajesh Kumar (Field Tech)';

    const inspectionId = id || `insp-${Date.now()}`;
    const randCode = Math.floor(100 + Math.random() * 900);
    const categoryPrefix = category ? category.substring(0, 2).toUpperCase() : 'IN';
    const inspectionNumber = req.body.inspection_number || `GZ-2026-${categoryPrefix}-${randCode}`;

    // Verify Geofence with facility
    let isGeofenceVerified = 1;
    if (gps_latitude && gps_longitude && facility_id) {
      const facility = await db.asyncGet('SELECT latitude, longitude, geofence_radius_meters FROM facilities WHERE id = ?', [facility_id]);
      if (facility) {
        // Approximate distance calculation
        const R = 6371e3; // metres
        const φ1 = (gps_latitude * Math.PI) / 180;
        const φ2 = (facility.latitude * Math.PI) / 180;
        const Δφ = ((facility.latitude - gps_latitude) * Math.PI) / 180;
        const Δλ = ((facility.longitude - gps_longitude) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        isGeofenceVerified = distance <= (facility.geofence_radius_meters || 200) ? 1 : 0;
      }
    }

    await db.asyncRun(
      `INSERT INTO inspections (
        id, inspection_number, template_id, facility_id, technician_id,
        status, category, started_at, completed_at, gps_latitude, gps_longitude,
        gps_accuracy_meters, is_geofence_verified, overall_severity, technician_notes,
        chemical_used, chemical_dosage, cibrc_registration_no,
        technician_signature_url, technician_signed_at,
        client_signature_name, client_signature_url, client_signed_at, client_feedback_rating,
        ai_pest_detected, ai_confidence_score, sync_status, offline_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inspectionId,
        inspectionNumber,
        template_id,
        facility_id,
        technicianId,
        'pending_review',
        category || 'general_insects',
        started_at || new Date().toISOString(),
        completed_at || new Date().toISOString(),
        gps_latitude || 13.0105,
        gps_longitude || 80.2207,
        gps_accuracy_meters || 3.5,
        isGeofenceVerified,
        overall_severity || 'none',
        technician_notes || 'Routine field compliance verification completed.',
        chemical_used || 'Standard Botanical / CIBRC Formulation',
        chemical_dosage || 'As per manufacturer dilution norms',
        cibrc_registration_no || 'CIBRC-REG-2026-COMPLIANT',
        technician_signature_url || '',
        new Date().toISOString(),
        client_signature_name || 'Client Property Officer',
        client_signature_url || '',
        new Date().toISOString(),
        client_feedback_rating || 5,
        ai_pest_detected || 'None Detected',
        ai_confidence_score || 95.0,
        'synced',
        offline_created_at || null
      ]
    );

    // Insert checklist responses
    for (let i = 0; i < checklist_responses.length; i++) {
      const item = checklist_responses[i];
      await db.asyncRun(
        `INSERT INTO inspection_checklist_responses (id, inspection_id, item_label, passed, value, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`resp-${inspectionId}-${i}`, inspectionId, item.item_label || item.label, item.passed ? 1 : 0, item.value || 'PASS', item.notes || '']
      );
    }

    // Insert photos
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      await db.asyncRun(
        `INSERT INTO inspection_photos (id, inspection_id, photo_url, caption, photo_type, captured_at, gps_latitude, gps_longitude, ai_detected_pest, ai_confidence)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `ph-${inspectionId}-${i}`,
          inspectionId,
          p.photo_url || p.uri || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
          p.caption || 'Field inspection evidence with GPS watermark',
          'evidence',
          p.captured_at || new Date().toISOString(),
          p.gps_latitude || gps_latitude,
          p.gps_longitude || gps_longitude,
          p.ai_detected_pest || ai_pest_detected,
          p.ai_confidence || ai_confidence_score
        ]
      );
    }

    // Insert Audit Log
    await db.asyncRun(
      `INSERT INTO audit_logs (id, entity_name, entity_id, action, performed_by_name, comments, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        'inspections',
        inspectionId,
        'CREATED',
        technicianName,
        `Inspection submitted ${offline_created_at ? '(Synced from Offline Storage)' : 'live'} with GPS Geotag: ${gps_latitude}, ${gps_longitude}`,
        new Date().toISOString()
      ]
    );

    // Create Notification for QA Supervisors
    await db.asyncRun(
      `INSERT INTO notifications (id, recipient_id, inspection_id, channel, title, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        `notif-${Date.now()}`,
        'usr-admin-01',
        inspectionId,
        'push',
        `New Inspection Pending Review: ${inspectionNumber}`,
        `Submitted by ${technicianName} with ${photos.length} evidence photos.`
      ]
    );

    res.status(201).json({
      message: 'Inspection submitted successfully',
      inspection_id: inspectionId,
      inspection_number: inspectionNumber,
      sync_status: 'synced'
    });
  } catch (err) {
    console.error('Error creating inspection:', err);
    res.status(500).json({ error: 'Failed to record inspection' });
  }
};

// Update inspection status (Approve / Reject / Flag by QA Supervisor)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, supervisor_notes, rejection_reason } = req.body;

    if (!['approved', 'rejected', 'flagged_investigation', 'pending_review'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }

    const inspection = await db.asyncGet('SELECT * FROM inspections WHERE id = ?', [id]);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const reviewerName = req.user ? req.user.full_name : 'QA Supervisor';
    const reviewerId = req.user ? req.user.id : 'usr-admin-01';

    await db.asyncRun(
      `UPDATE inspections 
       SET status = ?, 
           supervisor_notes = COALESCE(?, supervisor_notes),
           rejection_reason = COALESCE(?, rejection_reason),
           qa_supervisor_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, supervisor_notes, rejection_reason, reviewerId, id]
    );

    // Immutable Audit Log entry
    await db.asyncRun(
      `INSERT INTO audit_logs (id, entity_name, entity_id, action, performed_by, performed_by_name, previous_state, new_state, comments, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        'inspections',
        id,
        status.toUpperCase(),
        reviewerId,
        reviewerName,
        JSON.stringify({ status: inspection.status }),
        JSON.stringify({ status, supervisor_notes, rejection_reason }),
        supervisor_notes || rejection_reason || `Inspection status changed to ${status}`,
        new Date().toISOString()
      ]
    );

    res.json({
      message: `Inspection status updated to ${status}`,
      inspection_id: id,
      new_status: status
    });
  } catch (err) {
    console.error('Error updating inspection status:', err);
    res.status(500).json({ error: 'Failed to update inspection status' });
  }
};
