import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  Mic, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  RotateCcw,
  Check
} from 'lucide-react';

export default function MobileSimulatorModal({ facilities, templates, onClose, onInspectionCreated }) {
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('tmpl-termite');
  const [selectedFacility, setSelectedFacility] = useState(facilities[0]?.id || 'fac-01');
  
  // GPS State
  const [gpsCoords, setGpsCoords] = useState({ lat: 13.0108, lng: 80.2209, accuracy: 3.8, verified: true });
  const [isGrabbingGps, setIsGrabbingGps] = useState(false);

  // AI & Evidence State
  const [evidencePhoto, setEvidencePhoto] = useState(
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
  );
  const [aiDetection, setAiDetection] = useState({
    detected: 'Subterranean Termite (98% confidence)',
    confidence: 98.4,
    showBox: true
  });
  const [isScanningAi, setIsScanningAi] = useState(false);

  // Voice note state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceNoteRecorded, setVoiceNoteRecorded] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState({
    mud_tubes: true,
    moisture_high: true,
    chemical_barrier_intact: false,
    perimeter_clean: true
  });

  // Signatures
  const [techSigned, setTechSigned] = useState(true);
  const [clientSigned, setClientSigned] = useState(true);
  const [clientName, setClientName] = useState('Mr. V. Ramanathan (Facility Dir)');
  const [technicianNotes, setTechnicianNotes] = useState('Active mud tube detected at perimeter baseboard. Drilled 6 holes and injected 12L Imidacloprid solution.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const grabGps = () => {
    setIsGrabbingGps(true);
    setTimeout(() => {
      const facility = facilities.find(f => f.id === selectedFacility) || facilities[0];
      setGpsCoords({
        lat: Number((facility.latitude + (Math.random() - 0.5) * 0.0004).toFixed(6)),
        lng: Number((facility.longitude + (Math.random() - 0.5) * 0.0004).toFixed(6)),
        accuracy: 3.2,
        verified: true
      });
      setIsGrabbingGps(false);
    }, 600);
  };

  const simulateAiScan = () => {
    setIsScanningAi(true);
    setTimeout(() => {
      setAiDetection({
        detected: 'Subterranean Termite (99.2% confidence)',
        confidence: 99.2,
        showBox: true
      });
      setIsScanningAi(false);
    }, 800);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      template_id: selectedTemplate,
      facility_id: selectedFacility,
      category: 'termite',
      started_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date().toISOString(),
      gps_latitude: gpsCoords.lat,
      gps_longitude: gpsCoords.lng,
      gps_accuracy_meters: gpsCoords.accuracy,
      overall_severity: 'high',
      technician_notes: technicianNotes,
      chemical_used: 'Imidacloprid 30.5% SC (Bayer Premise)',
      chemical_dosage: '10.5 ml / 5L water',
      cibrc_registration_no: 'CIR-65239/2018-Imidacloprid-SC-194',
      technician_signature_url: 'SIGNED_DIGITALLY',
      client_signature_name: clientName,
      client_signature_url: 'SIGNED_DIGITALLY',
      client_feedback_rating: 5,
      ai_pest_detected: aiDetection.detected,
      ai_confidence_score: aiDetection.confidence,
      checklist_responses: [
        { item_label: 'Perimeter Wall & Expansion Joint Inspection', passed: true, notes: 'Completed' },
        { item_label: 'Moisture Level Reading (< 18% Required)', passed: !checklist.moisture_high, notes: checklist.moisture_high ? 'High 21%' : 'Normal' },
        { item_label: 'Subterranean Mud Tubes Detected', passed: !checklist.mud_tubes, notes: checklist.mud_tubes ? 'Active mud tube found' : 'None' },
        { item_label: 'Chemical Barrier Drill Integrity Check', passed: checklist.chemical_barrier_intact, notes: 'Drilled 6 holes' }
      ],
      photos: [
        {
          photo_url: evidencePhoto,
          caption: 'Live evidence photo with AI bounding box & GPS watermark',
          ai_detected_pest: aiDetection.detected,
          ai_confidence: aiDetection.confidence
        }
      ]
    };

    if (isOffline) {
      // Simulate saving to local offline queue
      setTimeout(() => {
        setOfflineQueue(prev => [...prev, payload]);
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 2000);
      }, 500);
    } else {
      // Send directly to backend API
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/inspections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setIsSubmitting(false);
        setSubmitSuccess(true);
        if (onInspectionCreated) onInspectionCreated(data);
        setTimeout(() => {
          setSubmitSuccess(false);
          onClose();
        }, 1500);
      } catch (err) {
        console.error('Submit error:', err);
        setIsSubmitting(false);
      }
    }
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    for (const item of offlineQueue) {
      await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ...item, offline_created_at: new Date().toISOString() })
      });
    }
    setOfflineQueue([]);
    setIsSubmitting(false);
    if (onInspectionCreated) onInspectionCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md overflow-y-auto">
      {/* Container with Device Frame */}
      <div className="relative my-6 flex flex-col items-center">
        
        {/* Top Control Bar for Simulator */}
        <div className="mb-3 flex items-center justify-between w-[380px] bg-slate-800 text-white px-4 py-2 rounded-xl text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <span className="font-bold text-glitzup-gold">Mobile Simulator</span>
            <span className="text-[10px] text-slate-400">React Native / Expo</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline Mode Toggle */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                isOffline ? 'bg-amber-500 text-slate-900' : 'bg-emerald-600 text-white'
              }`}
              title="Toggle network connection to test offline caching"
            >
              {isOffline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              <span>{isOffline ? 'Offline' : 'Online'}</span>
            </button>

            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Smartphone Hardware Frame */}
        <div className="relative w-[380px] h-[780px] rounded-[48px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col">
          
          {/* Inner Screen */}
          <div className="w-full h-full rounded-[38px] bg-white overflow-y-auto flex flex-col relative select-none">
            
            {/* Status Bar */}
            <div className="sticky top-0 z-30 flex items-center justify-between bg-glitzup-navy px-6 pt-3 pb-2 text-white text-[11px] font-semibold">
              <span>09:41</span>
              {/* Dynamic Island / Speaker */}
              <div className="h-4 w-24 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5">
                {isOffline ? <WifiOff className="h-3 w-3 text-amber-400" /> : <Wifi className="h-3 w-3" />}
                <span className="text-[10px]">5G</span>
              </div>
            </div>

            {/* Mobile App Navigation Header */}
            <div className="bg-glitzup-navy px-4 pb-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-glitzup-gold uppercase tracking-wider">GlitzUp PestCheck</div>
                  <div className="text-sm font-extrabold text-white">Termite Inspection #TK-804</div>
                </div>
                <div className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  Step 1 of 3
                </div>
              </div>
            </div>

            {/* Offline Sync Banner if applicable */}
            {offlineQueue.length > 0 && (
              <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-[11px] text-amber-900">
                <span>{offlineQueue.length} inspections saved offline</span>
                {!isOffline && (
                  <button
                    onClick={syncOfflineQueue}
                    className="font-bold underline text-amber-950 flex items-center gap-1"
                  >
                    <UploadCloud className="h-3.5 w-3.5" /> Sync Now
                  </button>
                )}
              </div>
            )}

            {/* Mobile Form Content */}
            <div className="flex-1 p-4 space-y-4 text-xs">
              
              {/* Site Details Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Site Details</span>
                  {gpsCoords.verified && (
                    <span className="rounded bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Property</label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white p-1 text-[11px] font-semibold text-slate-800 outline-none"
                  >
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.property_name}</option>
                    ))}
                  </select>
                </div>

                {/* GPS Coordinates Grabber */}
                <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Live GPS Telemetry</span>
                    <span className="font-mono font-bold text-slate-800">
                      {gpsCoords.lat}°, {gpsCoords.lng}° (±{gpsCoords.accuracy}m)
                    </span>
                  </div>
                  <button
                    onClick={grabGps}
                    disabled={isGrabbingGps}
                    className="rounded bg-slate-100 px-2 py-1 font-bold text-glitzup-navy hover:bg-slate-200"
                  >
                    {isGrabbingGps ? 'Pinging...' : 'Update GPS'}
                  </button>
                </div>
              </div>

              {/* Photo Evidence with AI Pest Box */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Camera className="h-3 w-3 text-glitzup-navy" />
                    Live Photo Evidence
                  </span>
                  <button
                    onClick={simulateAiScan}
                    disabled={isScanningAi}
                    className="text-[9px] font-bold text-glitzup-red flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {isScanningAi ? 'Analyzing...' : 'AI Scan'}
                  </button>
                </div>

                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img src={evidencePhoto} alt="Evidence preview" className="h-full w-full object-cover" />
                  
                  {/* AI Detection Box Overlay */}
                  {aiDetection.showBox && (
                    <div className="absolute inset-x-8 inset-y-6 border-2 border-red-500 rounded bg-red-500/15 pointer-events-none flex flex-col justify-between p-1">
                      <span className="self-start rounded bg-glitzup-red text-white text-[8px] font-bold px-1 py-0.5">
                        {aiDetection.detected}
                      </span>
                      <span className="self-end rounded bg-glitzup-navy text-glitzup-gold text-[7px] font-mono px-1">
                        GPS Watermarked
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist Toggles */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Inspection Checklist</span>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[11px] font-medium text-slate-800">Mud tubes detected</span>
                  <button
                    onClick={() => setChecklist(prev => ({ ...prev, mud_tubes: !prev.mud_tubes }))}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      checklist.mud_tubes ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {checklist.mud_tubes ? 'YES' : 'NO'}
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[11px] font-medium text-slate-800">Moisture level &gt; 18%</span>
                  <button
                    onClick={() => setChecklist(prev => ({ ...prev, moisture_high: !prev.moisture_high }))}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      checklist.moisture_high ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {checklist.moisture_high ? 'YES' : 'NO'}
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[11px] font-medium text-slate-800">Chemical Barrier Intact</span>
                  <button
                    onClick={() => setChecklist(prev => ({ ...prev, chemical_barrier_intact: !prev.chemical_barrier_intact }))}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      checklist.chemical_barrier_intact ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {checklist.chemical_barrier_intact ? 'YES' : 'NO'}
                  </button>
                </div>
              </div>

              {/* Voice Notes Feature */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${isRecordingVoice ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'}`}>
                    <Mic className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-800 block">Voice Note Memo</span>
                    <span className="text-[9px] text-slate-500">
                      {isRecordingVoice ? 'Recording 0:04s...' : (voiceNoteRecorded ? 'Voice memo recorded (0:18s)' : 'Tap to record observations')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isRecordingVoice) {
                      setIsRecordingVoice(true);
                      setTimeout(() => {
                        setIsRecordingVoice(false);
                        setVoiceNoteRecorded(true);
                      }, 2500);
                    }
                  }}
                  className="text-[9px] font-bold rounded bg-white px-2 py-1 border border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  {isRecordingVoice ? 'Stop' : (voiceNoteRecorded ? 'Re-record' : 'Record')}
                </button>
              </div>

              {/* Digital Signatures Pad */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Digital Signatures</span>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
                    <span className="text-slate-400 block text-[9px]">Client Representative</span>
                    <div className="font-serif italic font-bold text-slate-800 my-1">
                      {clientName.split(' ')[1] || 'V. Ramanathan'}
                    </div>
                    <span className="text-[8px] text-emerald-600 font-bold">✓ Signed</span>
                  </div>

                  <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
                    <span className="text-slate-400 block text-[9px]">Technician Sign-off</span>
                    <div className="font-serif italic font-bold text-glitzup-navy my-1">
                      Rajesh Kumar
                    </div>
                    <span className="text-[8px] text-emerald-600 font-bold">✓ Signed</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                    isOffline 
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                      : 'bg-glitzup-gold text-glitzup-navy hover:bg-amber-400'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : submitSuccess ? (
                    <span className="flex items-center gap-1 text-emerald-950">
                      <Check className="h-4 w-4" /> {isOffline ? 'Saved to Offline Queue!' : 'Submitted to QA!'}
                    </span>
                  ) : (
                    <span>
                      {isOffline ? 'Save to Offline Queue' : 'Submit Inspection (Sync Ready)'}
                    </span>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
