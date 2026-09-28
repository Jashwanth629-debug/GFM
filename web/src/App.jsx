import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import KpiCards from './components/KpiCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import InspectionTable from './components/InspectionTable';
import InspectionModal from './components/InspectionModal';
import TaskAssignModal from './components/TaskAssignModal';
import MobileSimulatorModal from './components/MobileSimulatorModal';
import { 
  ClipboardList, 
  FileCheck, 
  Users, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState({
    id: 'usr-admin-01',
    full_name: 'S. Karthikeyan',
    email: 'admin@glitzupfm.in',
    role: 'admin',
    employee_code: 'GZ-QA-001'
  });

  // Data states
  const [facilities, setFacilities] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Filter states
  const [selectedFacility, setSelectedFacility] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [activeInspectionId, setActiveInspectionId] = useState(null);
  const [activeInspectionDetail, setActiveInspectionDetail] = useState(null);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);
  const [isTaskAssignOpen, setIsTaskAssignOpen] = useState(false);

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      // 1. Fetch Facilities
      const facRes = await fetch('/api/facilities', {
        headers: { Authorization: `Bearer admin_demo_token` }
      });
      if (facRes.ok) {
        const data = await facRes.json();
        setFacilities(data.facilities || []);
      }

      // 2. Fetch Templates
      const tmplRes = await fetch('/api/templates', {
        headers: { Authorization: `Bearer admin_demo_token` }
      });
      if (tmplRes.ok) {
        const data = await tmplRes.json();
        setTemplates(data.templates || []);
      }

      // 3. Fetch Analytics
      const anaRes = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer admin_demo_token` }
      });
      if (anaRes.ok) {
        const data = await anaRes.json();
        setAnalytics(data);
      }

      // 4. Fetch Notifications
      const notifRes = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer admin_demo_token` }
      });
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  // Fetch Inspections with query filters
  const fetchInspections = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFacility) params.append('facility_id', selectedFacility);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/inspections?${params.toString()}`, {
        headers: { Authorization: `Bearer admin_demo_token` }
      });
      if (res.ok) {
        const data = await res.json();
        setInspections(data.inspections || []);
      }
    } catch (err) {
      console.error('Error fetching inspections:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [selectedFacility, statusFilter, categoryFilter, search]);

  // Load Inspection Detail for modal
  const handleSelectInspection = async (id) => {
    setActiveInspectionId(id);
    try {
      const res = await fetch(`/api/inspections/${id}`, {
        headers: { Authorization: `Bearer admin_demo_token` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveInspectionDetail(data.inspection);
      }
    } catch (err) {
      console.error('Error fetching inspection details:', err);
    }
  };

  // Update inspection status (Approve/Reject/Flag)
  const handleUpdateStatus = async (id, payload) => {
    try {
      const res = await fetch(`/api/inspections/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer admin_demo_token`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // Refresh inspection detail & lists
        handleSelectInspection(id);
        fetchInspections();
        fetchData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Dispatch Reminder / Alert
  const handleDispatchReminder = async (payload) => {
    try {
      await fetch('/api/notifications/reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer admin_demo_token`
        },
        body: JSON.stringify(payload)
      });
      fetchData();
    } catch (err) {
      console.error('Error dispatching reminder:', err);
    }
  };

  // Export CSV
  const handleExportExcel = () => {
    window.location.href = 'http://localhost:5000/api/reports/excel';
  };

  // Switch role between QA Lead and Field Technician
  const handleSwitchRole = () => {
    if (currentUser.role === 'admin') {
      setCurrentUser({
        id: 'usr-tech-01',
        full_name: 'Rajesh Kumar',
        email: 'tech.rajesh@glitzupfm.in',
        role: 'field_technician',
        employee_code: 'GZ-TECH-042'
      });
    } else {
      setCurrentUser({
        id: 'usr-admin-01',
        full_name: 'S. Karthikeyan',
        email: 'admin@glitzupfm.in',
        role: 'admin',
        employee_code: 'GZ-QA-001'
      });
    }
  };

  const pendingCount = inspections.filter((i) => i.status === 'pending_review').length;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingCount={pendingCount}
        onOpenMobileSimulator={() => setIsMobileSimulatorOpen(true)}
        onSwitchRole={handleSwitchRole}
        currentRole={currentUser.role}
      />

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        <Navbar
          facilities={facilities}
          selectedFacility={selectedFacility}
          onSelectFacility={setSelectedFacility}
          onOpenMobileSimulator={() => setIsMobileSimulatorOpen(true)}
          onOpenTaskAssign={() => setIsTaskAssignOpen(true)}
          currentUser={currentUser}
          notifications={notifications}
          onExportExcel={handleExportExcel}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Executive Overview Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-glitzup-navy tracking-tight">
                  GlitzUp PestCheck Compliance Portal
                </h1>
                <span className="rounded-md bg-glitzup-navy text-glitzup-gold px-2 py-0.5 text-[10px] font-extrabold uppercase">
                  ISO 9001 / CIBRC
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chennai Facility Management Division • Field Service Inspection & Verification Dashboard
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileSimulatorOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-glitzup-navy px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-glitzup-slate transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-glitzup-gold" />
                <span>Simulate Field Inspection</span>
              </button>
            </div>
          </div>

          {/* Tab Views */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI summary cards */}
              <KpiCards metrics={analytics?.metrics} />

              {/* Analytics chart: Recurring pest trends + distribution */}
              <AnalyticsCharts analytics={analytics} />

              {/* Live Review Queue */}
              <InspectionTable
                inspections={inspections}
                onSelectInspection={handleSelectInspection}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
              />
            </div>
          )}

          {currentTab === 'inspections' && (
            <div className="space-y-6">
              <InspectionTable
                inspections={inspections}
                onSelectInspection={handleSelectInspection}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
              />
            </div>
          )}

          {currentTab === 'technicians' && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold text-glitzup-navy text-sm">Certified Field Pest Technicians (Chennai Zone)</h3>
              <p className="text-xs text-slate-700">
                Technicians equipped with GlitzUp PestCheck mobile native app for GPS geotagging, CIBRC chemical verification, and offline sync.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {(analytics?.technician_performance || []).map((t, idx) => (
                  <div key={idx} className="glass-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{t.full_name}</span>
                      <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5">
                        Active
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">Employee Code: <strong className="font-mono text-slate-800">{t.employee_code}</strong></div>
                    <div className="text-xs text-slate-600">Total Inspections: <strong>{t.total_inspections}</strong></div>
                    <div className="text-xs text-emerald-600 font-bold">Approved Pass Rate: {((t.approved_count / (t.total_inspections || 1)) * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'reports' && (
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-glitzup-navy text-sm">Statutory Compliance & Audit Reports</h3>
                  <p className="text-xs text-slate-700">
                    Export certified inspection dossiers for Central Insecticides Board (CIBRC), ISO 9001/14001 audits, and corporate clients.
                  </p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Full Excel Ledger</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 pt-2">
                {inspections.map((ins) => (
                  <div key={ins.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-glitzup-navy">{ins.inspection_number}</span>
                      <span className="mx-2 text-slate-300">•</span>
                      <span className="font-semibold text-slate-800">{ins.property_name}</span>
                      <span className="mx-2 text-slate-300">•</span>
                      <span className="text-slate-500 capitalize">{ins.category.replace('_', ' ')}</span>
                    </div>
                    <a
                      href={`http://localhost:5000/api/reports/pdf/${ins.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="glass-button px-3 py-1 font-bold text-glitzup-navy hover:text-slate-900 flex items-center gap-1"
                    >
                      <span>View PDF Certificate</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Inspection Review Modal */}
      {activeInspectionDetail && (
        <InspectionModal
          inspection={activeInspectionDetail}
          onClose={() => {
            setActiveInspectionId(null);
            setActiveInspectionDetail(null);
          }}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Task Assign & Reminder Modal */}
      {isTaskAssignOpen && (
        <TaskAssignModal
          facilities={facilities}
          onClose={() => setIsTaskAssignOpen(false)}
          onDispatchReminder={handleDispatchReminder}
        />
      )}

      {/* Interactive Mobile Field Simulator Modal */}
      {isMobileSimulatorOpen && (
        <MobileSimulatorModal
          facilities={facilities}
          templates={templates}
          onClose={() => setIsMobileSimulatorOpen(false)}
          onInspectionCreated={() => {
            fetchInspections();
            fetchData();
          }}
        />
      )}
    </div>
  );
}
