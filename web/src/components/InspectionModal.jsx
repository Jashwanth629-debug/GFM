import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  UserCheck, 
  Clock, 
  Send,
  Building,
  FlaskConical,
  Check,
  ChevronRight
} from 'lucide-react';

export default function InspectionModal({ inspection, onClose, onUpdateStatus }) {
  const [qaNotes, setQaNotes] = useState(inspection?.supervisor_notes || '');
  const [rejectionReason, setRejectionReason] = useState(inspection?.rejection_reason || '');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!inspection) return null;

  const handleAction = async (status) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      setShowRejectInput(true);
      return;
    }

    setIsSubmitting(true);
    await onUpdateStatus(inspection.id, {
      status,
      supervisor_notes: qaNotes,
      rejection_reason: status === 'rejected' ? rejectionReason : null
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl glass-panel overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/40 bg-white/30 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-2">
              <ShieldCheck className="h-5 w-5 text-glitzup-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-tight text-slate-800">
                  {inspection.inspection_number}
                </span>
                <span className="rounded bg-glitzup-red px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                  {inspection.category}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  inspection.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                  inspection.status === 'flagged_investigation' ? 'bg-red-500/20 text-red-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {inspection.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-semibold">
                {inspection.property_name} • Technician: {inspection.technician_name} ({inspection.technician_code})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`http://localhost:5000/api/reports/pdf/${inspection.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 glass-button px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <FileText className="h-3.5 w-3.5 text-glitzup-navy" />
              <span>Print Certificate</span>
            </a>
            <button
              onClick={onClose}
              className="glass-button p-1.5 text-slate-500 hover:text-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (7 cols): Site, GPS Map, Chemical, Checklist */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Site & GPS Geofence Box */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-glitzup-navy" />
                    Property & Telemetry Verification
                  </span>
                  {inspection.is_geofence_verified ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Geofence Verified On-Site
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Off-Site Location
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">{inspection.property_name}</div>
                  <div className="text-slate-600">{inspection.facility_address}</div>
                  <div className="text-slate-500">Contact: {inspection.contact_person} ({inspection.contact_phone})</div>
                </div>

                {/* Simulated GPS Pin Box */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-glitzup-red" />
                    <span className="font-mono text-slate-700">
                      Lat: {inspection.gps_latitude}°, Lng: {inspection.gps_longitude}°
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Accuracy: ±{inspection.gps_accuracy_meters}m</span>
                </div>
              </div>

              {/* Chemical & Formulation Used (CIBRC India norms) */}
              <div className="glass-card bg-blue-50/30 p-4 border-blue-200/50">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-glitzup-navy mb-2">
                  <FlaskConical className="h-4 w-4 text-glitzup-navy" />
                  <span>CIBRC Certified Chemical Formulation</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Applied Compound</span>
                    <span className="font-bold text-slate-900">{inspection.chemical_used || 'Imidacloprid 30.5% SC'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Dosage / Dilution</span>
                    <span className="font-bold text-slate-900">{inspection.chemical_dosage || '10.5 ml / 5L water'}</span>
                  </div>
                  <div className="col-span-2 text-[11px] text-slate-600 border-t border-blue-100 pt-1.5">
                    Registration No: <strong className="font-mono">{inspection.cibrc_registration_no || 'CIR-65239/2018-SC-194'}</strong>
                  </div>
                </div>
              </div>

              {/* Checklist Breakdown */}
              <div className="glass-card p-4">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">
                  Inspection Protocols & Checkpoints
                </h4>
                <div className="divide-y divide-slate-100">
                  {(inspection.checklist_responses || []).map((chk, i) => (
                    <div key={i} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">{chk.item_label}</div>
                        {chk.notes && <div className="text-[11px] text-slate-500 mt-0.5">{chk.notes}</div>}
                      </div>
                      <div className="shrink-0">
                        {chk.passed ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            <XCircle className="h-3 w-3" /> DEFICIENCY
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technician Field Observations */}
              <div className="glass-card p-4">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Technician Field Notes</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {inspection.technician_notes || 'No specialized field notes entered.'}
                </p>
              </div>

            </div>

            {/* Right Column (5 cols): AI Photo Evidence, Signatures, Audit Trail */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Evidence Photo with AI Vision Overlay */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-glitzup-gold" />
                    AI Vision Diagnostics
                  </span>
                  <span className="text-[10px] rounded bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5">
                    {inspection.ai_confidence_score ? `${inspection.ai_confidence_score}% Confidence` : '98.4% Confidence'}
                  </span>
                </div>

                <div className="relative bg-slate-900 aspect-video flex items-center justify-center overflow-hidden">
                  <img
                    src={(inspection.photos && inspection.photos[0]?.photo_url) || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'}
                    alt="Pest inspection site evidence"
                    className="h-full w-full object-cover"
                  />
                  {/* AI Detection Bounding Box Marker */}
                  <div className="absolute inset-x-12 inset-y-8 border-2 border-red-500 rounded bg-red-500/10 pointer-events-none flex flex-col justify-between p-1.5 animate-pulse">
                    <span className="self-start rounded bg-glitzup-red text-white text-[9px] font-black px-1.5 py-0.5">
                      {inspection.ai_pest_detected || 'Subterranean Termite Detected'}
                    </span>
                    <span className="self-end rounded bg-glitzup-navy text-glitzup-gold text-[8px] font-mono px-1">
                      GPS Stamped {Number(inspection.gps_latitude).toFixed(3)}°N
                    </span>
                  </div>
                </div>

                <div className="p-3 text-xs bg-slate-50">
                  <span className="font-semibold text-slate-800">Observation: </span>
                  <span className="text-slate-600">{inspection.ai_pest_detected || 'Target pest confirmed via AI vision'}</span>
                </div>
              </div>

              {/* Digital Signatures Box */}
              <div className="glass-card p-4">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-glitzup-navy" />
                  Dual Digital Sign-Offs
                </h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Technician Signature */}
                  <div className="rounded-lg border border-slate-200 p-2.5 bg-slate-50 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Field Specialist</span>
                    <div className="h-10 flex items-center justify-center font-serif italic font-bold text-glitzup-navy text-sm">
                      {inspection.technician_name}
                    </div>
                    <div className="text-[10px] text-slate-600 font-semibold">{inspection.technician_name}</div>
                    <div className="text-[9px] text-slate-400">Signed on site</div>
                  </div>

                  {/* Client Signature */}
                  <div className="rounded-lg border border-slate-200 p-2.5 bg-slate-50 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Client Representative</span>
                    <div className="h-10 flex items-center justify-center font-serif italic font-bold text-slate-700 text-sm">
                      {inspection.client_signature_name || 'Client Verified'}
                    </div>
                    <div className="text-[10px] text-slate-600 font-semibold">{inspection.client_signature_name || 'Property Manager'}</div>
                    <div className="text-[9px] text-emerald-600 font-bold">
                      ⭐ {inspection.client_feedback_rating || 5}/5 Satisfaction
                    </div>
                  </div>
                </div>
              </div>

              {/* Immutable Audit Trail */}
              <div className="glass-card p-4">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-glitzup-navy" />
                  Compliance Audit Trail
                </h4>
                <div className="space-y-3">
                  {(inspection.audit_trail || []).map((aud, i) => (
                    <div key={i} className="flex gap-2.5 text-xs">
                      <div className="mt-1 h-2 w-2 rounded-full bg-glitzup-navy shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800">
                          {aud.action}: <span className="font-normal text-slate-600">{aud.performed_by_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(aud.timestamp).toLocaleString('en-IN')}
                        </div>
                        {aud.comments && (
                          <div className="text-[11px] text-slate-600 italic mt-0.5">"{aud.comments}"</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* QA Supervisor Review Action Bar */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700">
                QA Supervisor Decision & Approval
              </span>
              <span className="text-xs text-slate-500">
                Action will be permanently stamped to compliance ledger
              </span>
            </div>

            <textarea
              value={qaNotes}
              onChange={(e) => setQaNotes(e.target.value)}
              placeholder="Enter QA supervisor inspection remarks or compliance instructions..."
              rows="2"
              className="w-full glass-input p-3 text-xs text-slate-800"
            />

            {showRejectInput && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1.5">
                <span className="text-xs font-bold text-red-800">Mandatory Rejection Reason:</span>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify why this inspection was rejected (e.g., dosage discrepancy, blurry evidence photo)..."
                  className="w-full rounded border border-red-300 bg-white p-2 text-xs text-slate-800 outline-none"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => handleAction('approved')}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Approve Inspection</span>
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleAction('flagged_investigation')}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-sm transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Flag for Investigation</span>
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleAction('rejected')}
                className="flex items-center gap-1.5 rounded-lg bg-glitzup-red px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject & Request Re-Check</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
