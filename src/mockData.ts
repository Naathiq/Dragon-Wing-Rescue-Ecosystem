import { Drone, Survivor, Hazard, AIDetection, EmergencyAlert, ZoneCoverage, SensorHealth, AnalyticsPoint } from './types';

export const INITIAL_DRONES: Drone[] = [
  {
    id: 'd1',
    name: 'Slave 1',
    callsign: 'SLAVE-01',
    type: 'scout',
    status: 'Searching',
    battery: 82,
    altitude: 42,
    speed: 8.4,
    latitude: 37.7749,
    longitude: -122.4194,
    heading: 142,
    gpsSatellites: 14,
    gpsAvailable: true,
    imuStatus: 'Online',
    lidarStatus: 'Scanning',
    rgbCamStatus: 'Streaming',
    thermalCamStatus: 'Streaming',
    acousticStatus: 'Online',
    commStatus: 'Connected',
    navMode: 'VIO Navigation',
    obstacleAvoidanceActive: true,
    signalStrength: 94,
    latency: 18,
    bandwidth: 42.5,
    packetLoss: 0.1,
    position3D: { x: -12, y: 18, z: 8 },
    flightTrajectory: [
      { x: -25, y: 18, z: 20, timestamp: '10:00' },
      { x: -20, y: 18, z: 15, timestamp: '10:05' },
      { x: -15, y: 18, z: 12, timestamp: '10:10' },
      { x: -12, y: 18, z: 8, timestamp: '10:15' },
    ]
  },
  {
    id: 'd2',
    name: 'Slave 2',
    callsign: 'SLAVE-02',
    type: 'scout',
    status: 'Searching',
    battery: 64,
    altitude: 38,
    speed: 7.2,
    latitude: 37.7782,
    longitude: -122.4162,
    heading: 285,
    gpsSatellites: 12,
    gpsAvailable: true,
    imuStatus: 'Online',
    lidarStatus: 'Scanning',
    rgbCamStatus: 'Streaming',
    thermalCamStatus: 'Streaming',
    acousticStatus: 'Online',
    commStatus: 'Connected',
    navMode: 'SLAM Navigation',
    obstacleAvoidanceActive: true,
    signalStrength: 86,
    latency: 24,
    bandwidth: 36.0,
    packetLoss: 0.4,
    position3D: { x: 18, y: 16, z: -14 },
    flightTrajectory: [
      { x: 10, y: 16, z: -25, timestamp: '10:00' },
      { x: 14, y: 16, z: -20, timestamp: '10:08' },
      { x: 18, y: 16, z: -14, timestamp: '10:15' },
    ]
  },
  {
    id: 'd3',
    name: 'Slave 3',
    callsign: 'SLAVE-03',
    type: 'scout',
    status: 'Returning',
    battery: 31,
    altitude: 50,
    speed: 11.2,
    latitude: 37.7715,
    longitude: -122.4231,
    heading: 45,
    gpsSatellites: 15,
    gpsAvailable: true,
    imuStatus: 'Online',
    lidarStatus: 'Online',
    rgbCamStatus: 'Online',
    thermalCamStatus: 'Online',
    acousticStatus: 'Standby',
    commStatus: 'Connected',
    navMode: 'GPS Navigation',
    obstacleAvoidanceActive: true,
    signalStrength: 78,
    latency: 32,
    bandwidth: 22.0,
    packetLoss: 0.8,
    position3D: { x: -4, y: 22, z: 22 },
    flightTrajectory: [
      { x: -18, y: 22, z: 35, timestamp: '10:00' },
      { x: -10, y: 22, z: 28, timestamp: '10:10' },
      { x: -4, y: 22, z: 22, timestamp: '10:15' },
    ]
  },
  {
    id: 'd4',
    name: 'Master',
    callsign: 'MASTER',
    type: 'relay',
    status: 'Relay',
    battery: 91,
    altitude: 120,
    speed: 1.5,
    latitude: 37.7750,
    longitude: -122.4180,
    heading: 0,
    gpsSatellites: 18,
    gpsAvailable: true,
    imuStatus: 'Online',
    lidarStatus: 'Online',
    rgbCamStatus: 'Online',
    thermalCamStatus: 'Standby',
    acousticStatus: 'Standby',
    commStatus: 'Connected',
    navMode: 'GPS Navigation',
    obstacleAvoidanceActive: false,
    signalStrength: 99,
    latency: 8,
    bandwidth: 150.0,
    packetLoss: 0.0,
    position3D: { x: 0, y: 48, z: 0 },
    flightTrajectory: [
      { x: 0, y: 48, z: 0, timestamp: '09:50' },
    ]
  }
];

export const INITIAL_SURVIVORS: Survivor[] = [
  {
    id: 'S001',
    detectionType: 'Person',
    confidence: 96,
    latitude: 37.7754,
    longitude: -122.4201,
    zone: 'Zone A3',
    nearbyHazard: 'Active Fire (18m)',
    riskLevel: 'Critical',
    status: 'Unrescued',
    detectedAt: '10:12:44',
    timeAgo: '4m ago',
    thermalTemp: 37.2,
    notes: 'Adult trapped on 3rd floor balcony; structural collapse below stairs; active smoke.',
    assignedTeam: undefined,
    coordinates3D: { x: -15, y: 7, z: 6 },
    priorityScore: 98
  },
  {
    id: 'S002',
    detectionType: 'Thermal Hotspot',
    confidence: 93,
    latitude: 37.7741,
    longitude: -122.4188,
    zone: 'Zone B2',
    nearbyHazard: 'Structural Collapse & Rubble',
    riskLevel: 'Critical',
    status: 'Rescue Assigned',
    detectedAt: '10:08:19',
    timeAgo: '8m ago',
    thermalTemp: 36.8,
    notes: '2 distinct body heat signatures beneath cracked concrete slab. Acoustic sensor detected knocking.',
    assignedTeam: 'Rescue Squad Alpha-4',
    coordinates3D: { x: 8, y: 2, z: -10 },
    priorityScore: 92
  },
  {
    id: 'S003',
    detectionType: 'Visual Motion',
    confidence: 89,
    latitude: 37.7762,
    longitude: -122.4155,
    zone: 'Zone C1',
    nearbyHazard: 'Rising Flash Flood (0.8m/hr)',
    riskLevel: 'High',
    status: 'Unrescued',
    detectedAt: '10:14:02',
    timeAgo: '2m ago',
    thermalTemp: 35.9,
    notes: 'Individual waving orange cloth atop stranded delivery truck in flood surge.',
    assignedTeam: undefined,
    coordinates3D: { x: 22, y: 3, z: 14 },
    priorityScore: 84
  },
  {
    id: 'S004',
    detectionType: 'Person',
    confidence: 94,
    latitude: 37.7770,
    longitude: -122.4172,
    zone: 'Zone B4',
    nearbyHazard: 'Exposed Electrical Line (35m)',
    riskLevel: 'High',
    status: 'Unrescued',
    detectedAt: '10:02:51',
    timeAgo: '14m ago',
    thermalTemp: 36.6,
    notes: 'Sheltered in warehouse loading bay entrance. Conscious, responsive to drone siren.',
    assignedTeam: undefined,
    coordinates3D: { x: 12, y: 2, z: -2 },
    priorityScore: 76
  },
  {
    id: 'S005',
    detectionType: 'Acoustic Tap',
    confidence: 82,
    latitude: 37.7735,
    longitude: -122.4215,
    zone: 'Zone A1',
    nearbyHazard: 'Unstable Debris Pile',
    riskLevel: 'Medium',
    status: 'Rescued',
    detectedAt: '09:48:10',
    timeAgo: '28m ago',
    thermalTemp: 36.4,
    notes: 'Extracted safely by Ground Team Bravo. Transported to mobile triage field unit.',
    assignedTeam: 'Ground Team Bravo',
    coordinates3D: { x: -28, y: 1, z: 12 },
    priorityScore: 30
  },
  {
    id: 'S006',
    detectionType: 'Person',
    confidence: 91,
    latitude: 37.7747,
    longitude: -122.4140,
    zone: 'Zone C2',
    nearbyHazard: 'Water Runoff',
    riskLevel: 'Medium',
    status: 'Rescued',
    detectedAt: '09:55:33',
    timeAgo: '21m ago',
    thermalTemp: 36.5,
    notes: 'Child evacuated via rescue boat crew. No critical injuries reported.',
    assignedTeam: 'Marine Rescue 2',
    coordinates3D: { x: 26, y: 2, z: -18 },
    priorityScore: 25
  },
  {
    id: 'S007',
    detectionType: 'Thermal Hotspot',
    confidence: 88,
    latitude: 37.7758,
    longitude: -122.4190,
    zone: 'Zone A2',
    nearbyHazard: 'Smoldering Debris',
    riskLevel: 'Critical',
    status: 'Unrescued',
    detectedAt: '10:16:15',
    timeAgo: 'Just now',
    thermalTemp: 37.0,
    notes: 'Thermal signature detected in collapsed school gymnasium basement stairwell.',
    assignedTeam: undefined,
    coordinates3D: { x: -6, y: 1.5, z: -6 },
    priorityScore: 95
  }
];

export const INITIAL_HAZARDS: Hazard[] = [
  {
    id: 'H001',
    type: 'Fire',
    location: 'Zone A3 – Commercial Complex',
    zone: 'Zone A3',
    coordinates: { lat: 37.7755, lon: -122.4203 },
    coordinates3D: { x: -16, y: 4, z: 8 },
    confidence: 95,
    severity: 'Critical',
    detectedAt: '10:04:12',
    status: 'Spreading',
    details: 'Thermal peak 480°C. Structural roof collapse risk high. Wind spreading East at 14 km/h.'
  },
  {
    id: 'H002',
    type: 'Structural Collapse',
    location: 'Zone B2 – Multi-story Residential',
    zone: 'Zone B2',
    coordinates: { lat: 37.7742, lon: -122.4186 },
    coordinates3D: { x: 6, y: 3, z: -12 },
    confidence: 92,
    severity: 'Critical',
    detectedAt: '10:06:50',
    status: 'Active',
    details: 'Façade fractured 60%. Secondary collapse imminent. Search team seismic monitors alerted.'
  },
  {
    id: 'H003',
    type: 'Flood',
    location: 'Zone C1 – Lowland Basin Parkway',
    zone: 'Zone C1',
    coordinates: { lat: 37.7760, lon: -122.4150 },
    coordinates3D: { x: 20, y: 0.5, z: 16 },
    confidence: 96,
    severity: 'High',
    detectedAt: '09:58:20',
    status: 'Active',
    details: 'Water depth 1.6m and rising 12 cm every 10 minutes due to breach upstream.'
  },
  {
    id: 'H004',
    type: 'Landslide',
    location: 'Zone D1 – Northern Ridge Slope',
    zone: 'Zone D1',
    coordinates: { lat: 37.7788, lon: -122.4220 },
    coordinates3D: { x: -22, y: 6, z: -26 },
    confidence: 88,
    severity: 'High',
    detectedAt: '10:01:35',
    status: 'Active',
    details: 'Slope instability detected by LiDAR point cloud displacement. Roadway completely blocked.'
  },
  {
    id: 'H005',
    type: 'Exposed Electrical',
    location: 'Zone B4 – Substation Junction',
    zone: 'Zone B4',
    coordinates: { lat: 37.7768, lon: -122.4168 },
    coordinates3D: { x: 14, y: 2, z: 0 },
    confidence: 90,
    severity: 'High',
    detectedAt: '10:05:10',
    status: 'Active',
    details: 'Severed 13.8kV transmission line arcing near standing rainwater pool.'
  },
  {
    id: 'H006',
    type: 'Chemical / Gas',
    location: 'Zone A4 – Industrial Storage Yard',
    zone: 'Zone A4',
    coordinates: { lat: 37.7730, lon: -122.4225 },
    coordinates3D: { x: -30, y: 2, z: -4 },
    confidence: 84,
    severity: 'Medium',
    detectedAt: '10:09:40',
    status: 'Monitored',
    details: 'Volatile organic compound plume detected by drone multispectral sniffer; wind moving away from survivors.'
  },
  {
    id: 'H007',
    type: 'Debris',
    location: 'Zone B1 – Main Thoroughfare Ave',
    zone: 'Zone B1',
    coordinates: { lat: 37.7745, lon: -122.4175 },
    coordinates3D: { x: 2, y: 1, z: 4 },
    confidence: 94,
    severity: 'Low',
    detectedAt: '09:50:00',
    status: 'Contained',
    details: 'Heavy concrete and rebar obstruction. Rescue vehicle access impassable; requires heavy clearing.'
  }
];

export const INITIAL_AI_DETECTIONS: AIDetection[] = [
  {
    id: 'det-1',
    objectType: 'Person / Survivor',
    confidence: 96,
    location: 'Zone A3 (37.7754, -122.4201)',
    detectionTime: '10:16:22',
    riskLevel: 'Critical',
    droneSource: 'Slave 1',
    bbox: [32, 28, 24, 38],
    snapshotColor: '#ef4444'
  },
  {
    id: 'det-2',
    objectType: 'Fire',
    confidence: 94,
    location: 'Zone A3 (37.7755, -122.4203)',
    detectionTime: '10:16:18',
    riskLevel: 'Critical',
    droneSource: 'Slave 1',
    bbox: [62, 18, 30, 42],
    snapshotColor: '#f97316'
  },
  {
    id: 'det-3',
    objectType: 'Structural damage',
    confidence: 92,
    location: 'Zone B2 (37.7742, -122.4186)',
    detectionTime: '10:15:50',
    riskLevel: 'Critical',
    droneSource: 'Slave 2',
    bbox: [18, 44, 46, 36],
    snapshotColor: '#eab308'
  },
  {
    id: 'det-4',
    objectType: 'Flood water',
    confidence: 97,
    location: 'Zone C1 (37.7760, -122.4150)',
    detectionTime: '10:15:30',
    riskLevel: 'High',
    droneSource: 'Slave 2',
    bbox: [10, 60, 80, 35],
    snapshotColor: '#06b6d4'
  },
  {
    id: 'det-5',
    objectType: 'Person / Survivor',
    confidence: 91,
    location: 'Zone C1 (37.7762, -122.4155)',
    detectionTime: '10:14:45',
    riskLevel: 'High',
    droneSource: 'Slave 2',
    bbox: [48, 52, 16, 28],
    snapshotColor: '#ef4444'
  },
  {
    id: 'det-6',
    objectType: 'Debris',
    confidence: 89,
    location: 'Zone B1 (37.7745, -122.4175)',
    detectionTime: '10:13:10',
    riskLevel: 'Medium',
    droneSource: 'Slave 3',
    bbox: [25, 30, 50, 40],
    snapshotColor: '#a855f7'
  },
  {
    id: 'det-7',
    objectType: 'Landslide',
    confidence: 88,
    location: 'Zone D1 (37.7788, -122.4220)',
    detectionTime: '10:11:05',
    riskLevel: 'High',
    droneSource: 'Slave 3',
    bbox: [15, 20, 70, 50],
    snapshotColor: '#d97706'
  }
];

export const INITIAL_ALERTS: EmergencyAlert[] = [
  {
    id: 'alt-1',
    severity: 'CRITICAL',
    title: 'Survivor detected near active fire',
    description: 'Slave 1 YOLO detected human on 3rd floor balcony; thermal core 37.2°C. Fire front 18m away spreading East.',
    location: 'Zone A3 (37.7754, -122.4194)',
    zone: 'Zone A3',
    timestamp: '10:16:22',
    acknowledged: false,
    source: 'Slave 1 Edge AI'
  },
  {
    id: 'alt-2',
    severity: 'CRITICAL',
    title: 'Structural collapse detected',
    description: 'LiDAR point-cloud displacement > 14cm on multi-story residential building. Secondary collapse probability 87%.',
    location: 'Zone B2 (37.7742, -122.4186)',
    zone: 'Zone B2',
    timestamp: '10:15:50',
    acknowledged: false,
    source: 'Slave 2 LiDAR SLAM'
  },
  {
    id: 'alt-3',
    severity: 'HIGH',
    title: 'Flood water rapid rise detected',
    description: 'Water surge velocity increased to 0.8 m/hr. Zone C1 access road submerged; 1 survivor isolated on vehicle.',
    location: 'Zone C1 (37.7760, -122.4150)',
    zone: 'Zone C1',
    timestamp: '10:14:02',
    acknowledged: false,
    source: 'Slave 2 RGB AI'
  },
  {
    id: 'alt-4',
    severity: 'HIGH',
    title: 'Drone Slave 3 Battery Advisory',
    description: 'Battery reached 31%. Autonomous RTB (Return to Base) engaged. Rerouting via safe waypoint corridor.',
    location: 'Transit Corridor West',
    zone: 'Zone B1',
    timestamp: '10:10:15',
    acknowledged: true,
    source: 'Fleet Autonomous Manager'
  },
  {
    id: 'alt-5',
    severity: 'MEDIUM',
    title: 'GPS Signal Degraded – VIO Active',
    description: 'Slave 1 entered concrete canyon shadow. Automatic seamless failover from GNSS to Visual-Inertial Odometry + LiDAR SLAM.',
    location: 'Zone A3 Sector Alley',
    zone: 'Zone A3',
    timestamp: '10:08:44',
    acknowledged: true,
    source: 'Slave 1 Nav Core'
  }
];

export const INITIAL_ZONES: ZoneCoverage[] = [
  {
    id: 'zone-a',
    name: 'Zone A – Downtown Commercial',
    status: 'Complete',
    coveragePercent: 100,
    areaSqKm: 1.4,
    survivorsFound: 3,
    hazardsFound: 3,
    assignedDrone: 'Slave 1'
  },
  {
    id: 'zone-b',
    name: 'Zone B – High-Density Residential',
    status: 'Complete',
    coveragePercent: 100,
    areaSqKm: 1.8,
    survivorsFound: 2,
    hazardsFound: 2,
    assignedDrone: 'Slave 2'
  },
  {
    id: 'zone-c',
    name: 'Zone C – Lowland Flood Basin',
    status: 'In Progress',
    coveragePercent: 54,
    areaSqKm: 2.1,
    survivorsFound: 2,
    hazardsFound: 1,
    assignedDrone: 'Slave 2'
  },
  {
    id: 'zone-d',
    name: 'Zone D – Mountain Ridge & Slopes',
    status: 'Not Searched',
    coveragePercent: 18,
    areaSqKm: 2.7,
    survivorsFound: 0,
    hazardsFound: 1,
    assignedDrone: 'Slave 3 (Queued)'
  }
];

export const INITIAL_SENSORS: SensorHealth[] = [
  { id: 's1', name: 'RGB Camera', status: 'Online', rate: '4K @ 60 FPS', detail: 'Sony Exmor Edge AI Pipeline', iconType: 'camera' },
  { id: 's2', name: 'Thermal Camera', status: 'Online', rate: '640x512 FLIR 30Hz', detail: 'Uncooled Microbolometer <40mK', iconType: 'flame' },
  { id: 's3', name: 'GPS / GNSS', status: 'Online', rate: '14 Sats locked (RTK)', detail: 'Dual-band L1/L5 GPS+Galileo', iconType: 'satellite' },
  { id: 's4', name: 'IMU', status: 'Online', rate: '1000 Hz Tri-Axial', detail: 'Redundant MEMS Gyro + Accel', iconType: 'compass' },
  { id: 's5', name: 'LiDAR / Depth', status: 'Online', rate: '300,000 pts/sec', detail: '360° Solid-State 120m Range', iconType: 'radar' },
  { id: 's6', name: 'Acoustic Sensor', status: 'Online', rate: '4-Mic Beamforming', detail: 'Bio-Acoustic Knock Detection', iconType: 'mic' },
  { id: 's7', name: 'Mesh Communication', status: 'Online', rate: '5.8 GHz COFDM 42 Mbps', detail: 'Ad-hoc Drone-to-Drone Mesh', iconType: 'radio' },
];

export const INITIAL_ANALYTICS: AnalyticsPoint[] = [
  { time: '09:50', survivors: 1, hazards: 2, coverage: 15, batteryAvg: 96, aiConfidenceAvg: 91, rescuedCount: 0 },
  { time: '09:55', survivors: 2, hazards: 3, coverage: 28, batteryAvg: 91, aiConfidenceAvg: 93, rescuedCount: 0 },
  { time: '10:00', survivors: 4, hazards: 4, coverage: 42, batteryAvg: 85, aiConfidenceAvg: 92, rescuedCount: 1 },
  { time: '10:05', survivors: 5, hazards: 5, coverage: 52, batteryAvg: 79, aiConfidenceAvg: 94, rescuedCount: 1 },
  { time: '10:10', survivors: 6, hazards: 6, coverage: 61, batteryAvg: 72, aiConfidenceAvg: 93, rescuedCount: 2 },
  { time: '10:15', survivors: 7, hazards: 7, coverage: 68, batteryAvg: 67, aiConfidenceAvg: 94, rescuedCount: 2 },
];

// Tactical Web Audio synthesizer for emergency alert sound effect
export function playAlertSound(type: 'critical' | 'high' | 'click' = 'critical') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'critical') {
      // 2-tone urgent military beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.42);
    } else if (type === 'high') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // subtle tactical click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // Audio might be blocked if user hasn't interacted with page yet, which is safe to ignore
  }
}
