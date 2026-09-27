import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Radio, 
  Activity, 
  BarChart3, 
  Bell, 
  Video,
  AlertOctagon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type ActiveNavTab = 
  | 'dashboard' 
  | 'map' 
  | 'feeds' 
  | 'survivors' 
  | 'fleet' 
  | 'telemetry' 
  | 'hazards' 
  | 'analytics' 
  | 'alerts';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  unacknowledgedAlertsCount: number;
  criticalSurvivorsCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unacknowledgedAlertsCount,
  criticalSurvivorsCount,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'survivors' as const, label: 'Survivor Table', icon: Users, badge: criticalSurvivorsCount > 0 ? `${criticalSurvivorsCount} Crit` : null, badgeColor: 'red' },
    { id: 'map' as const, label: '3D Disaster Map', icon: Map, badge: null },
    { id: 'feeds' as const, label: 'Live Camera Feeds', icon: Video, badge: '4K/LWIR' },
    { id: 'fleet' as const, label: 'Drone Fleet', icon: Radio, badge: '4 Units' },
    { id: 'hazards' as const, label: 'Hazards & Coverage', icon: AlertOctagon, badge: null },
    { id: 'analytics' as const, label: 'Mission Analytics', icon: BarChart3, badge: null },
    { id: 'alerts' as const, label: 'Alert Log', icon: Bell, badge: unacknowledgedAlertsCount > 0 ? `${unacknowledgedAlertsCount}` : null, badgeColor: 'red' },
  ];

  return (
    <aside
      id="mission-control-sidebar"
      className={`bg-slate-950/90 border-r border-white/[0.08] transition-all duration-300 flex flex-col justify-between z-30 flex-shrink-0 h-full overflow-y-auto scrollbar-thin backdrop-blur-xl ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div>
        {/* Swarm Status Header */}
        <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium">
                Mesh Network Online
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors mx-auto cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer group ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-950/40 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
                title={item.label}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400 shadow-sm shadow-cyan-400" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-115 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs tracking-wide">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-tight ${
                          item.badgeColor === 'red'
                            ? isActive ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-300 border border-white/[0.06]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      {!isCollapsed && (
        <div className="p-3 m-2.5 rounded-xl bg-slate-900/50 border border-white/[0.06] text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Autonomous Edge AI</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Real-time inference & 3D SLAM active on all UAV units.
          </p>
        </div>
      )}
    </aside>
  );
};
