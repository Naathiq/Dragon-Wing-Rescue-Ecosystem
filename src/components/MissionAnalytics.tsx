import React, { useState, useMemo } from 'react';
import { AnalyticsPoint, Survivor, Hazard, SurvivorStatus } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertOctagon, 
  Activity, 
  Radio, 
  MapPin, 
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface MissionAnalyticsProps {
  analyticsData: AnalyticsPoint[];
  survivors: Survivor[];
  hazards: Hazard[];
  onUpdateSurvivorStatus?: (id: string, newStatus: SurvivorStatus, assignedTeam?: string) => void;
}

export const MissionAnalytics: React.FC<MissionAnalyticsProps> = ({
  analyticsData,
  survivors,
  hazards,
  onUpdateSurvivorStatus
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'detections' | 'coverage-battery' | 'confidence' | 'status'>('detections');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Real-time calculated survivor statistics
  const totalSurvivors = survivors.length;
  const unrescued = survivors.filter(s => s.status === 'Unrescued').length;
  const assigned = survivors.filter(s => s.status === 'Rescue Assigned').length;
  const rescued = survivors.filter(s => s.status === 'Rescued').length;
  const criticalPending = survivors.filter(s => s.riskLevel === 'Critical' && s.status === 'Unrescued').length;
  const rescueRate = totalSurvivors > 0 ? Math.round((rescued / totalSurvivors) * 100) : 0;

  // Dynamically synchronize time-series analytics with real-time survivor data
  const syncedAnalyticsData = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return [];
    return analyticsData.map((point, index) => {
      // The most recent / active operational timepoint reflects current live mission state
      if (index === analyticsData.length - 1) {
        return {
          ...point,
          rescuedCount: rescued,
          survivors: totalSurvivors,
          hazards: hazards.length
        };
      }
      return point;
    });
  }, [analyticsData, rescued, totalSurvivors, hazards.length]);

  // Survivor Status Pie / Donut Data
  const pieData = [
    { name: 'Safely Extracted (Rescued)', value: rescued, color: '#10b981' },
    { name: 'Rescue Assigned / In-Transit', value: assigned, color: '#f59e0b' },
    { name: 'Unrescued (Pending)', value: unrescued, color: '#ef4444' }
  ];

  // AI Confidence distribution by detection category
  const confidenceData = [
    { category: 'Person', avgConfidence: 94, count: 4 },
    { category: 'Thermal Sig', avgConfidence: 91, count: 2 },
    { category: 'Fire', avgConfidence: 95, count: 2 },
    { category: 'Flood Water', avgConfidence: 96, count: 1 },
    { category: 'Structure Damage', avgConfidence: 91, count: 1 },
    { category: 'Debris', avgConfidence: 89, count: 1 },
  ];

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-800 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <div className="text-slate-400 font-bold mb-1">Timepoint: {label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const filteredSurvivors = survivors.filter(s => {
    if (filterRisk === 'ALL') return true;
    return s.riskLevel === filterRisk;
  });

  return (
    <div id="mission-analytics-panel" className="space-y-5">
      {/* 1. REAL-TIME MISSION RESCUE KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Survivors Located */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 font-bold">TOTAL LOCATED</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{totalSurvivors}</span>
            <span className="text-xs text-slate-400">Total detected</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Critical: <strong className="text-red-400">{criticalPending}</strong> pending</span>
            <span className="text-cyan-400">100% Geotagged</span>
          </div>
        </div>

        {/* Card 2: Safely Rescued (Extracted) */}
        <div className="bg-slate-900/60 rounded-2xl border border-emerald-500/20 p-4 shadow-sm backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Safely Extracted
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-300 font-mono">{rescued}</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              ({rescueRate}% rate)
            </span>
          </div>
          {/* Rescue progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2.5 overflow-hidden border border-white/[0.06]">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${rescueRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Rescue Assigned / In Transit */}
        <div className="bg-slate-900/60 rounded-2xl border border-amber-500/20 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-400 font-medium">Rescue in Progress</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-300 font-mono">{assigned}</span>
            <span className="text-xs text-slate-400">Teams Dispatched</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Ground Squads: Alpha-1, Bravo-2
          </div>
        </div>

        {/* Card 4: Unrescued (Pending Extraction) */}
        <div className="bg-slate-900/60 rounded-2xl border border-red-500/20 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-red-400 font-medium">Pending Extraction</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-400 font-mono">{unrescued}</span>
            <span className="text-xs text-slate-400">Awaiting Response</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {criticalPending > 0 ? (
              <span className="text-red-400 font-medium">{criticalPending} Critical Immediate Risk</span>
            ) : (
              <span className="text-slate-400">All high priority triaged</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN CHARTS CONTAINER */}
      <div className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-5 shadow-sm backdrop-blur-md">
        {/* Header and Chart Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Mission Intelligence & Rescue Analytics
              </h2>
              <p className="text-xs text-slate-400">
                Live Data Synchronized with Survivor Database · Real-Time Extraction Curves
              </p>
            </div>
          </div>

          {/* Chart View Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveChartTab('detections')}
              className={`px-3 py-1.5 rounded transition-all text-[11px] font-medium ${
                activeChartTab === 'detections'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Detection & Extraction Curves
            </button>
            <button
              onClick={() => setActiveChartTab('status')}
              className={`px-3 py-1.5 rounded transition-all text-[11px] font-medium ${
                activeChartTab === 'status'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rescue Status Donut ({rescued}/{totalSurvivors} Rescued)
            </button>
            <button
              onClick={() => setActiveChartTab('coverage-battery')}
              className={`px-3 py-1.5 rounded transition-all text-[11px] font-medium ${
                activeChartTab === 'coverage-battery'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Coverage & Battery
            </button>
            <button
              onClick={() => setActiveChartTab('confidence')}
              className={`px-3 py-1.5 rounded transition-all text-[11px] font-medium ${
                activeChartTab === 'confidence'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI YOLO Confidence
            </button>
          </div>
        </div>

        {/* CHART CONTENT AREA */}
        <div className="h-[320px] w-full pt-2">
          {/* CHART 1: Survivors & Hazards detected over time */}
          {activeChartTab === 'detections' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={syncedAnalyticsData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="survivorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="hazardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="rescuedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                <Area
                  type="monotone"
                  dataKey="survivors"
                  name="Survivors Located"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#survivorGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="rescuedCount"
                  name="Survivors Safely Rescued"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#rescuedGrad)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="hazards"
                  name="Hazards Mapped"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#hazardGrad)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* CHART 2: Rescue Status Donut Breakdown */}
          {activeChartTab === 'status' && (
            <div className="flex flex-col md:flex-row items-center justify-around h-full gap-4">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 text-xs font-mono bg-slate-950/80 p-4 rounded-xl border border-slate-800 min-w-[280px]">
                <div className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-800 pb-2">
                  LIVE SURVIVOR STATUS ROSTER
                </div>
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-100 font-mono">
                      {item.value} ({totalSurvivors > 0 ? Math.round((item.value / totalSurvivors) * 100) : 0}%)
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-slate-200">
                  <span>Total Located:</span>
                  <span>{totalSurvivors} persons</span>
                </div>
              </div>
            </div>
          )}

          {/* CHART 3: Search Coverage vs Drone Battery */}
          {activeChartTab === 'coverage-battery' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={syncedAnalyticsData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="coverage"
                  name="Search Coverage (%)"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0ea5e9' }}
                />
                <Line
                  type="monotone"
                  dataKey="batteryAvg"
                  name="Fleet Battery Avg (%)"
                  stroke="#eab308"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#eab308' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* CHART 4: AI Confidence Distribution */}
          {activeChartTab === 'confidence' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" domain={[70, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                <Bar dataKey="avgConfidence" name="Avg YOLO Confidence (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. SYNCHRONIZED SURVIVOR STATUS & EXTRACTION MANIFEST */}
      <div className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Survivor Rescue Manifest
              </h3>
              <p className="text-xs text-slate-400">
                Synchronized real-time status & multi-squad dispatch logs
              </p>
            </div>
          </div>

          {/* Risk Level Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500 text-[11px] mr-1">Risk:</span>
            {['ALL', 'Critical', 'High', 'Medium'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterRisk(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterRisk === lvl
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Survivor ID</th>
                <th className="py-2.5 px-3">Type & Temp</th>
                <th className="py-2.5 px-3">Location (Lat, Lng)</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredSurvivors.map(s => {
                const isRescued = s.status === 'Rescued';
                const isAssigned = s.status === 'Rescue Assigned';

                return (
                  <tr 
                    key={s.id} 
                    className={`hover:bg-slate-900/60 transition-colors ${
                      isRescued ? 'bg-emerald-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-100 flex items-center gap-1.5">
                      {isRescued ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{s.id}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-200 font-semibold">{s.detectionType}</span>
                      <span className="text-[10px] text-slate-400 block">{s.thermalTemp}°C</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <div className="text-cyan-300 font-semibold text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span>{s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{s.zone}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        s.riskLevel === 'Critical'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : s.riskLevel === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}>
                        {s.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border ${
                        isRescued
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : isAssigned
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}>
                        {isRescued && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {isAssigned && <Clock className="w-3 h-3 text-amber-400" />}
                        {!isRescued && !isAssigned && <AlertTriangle className="w-3 h-3 text-red-400" />}
                        <span>{s.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {onUpdateSurvivorStatus && (
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status === 'Unrescued' && (
                            <button
                              onClick={() => onUpdateSurvivorStatus(s.id, 'Rescue Assigned', 'Rescue Alpha-1')}
                              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all flex items-center gap-1"
                              title="Assign rescue team"
                            >
                              <span>Dispatch Team</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {s.status === 'Rescue Assigned' && (
                            <button
                              onClick={() => onUpdateSurvivorStatus(s.id, 'Rescued')}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold transition-all flex items-center gap-1"
                              title="Mark as Safely Extracted"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Mark Rescued</span>
                            </button>
                          )}

                          {s.status === 'Rescued' && (
                            <button
                              onClick={() => onUpdateSurvivorStatus(s.id, 'Unrescued')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-[10px] font-mono transition-colors"
                              title="Reset back to Unrescued if needed"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
