import React, { useState } from 'react';
import { Drone, SensorHealth, NavigationMode } from '../types';
import { 
  Activity, 
  Compass, 
  Radio, 
  Camera, 
  Flame, 
  Satellite, 
  Mic, 
  ShieldCheck, 
  Wifi, 
  Cpu, 
  Zap, 
  AlertCircle,
  EyeOff,
  Crosshair,
  Server
} from 'lucide-react';

interface TelemetrySensorsProps {
  currentDrone: Drone;
  sensors: SensorHealth[];
  onToggleGpsDenial: (droneId: string) => void;
}

export const TelemetrySensors: React.FC<TelemetrySensorsProps> = ({
  currentDrone,
  sensors,
  onToggleGpsDenial,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'sensors' | 'navigation' | 'comms'>('telemetry');

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'camera':
        return <Camera className="w-4 h-4 text-cyan-400" />;
      case 'flame':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'satellite':
        return <Satellite className="w-4 h-4 text-emerald-400" />;
      case 'compass':
        return <Compass className="w-4 h-4 text-blue-400" />;
      case 'radar':
        return <Activity className="w-4 h-4 text-purple-400" />;
      case 'mic':
        return <Mic className="w-4 h-4 text-red-400" />;
      default:
        return <Radio className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusIndicator = (status: 'Online' | 'Degraded' | 'Offline') => {
    switch (status) {
      case 'Online':
        return {
          dot: 'bg-emerald-400',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300'
        };
      case 'Degraded':
        return {
          dot: 'bg-amber-400',
          text: 'text-amber-400',
          badge: 'bg-amber-950/70 border-amber-500/30 text-amber-300'
        };
      case 'Offline':
        return {
          dot: 'bg-red-400',
          text: 'text-red-400',
          badge: 'bg-red-950/70 border-red-500/30 text-red-300'
        };
    }
  };

  return (
    <div id="drone-telemetry-sensors-panel" className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-5 shadow-sm backdrop-blur-md">
      {/* Top Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Avionics Telemetry & Hardware Sensors
            </h2>
            <p className="text-xs text-slate-400">
              Unit: <strong className="text-cyan-300 font-normal">{currentDrone.name}</strong> ({currentDrone.callsign})
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-full border border-white/[0.08] text-xs">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1 rounded transition-colors text-[11px] font-medium ${
              activeTab === 'telemetry'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab('sensors')}
            className={`px-3 py-1 rounded transition-colors text-[11px] font-medium ${
              activeTab === 'sensors'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sensors Health
          </button>
          <button
            onClick={() => setActiveTab('navigation')}
            className={`px-3 py-1 rounded transition-colors text-[11px] font-medium ${
              activeTab === 'navigation'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auto Navigation
          </button>
          <button
            onClick={() => setActiveTab('comms')}
            className={`px-3 py-1 rounded transition-colors text-[11px] font-medium ${
              activeTab === 'comms'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Comms Mesh
          </button>
        </div>
      </div>

      {/* TAB 1: TELEMETRY (Section 10) */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          {/* Main Flight Instrumentation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Altitude (AGL)</span>
              <span className="text-xl font-semibold text-cyan-300 font-mono">
                {currentDrone.altitude} <span className="text-xs text-slate-500 font-normal">m</span>
              </span>
              <span className="text-[10px] text-emerald-400 block mt-1">±0.05m LiDAR</span>
            </div>

            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Ground Speed</span>
              <span className="text-xl font-semibold text-cyan-300 font-mono">
                {currentDrone.speed} <span className="text-xs text-slate-500 font-normal">m/s</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">{(currentDrone.speed * 3.6).toFixed(1)} km/h</span>
            </div>

            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Battery Cell</span>
              <span className={`text-xl font-semibold font-mono ${currentDrone.battery < 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {currentDrone.battery}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">22.8V · 6S</span>
            </div>

            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Heading</span>
              <span className="text-xl font-semibold text-cyan-300 font-mono">
                {currentDrone.heading}°
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">True North</span>
            </div>

            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">GPS Lock</span>
              <span className="text-xl font-semibold text-emerald-400 font-mono">
                {currentDrone.gpsAvailable ? `${currentDrone.gpsSatellites} Sats` : 'Jammed'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {currentDrone.gpsAvailable ? 'RTK Fixed Lock' : 'VIO Failover'}
              </span>
            </div>

            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Comm Latency</span>
              <span className="text-xl font-semibold text-cyan-300 font-mono">
                {currentDrone.latency} <span className="text-xs text-slate-500 font-normal">ms</span>
              </span>
              <span className="text-[10px] text-emerald-400 block mt-1">{currentDrone.bandwidth} Mbps</span>
            </div>
          </div>

          {/* Compass Rose & Geographic Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  HEADING GYROSCOPE HUD
                </span>
                <span className="text-cyan-400 font-bold">{currentDrone.heading}°</span>
              </div>
              {/* Linear Compass Tape */}
              <div className="relative h-9 bg-slate-900 rounded border border-slate-800 overflow-hidden flex items-center justify-center font-mono text-xs">
                <div className="absolute inset-y-0 w-0.5 bg-red-500 z-10" />
                <div
                  className="flex items-center gap-6 text-slate-400 whitespace-nowrap transition-transform duration-300"
                  style={{ transform: `translateX(${(-currentDrone.heading * 2) % 360}px)` }}
                >
                  <span>N (0°)</span>
                  <span>NE (45°)</span>
                  <span>E (90°)</span>
                  <span>SE (135°)</span>
                  <span>S (180°)</span>
                  <span>SW (225°)</span>
                  <span>W (270°)</span>
                  <span>NW (315°)</span>
                  <span>N (360°)</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Satellite className="w-4 h-4 text-emerald-400" />
                  WGS84 COORDINATES
                </span>
                <span className="text-emerald-400 font-bold">ACCURACY ±0.08m</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">LATITUDE</span>
                  <span className="text-slate-100 font-bold">{currentDrone.latitude.toFixed(6)}° N</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">LONGITUDE</span>
                  <span className="text-slate-100 font-bold">{Math.abs(currentDrone.longitude).toFixed(6)}° W</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SENSOR STATUS (Section 11) */}
      {activeTab === 'sensors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sensors.map(s => {
            const ind = getStatusIndicator(s.status);
            return (
              <div
                key={s.id}
                className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-900 border border-white/[0.08]">
                        {getSensorIcon(s.iconType)}
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {s.name}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${ind.badge}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-1">
                    {s.detail}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <span>Rate</span>
                  <span className="text-cyan-300 font-semibold font-mono">{s.rate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: AUTONOMOUS NAVIGATION STATUS (Section 16) */}
      {activeTab === 'navigation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-white/[0.08]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Active Navigation Subsystem</span>
                <h3 className="text-base font-semibold text-cyan-300 flex items-center gap-2 mt-0.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  {currentDrone.navMode}
                </h3>
              </div>

              {/* GPS Denial Simulation Toggle */}
              <button
                onClick={() => onToggleGpsDenial(currentDrone.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all border flex items-center gap-1.5 font-medium cursor-pointer ${
                  !currentDrone.gpsAvailable
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-white/[0.08] hover:bg-slate-700/80'
                }`}
              >
                {!currentDrone.gpsAvailable ? <EyeOff className="w-3.5 h-3.5" /> : <Satellite className="w-3.5 h-3.5" />}
                <span>
                  {!currentDrone.gpsAvailable ? 'GPS Denied (Active)' : 'Simulate GPS Jamming'}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {!currentDrone.gpsAvailable ? (
                <span className="text-amber-300">
                  Critical: GPS satellites unavailable or jammed by concrete rubble. Autonomous flight computer seamlessly switched to Visual-Inertial Odometry (VIO) using downward cameras and 3D LiDAR SLAM point clouds for drift-free indoor navigation and obstacle avoidance.
                </span>
              ) : (
                'Standard outdoor GNSS navigation locked with 14 satellites and RTK base station correction. Obstacle avoidance radar constantly scans 360° for powerlines, trees, and flying debris.'
              )}
            </p>
          </div>

          {/* Navigation Modes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className={`p-3.5 rounded-xl border ${
              currentDrone.navMode === 'GPS Navigation' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200' : 'bg-slate-950/40 border-white/[0.06] text-slate-400'
            }`}>
              <div className="font-semibold text-white text-sm mb-1">GPS Navigation</div>
              <p className="text-xs text-slate-400 leading-normal">Outdoor open sky waypoint traversal using multi-constellation GNSS.</p>
              <span className="text-[10px] text-emerald-400 block mt-2">Active in open sectors</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              currentDrone.navMode === 'VIO Navigation' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200' : 'bg-slate-950/40 border-white/[0.06] text-slate-400'
            }`}>
              <div className="font-semibold text-white text-sm mb-1">VIO Navigation</div>
              <p className="text-xs text-slate-400 leading-normal">Visual-Inertial Odometry using optical flow cameras & high-rate IMU.</p>
              <span className="text-[10px] text-cyan-400 block mt-2">Active inside urban canyons</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              currentDrone.navMode === 'SLAM Navigation' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200' : 'bg-slate-950/40 border-white/[0.06] text-slate-400'
            }`}>
              <div className="font-semibold text-white text-sm mb-1">SLAM Navigation</div>
              <p className="text-xs text-slate-400 leading-normal">Simultaneous Localization and Mapping via 3D LiDAR laser scans.</p>
              <span className="text-[10px] text-purple-400 block mt-2">Operates in collapsed buildings</span>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/40 border-white/[0.06] text-slate-400">
              <div className="font-semibold text-white text-sm mb-1">Obstacle Avoidance</div>
              <p className="text-xs text-slate-400 leading-normal">360° LiDAR bubble with emergency autonomous braking & reroute.</p>
              <span className="text-[10px] text-emerald-400 block mt-2">Status: ALWAYS ON</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMMUNICATION STATUS (Section 17) */}
      {activeTab === 'comms' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-white/[0.08]">
            <h3 className="text-base font-semibold text-white tracking-tight mb-2">
              Disaster Ad-Hoc Mesh Architecture (Zero-Cloud Operation)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              All telemetry, YOLO AI inferences, and sensor streams route over a local peer-to-peer COFDM radio frequency mesh (5.8 GHz). Ground rescue stations communicate directly with Scout UAVs through the high-altitude Master Relay drone, enabling 100% full functionality even when cell towers, internet, and cloud infrastructure are completely destroyed.
            </p>

            {/* Architecture Node Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/[0.06] text-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Edge Scout Node</span>
                <span className="font-semibold text-cyan-300 text-sm mt-0.5 block">{currentDrone.name}</span>
                <div className="mt-2 text-xs font-mono text-emerald-400">Signal: {currentDrone.signalStrength}%</div>
                <div className="text-[10px] text-slate-400">P2P COFDM Mesh Link</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-purple-500/20 text-center relative">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">High-Altitude Relay</span>
                <span className="font-semibold text-purple-300 text-sm mt-0.5 block">Master (120m AGL)</span>
                <div className="mt-2 text-xs font-mono text-purple-400">Latency: 8 ms</div>
                <div className="text-[10px] text-slate-400">Omni Microwave Repeater</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Ground Control Unit</span>
                <span className="font-semibold text-emerald-300 text-sm mt-0.5 block">Field Command Vehicle 1</span>
                <div className="mt-2 text-xs font-mono text-emerald-400">Bandwidth: 150 Mbps</div>
                <div className="text-[10px] text-slate-400">Ruggedized Edge Server</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
