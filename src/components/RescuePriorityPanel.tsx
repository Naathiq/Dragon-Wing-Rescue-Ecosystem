import React, { useState } from 'react';
import { Survivor, Hazard } from '../types';
import { ShieldAlert, Flame, Waves, AlertTriangle, ArrowRight, CheckCircle2, Siren, Zap, LayoutGrid, List } from 'lucide-react';

interface RescuePriorityPanelProps {
  survivors: Survivor[];
  hazards: Hazard[];
  onDispatchTeam?: (survivorId: string) => void;
  onFocusSurvivor?: (survivor: Survivor) => void;
}

export const RescuePriorityPanel: React.FC<RescuePriorityPanelProps> = ({
  survivors,
  hazards,
  onDispatchTeam,
  onFocusSurvivor
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  // Sort survivors by priority score descending
  const prioritized = [...survivors].sort((a, b) => b.priorityScore - a.priorityScore);

  const getPriorityStyle = (score: number) => {
    if (score >= 90) {
      return {
        label: 'CRITICAL PRIORITY',
        border: 'border-red-500/60 bg-red-950/20',
        badge: 'bg-red-500/20 text-red-300 border-red-500/50',
        bar: 'bg-red-500',
        text: 'text-red-400'
      };
    }
    if (score >= 70) {
      return {
        label: 'HIGH PRIORITY',
        border: 'border-amber-500/50 bg-amber-950/20',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        bar: 'bg-amber-500',
        text: 'text-amber-400'
      };
    }
    if (score >= 50) {
      return {
        label: 'MEDIUM PRIORITY',
        border: 'border-yellow-500/40 bg-yellow-950/10',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        bar: 'bg-yellow-500',
        text: 'text-yellow-400'
      };
    }
    return {
      label: 'STABLE / LOW',
      border: 'border-emerald-500/30 bg-emerald-950/10',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      bar: 'bg-emerald-500',
      text: 'text-emerald-400'
    };
  };

  return (
    <div id="ai-rescue-priority-system" className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-5 shadow-sm backdrop-blur-md flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Siren className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Rescue Priority Ranking
            </h2>
            <p className="text-xs text-slate-400">
              Composite threat analysis & automated triage index
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-full border border-white/[0.08] text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors text-xs font-medium cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-red-500/20 text-red-300 font-medium border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors text-xs font-medium cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-red-500/20 text-red-300 font-medium border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <span className="text-xs font-medium text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 hidden sm:inline-block">
            Triage Index
          </span>
        </div>
      </div>

      {/* Description Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-center text-[10px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800">
        <div>
          <span className="text-slate-500 block">FIRE PROX</span>
          <span className="text-red-400 font-bold">W=0.35</span>
        </div>
        <div>
          <span className="text-slate-500 block">FLOOD RISE</span>
          <span className="text-cyan-400 font-bold">W=0.25</span>
        </div>
        <div>
          <span className="text-slate-500 block">COLLAPSE RISK</span>
          <span className="text-amber-400 font-bold">W=0.25</span>
        </div>
        <div>
          <span className="text-slate-500 block">YOLO CONF</span>
          <span className="text-emerald-400 font-bold">W=0.15</span>
        </div>
      </div>

      {/* Priority Content: TABLE or CARDS */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/40 flex-1">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Survivor</th>
                <th className="py-2.5 px-3">Priority Score</th>
                <th className="py-2.5 px-3">Threat Context</th>
                <th className="py-2.5 px-3">Coordinates / Zone</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 bg-slate-900/30">
              {prioritized.map((s, idx) => {
                const style = getPriorityStyle(s.priorityScore);
                const isCritical = s.priorityScore >= 90 && s.status !== 'Rescued';

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCritical ? 'bg-red-950/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-300">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        idx === 0 ? 'bg-red-500 text-white font-extrabold' : idx === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>

                    {/* Survivor */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-cyan-300 text-sm">{s.id}</div>
                      <div className="text-[10px] text-slate-400">{s.detectionType}</div>
                    </td>

                    {/* Score */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${style.text}`}>
                          {s.priorityScore}/100
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border ${style.badge}`}>
                          {style.label.replace(' PRIORITY', '')}
                        </span>
                      </div>
                      <div className="w-20 bg-slate-950 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className={`h-1 rounded-full ${style.bar}`}
                          style={{ width: `${s.priorityScore}%` }}
                        />
                      </div>
                    </td>

                    {/* Hazard */}
                    <td className="py-2.5 px-3 text-xs">
                      <div className="text-amber-300 font-medium truncate max-w-[180px]">{s.nearbyHazard}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{s.notes}</div>
                    </td>

                    {/* Zone & Coordinates */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                      <div className="text-slate-200">{s.zone}</div>
                      <div className="text-[10px] text-slate-500">
                        {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        s.status === 'Rescued'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : s.status === 'Rescue Assigned'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                          : 'bg-red-950 text-red-300 border-red-500/40'
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {s.status === 'Unrescued' ? (
                        <button
                          onClick={() => onDispatchTeam?.(s.id)}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition-all flex items-center gap-1 ml-auto"
                        >
                          <span>Dispatch</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : s.status === 'Rescue Assigned' ? (
                        <span className="text-amber-400 font-semibold text-[10px]">
                          En Route
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-[10px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Safe
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Priority Cards */
        <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
          {prioritized.map(s => {
            const style = getPriorityStyle(s.priorityScore);
            const isCritical = s.priorityScore >= 90 && s.status !== 'Rescued';

            return (
              <div
                key={s.id}
                className={`p-3.5 rounded-xl border transition-all ${style.border} ${
                  isCritical ? 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">
                      Survivor {s.id}
                    </span>
                    <span className="text-xs text-slate-300">
                      ({s.detectionType})
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-semibold ${style.text}`}>
                      {s.priorityScore}/100
                    </span>
                  </div>
                </div>

                {/* Threat factors summary */}
                <div className="space-y-1 mb-2.5 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-slate-400">Threat Context:</span>
                    <span className="text-amber-300 font-semibold">{s.nearbyHazard}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-2">
                    {s.notes}
                  </div>
                </div>

                {/* Progress gauge */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 mb-2.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${style.bar}`}
                    style={{ width: `${s.priorityScore}%` }}
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <span className="text-[11px] text-slate-400">
                    Zone: <strong className="text-slate-200">{s.zone}</strong> · Conf: <strong className="text-emerald-400">{s.confidence}%</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {s.status === 'Unrescued' ? (
                      <button
                        onClick={() => onDispatchTeam?.(s.id)}
                        className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition-all flex items-center gap-1"
                      >
                        <span>Dispatch Team</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : s.status === 'Rescue Assigned' ? (
                      <span className="text-amber-400 font-semibold text-[11px]">
                        Team En Route ({s.assignedTeam || 'Squad 1'})
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Extracted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

