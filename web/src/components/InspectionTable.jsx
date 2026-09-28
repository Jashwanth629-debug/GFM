import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Eye, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function InspectionTable({ 
  inspections, 
  onSelectInspection, 
  search, 
  setSearch, 
  statusFilter, 
  setStatusFilter,
  categoryFilter,
  setCategoryFilter
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
            Pending QA
          </span>
        );
      case 'flagged_investigation':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            Flagged
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="border-b border-white/40 p-5 bg-white/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Active Field Inspection Review Queue</h3>
          <p className="text-xs text-slate-500">
            Showing {inspections.length} recorded inspections across GlitzUp accounts
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Client, Tech..."
              className="w-48 sm:w-60 glass-input py-1.5 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="flagged_investigation">Flagged for QA</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-input px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="">All Pest Types</option>
            <option value="termite">Termite Treatment</option>
            <option value="rodent">Rodent Control</option>
            <option value="aftercare">14-Day Aftercare</option>
            <option value="client_feedback">Client Feedback</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/40 bg-white/30 text-[11px] font-bold uppercase tracking-wider text-slate-700">
            <tr>
              <th className="px-5 py-3.5">Inspection ID</th>
              <th className="px-5 py-3.5">Client & Facility</th>
              <th className="px-5 py-3.5">Field Technician</th>
              <th className="px-5 py-3.5">Pest Type & AI Detection</th>
              <th className="px-5 py-3.5">GPS Geotag</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40 bg-white/10">
            {inspections.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No inspections match your filter criteria.
                </td>
              </tr>
            ) : (
              inspections.map((ins) => (
                <tr 
                  key={ins.id}
                  className="hover:bg-white/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectInspection(ins.id)}
                >
                  {/* Inspection ID */}
                  <td className="px-5 py-4 font-mono font-bold text-glitzup-navy">
                    {ins.inspection_number}
                    <div className="text-[10px] font-sans text-slate-400 font-normal">
                      {new Date(ins.completed_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>

                  {/* Client & Facility */}
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{ins.property_name}</div>
                    <div className="text-[11px] text-slate-500">{ins.client_name}</div>
                  </td>

                  {/* Technician */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800">{ins.technician_name}</div>
                    <div className="text-[10px] text-slate-400">{ins.technician_code}</div>
                  </td>

                  {/* Pest & AI Detection */}
                  <td className="px-5 py-4">
                    <div className="capitalize font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{ins.category.replace('_', ' ')}</span>
                      {ins.overall_severity === 'critical' && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-black text-red-700 uppercase">
                          Critical
                        </span>
                      )}
                    </div>
                    {ins.ai_pest_detected && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium mt-0.5">
                        <Sparkles className="h-3 w-3 text-glitzup-gold" />
                        <span className="truncate max-w-[150px]">{ins.ai_pest_detected}</span>
                      </div>
                    )}
                  </td>

                  {/* GPS Geotag */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-glitzup-red" />
                      <span className="font-mono text-[11px]">
                        {Number(ins.gps_latitude).toFixed(4)}°, {Number(ins.gps_longitude).toFixed(4)}°
                      </span>
                    </div>
                    {ins.is_geofence_verified ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 mt-0.5">
                        <ShieldCheck className="h-3 w-3" /> Geofence Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-600 mt-0.5">
                        Off-site GPS
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {getStatusBadge(ins.status)}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectInspection(ins.id)}
                        className="rounded-lg bg-glitzup-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-glitzup-slate transition-all shadow-sm flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Review & Sign</span>
                      </button>

                      <a
                        href={`http://localhost:5000/api/reports/pdf/${ins.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="glass-button p-1.5 text-slate-700"
                        title="View Compliance Certificate"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
