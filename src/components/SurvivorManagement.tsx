import React, { useState, useMemo } from 'react';
import { Survivor, SurvivorStatus, RiskLevel } from '../types';
import {
  Users,
  AlertTriangle,
  MapPin,
  CheckCircle,
  Clock,
  Thermometer,
  Search,
  Copy,
  Check,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  X,
  LayoutGrid,
  List
} from 'lucide-react';

interface SurvivorManagementProps {
  survivors: Survivor[];
  onUpdateStatus: (id: string, newStatus: SurvivorStatus, assignedTeam?: string) => void;
  onFocusSurvivor?: (survivor: Survivor) => void;
}

export const SurvivorManagement: React.FC<SurvivorManagementProps> = ({
  survivors,
  onUpdateStatus,
  onFocusSurvivor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SurvivorStatus>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSurvivorId, setSelectedSurvivorId] = useState<string | null>(null);
  const [editingSurvivorId, setEditingSurvivorId] = useState<string | null>(null);
  const [customTeam] = useState('Ground Rescue Alpha-1');

  // Filtered Survivors via Search Term and Status Filter, sorted sequentially by ID (S001, S002, ...)
  const processedSurvivors = useMemo(() => {
    const list = survivors.filter(s => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const matchesId = s.id.toLowerCase().includes(query);
      const matchesType = s.detectionType.toLowerCase().includes(query);
      const matchesHazard = s.nearbyHazard.toLowerCase().includes(query);
      const matchesZone = s.zone.toLowerCase().includes(query);
      const matchesTeam = s.assignedTeam?.toLowerCase().includes(query);
      const matchesStatus = s.status.toLowerCase().includes(query);
      const matchesRisk = s.riskLevel.toLowerCase().includes(query);
      const matchesCoords = 
        s.latitude.toFixed(4).includes(query) || 
        s.longitude.toFixed(4).includes(query) ||
        `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`.includes(query);

      return (
        matchesId ||
        matchesType ||
        matchesHazard ||
        matchesZone ||
        matchesTeam ||
        matchesStatus ||
        matchesRisk ||
        matchesCoords
      );
    });

    // Ensure strict sequential order: S001, S002, S003, ...
    return [...list].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [survivors, searchTerm, statusFilter]);

  const copyCoordinates = (s: Survivor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = `${s.latitude.toFixed(6)}, ${s.longitude.toFixed(6)}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDetectionTypeBadge = (type: string) => {
    switch (type) {
      case 'Person':
        return { label: 'Person', color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20' };
      case 'Thermal Hotspot':
        return { label: 'Thermal', color: 'text-amber-300 bg-amber-500/10 border-amber-500/20' };
      case 'Acoustic Tap':
        return { label: 'Acoustic', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' };
      case 'Visual Motion':
        return { label: 'Motion', color: 'text-purple-300 bg-purple-500/10 border-purple-500/20' };
      default:
        return { label: type, color: 'text-slate-300 bg-slate-800 border-white/10' };
    }
  };

  const getStatusBadge = (status: SurvivorStatus) => {
    switch (status) {
      case 'Unrescued':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Rescue Assigned':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Rescued':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-900 border-white/10';
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'Critical':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'High':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Medium':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'Low':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-800 border-white/10';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return { text: 'text-emerald-400', bar: 'bg-emerald-400' };
    if (confidence >= 75) return { text: 'text-cyan-300', bar: 'bg-cyan-400' };
    return { text: 'text-amber-400', bar: 'bg-amber-500' };
  };

  const unrescuedCount = useMemo(() => survivors.filter(s => s.status === 'Unrescued').length, [survivors]);
  const assignedCount = useMemo(() => survivors.filter(s => s.status === 'Rescue Assigned').length, [survivors]);
  const rescuedCount = useMemo(() => survivors.filter(s => s.status === 'Rescued').length, [survivors]);

  return (
    <div id="survivor-detection-panel" className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-sm backdrop-blur-md">
      {/* PANEL TITLE & STATS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Survivor Detection & Manifest
              </h2>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Live Swarm Detections
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-slate-950/40 p-2.5 rounded-xl border border-white/[0.06] text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search survivor ID, detection type, coordinates, zone, status, risk..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/[0.08] rounded-xl pl-9 pr-10 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/[0.06] text-slate-400">
            Showing <strong className="text-cyan-300">{processedSurvivors.length}</strong> of {survivors.length} survivors
          </span>
        </div>
      </div>

      {/* SURVIVOR BOXES LAYOUT - SIMPLIFIED, UNCLUTTERED, NON-CONGESTED */}
      <div id="survivor-boxes-container" className="space-y-4">
        {/* Streamlined Filter & View Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-white/[0.06]">
          {/* Status Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              All ({survivors.length})
            </button>
            <button
              onClick={() => setStatusFilter('Unrescued')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Unrescued'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-semibold'
                  : 'text-slate-400 hover:text-red-300 hover:bg-white/[0.04]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Unrescued ({unrescuedCount})
            </button>
            <button
              onClick={() => setStatusFilter('Rescue Assigned')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Rescue Assigned'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-white/[0.04]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Assigned ({assignedCount})
            </button>
            <button
              onClick={() => setStatusFilter('Rescued')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Rescued'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-white/[0.04]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Rescued ({rescuedCount})
            </button>
          </div>

          {/* View Mode Switcher (One by One Cards vs Compact Table) */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/[0.08] text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cards One by One"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards (One by One)</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Table"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {processedSurvivors.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-950/30 rounded-2xl border border-white/[0.06]">
            <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm">No survivors found matching current filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="mt-2 text-cyan-400 hover:underline text-xs cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* SIMPLE & CLEAN SURVIVOR CARDS - ONE BY ONE (S001, S002, ...) */
          <div className="flex flex-col gap-4">
            {processedSurvivors.map(s => {
              const isSelected = selectedSurvivorId === s.id;
              const confColor = getConfidenceColor(s.confidence);

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedSurvivorId(s.id);
                    onFocusSurvivor?.(s);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-xl ring-2 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-white/[0.09] hover:border-cyan-500/40 hover:bg-slate-900/90'
                  }`}
                >
                  {/* Left: ID and Status */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 flex-shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono min-w-[70px] drop-shadow-sm">
                      {s.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold border shadow-sm ${getStatusBadge(s.status)}`}>
                      {s.status}
                    </span>
                    <span className="text-slate-400 text-xs sm:text-sm flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {s.timeAgo}
                    </span>
                  </div>

                  {/* Middle: Location, Hazard Level, and AI Confidence (STRICTLY IN THE SAME LINE & PROPERLY ALIGNED) */}
                  <div className="flex items-center flex-nowrap gap-3.5 sm:gap-4 text-sm text-slate-300 whitespace-nowrap overflow-x-auto scrollbar-none flex-shrink-0 p-1 sm:p-1.5">
                    {/* Survivor Location with Zoom Animation - Anchored with origin-left and safe gap to prevent overlapping */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCoordinates(s, e);
                      }}
                      title={`Zone ${s.zone} · ${s.latitude.toFixed(5)}°N, ${Math.abs(s.longitude).toFixed(5)}°W (Click to copy)`}
                      className="relative h-13 min-h-[52px] bg-slate-950/70 px-3.5 rounded-xl border border-white/[0.1] flex items-center gap-2.5 font-mono cursor-pointer transform origin-left transition-all duration-300 ease-out hover:scale-[1.04] hover:z-20 hover:border-cyan-400/70 hover:bg-slate-950 hover:shadow-xl hover:shadow-cyan-950/40 group/loc flex-shrink-0"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-cyan-400 transition-transform duration-300 group-hover/loc:scale-125" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1 group-hover/loc:text-cyan-300 transition-colors leading-none">
                          Location · Zone {s.zone}
                        </span>
                        <div className="flex items-center gap-1.5 leading-none">
                          <span className="text-xs sm:text-sm font-bold text-cyan-200 group-hover/loc:text-white transition-colors truncate block">
                            {s.latitude.toFixed(4)}°N, {Math.abs(s.longitude).toFixed(4)}°W
                          </span>
                          {copiedId === s.id && (
                            <span className="text-[11px] text-emerald-400 font-sans flex items-center gap-0.5 font-semibold">
                              <Check className="w-3 h-3" /> Copied
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 1. Hazard Level with Zoom Animation */}
                    <div
                      className={`relative h-13 min-h-[52px] bg-slate-950/70 px-3.5 rounded-xl border flex items-center gap-2.5 font-mono cursor-pointer transform origin-center transition-all duration-300 ease-out hover:scale-[1.04] hover:z-20 hover:shadow-xl group/hazard flex-shrink-0 ${
                        s.riskLevel === 'Critical'
                          ? 'border-red-500/40 hover:border-red-400 hover:shadow-red-950/50'
                          : s.riskLevel === 'High'
                          ? 'border-orange-500/40 hover:border-orange-400 hover:shadow-orange-950/50'
                          : s.riskLevel === 'Medium'
                          ? 'border-amber-500/40 hover:border-amber-400 hover:shadow-amber-950/50'
                          : 'border-emerald-500/40 hover:border-emerald-400 hover:shadow-emerald-950/50'
                      }`}
                      title={`Hazard Level: ${s.riskLevel} · Proximity: ${s.nearbyHazard}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                        s.riskLevel === 'Critical'
                          ? 'bg-red-950/40 border-red-500/30'
                          : s.riskLevel === 'High'
                          ? 'bg-orange-950/40 border-orange-500/30'
                          : s.riskLevel === 'Medium'
                          ? 'bg-amber-950/40 border-amber-500/30'
                          : 'bg-emerald-950/40 border-emerald-500/30'
                      }`}>
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover/hazard:scale-125 ${
                          s.riskLevel === 'Critical'
                            ? 'text-red-400'
                            : s.riskLevel === 'High'
                            ? 'text-orange-400'
                            : s.riskLevel === 'Medium'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1 group-hover/hazard:text-slate-200 transition-colors leading-none">
                          Hazard Level
                        </span>
                        <div className="flex items-center gap-1.5 leading-none">
                          <span className={`text-xs sm:text-sm font-black block transition-transform duration-300 group-hover/hazard:scale-105 origin-left ${
                            s.riskLevel === 'Critical'
                              ? 'text-red-300'
                              : s.riskLevel === 'High'
                              ? 'text-orange-300'
                              : s.riskLevel === 'Medium'
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                          }`}>
                            {s.riskLevel}
                          </span>
                          <span className="text-[11px] text-slate-400 font-sans truncate max-w-[130px] hidden sm:inline">
                            · {s.nearbyHazard}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. AI Confidence with Zoom Animation */}
                    <div
                      className="relative h-13 min-h-[52px] bg-slate-950/70 px-3.5 rounded-xl border border-white/[0.1] flex items-center gap-2.5 font-mono cursor-pointer transform origin-center transition-all duration-300 ease-out hover:scale-[1.04] hover:z-20 hover:border-cyan-400/70 hover:bg-slate-950 hover:shadow-xl hover:shadow-cyan-950/40 group/conf flex-shrink-0"
                      title={`AI Detection Confidence: ${s.confidence}%`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${confColor.bar} transition-transform duration-300 group-hover/conf:scale-150 flex-shrink-0`} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1 group-hover/conf:text-cyan-300 transition-colors leading-none">
                          Confidence
                        </span>
                        <div className="flex items-center leading-none">
                          <span className={`text-xs sm:text-sm font-black ${confColor.text} block transition-transform duration-300 group-hover/conf:scale-110 origin-left`}>
                            {s.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button (Properly Aligned) */}
                  <div className="flex items-center justify-end gap-2 flex-shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      {s.status === 'Unrescued' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(s.id, 'Rescue Assigned', customTeam);
                          }}
                          className="h-13 min-h-[52px] px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <UserCheck className="w-4 h-4 text-amber-400" />
                          <span>Dispatch Team</span>
                        </button>
                      )}

                      {s.status === 'Rescue Assigned' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(s.id, 'Rescued');
                          }}
                          className="h-13 min-h-[52px] px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Mark Rescued</span>
                        </button>
                      )}

                      {s.status === 'Rescued' && (
                        <span className="h-13 min-h-[52px] text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2 px-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <CheckCircle className="w-4 h-4" />
                          <span>Rescued</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* COMPACT, UNCLUTTERED TABLE VIEW (ZERO CONGESTION) */
          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-white/[0.08] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Target ID & Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 min-w-[210px]">Location / Zone</th>
                  <th className="py-3 px-4 min-w-[180px]">Hazard</th>
                  <th className="py-3 px-4 min-w-[140px]">Confidence</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {processedSurvivors.map(s => {
                  const isSelected = selectedSurvivorId === s.id;
                  const typeBadge = getDetectionTypeBadge(s.detectionType);
                  const confColor = getConfidenceColor(s.confidence);

                  return (
                    <tr
                      key={s.id}
                      onClick={() => {
                        setSelectedSurvivorId(s.id);
                        onFocusSurvivor?.(s);
                      }}
                      className={`hover:bg-white/[0.04] transition-colors cursor-pointer ${
                        isSelected ? 'bg-cyan-500/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{s.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] border ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{s.timeAgo}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 pr-6 min-w-[210px]">
                        <div className="inline-block p-1 -m-1 rounded-lg transition-transform duration-200 hover:scale-[1.04] origin-left relative hover:z-10">
                          <div className="flex items-center gap-1.5 font-mono text-cyan-200">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span className="font-semibold">{s.latitude.toFixed(4)}°N, {Math.abs(s.longitude).toFixed(4)}°W</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Zone {s.zone}</div>
                        </div>
                      </td>

                      <td className="py-3 px-4 min-w-[180px]">
                        <div className="inline-block p-1 -m-1 rounded-lg transition-transform duration-200 hover:scale-[1.04] origin-left relative hover:z-10 cursor-pointer">
                          <div className="text-slate-200 truncate max-w-[160px] font-medium">{s.nearbyHazard}</div>
                          <div className="text-[11px] text-amber-300 mt-0.5">{s.thermalTemp}°C thermal</div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 transform transition-transform duration-200 hover:scale-105 origin-left">
                          <span className={`font-mono font-semibold ${confColor.text}`}>{s.confidence}%</span>
                          <div className="w-16 bg-slate-800 rounded-full h-1">
                            <div className={`h-1 rounded-full ${confColor.bar}`} style={{ width: `${s.confidence}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRiskBadge(s.riskLevel)}`}>
                          {s.riskLevel}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
                          {s.status === 'Unrescued' && (
                            <button
                              onClick={() => onUpdateStatus(s.id, 'Rescue Assigned', customTeam)}
                              className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                          {s.status === 'Rescue Assigned' && (
                            <button
                              onClick={() => onUpdateStatus(s.id, 'Rescued')}
                              className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer"
                            >
                              Mark Rescued
                            </button>
                          )}
                          {s.status === 'Rescued' && (
                            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Rescued</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
