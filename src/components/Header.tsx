import React, { useState, useEffect } from 'react';
import { MissionStatus, ColorTheme } from '../types';
import { 
  Radio, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Wifi, 
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  missionStatus: MissionStatus;
  onToggleMissionStatus: () => void;
  onResetMission: () => void;
  missionSeconds: number;
  criticalAlertCount: number;
  onOpenAlerts: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: ColorTheme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  missionStatus,
  onToggleMissionStatus,
  onResetMission,
  missionSeconds,
  criticalAlertCount,
  onOpenAlerts,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatMissionTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header
      id="main-mission-control-header"
      className="bg-slate-950/80 border-b border-white/[0.08] px-4 sm:px-6 py-3 sticky top-0 z-40 backdrop-blur-xl flex-shrink-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-[1920px] mx-auto">
        {/* Title and System Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/40">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                Dragon Wing Rescue Ecosystem
                <span className="text-cyan-400/80 font-normal text-xs sm:text-sm font-mono">· SWARM TAC-OPS</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-950/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Swarm Link
              </span>
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <span>GNSS: RTK 14 Sats</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mission Timer & Status Pill */}
          <div className="flex items-center bg-slate-900/60 rounded-full border border-white/[0.08] px-3.5 py-1.5 gap-3 text-xs backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  missionStatus === 'ACTIVE'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-400 text-[11px]">Mission</span>
              <span className={`font-semibold text-xs ${missionStatus === 'ACTIVE' ? 'text-emerald-300' : 'text-amber-300'}`}>
                {missionStatus === 'ACTIVE' ? 'Active' : 'Paused'}
              </span>
            </div>

            <div className="h-3.5 w-px bg-white/10" />

            <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-xs tracking-wider">{formatMissionTime(missionSeconds)}</span>
            </div>

            <button
              onClick={onToggleMissionStatus}
              className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                missionStatus === 'ACTIVE'
                  ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
              title={missionStatus === 'ACTIVE' ? 'Pause Mission' : 'Resume Mission'}
            >
              {missionStatus === 'ACTIVE' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{missionStatus === 'ACTIVE' ? 'Pause' : 'Resume'}</span>
            </button>
          </div>

          {/* Emergency Alert Indicator Button */}
          <button
            onClick={onOpenAlerts}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs cursor-pointer ${
              criticalAlertCount > 0
                ? 'bg-red-500/15 text-red-300 border-red-500/40 shadow-sm animate-pulse'
                : 'bg-slate-900/60 text-slate-300 border-white/[0.08] hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${criticalAlertCount > 0 ? 'text-red-400' : 'text-slate-400'}`} />
            <span className="font-medium">Alerts</span>
            {criticalAlertCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-[10px] text-white font-bold ml-0.5">
                {criticalAlertCount}
              </span>
            )}
          </button>

          {/* Color Theme Switcher (Dark & White) */}
          <div 
            id="theme-switcher-control"
            className="flex items-center bg-slate-900/60 rounded-full border border-white/[0.08] p-0.5 text-xs backdrop-blur-md"
          >
            <button
              onClick={() => {
                if (theme !== 'dark') onToggleTheme();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="text-[11px]">Dark</span>
            </button>
            <button
              onClick={() => {
                if (theme !== 'light') onToggleTheme();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-amber-500/20 text-amber-600 border border-amber-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to White / Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="text-[11px]">White</span>
            </button>
          </div>

          {/* Tactical Audio Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-900/60 text-slate-500 border-white/[0.08] hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Mute Alert Audio' : 'Unmute Alert Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

