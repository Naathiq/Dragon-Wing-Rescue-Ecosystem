import React, { useState } from 'react';
import { EmergencyAlert } from '../types';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, MapPin, Radio, Bell, Check } from 'lucide-react';

interface AlertSystemProps {
  alerts: EmergencyAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onAcknowledgeAll?: () => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({
  alerts,
  onAcknowledgeAlert,
  onAcknowledgeAll,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');

  const filtered = filterSeverity === 'ALL'
    ? alerts
    : alerts.filter(a => a.severity === filterSeverity);

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  const getAlertStyle = (severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO') => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-red-500/60 bg-red-950/20',
          badge: 'bg-red-500/20 text-red-300 border-red-500/50',
          title: 'text-red-400 font-bold',
          icon: <AlertTriangle className="w-4 h-4 text-red-400" />
        };
      case 'HIGH':
        return {
          border: 'border-amber-500/50 bg-amber-950/20',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          title: 'text-amber-400 font-bold',
          icon: <ShieldAlert className="w-4 h-4 text-amber-400" />
        };
      case 'MEDIUM':
        return {
          border: 'border-yellow-500/40 bg-yellow-950/10',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          title: 'text-yellow-400 font-semibold',
          icon: <Bell className="w-4 h-4 text-yellow-400" />
        };
      default:
        return {
          border: 'border-blue-500/30 bg-blue-950/10',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          title: 'text-blue-400 font-semibold',
          icon: <Radio className="w-4 h-4 text-blue-400" />
        };
    }
  };

  return (
    <div id="emergency-alert-panel" className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-4 sm:p-5 shadow-sm backdrop-blur-md flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Emergency Alerts
            </h2>
            <p className="text-xs text-slate-400">
              Live edge sensor interrupts & operator dispatch
            </p>
          </div>
        </div>

        {/* Unacknowledged count & Acknowledge All */}
        <div className="flex items-center gap-2">
          {unacknowledgedCount > 0 && onAcknowledgeAll && (
            <button
              onClick={onAcknowledgeAll}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acknowledge All ({unacknowledgedCount})</span>
            </button>
          )}

          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20">
            {unacknowledgedCount} Pending
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 text-xs">
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1 rounded-full transition-colors text-xs font-medium cursor-pointer ${
              filterSeverity === sev
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin flex-1">
        {filtered.map(a => {
          const style = getAlertStyle(a.severity);

          return (
            <div
              key={a.id}
              className={`p-3.5 rounded-xl border transition-all ${style.border} ${
                !a.acknowledged ? 'ring-1 ring-red-500/30 shadow-sm' : 'opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {style.icon}
                  <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border ${style.badge}`}>
                    {a.severity}
                  </span>
                  <span className={`text-sm font-semibold tracking-normal ${style.title}`}>
                    {a.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{a.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-2.5 pl-6">
                {a.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs pl-6">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {a.location}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-cyan-400 font-medium">{a.source}</span>
                </div>

                <div>
                  {!a.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(a.id)}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] hover:border-white/[0.15] text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
