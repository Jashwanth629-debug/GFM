import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  ShieldCheck, 
  Users, 
  FileText, 
  Smartphone, 
  Settings, 
  HelpCircle,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  onSelectTab, 
  pendingCount, 
  onOpenMobileSimulator,
  onSwitchRole,
  currentRole
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'inspections', label: 'Live Inspections Queue', icon: ClipboardCheck, badge: pendingCount },
    { id: 'technicians', label: 'Technicians & EHS', icon: Users },
    { id: 'reports', label: 'Compliance Reports', icon: FileText },
    { id: 'simulator', label: 'Field Mobile Simulator', icon: Smartphone, highlight: true }
  ];

  return (
    <aside className="fixed left-4 top-4 z-40 flex h-[calc(100vh-2rem)] w-64 flex-col justify-between glass-panel">
      <div>
        {/* Brand Header */}
        <div className="flex h-20 items-center gap-3 border-b border-white/40 px-6">
          <div className="flex items-center justify-center w-full">
            {/* The user will place the actual logo.png in the public folder */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-glitzup-gold" />
              <span className="font-extrabold text-xl tracking-tight text-glitzup-navy uppercase">Glitz Up</span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5 px-3 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'simulator') {
                    onOpenMobileSimulator();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white/60 text-glitzup-navy shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-white/40 hover:text-glitzup-navy'
                } ${item.highlight ? 'bg-gradient-to-r from-glitzup-red/10 to-transparent border border-glitzup-red/20' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-glitzup-navy' : 'text-slate-400 group-hover:text-glitzup-navy'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-glitzup-gold px-2 text-[10px] font-extrabold text-glitzup-navy">
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="rounded bg-glitzup-red/90 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                    App
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Toggle / Footer */}
      <div className="border-t border-white/40 p-4">
        <div className="glass-card p-3 mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
            <span>Active Role:</span>
            <span className="font-bold text-glitzup-navy uppercase">
              {currentRole === 'admin' ? 'Admin / QA' : 'Technician'}
            </span>
          </div>
          <button
            onClick={onSwitchRole}
            className="w-full rounded-lg bg-white/50 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-white/80 transition-colors border border-white/60"
          >
            Switch to {currentRole === 'admin' ? 'Field Tech View' : 'Admin QA View'}
          </button>
        </div>

        <div className="text-center text-[10px] text-slate-500">
          GlitzUp Facility Management © 2026<br/>
          <a href="https://www.glitzupfm.in" target="_blank" rel="noreferrer" className="text-glitzup-navy font-semibold hover:underline">
            www.glitzupfm.in
          </a>
        </div>
      </div>
    </aside>
  );
}
