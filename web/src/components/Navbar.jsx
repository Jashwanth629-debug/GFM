import React, { useState } from 'react';
import { 
  Building2, 
  Bell, 
  UserCheck, 
  Download, 
  Smartphone, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  PlusCircle
} from 'lucide-react';

export default function Navbar({ 
  facilities, 
  selectedFacility, 
  onSelectFacility, 
  onOpenMobileSimulator, 
  onOpenTaskAssign,
  currentUser,
  notifications,
  onExportExcel
}) {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-4 z-30 flex h-16 w-[calc(100%-2rem)] mx-auto items-center justify-between glass-panel px-6 mb-8">
      {/* Left: Facility Selector */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex items-center gap-2 glass-input px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/40 cursor-pointer">
            <Building2 className="h-4 w-4 text-glitzup-navy" />
            <select 
              value={selectedFacility} 
              onChange={(e) => onSelectFacility(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none cursor-pointer pr-4 appearance-none"
            >
              <option value="">🏢 All GlitzUp Properties (Chennai & Tamil Nadu)</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.property_name} ({f.client_name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Mobile Field App Simulator Trigger */}
        <button
          onClick={onOpenMobileSimulator}
          className="hidden md:flex items-center gap-2 rounded-lg bg-gradient-to-r from-glitzup-navy to-glitzup-slate px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all"
        >
          <Smartphone className="h-4 w-4 text-glitzup-gold" />
          <span>Mobile Field App</span>
          <span className="rounded bg-glitzup-red px-1.5 py-0.5 text-[10px] font-extrabold uppercase">Live Test</span>
        </button>

        {/* Assign Task Button */}
        <button
          onClick={onOpenTaskAssign}
          className="hidden sm:flex items-center gap-1.5 glass-button px-3 py-2 text-xs font-semibold text-slate-700"
        >
          <PlusCircle className="h-4 w-4 text-glitzup-navy" />
          <span>Assign Task</span>
        </button>

        {/* Export Excel Button */}
        <button
          onClick={onExportExcel}
          className="flex items-center gap-1.5 glass-button px-3 py-2 text-xs font-semibold text-slate-700"
          title="Export CSV / Excel compliance ledger"
        >
          <Download className="h-4 w-4 text-emerald-600" />
          <span className="hidden lg:inline">Export Excel</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative glass-button p-2 text-slate-500 hover:text-slate-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-glitzup-red text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-80 glass-card p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-white/40 pb-2 mb-2">
                <span className="text-xs font-bold uppercase text-slate-500">Live QA Alerts & Reminders</span>
                <span className="text-[11px] font-semibold text-glitzup-navy">{notifications.length} total</span>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-lg bg-white/40 hover:bg-white/60 p-2.5 text-xs transition-colors cursor-pointer border border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.channel.toUpperCase()}</span>
                    </div>
                    <p className="mt-1 text-slate-600 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-white/40 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-glitzup-navy font-bold text-xs text-white">
            {currentUser?.full_name ? currentUser.full_name.substring(0, 2).toUpperCase() : 'QA'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-800">{currentUser?.full_name || 'S. Karthikeyan'}</div>
            <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              <span>{currentUser?.role === 'admin' ? 'QA Supervisor / Lead' : 'Field Technician'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
