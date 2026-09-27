import React, { useState } from 'react';
import { AIDetection, RiskLevel } from '../types';
import { Cpu, ShieldAlert, Filter, Clock, MapPin, Eye, CheckCircle2 } from 'lucide-react';

interface AIDetectionPanelProps {
  detections: AIDetection[];
  onSelectDetection?: (detection: AIDetection) => void;
}

export const AIDetectionPanel: React.FC<AIDetectionPanelProps> = ({
  detections,
  onSelectDetection,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Person / Survivor',
    'Fire',
    'Flood water',
    'Structural damage',
    'Debris',
    'Landslide'
  ];

  const filteredDetections = filterType === 'ALL'
    ? detections
    : detections.filter(d => d.objectType.toLowerCase().includes(filterType.toLowerCase()));

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getCategoryColor = (type: string) => {
    if (type.includes('Person')) return 'text-emerald-400';
    if (type.includes('Fire')) return 'text-red-400';
    if (type.includes('Flood')) return 'text-cyan-400';
    if (type.includes('Structural')) return 'text-amber-400';
    if (type.includes('Landslide')) return 'text-orange-400';
    return 'text-purple-400';
  };

  return (
    <div id="ai-detection-panel" className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-4 sm:p-5 shadow-sm backdrop-blur-md flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Real-Time AI Detections
            </h2>
            <p className="text-xs text-slate-400">
              On-drone YOLOv11s inference · 320×320 tensor pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {detections.length} Targets
          </span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-xs scrollbar-thin">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all border cursor-pointer ${
              filterType === cat
                ? 'bg-cyan-500/20 text-cyan-300 font-medium border-cyan-500/40 shadow-sm'
                : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            {cat === 'ALL' ? 'All Detections' : cat}
          </button>
        ))}
      </div>

      {/* Detections List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[360px] scrollbar-thin">
        {filteredDetections.map(d => (
          <div
            key={d.id}
            onClick={() => onSelectDetection?.(d)}
            className="p-3.5 rounded-xl bg-slate-950/40 border border-white/[0.06] hover:border-cyan-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-sm font-semibold tracking-normal ${getCategoryColor(d.objectType)}`}>
                    {d.objectType}
                  </span>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700/60">
                    {d.confidence}%
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getRiskBadge(d.riskLevel)}`}>
                    {d.riskLevel}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {d.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {d.detectionTime}
                  </span>
                  <span className="text-cyan-400/90 font-medium">
                    via {d.droneSource}
                  </span>
                </div>
              </div>

              {/* Right Mini Visual Snapshot Preview */}
              <div className="w-14 h-12 rounded-lg bg-slate-900/80 border border-white/[0.08] flex items-center justify-center relative overflow-hidden flex-shrink-0 group-hover:border-cyan-500/40">
                <div
                  className="absolute inset-1 border rounded"
                  style={{ borderColor: d.snapshotColor, opacity: 0.7 }}
                />
                <span className="text-[10px] font-mono font-semibold text-slate-300">
                  {d.confidence}%
                </span>
                <div className="absolute bottom-0.5 right-1 text-[8px] font-mono text-slate-500">
                  AI
                </div>
              </div>
            </div>

            {/* Confidence Progress Bar */}
            <div className="w-full bg-slate-800/60 rounded-full h-1 mt-2.5 overflow-hidden">
              <div
                className="h-1 rounded-full bg-cyan-400"
                style={{ width: `${d.confidence}%` }}
              />
            </div>
          </div>
        ))}

        {filteredDetections.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-xs">
            No detections found in this category.
          </div>
        )}
      </div>
    </div>
  );
};
