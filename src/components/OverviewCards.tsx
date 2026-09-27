import React from 'react';
import { Drone, Survivor, Hazard } from '../types';
import { 
  Radio, 
  Users, 
  AlertOctagon, 
  Map, 
  ChevronRight
} from 'lucide-react';

interface OverviewCardsProps {
  drones: Drone[];
  survivors: Survivor[];
  hazards: Hazard[];
  overallCoverage: number;
  missionSeconds: number;
  onNavigateSection?: (section: string) => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  drones,
  survivors,
  hazards,
  overallCoverage,
  onNavigateSection
}) => {
  const activeDronesCount = drones.filter(d => d.status === 'Searching' || d.status === 'Hovering' || d.status === 'Relay').length;
  const criticalSurvivors = survivors.filter(s => s.riskLevel === 'Critical' && s.status === 'Unrescued').length;
  const rescuedCount = survivors.filter(s => s.status === 'Rescued').length;
  const criticalHazards = hazards.filter(h => h.severity === 'Critical').length;

  const cards = [
    {
      id: 'active-drones',
      title: 'Active Swarm Fleet',
      value: `${activeDronesCount}/${drones.length}`,
      sub: '1 Master · 3 Slaves Active',
      icon: Radio,
      color: 'cyan',
      tag: 'Mesh Healthy',
      onClick: () => onNavigateSection?.('fleet')
    },
    {
      id: 'survivors-detected',
      title: 'Survivors Located',
      value: `${survivors.length}`,
      sub: `${criticalSurvivors} Critical · ${rescuedCount} Extracted`,
      icon: Users,
      color: 'emerald',
      tag: criticalSurvivors > 0 ? `${criticalSurvivors} Need Rescue` : 'All Assigned',
      onClick: () => onNavigateSection?.('survivors')
    },
    {
      id: 'hazards-detected',
      title: 'Disaster Hazards',
      value: `${hazards.length}`,
      sub: `${criticalHazards} High Threat · Gas & Fire`,
      icon: AlertOctagon,
      color: 'amber',
      tag: 'Active Spread',
      onClick: () => onNavigateSection?.('hazards')
    },
    {
      id: 'search-coverage',
      title: 'Search Coverage',
      value: `${overallCoverage}%`,
      sub: 'Zone A & B Cleared · Zone C Active',
      icon: Map,
      color: 'blue',
      progress: overallCoverage,
      tag: '8.0 km² Grid',
      onClick: () => onNavigateSection?.('coverage')
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan':
        return {
          card: 'bg-slate-900/60 hover:bg-slate-900/90 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/30 hover:hud-glow-cyan',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 group-hover:border-cyan-400/40',
          iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 group-hover:text-cyan-300 transition-transform duration-300',
        };
      case 'emerald':
        return {
          card: 'bg-slate-900/60 hover:bg-slate-900/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/30 hover:hud-glow-emerald',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 group-hover:border-emerald-400/40',
          iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 group-hover:text-emerald-300 transition-transform duration-300',
        };
      case 'amber':
        return {
          card: 'bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-950/30 hover:hud-glow-amber',
          text: 'text-amber-400',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20 group-hover:border-amber-400/40',
          iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 group-hover:text-amber-300 transition-transform duration-300',
        };
      case 'blue':
      default:
        return {
          card: 'bg-slate-900/60 hover:bg-slate-900/90 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-950/30 hover:hud-glow-cyan',
          text: 'text-blue-400',
          badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20 group-hover:border-blue-400/40',
          iconBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30 group-hover:scale-110 group-hover:text-blue-300 transition-transform duration-300',
        };
    }
  };

  return (
    <div id="mission-overview-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map(c => {
        const cls = getColorClasses(c.color);
        const IconComponent = c.icon;

        return (
          <div
            key={c.id}
            onClick={c.onClick}
            className={`p-4 sm:p-4.5 rounded-2xl border border-white/[0.08] transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-sm backdrop-blur-md transform hover:scale-[1.025] hud-corner ${cls.card}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
                  {c.title}
                </span>
                <div className={`p-2 rounded-xl transition-all duration-300 ${cls.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              {/* Metric Value */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${cls.text}`}>
                  {c.value}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                {c.sub}
              </div>
            </div>

            {/* Optional Progress bar */}
            {c.progress !== undefined && (
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden border border-white/[0.04]">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 shadow-sm shadow-blue-500/50"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            )}

            {/* Bottom tag indicator */}
            <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-colors ${cls.badge}`}>
                {c.tag}
              </span>
              <span className="text-slate-500 group-hover:text-cyan-300 transition-colors flex items-center text-[11px] font-medium font-mono">
                View <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
