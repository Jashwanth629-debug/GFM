import React from 'react';
import { 
  FileCheck2, 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  TrendingUp, 
  ShieldAlert 
} from 'lucide-react';

export default function KpiCards({ metrics }) {
  const cards = [
    {
      title: 'Total Inspections',
      value: metrics?.total_inspections || 1428,
      delta: '+12.4% MoM',
      deltaPositive: true,
      icon: FileCheck2,
      color: 'text-glitzup-navy',
      bg: 'bg-blue-50/80',
      border: 'border-blue-100'
    },
    {
      title: 'Compliance Rate',
      value: metrics?.compliance_rate || '97.2%',
      badge: 'CIBRC / ISO 9001',
      delta: 'Target: >95%',
      deltaPositive: true,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-100'
    },
    {
      title: 'Pending QA Approvals',
      value: metrics?.pending_approvals || 14,
      badge: 'Action Required',
      delta: 'SLA: < 4 hrs',
      deltaPositive: false,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50/80',
      border: 'border-amber-100'
    },
    {
      title: 'Rejection Rate',
      value: metrics?.rejection_rate || '2.8%',
      delta: 'Down 0.6% vs last quarter',
      deltaPositive: true,
      icon: AlertOctagon,
      color: 'text-glitzup-red',
      bg: 'bg-red-50/80',
      border: 'border-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`glass-card p-5 transition-all hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{c.title}</span>
              <div className={`rounded-xl ${c.bg} p-2.5 ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">{c.value}</span>
              {c.badge && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {c.badge}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center text-xs font-semibold text-slate-500">
              <TrendingUp className={`mr-1.5 h-3.5 w-3.5 ${c.deltaPositive ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className={c.deltaPositive ? 'text-emerald-700' : 'text-amber-700'}>{c.delta}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
