import React, { useState } from 'react';
import { Drone } from '../types';
import { 
  Radio, 
  BatteryCharging, 
  Battery, 
  BatteryWarning, 
  AlertTriangle,
  MapPin, 
  Copy, 
  Check, 
  ArrowDownCircle, 
  Satellite, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

interface DroneFleetPanelProps {
  drones: Drone[];
  selectedDroneId: string;
  onSelectDrone: (id: string) => void;
  onReturnToBase?: (droneId: string) => void;
}

export const DroneFleetPanel: React.FC<DroneFleetPanelProps> = ({
  drones,
  selectedDroneId,
  onSelectDrone,
  onReturnToBase,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCoordinates = (drone: Drone, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = `${drone.latitude.toFixed(6)}, ${drone.longitude.toFixed(6)}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(drone.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Searching':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
      case 'Relay':
        return 'text-purple-300 bg-purple-500/10 border-purple-500/20';
      case 'Returning':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'Hovering':
        return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20';
      default:
        return 'text-red-300 bg-red-500/10 border-red-500/20';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery <= 30) return { text: 'text-red-400', bar: 'bg-red-500', icon: BatteryWarning };
    if (battery <= 50) return { text: 'text-amber-400', bar: 'bg-amber-500', icon: BatteryCharging };
    return { text: 'text-emerald-400', bar: 'bg-emerald-400', icon: Battery };
  };

  // Identify Master Drone and Scout Drones
  const masterDrone = drones.find(
    d => d.type === 'relay' || d.name.toLowerCase().includes('master')
  ) || drones[drones.length - 1];

  const scoutDrones = drones.filter(d => d.id !== masterDrone?.id);

  return (
    <div id="drone-fleet-monitoring" className="space-y-4">
      {/* SECTION HEADER */}
      <div className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Drone Fleet Monitoring
              </h2>
              <p className="text-xs text-slate-400">
                Live Coordinates, GPS Fix & Real-Time Battery Levels for Master & Slave Units
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{drones.length} Units Active</span>
            </span>
          </div>
        </div>

        {/* MASTER DRONE SPOTLIGHT CARD */}
        {masterDrone && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-purple-400 flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5" />
                Master Drone (Top Relay · 120m AGL)
              </span>
              <span className="text-[11px] text-slate-500">
                Central Mesh Node & Swarm Coordinator
              </span>
            </div>

            {(() => {
              const isSelected = masterDrone.id === selectedDroneId;
              const batt = getBatteryColor(masterDrone.battery);
              const BattIcon = batt.icon;

              return (
                <div
                  onClick={() => onSelectDrone(masterDrone.id)}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/25 border-purple-500/70 shadow-2xl ring-2 ring-purple-500/30'
                      : 'bg-slate-900/50 border-white/[0.08] hover:border-purple-500/40 hover:bg-slate-900/80 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
                    {/* Identification */}
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center flex-shrink-0 shadow-inner">
                        <Satellite className="w-7 h-7 text-purple-400" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 mb-1">
                          <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                            {masterDrone.name}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                            ★ Master
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(masterDrone.status)}`}>
                            {masterDrone.status}
                          </span>
                        </div>
                        <span className="text-sm text-slate-300">
                          Callsign: <strong className="text-purple-200 font-mono font-semibold">{masterDrone.callsign}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Master Location */}
                    <div className="bg-slate-950/60 p-4 sm:px-5 sm:py-3.5 rounded-2xl border border-white/[0.08] flex items-center justify-between gap-5 font-mono transform transition-all duration-300 ease-out hover:scale-[1.04] hover:border-purple-400/60 hover:bg-slate-950/90 hover:shadow-xl hover:shadow-purple-950/40 cursor-pointer group/loc">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 transition-transform duration-300 group-hover/loc:scale-125" />
                        <div>
                          <span className="text-xs text-slate-400 uppercase block font-semibold group-hover/loc:text-purple-300 transition-colors">Location</span>
                          <span className="text-sm sm:text-base font-bold text-purple-200 block">
                            {masterDrone.latitude.toFixed(5)}° N, {Math.abs(masterDrone.longitude).toFixed(5)}° W
                          </span>
                          <span className="text-xs text-slate-300 block mt-0.5">
                            Alt: <strong className="text-white">{masterDrone.altitude}m</strong> · Speed: <strong className="text-white">{masterDrone.speed} m/s</strong>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => copyCoordinates(masterDrone, e)}
                        className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Location"
                      >
                        {copiedId === masterDrone.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Master Battery Level */}
                    <div className="bg-slate-950/60 p-4 sm:px-5 sm:py-3.5 rounded-2xl border border-white/[0.08] min-w-[210px] sm:min-w-[250px] relative z-10 transform-gpu transition-all duration-200 ease-out hover:scale-[1.02] [backface-visibility:hidden] will-change-transform hover:border-emerald-400/60 hover:bg-slate-950/90 hover:shadow-xl hover:shadow-emerald-950/40 cursor-pointer group/batt">
                      <div className="flex items-center justify-between mb-2 text-sm select-none">
                        <span className="text-slate-200 font-semibold flex items-center gap-2">
                          <BattIcon className={`w-4 h-4 ${batt.text} flex-shrink-0 transition-transform duration-200 group-hover/batt:scale-115`} />
                          <span className="transition-colors font-semibold text-slate-200 dark:text-slate-200 [backface-visibility:hidden]">Battery Level</span>
                        </span>
                        <span className={`inline-block font-bold font-mono text-base ${batt.text} [backface-visibility:hidden] tracking-tight`}>
                          {Math.round(masterDrone.battery)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/[0.06]">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${batt.bar}`}
                          style={{ width: `${masterDrone.battery}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* SCOUT DRONES GRID */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-cyan-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              Slave Units ({scoutDrones.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Autonomous Slave Search Swarm
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {scoutDrones.map(d => {
              const isSelected = d.id === selectedDroneId;
              const batt = getBatteryColor(d.battery);
              const BattIcon = batt.icon;

              return (
                <div
                  key={d.id}
                  onClick={() => onSelectDrone(d.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/40 border-white/[0.06] hover:border-cyan-500/30 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {d.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          Slave
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadge(d.status)}`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mb-3">
                      Callsign: <strong className="text-slate-200">{d.callsign}</strong>
                    </div>

                    {/* LOCATION SECTION */}
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-white/[0.06] mb-3 relative z-10 transform-gpu transition-all duration-200 ease-out hover:scale-[1.02] [backface-visibility:hidden] will-change-transform hover:border-cyan-400/50 hover:bg-slate-950/85 hover:shadow-xl hover:shadow-cyan-950/30 cursor-pointer group/loc">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover/loc:scale-115" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block group-hover/loc:text-cyan-300 transition-colors [backface-visibility:hidden]">
                              Location
                            </span>
                            <span className="text-xs font-semibold text-cyan-200 block font-mono [backface-visibility:hidden]">
                              {d.latitude.toFixed(5)}° N, {Math.abs(d.longitude).toFixed(5)}° W
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block font-mono [backface-visibility:hidden]">
                              Altitude: {d.altitude} m · Speed: {d.speed} m/s
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => copyCoordinates(d, e)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Coordinates"
                        >
                          {copiedId === d.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* BATTERY LEVEL SECTION */}
                    <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/[0.06] relative z-10 transform-gpu transition-all duration-200 ease-out hover:scale-[1.02] [backface-visibility:hidden] will-change-transform hover:border-emerald-400/50 hover:bg-slate-950/85 hover:shadow-xl hover:shadow-emerald-950/30 cursor-pointer group/batt">
                      <div className="flex items-center justify-between mb-1 text-xs select-none">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <BattIcon className={`w-3.5 h-3.5 ${batt.text} flex-shrink-0 transition-transform duration-200 group-hover/batt:scale-115`} />
                          <span className="text-slate-300 font-semibold transition-colors [backface-visibility:hidden]">Battery</span>
                        </span>
                        <span className={`inline-block font-bold font-mono ${batt.text} [backface-visibility:hidden] tracking-tight`}>
                          {Math.round(d.battery)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${batt.bar}`}
                          style={{ width: `${d.battery}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Return To Base Command */}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[10px]">
                      GPS Fix: Active
                    </span>

                    {d.status !== 'Returning' && onReturnToBase && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReturnToBase(d.id);
                        }}
                        className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                      >
                        <ArrowDownCircle className="w-3 h-3 text-amber-400" />
                        <span>Command RTB</span>
                      </button>
                    )}

                    {d.status === 'Returning' && (
                      <span className="text-amber-400 text-[11px] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        Returning
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
