import React, { useState } from 'react';
import { X, Send, Calendar, User, Building, AlertCircle, CheckCircle } from 'lucide-react';

export default function TaskAssignModal({ facilities, onClose, onDispatchReminder }) {
  const [technicianId, setTechnicianId] = useState('usr-tech-01');
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || '');
  const [templateCode, setTemplateCode] = useState('TERMITE_INSPECT');
  const [priority, setPriority] = useState('High');
  const [channel, setChannel] = useState('sms');
  const [scheduledDate, setScheduledDate] = useState('2026-03-21T09:00');
  const [instructions, setInstructions] = useState('Conduct priority subterranean termite perimeter sweep and verify bait box tamper seals.');
  const [sentSuccess, setSentSuccess] = useState(false);

  const technicians = [
    { id: 'usr-tech-01', name: 'Rajesh Kumar', code: 'GZ-TECH-042', phone: '+91 98403 45678' },
    { id: 'usr-tech-02', name: 'Anand Murugan', code: 'GZ-TECH-088', phone: '+91 98404 56789' },
    { id: 'usr-tech-03', name: 'Selvam Perumal', code: 'GZ-TECH-103', phone: '+91 98405 67890' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onDispatchReminder({
      technician_id: technicianId,
      channel,
      message: `[GlitzUp Alert] New Task: ${templateCode} at ${facilities.find(f => f.id === facilityId)?.property_name || 'Assigned Site'}. Scheduled: ${scheduledDate}. Notes: ${instructions}`
    });
    setSentSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-glitzup-navy px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">Assign Field Inspection & Dispatch Alert</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900">Task Assigned & Dispatched!</h4>
            <p className="text-xs text-slate-600">
              Notification sent via {channel.toUpperCase()} to the field technician's mobile device.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Property / Client</label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-glitzup-navy"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.property_name} ({f.client_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Technician</label>
                <select
                  value={technicianId}
                  onChange={(e) => setTechnicianId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-glitzup-navy"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspection Protocol</label>
                <select
                  value={templateCode}
                  onChange={(e) => setTemplateCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-glitzup-navy"
                >
                  <option value="TERMITE_INSPECT">Termite Inspection & Barrier</option>
                  <option value="RODENT_VERIFY">Rodent Control Verification</option>
                  <option value="AFTERCARE_CHECK">14-Day Aftercare Efficacy</option>
                  <option value="CLIENT_SATISFACTION">Client Debrief & Handover</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-glitzup-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispatch Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-glitzup-navy"
                >
                  <option value="sms">SMS via Twilio Gateway</option>
                  <option value="push">Firebase Cloud Push</option>
                  <option value="email">Email Dispatch</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Special Site Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows="2"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-glitzup-navy"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-glitzup-navy px-5 py-2 font-bold text-white hover:bg-glitzup-slate transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span>Dispatch Task</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
