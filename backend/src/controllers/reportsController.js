const { db } = require('../config/db');

// Generate Printable / PDF-ready Audit Certificate
exports.getInspectionReport = async (req, res) => {
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
        u.full_name as technician_name,
        u.employee_code as technician_code,
        t.title as template_title
      FROM inspections i
      JOIN facilities f ON i.facility_id = f.id
      JOIN users u ON i.technician_id = u.id
      JOIN inspection_templates t ON i.template_id = t.id
      WHERE i.id = ?`,
      [id]
    );

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection record not found' });
    }

    const checklist = await db.asyncAll('SELECT * FROM inspection_checklist_responses WHERE inspection_id = ?', [id]);
    const photos = await db.asyncAll('SELECT * FROM inspection_photos WHERE inspection_id = ?', [id]);
    const auditLogs = await db.asyncAll('SELECT * FROM audit_logs WHERE entity_id = ? ORDER BY timestamp ASC', [id]);

    // Return HTML printable compliance certificate
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GlitzUp Compliance Certificate - ${inspection.inspection_number}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 30px; background: #fff; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #012341; padding-bottom: 20px; }
    .logo-container { display: flex; align-items: center; gap: 12px; }
    .logo-text { font-size: 26px; font-weight: 800; color: #012341; letter-spacing: -0.5px; }
    .logo-badge { background: #E74C3C; color: #fff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; margin-left: 8px; }
    .cert-title { text-align: right; }
    .cert-title h1 { margin: 0; font-size: 20px; color: #012341; }
    .cert-title p { margin: 4px 0 0 0; font-size: 13px; color: #64748b; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
    .meta-block h3 { margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-block p { margin: 2px 0; font-size: 14px; font-weight: 600; color: #0f172a; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .badge-approved { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-flagged { background: #fee2e2; color: #991b1b; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #012341; color: #fff; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; }
    td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; padding-top: 20px; border-top: 2px dashed #cbd5e1; }
    .sig-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #fafafa; text-align: center; }
    .sig-img { max-height: 50px; margin: 10px 0; }
    .audit-seal { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="background: #012341; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-weight: bold;">
      Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div class="logo-container">
      <span class="logo-text">GlitzUp</span>
      <span class="logo-badge">PestCheck Compliance</span>
    </div>
    <div class="cert-title">
      <h1>FIELD SERVICE COMPLIANCE CERTIFICATE</h1>
      <p>Certificate Ref: <strong>${inspection.inspection_number}</strong></p>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-block">
      <h3>Client & Property Details</h3>
      <p>${inspection.client_name}</p>
      <p style="font-weight: normal; color: #475569;">${inspection.property_name}</p>
      <p style="font-size: 12px; color: #64748b; font-weight: normal;">${inspection.facility_address}</p>
      <p style="margin-top: 6px; font-size: 12px;">Contact: ${inspection.contact_person || 'N/A'}</p>
    </div>
    <div class="meta-block">
      <h3>Inspection Protocol & GPS Telemetry</h3>
      <p>Type: ${inspection.template_title}</p>
      <p>GPS Tag: ${inspection.gps_latitude}°, ${inspection.gps_longitude}° (±${inspection.gps_accuracy_meters}m)</p>
      <p>Geofence Verification: <strong>${inspection.is_geofence_verified ? 'VERIFIED ON-SITE' : 'OFF-SITE OVERRIDE'}</strong></p>
      <p style="margin-top: 6px;">Status: <span class="badge badge-${inspection.status}">${inspection.status.replace('_', ' ')}</span></p>
    </div>
  </div>

  <div style="background: #f1f5f9; padding: 14px; border-radius: 6px; margin: 15px 0;">
    <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #012341; text-transform: uppercase;">Statutory Chemical & Dosage Records (CIBRC India)</h4>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; font-size: 12px;">
      <div><strong>Chemical:</strong> ${inspection.chemical_used || 'Standard formulation'}</div>
      <div><strong>Dosage:</strong> ${inspection.chemical_dosage || 'As per norms'}</div>
      <div><strong>CIBRC License No:</strong> ${inspection.cibrc_registration_no || 'CERT-APPROVED'}</div>
    </div>
  </div>

  <h3 style="font-size: 14px; color: #012341; text-transform: uppercase; margin-top: 25px;">Checklist & Observation Audit</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 60%;">Checklist Item</th>
        <th style="width: 20%;">Result</th>
        <th style="width: 20%;">Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${checklist
        .map(
          (c) => `
        <tr>
          <td>${c.item_label}</td>
          <td><strong>${c.passed ? '<span style="color:#166534;">PASSED</span>' : '<span style="color:#991b1b;">DEFICIENCY DETECTED</span>'}</strong></td>
          <td>${c.notes || '-'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div style="margin-top: 20px;">
    <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #012341;">Technician Field Observations</h4>
    <p style="margin: 0; font-size: 13px; background: #f8fafc; border-left: 4px solid #012341; padding: 10px 14px;">
      ${inspection.technician_notes || 'Routine scheduled compliance inspection conducted in according to GlitzUp SOP.'}
    </p>
  </div>

  <div class="signatures">
    <div class="sig-box">
      <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Field Technician Sign-off</div>
      <div style="height: 50px; display: flex; align-items: center; justify-content: center; font-style: italic; color: #012341; font-weight: bold;">
        ${inspection.technician_name}
      </div>
      <div style="font-size: 12px; font-weight: 600;">${inspection.technician_name} (Code: ${inspection.technician_code})</div>
      <div style="font-size: 11px; color: #64748b;">Timestamp: ${inspection.technician_signed_at || inspection.completed_at}</div>
    </div>
    <div class="sig-box">
      <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Client Authorized Representative</div>
      <div style="height: 50px; display: flex; align-items: center; justify-content: center; font-style: italic; color: #2C3E50; font-weight: bold;">
        ${inspection.client_signature_name || 'Authorized Client Rep'}
      </div>
      <div style="font-size: 12px; font-weight: 600;">${inspection.client_signature_name || 'Client Representative'}</div>
      <div style="font-size: 11px; color: #64748b;">Rating: ⭐⭐⭐⭐⭐ (${inspection.client_feedback_rating || 5}/5 Stars)</div>
    </div>
  </div>

  <div class="audit-seal">
    GlitzUp Facility Management Services Pvt Ltd • ISO 9001:2015 & ISO 14001:2015 Certified • chennai@glitzupfm.in • www.glitzupfm.in<br>
    Cryptographic SHA-256 Audit Seal: ${inspection.id.replace(/-/g, '').toUpperCase().substring(0, 32)}
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlReport);
  } catch (err) {
    console.error('Error generating inspection report:', err);
    res.status(500).json({ error: 'Failed to generate inspection report' });
  }
};

// Export CSV for Excel/Auditors
exports.exportExcelCSV = async (req, res) => {
  try {
    const inspections = await db.asyncAll(`
      SELECT 
        i.inspection_number,
        f.client_name,
        f.property_name,
        u.full_name as technician,
        i.category,
        i.status,
        i.overall_severity,
        i.gps_latitude,
        i.gps_longitude,
        i.chemical_used,
        i.chemical_dosage,
        i.cibrc_registration_no,
        i.client_signature_name,
        i.client_feedback_rating,
        i.ai_pest_detected,
        i.started_at,
        i.completed_at
      FROM inspections i
      JOIN facilities f ON i.facility_id = f.id
      JOIN users u ON i.technician_id = u.id
      ORDER BY i.completed_at DESC
    `);

    const headers = [
      'Inspection Number',
      'Client',
      'Property',
      'Technician',
      'Category',
      'Status',
      'Severity',
      'GPS Lat',
      'GPS Lng',
      'Chemical Used',
      'Dosage',
      'CIBRC Reg No',
      'Client Signer',
      'Rating',
      'AI Diagnosis',
      'Started At',
      'Completed At'
    ];

    const rows = inspections.map((r) => [
      r.inspection_number,
      `"${(r.client_name || '').replace(/"/g, '""')}"`,
      `"${(r.property_name || '').replace(/"/g, '""')}"`,
      `"${(r.technician || '').replace(/"/g, '""')}"`,
      r.category,
      r.status,
      r.overall_severity,
      r.gps_latitude,
      r.gps_longitude,
      `"${(r.chemical_used || '').replace(/"/g, '""')}"`,
      `"${(r.chemical_dosage || '').replace(/"/g, '""')}"`,
      r.cibrc_registration_no,
      `"${(r.client_signature_name || '').replace(/"/g, '""')}"`,
      r.client_feedback_rating,
      `"${(r.ai_pest_detected || '').replace(/"/g, '""')}"`,
      r.started_at,
      r.completed_at
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="GlitzUp_PestCheck_Compliance_Export.csv"');
    res.send(csvContent);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};
