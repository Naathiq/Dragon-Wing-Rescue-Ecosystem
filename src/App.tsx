import React, { useState, useEffect } from 'react';
import { 
  Drone, 
  Survivor, 
  Hazard, 
  AIDetection, 
  EmergencyAlert, 
  ZoneCoverage, 
  SensorHealth, 
  AnalyticsPoint, 
  MissionStatus, 
  SurvivorStatus,
  ColorTheme
} from './types';
import { 
  INITIAL_DRONES, 
  INITIAL_SURVIVORS, 
  INITIAL_HAZARDS, 
  INITIAL_AI_DETECTIONS, 
  INITIAL_ALERTS, 
  INITIAL_ZONES, 
  INITIAL_SENSORS, 
  INITIAL_ANALYTICS,
  playAlertSound 
} from './mockData';
import { Header } from './components/Header';
import { OverviewCards } from './components/OverviewCards';
import { DisasterMap3D } from './components/DisasterMap3D';
import { LiveCameraFeeds } from './components/LiveCameraFeeds';
import { AIDetectionPanel } from './components/AIDetectionPanel';
import { SurvivorManagement } from './components/SurvivorManagement';
import { RescuePriorityPanel } from './components/RescuePriorityPanel';
import { HazardMonitoring } from './components/HazardMonitoring';
import { DroneFleetPanel } from './components/DroneFleetPanel';
import { TelemetrySensors } from './components/TelemetrySensors';
import { SearchCoveragePanel } from './components/SearchCoveragePanel';
import { AlertSystem } from './components/AlertSystem';
import { MissionAnalytics } from './components/MissionAnalytics';
import { Sidebar, ActiveNavTab } from './components/Sidebar';
import { Map, Video, Users, ArrowRight, Radio, BatteryCharging, ChevronRight, Siren, CheckCircle2 } from 'lucide-react';

export default function App() {
  // State
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('ACTIVE');
  const [missionSeconds, setMissionSeconds] = useState<number>(24 * 60 + 35); // 24:35 start
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [dashboardMainView, setDashboardMainView] = useState<'map' | 'cameras'>('map');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  // Color Theme state: 'dark' or 'light' (white)
  const [theme, setTheme] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('dragonwing_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Sync data-theme attribute on document root and document body
  useEffect(() => {
    try {
      localStorage.setItem('dragonwing_theme', theme);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Core Data State
  const [drones, setDrones] = useState<Drone[]>(INITIAL_DRONES);
  const [selectedDroneId, setSelectedDroneId] = useState<string>('d1');
  const [survivors, setSurvivors] = useState<Survivor[]>(INITIAL_SURVIVORS);
  const [hazards, setHazards] = useState<Hazard[]>(INITIAL_HAZARDS);
  const [detections, setDetections] = useState<AIDetection[]>(INITIAL_AI_DETECTIONS);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(INITIAL_ALERTS);
  const [zones, setZones] = useState<ZoneCoverage[]>(INITIAL_ZONES);
  const [sensors, setSensors] = useState<SensorHealth[]>(INITIAL_SENSORS);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPoint[]>(INITIAL_ANALYTICS);

  const currentDrone = drones.find(d => d.id === selectedDroneId) || drones[0];
  const criticalAlertCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;
  const criticalSurvivorsCount = survivors.filter(s => s.riskLevel === 'Critical' && s.status === 'Unrescued').length;
  const overallCoverage = Math.round(
    zones.reduce((acc, z) => acc + (z.coveragePercent * z.areaSqKm), 0) / 
    zones.reduce((acc, z) => acc + z.areaSqKm, 0)
  );

  // Simulation Clock Tick
  useEffect(() => {
    if (missionStatus !== 'ACTIVE') return;

    const interval = setInterval(() => {
      setMissionSeconds(prev => prev + 1);

      // Subtly animate drone flight motion in 3D
      setDrones(prevDrones =>
        prevDrones.map(d => {
          if (d.status === 'Returning') {
            // Move towards origin base (0, 10, 0)
            const targetX = 0;
            const targetZ = 0;
            const dx = targetX - d.position3D.x;
            const dz = targetZ - d.position3D.z;
            const step = 0.05 * simSpeed;
            return {
              ...d,
              battery: Math.max(5, d.battery - 0.01 * simSpeed),
              position3D: {
                x: d.position3D.x + (dx > 0 ? step : -step),
                y: Math.max(10, d.position3D.y - 0.02 * simSpeed),
                z: d.position3D.z + (dz > 0 ? step : -step)
              }
            };
          }

          if (d.status === 'Searching') {
            // Slow orbital search sweep
            const angleDelta = 0.015 * simSpeed;
            const currentAngle = Math.atan2(d.position3D.z, d.position3D.x);
            const radius = Math.hypot(d.position3D.x, d.position3D.z);
            const newAngle = currentAngle + angleDelta;
            const newX = Math.cos(newAngle) * radius;
            const newZ = Math.sin(newAngle) * radius;
            const newHeading = Math.round((newAngle * 180 / Math.PI + 360) % 360);

            return {
              ...d,
              battery: Math.max(10, Number((d.battery - 0.005 * simSpeed).toFixed(2))),
              heading: newHeading,
              position3D: {
                ...d.position3D,
                x: Number(newX.toFixed(2)),
                z: Number(newZ.toFixed(2))
              }
            };
          }

          return d;
        })
      );
    }, 1000 / simSpeed);

    return () => clearInterval(interval);
  }, [missionStatus, simSpeed]);

  // Handler: Toggle Mission Active / Paused
  const handleToggleMissionStatus = () => {
    setMissionStatus(prev => prev === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
  };

  // Handler: Reset Mission Time
  const handleResetMission = () => {
    setMissionSeconds(0);
  };

  // Handler: Toggle Audio Sound
  const handleToggleSound = () => {
    setSoundEnabled(prev => !prev);
    if (!soundEnabled) {
      playAlertSound('click');
    }
  };

  // Handler: Toggle Dark / White Theme
  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    if (soundEnabled) {
      playAlertSound('click');
    }
  };

  // Handler: Acknowledge Alert
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, acknowledged: true } : a)
    );
    if (soundEnabled) {
      playAlertSound('click');
    }
  };

  // Handler: Acknowledge All Alerts
  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
    if (soundEnabled) {
      playAlertSound('click');
    }
  };

  // Handler: Update Survivor Status
  const handleUpdateSurvivorStatus = (id: string, newStatus: SurvivorStatus, assignedTeam?: string) => {
    setSurvivors(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            status: newStatus,
            assignedTeam: assignedTeam || (newStatus === 'Rescue Assigned' ? (s.assignedTeam || 'Rescue Alpha-1') : s.assignedTeam),
            priorityScore: newStatus === 'Rescued' ? 10 : s.priorityScore
          };
        }
        return s;
      });

      // Synchronize time-series analytics points with the updated rescue statistics
      const totalRescued = updated.filter(s => s.status === 'Rescued').length;
      const totalSurvivorsCount = updated.length;
      setAnalyticsData(prevAnalytics => {
        if (!prevAnalytics || prevAnalytics.length === 0) return prevAnalytics;
        const copy = [...prevAnalytics];
        const lastIdx = copy.length - 1;
        copy[lastIdx] = {
          ...copy[lastIdx],
          rescuedCount: totalRescued,
          survivors: totalSurvivorsCount
        };
        return copy;
      });

      return updated;
    });

    // Notify with an Emergency Alert when a survivor is safely rescued
    if (newStatus === 'Rescued') {
      const targetSurvivor = survivors.find(s => s.id === id);
      const zoneName = targetSurvivor?.zone || 'Disaster Perimeter';
      const rescueAlert: EmergencyAlert = {
        id: `alt-rescue-${Date.now()}`,
        severity: 'INFO',
        title: `Survivor ${id} Safely Extracted`,
        description: `Ground team confirmed survivor evacuated from ${zoneName}. Mission Analytics and extraction manifest updated.`,
        location: zoneName,
        zone: zoneName,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        acknowledged: false,
        source: 'Ground Rescue Net'
      };
      setAlerts(prev => [rescueAlert, ...prev]);
    }

    if (soundEnabled) {
      playAlertSound(newStatus === 'Rescued' ? 'click' : 'high');
    }
  };

  // Handler: Dispatch Team to Survivor
  const handleDispatchTeam = (survivorId: string) => {
    handleUpdateSurvivorStatus(survivorId, 'Rescue Assigned', 'Rescue Alpha-1');
  };

  // Handler: Toggle GPS Denial for Drone
  const handleToggleGpsDenial = (droneId: string) => {
    setDrones(prev =>
      prev.map(d => {
        if (d.id === droneId) {
          const newGpsState = !d.gpsAvailable;
          const newNavMode = newGpsState ? 'GPS Navigation' : 'VIO Navigation';
          return {
            ...d,
            gpsAvailable: newGpsState,
            navMode: newNavMode,
            gpsSatellites: newGpsState ? 14 : 0
          };
        }
        return d;
      })
    );

    // Create an alert
    const targetDrone = drones.find(d => d.id === droneId);
    if (targetDrone) {
      const isNowDenied = targetDrone.gpsAvailable;
      const newAlert: EmergencyAlert = {
        id: `alt-${Date.now()}`,
        severity: isNowDenied ? 'HIGH' : 'INFO',
        title: isNowDenied ? `GNSS Jammed – ${targetDrone.name} on VIO` : `GNSS Restored – ${targetDrone.name}`,
        description: isNowDenied
          ? `${targetDrone.name} lost satellite constellation. Autonomously engaged Visual-Inertial Odometry + 3D LiDAR SLAM mode.`
          : `${targetDrone.name} re-acquired 14 GNSS satellites with RTK centimeter lock.`,
        location: `Altitude ${targetDrone.altitude}m Sector`,
        zone: 'Sector Airspace',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        acknowledged: false,
        source: 'Avionics Navigation Computer'
      };
      setAlerts(prev => [newAlert, ...prev]);

      if (soundEnabled && isNowDenied) {
        playAlertSound('high');
      }
    }
  };

  // Handler: Return to Base for a Drone
  const handleReturnToBase = (droneId: string) => {
    setDrones(prev =>
      prev.map(d => d.id === droneId ? { ...d, status: 'Returning', speed: 10.5 } : d)
    );
    if (soundEnabled) {
      playAlertSound('click');
    }
  };

  // Handler: Emergency RTB for All Drones
  const handleEmergencyRTB = () => {
    setDrones(prev =>
      prev.map(d => d.type === 'scout' ? { ...d, status: 'Returning', speed: 12.0 } : d)
    );
    const newAlert: EmergencyAlert = {
      id: `alt-${Date.now()}`,
      severity: 'CRITICAL',
      title: 'EMERGENCY RECALL: ALL SCOUT DRONES RTB',
      description: 'Airspace evacuation order initiated. All scout UAVs returning to mobile ground launcher.',
      location: 'Disaster Airspace Corridor',
      zone: 'All Sectors',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      acknowledged: false,
      source: 'Mission Commander'
    };
    setAlerts(prev => [newAlert, ...prev]);

    if (soundEnabled) {
      playAlertSound('critical');
    }
  };

  // Handler: Simulate New Survivor Detected
  const handleInjectSurvivor = () => {
    const newIdNum = survivors.length + 1;
    const newId = `S00${newIdNum}`;
    const newSurvivor: Survivor = {
      id: newId,
      detectionType: 'Person',
      confidence: 95,
      latitude: 37.7759,
      longitude: -122.4182,
      zone: 'Zone B3',
      nearbyHazard: 'Fractured Building Wall (8m)',
      riskLevel: 'Critical',
      status: 'Unrescued',
      detectedAt: new Date().toLocaleTimeString('en-US', { hour12: false }),
      timeAgo: 'Just now',
      thermalTemp: 37.1,
      notes: 'Adult survivor discovered in collapsed stairwell cavity. Bio-acoustic confirmation registered.',
      coordinates3D: { x: 4, y: 1.5, z: 2 },
      priorityScore: 96
    };

    const newDetection: AIDetection = {
      id: `det-${Date.now()}`,
      objectType: 'Person / Survivor',
      confidence: 95,
      location: 'Zone B3 (37.7759, -122.4182)',
      detectionTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
      riskLevel: 'Critical',
      droneSource: 'Slave 1',
      bbox: [40, 35, 20, 35],
      snapshotColor: '#ef4444'
    };

    const newAlert: EmergencyAlert = {
      id: `alt-${Date.now()}`,
      severity: 'CRITICAL',
      title: `NEW SURVIVOR LOCATED [${newId}]`,
      description: `Slave 1 detected living person with 37.1°C core thermal signature trapped in Zone B3. Immediate extraction recommended.`,
      location: 'Zone B3 Collapsed Stairwell',
      zone: 'Zone B3',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      acknowledged: false,
      source: 'Slave 1 YOLOv11s'
    };

    setSurvivors(prev => [newSurvivor, ...prev]);
    setDetections(prev => [newDetection, ...prev]);
    setAlerts(prev => [newAlert, ...prev]);

    if (soundEnabled) {
      playAlertSound('critical');
    }
  };

  // Handler: Focus Survivor on Tactical 3D Map
  const handleFocusSurvivor = (survivor: Survivor) => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (soundEnabled) {
      playAlertSound('click');
    }
  };

  // Handler: Simulate Hazard
  const handleInjectHazard = (type: 'Fire' | 'Structural Collapse' | 'Flood') => {
    const newHazard: Hazard = {
      id: `H00${hazards.length + 1}`,
      type,
      location: 'Zone B2 – High-Density Block',
      zone: 'Zone B2',
      coordinates: { lat: 37.7744, lon: -122.4184 },
      coordinates3D: { x: 9, y: 2, z: -11 },
      confidence: 93,
      severity: 'Critical',
      detectedAt: new Date().toLocaleTimeString('en-US', { hour12: false }),
      status: 'Active',
      details: 'LiDAR SLAM detected sudden structural shift of 28cm. Rubble collapse blocking southern alleyway.'
    };

    const newAlert: EmergencyAlert = {
      id: `alt-${Date.now()}`,
      severity: 'CRITICAL',
      title: `SECONDARY HAZARD: ${type.toUpperCase()}`,
      description: `Seismic and LiDAR displacement detected in Zone B2. Immediate threat to nearby rescue teams.`,
      location: 'Zone B2 Multi-story Block',
      zone: 'Zone B2',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      acknowledged: false,
      source: 'Slave 2 LiDAR SLAM'
    };

    setHazards(prev => [newHazard, ...prev]);
    setAlerts(prev => [newAlert, ...prev]);

    if (soundEnabled) {
      playAlertSound('critical');
    }
  };

  // Handler: Toggle GPS All
  const handleToggleGpsAll = () => {
    const anyDenied = drones.some(d => !d.gpsAvailable);
    setDrones(prev =>
      prev.map(d => ({
        ...d,
        gpsAvailable: anyDenied,
        navMode: anyDenied ? 'GPS Navigation' : 'VIO Navigation',
        gpsSatellites: anyDenied ? 14 : 0
      }))
    );
    if (soundEnabled) {
      playAlertSound('high');
    }
  };

  return (
    <div 
      id="main-app-root"
      data-theme={theme}
      className="h-screen max-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden transition-colors duration-200"
    >
      {/* 1. MAIN HEADER (Section 1) */}
      <Header
        missionStatus={missionStatus}
        onToggleMissionStatus={handleToggleMissionStatus}
        onResetMission={handleResetMission}
        missionSeconds={missionSeconds}
        criticalAlertCount={criticalAlertCount}
        onOpenAlerts={() => setActiveTab('alerts')}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* BODY WITH SIDEBAR AND MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden min-h-0 w-full">
        {/* 15. NAVIGATION SIDEBAR (Section 15) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unacknowledgedAlertsCount={criticalAlertCount}
          criticalSurvivorsCount={criticalSurvivorsCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* MAIN DASHBOARD CONTENT AREA (ONLY THIS RIGHT WINDOW SCROLLS) */}
        <main className="flex-1 overflow-y-auto min-h-0 h-full p-4 sm:p-5 lg:p-6 space-y-5 max-w-[1920px] mx-auto w-full scrollbar-thin bg-tactical-grid relative">
          {/* Subtle Ambient HUD Lighting */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* TACTICAL LIVE TELEMETRY TICKER */}
          {activeTab === 'dashboard' && (
            <div className="bg-slate-950/75 border border-cyan-500/30 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-xl shadow-lg shadow-cyan-950/20 hud-corner">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono font-bold tracking-tight">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  TAC-NET · 5.8 GHz
                </span>
                <span className="hidden md:inline text-slate-300 font-mono text-[11px]">
                  Throughput: <strong className="text-white">142.8 Mbps</strong> · Latency: <strong className="text-emerald-400">14ms</strong>
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>GNSS Dual-Band RTK 14 Sats Locked</span>
                </span>
                <span className="hidden lg:inline text-slate-600">|</span>
                <span className="hidden lg:inline text-slate-300">
                  AI Edge TensorRT: <strong className="text-cyan-300">30.2 FPS @ 4K/LWIR</strong>
                </span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="hidden sm:inline text-emerald-400 font-semibold">
                  Zero Packet Loss (0.00%)
                </span>
              </div>
            </div>
          )}

          {/* 2. MISSION OVERVIEW CARDS (Section 2) - Visible in Dashboard view */}
          {activeTab === 'dashboard' && (
            <OverviewCards
              drones={drones}
              survivors={survivors}
              hazards={hazards}
              overallCoverage={overallCoverage}
              missionSeconds={missionSeconds}
              onNavigateSection={(section) => {
                if (section === 'fleet') setActiveTab('fleet');
                if (section === 'survivors') setActiveTab('survivors');
                if (section === 'hazards') setActiveTab('dashboard');
                if (section === 'coverage') setActiveTab('dashboard');
                if (section === 'analytics') setActiveTab('analytics');
              }}
            />
          )}

          {/* VIEW: DASHBOARD (MAIN COMMAND CENTER) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* PRIMARY ROW: 3D DIGITAL TWIN / CAMERA SWITCHER + REAL-TIME AI DETECTIONS */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
                {/* Left 2 Columns: Tactical Map or Live Feeds View */}
                <div className="xl:col-span-2 bg-slate-900/60 rounded-2xl border border-white/[0.08] p-4 sm:p-5 flex flex-col justify-between shadow-sm backdrop-blur-md min-h-[580px]">
                  {/* Top Switcher Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {dashboardMainView === 'map' ? <Map className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-white tracking-tight">
                          {dashboardMainView === 'map' ? '3D Disaster Digital Twin' : 'Live Multi-Spectral Camera Feeds'}
                        </h2>
                        <p className="text-xs text-slate-400">
                          {dashboardMainView === 'map'
                            ? 'Real-Time Spatial SLAM · UAV Telemetry · Survivor Geotags'
                            : '4K Optical · LWIR Thermal 30Hz · Edge Inference'}
                        </p>
                      </div>
                    </div>

                    {/* View Switcher Toggle */}
                    <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-white/[0.08] text-xs">
                      <button
                        onClick={() => setDashboardMainView('map')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          dashboardMainView === 'map'
                            ? 'bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>3D Map</span>
                      </button>
                      <button
                        onClick={() => setDashboardMainView('cameras')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          dashboardMainView === 'cameras'
                            ? 'bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Camera Feeds</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Display Area */}
                  <div className="flex-1 w-full min-h-[460px]">
                    {dashboardMainView === 'map' ? (
                      <DisasterMap3D
                        drones={drones}
                        selectedDroneId={selectedDroneId}
                        onSelectDrone={setSelectedDroneId}
                        survivors={survivors}
                        hazards={hazards}
                        isExpanded={isMapExpanded}
                        onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
                      />
                    ) : (
                      <LiveCameraFeeds
                        currentDrone={currentDrone}
                        survivors={survivors}
                        hazards={hazards}
                      />
                    )}
                  </div>
                </div>

                {/* Right Column: AI Detection Feed + Urgent Survivor Queue */}
                <div className="xl:col-span-1 flex flex-col gap-4">
                  {/* AI Detection Panel */}
                  <div className="flex-1 min-h-[320px]">
                    <AIDetectionPanel
                      detections={detections}
                      onSelectDetection={(d) => {
                        const src = d.droneSource.toLowerCase();
                        if (src.includes('slave 1') || src.includes('01') || src.includes('1')) setSelectedDroneId('d1');
                        else if (src.includes('slave 2') || src.includes('02') || src.includes('2')) setSelectedDroneId('d2');
                        else if (src.includes('slave 3') || src.includes('03') || src.includes('3')) setSelectedDroneId('d3');
                        else if (src.includes('master')) setSelectedDroneId('d4');
                      }}
                    />
                  </div>

                  {/* Urgent Survivor Triage Queue */}
                  <div className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-4 shadow-sm backdrop-blur-md flex flex-col">
                    <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2.5">
                      <div className="flex items-center gap-2">
                        <Siren className="w-4 h-4 text-red-400 animate-pulse" />
                        <h3 className="text-sm font-semibold text-white tracking-tight">
                          Urgent Triage Queue
                        </h3>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 font-medium">
                        {survivors.filter(s => s.status === 'Unrescued').length} Unrescued
                      </span>
                    </div>

                    {/* Top 2 Urgent Unrescued Survivors */}
                    <div className="space-y-2 mb-3">
                      {survivors
                        .filter(s => s.status === 'Unrescued')
                        .slice(0, 2)
                        .map(s => (
                          <div
                            key={s.id}
                            className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.06] hover:border-red-500/30 transition-all flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-red-400 text-sm">{s.id}</span>
                                <span className="text-xs text-slate-300 font-medium">{s.detectionType}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20">
                                  {s.riskLevel}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">
                                {s.nearbyHazard} · {s.zone}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDispatchTeam(s.id)}
                              className="px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer"
                            >
                              <span>Dispatch</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                    </div>

                    {/* Button to Open Dedicated Full Survivor Table */}
                    <button
                      onClick={() => setActiveTab('survivors')}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800/50 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30 border border-white/[0.08] text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>View Survivor Manifest ({survivors.length})</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* SECONDARY ROW: EMERGENCY ALERTS & SWARM FLEET STATUS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 13. ALERT SYSTEM (Section 13) */}
                <div className="min-h-[380px]">
                  <AlertSystem
                    alerts={alerts}
                    onAcknowledgeAlert={handleAcknowledgeAlert}
                    onAcknowledgeAll={handleAcknowledgeAll}
                  />
                </div>

                {/* Swarm Quick Fleet Status */}
                <div className="bg-slate-900/60 rounded-2xl border border-white/[0.08] p-5 shadow-sm backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white tracking-tight">
                            Swarm Fleet Overview
                          </h3>
                          <p className="text-xs text-slate-400">
                            4 Autonomous Nodes · Mesh Ad-Hoc 5.8GHz · Real-time Telemetry
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('fleet')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>Full Fleet</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Drones grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {drones.map(d => (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDroneId(d.id)}
                          className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.03] hud-corner ${
                            selectedDroneId === d.id
                              ? 'bg-cyan-950/30 border-cyan-500/70 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                              : 'bg-slate-950/50 border-white/[0.08] hover:border-cyan-500/40 hover:bg-slate-950/80 hover:shadow-md hover:shadow-cyan-950/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              {d.callsign}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              d.status === 'Searching'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : d.status === 'Hovering'
                                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}>
                              {d.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                            <span>Alt: <strong className="text-slate-200">{d.altitude}m</strong></span>
                            <span>Speed: <strong className="text-slate-200">{d.speed} m/s</strong></span>
                          </div>

                          {/* Battery Bar */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-400 flex items-center gap-1">
                                <BatteryCharging className="w-3 h-3 text-cyan-400" /> Battery
                              </span>
                              <span className={`font-bold ${d.battery < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {Math.round(d.battery)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  d.battery < 30 ? 'bg-red-500' : d.battery < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${d.battery}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer link to Fleet */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
                    <span className="text-slate-400">
                      GNSS Mode: <strong className="text-emerald-400">RTK 14 Sats Locked</strong>
                    </span>
                    <button
                      onClick={() => setActiveTab('fleet')}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      <span>View Drone Fleet →</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 3D MAP EXPANDED (Section 3) */}
          {activeTab === 'map' && (
            <div className="space-y-5">
              <div className="h-[680px] w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
                <DisasterMap3D
                  drones={drones}
                  selectedDroneId={selectedDroneId}
                  onSelectDrone={setSelectedDroneId}
                  survivors={survivors}
                  hazards={hazards}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <TelemetrySensors
                  currentDrone={currentDrone}
                  sensors={sensors}
                  onToggleGpsDenial={handleToggleGpsDenial}
                />
                <SearchCoveragePanel
                  zones={zones}
                  overallCoverage={overallCoverage}
                />
              </div>
            </div>
          )}

          {/* VIEW: LIVE CAMERA FEEDS (Section 5) */}
          {activeTab === 'feeds' && (
            <div className="space-y-5">
              <LiveCameraFeeds
                currentDrone={currentDrone}
                survivors={survivors}
                hazards={hazards}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AIDetectionPanel
                  detections={detections}
                  onSelectDetection={(d) => {
                    const src = d.droneSource.toLowerCase();
                    if (src.includes('slave 1') || src.includes('01') || src.includes('1')) setSelectedDroneId('d1');
                    else if (src.includes('slave 2') || src.includes('02') || src.includes('2')) setSelectedDroneId('d2');
                    else if (src.includes('slave 3') || src.includes('03') || src.includes('3')) setSelectedDroneId('d3');
                    else if (src.includes('master')) setSelectedDroneId('d4');
                  }}
                />
                <TelemetrySensors
                  currentDrone={currentDrone}
                  sensors={sensors}
                  onToggleGpsDenial={handleToggleGpsDenial}
                />
              </div>
            </div>
          )}

          {/* VIEW: SURVIVORS (Section 6 & 7) */}
          {activeTab === 'survivors' && (
            <div className="space-y-5">
              <SurvivorManagement
                survivors={survivors}
                onUpdateStatus={handleUpdateSurvivorStatus}
                onFocusSurvivor={handleFocusSurvivor}
              />
            </div>
          )}

          {/* VIEW: DRONE FLEET & COMMS (Section 9 & 17) */}
          {(activeTab === 'fleet' || (activeTab as string) === 'telemetry') && (
            <div className="space-y-5">
              <DroneFleetPanel
                drones={drones}
                selectedDroneId={selectedDroneId}
                onSelectDrone={setSelectedDroneId}
                onReturnToBase={handleReturnToBase}
              />
            </div>
          )}

          {/* VIEW: HAZARDS & COVERAGE (Section 8 & 12) */}
          {activeTab === 'hazards' && (
            <div className="space-y-5">
              <HazardMonitoring
                hazards={hazards}
              />
              <SearchCoveragePanel
                zones={zones}
                overallCoverage={overallCoverage}
              />
            </div>
          )}

          {/* VIEW: MISSION ANALYTICS (Section 14) */}
          {activeTab === 'analytics' && (
            <div className="space-y-5">
              <MissionAnalytics
                analyticsData={analyticsData}
                survivors={survivors}
                hazards={hazards}
                onUpdateSurvivorStatus={handleUpdateSurvivorStatus}
              />
              <SearchCoveragePanel
                zones={zones}
                overallCoverage={overallCoverage}
              />
            </div>
          )}

          {/* VIEW: ALERTS (Section 13) */}
          {activeTab === 'alerts' && (
            <div className="space-y-5">
              <AlertSystem
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onAcknowledgeAll={handleAcknowledgeAll}
              />
              <RescuePriorityPanel
                survivors={survivors}
                hazards={hazards}
                onDispatchTeam={handleDispatchTeam}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
