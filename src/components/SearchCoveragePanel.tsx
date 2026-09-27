import React from 'react';
import { ZoneCoverage } from '../types';
import { Map, CheckCircle2, Clock, AlertCircle, Users, AlertTriangle } from 'lucide-react';

interface SearchCoveragePanelProps {
  zones: ZoneCoverage[];
  overallCoverage: number;
}

export const SearchCoveragePanel: React.FC<SearchCoveragePanelProps> = ({
  zones,
  overallCoverage,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';
      case 'In Progress':
        return 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40 animate-pulse';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const totalArea = zones.reduce((acc, z) => acc + z.areaSqKm, 0);
  const searchedArea = zones.reduce((acc, z) => acc + (z.areaSqKm * z.coveragePercent) / 100, 0);

  return (
    <div id="search-coverage-panel" className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-5 shadow-sm backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Sector Search Coverage
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous Swarm Path Optimization · Gridded Sector Progress
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            Searched: <strong className="text-cyan-300 font-mono">{searchedArea.toFixed(1)} / {totalArea.toFixed(1)} km²</strong>
          </span>
          <span className="text-sm font-semibold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 font-mono">
            {overallCoverage}% Overall
          </span>
        </div>
      </div>

      {/* Primary Coverage Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-white/[0.08]">
          <div
            className="bg-cyan-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${overallCoverage}%` }}
          />
        </div>
      </div>

      {/* Individual Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {zones.map(z => (
          <div
            key={z.id}
            className="p-4 rounded-xl bg-slate-950/40 border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-white">
                  {z.name.split('–')[0].trim()}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadge(z.status)}`}>
                  {z.status}
                </span>
              </div>

              <div className="text-xs text-slate-400 mb-2.5">
                {z.name.split('–')[1] || ''}
              </div>

              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400 text-xs">Coverage</span>
                <span className="font-semibold text-cyan-300 font-mono">{z.coveragePercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
                <div
                  className={`h-1.5 rounded-full ${
                    z.status === 'Complete'
                      ? 'bg-emerald-400'
                      : z.status === 'In Progress'
                      ? 'bg-cyan-400'
                      : 'bg-slate-700'
                  }`}
                  style={{ width: `${z.coveragePercent}%` }}
                />
              </div>
            </div>

            {/* Zone statistics */}
            <div className="pt-2 border-t border-white/[0.06] space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  Survivors Found:
                </span>
                <span className="text-slate-200 font-bold">{z.survivorsFound}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Hazards Mapped:
                </span>
                <span className="text-slate-200 font-bold">{z.hazardsFound}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1">
                <span>Sector Area: {z.areaSqKm} km²</span>
                <span className="text-cyan-400">{z.assignedDrone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
