import React, { useState } from 'react';
import { Hazard, RiskLevel } from '../types';
import { 
  AlertOctagon, 
  Flame, 
  Waves, 
  Building2, 
  Mountain, 
  Trash2, 
  Zap, 
  FlaskConical, 
  Clock, 
  MapPin, 
  Activity 
} from 'lucide-react';

interface HazardMonitoringProps {
  hazards: Hazard[];
  onSelectHazard?: (h: Hazard) => void;
}

export const HazardMonitoring: React.FC<HazardMonitoringProps> = ({
  hazards,
  onSelectHazard
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | RiskLevel>('ALL');

  const filtered = severityFilter === 'ALL'
    ? hazards
    : hazards.filter(h => h.severity === severityFilter);

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'Fire':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Flood':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'Structural Collapse':
        return <Building2 className="w-4 h-4 text-red-400" />;
      case 'Landslide':
        return <Mountain className="w-4 h-4 text-amber-500" />;
      case 'Exposed Electrical':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Chemical / Gas':
        return <FlaskConical className="w-4 h-4 text-purple-400" />;
      default:
        return <Trash2 className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: RiskLevel) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/40';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/40';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/40';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Spreading':
        return 'text-red-400 bg-red-950/80 border-red-500/40 animate-pulse';
      case 'Active':
        return 'text-amber-400 bg-amber-950/80 border-amber-500/40';
      case 'Contained':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';
      default:
        return 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40';
    }
  };

  return (
    <div id="hazard-monitoring-panel" className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-5 shadow-sm backdrop-blur-md">
      {/* Header and Severity Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Hazard Monitoring
            </h2>
            <p className="text-xs text-slate-400">
              LiDAR displacement, thermal anomaly & environmental sensors
            </p>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-full border border-white/[0.08] text-xs">
          {(['ALL', 'Critical', 'High', 'Medium', 'Low'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-full transition-colors text-xs font-medium cursor-pointer ${
                severityFilter === sev
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Hazard Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Hazard Type</th>
              <th className="py-2.5 px-3">Location & Coordinates</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Detection Time</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Sensor Telemetry Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filtered.map(h => (
              <tr
                key={h.id}
                onClick={() => onSelectHazard?.(h)}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* Hazard Type */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      {getHazardIcon(h.type)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        {h.type}
                      </span>
                      <span className="text-[10px] text-slate-500">{h.id}</span>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="py-3 px-3">
                  <div className="text-slate-200 font-medium">{h.location}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {h.coordinates.lat.toFixed(4)}, {h.coordinates.lon.toFixed(4)}
                  </div>
                </td>

                {/* Confidence */}
                <td className="py-3 px-3">
                  <span className="font-bold text-slate-100">{h.confidence}%</span>
                  <div className="w-12 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                    <div
                      className="bg-orange-500 h-1 rounded-full"
                      style={{ width: `${h.confidence}%` }}
                    />
                  </div>
                </td>

                {/* Severity */}
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(h.severity)}`}>
                    {h.severity}
                  </span>
                </td>

                {/* Detection Time */}
                <td className="py-3 px-3 text-slate-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{h.detectedAt}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(h.status)}`}>
                    {h.status}
                  </span>
                </td>

                {/* Details */}
                <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs">
                  <p className="line-clamp-2">{h.details}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
