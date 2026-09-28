import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Bug, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsCharts({ analytics }) {
  const trends = analytics?.monthly_trends || [
    { month: 'Jan', pest_sightings: 110, inspections: 125 },
    { month: 'Feb', pest_sightings: 95, inspections: 118 },
    { month: 'Mar', pest_sightings: 135, inspections: 142 },
    { month: 'Apr', pest_sightings: 120, inspections: 130 },
    { month: 'May', pest_sightings: 145, inspections: 160 },
    { month: 'Jun', pest_sightings: 105, inspections: 122 }
  ];

  const chartData = {
    labels: trends.map((t) => t.month),
    datasets: [
      {
        label: 'Total Field Inspections',
        data: trends.map((t) => t.inspections),
        backgroundColor: '#012341',
        borderRadius: 6,
        barPercentage: 0.6
      },
      {
        label: 'Pest Infestations Detected',
        data: trends.map((t) => t.pest_sightings),
        backgroundColor: '#E74C3C',
        borderRadius: 6,
        barPercentage: 0.6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter', size: 11, weight: '600' },
          boxWidth: 12,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#012341',
        titleFont: { family: 'Montserrat', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Inter', size: 11 } }
      }
    }
  };

  const pestCategories = analytics?.pest_breakdown || [
    { category: 'termite', count: 42 },
    { category: 'rodent', count: 28 },
    { category: 'cockroach', count: 19 },
    { category: 'aftercare', count: 35 }
  ];

  const technicians = analytics?.technician_performance || [
    { full_name: 'Rajesh Kumar', employee_code: 'GZ-TECH-042', total_inspections: 48, approved_count: 47, avg_rating: 4.9 },
    { full_name: 'Anand Murugan', employee_code: 'GZ-TECH-088', total_inspections: 36, approved_count: 35, avg_rating: 4.8 },
    { full_name: 'Selvam Perumal', employee_code: 'GZ-TECH-103', total_inspections: 29, approved_count: 27, avg_rating: 4.7 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Monthly Recurring Pest Trends Chart */}
      <div className="lg:col-span-2 glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recurring Pest Trends & Inspection Volume</h3>
            <p className="text-xs text-slate-500">Tracking monthly pest incidence vs resolved treatment efficacy</p>
          </div>
          <span className="glass-button px-3 py-1 text-xs font-semibold text-slate-700">
            2026 Live Telemetry
          </span>
        </div>
        <div className="h-64 sm:h-72 w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* 2. Pest Category Distribution & Leaderboard */}
      <div className="space-y-6">
        {/* Pest Breakdown */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pest Types Tracked</h4>
            <Bug className="h-4 w-4 text-glitzup-red" />
          </div>
          <div className="space-y-2.5">
            {pestCategories.map((p, idx) => {
              const labels = {
                termite: 'Subterranean Termites',
                rodent: 'Rodent Bait Stations',
                cockroach: 'Commercial Cockroach Gel',
                aftercare: '14-Day Efficacy Audits',
                client_feedback: 'Handover Feedback'
              };
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 capitalize">{labels[p.category] || p.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-white/50 overflow-hidden border border-white/40">
                      <div 
                        className="h-full bg-glitzup-navy rounded-full" 
                        style={{ width: `${Math.min(100, (p.count / 50) * 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 w-6 text-right">{p.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Technician Leaderboard */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Field Specialists</h4>
            <Award className="h-4 w-4 text-glitzup-gold" />
          </div>
          <div className="divide-y divide-white/30">
            {technicians.map((t, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{t.full_name}</div>
                  <div className="text-[10px] text-slate-400">{t.employee_code}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-emerald-600">★ {t.avg_rating || '4.9'}</div>
                  <div className="text-[10px] text-slate-500">{t.total_inspections} Audits</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
