export type MissionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type SurvivorStatus = 'Unrescued' | 'Rescue Assigned' | 'Rescued';

export type NavigationMode = 'GPS Navigation' | 'VIO Navigation' | 'SLAM Navigation' | 'Obstacle Avoidance';

export interface Drone {
  id: string;
  name: string;
  callsign: string;
  type: 'scout' | 'relay';
  status: 'Searching' | 'Hovering' | 'Returning' | 'Relay' | 'Emergency RTB';
  battery: number;
  altitude: number; // in meters
  speed: number; // in m/s
  latitude: number;
  longitude: number;
  heading: number; // degrees 0-360
  gpsSatellites: number;
  gpsAvailable: boolean;
  imuStatus: 'Online' | 'Degraded' | 'Calibrating';
  lidarStatus: 'Online' | 'Scanning' | 'Offline';
  rgbCamStatus: 'Online' | 'Streaming' | 'Offline' | 'Standby';
  thermalCamStatus: 'Online' | 'Streaming' | 'Offline' | 'Standby';
  acousticStatus: 'Online' | 'Standby' | 'Offline';
  commStatus: 'Connected' | 'Degraded' | 'Offline';
  navMode: NavigationMode;
  obstacleAvoidanceActive: boolean;
  signalStrength: number; // percentage 0-100
  latency: number; // ms
  bandwidth: number; // Mbps
  packetLoss: number; // %
  position3D: { x: number; y: number; z: number };
  flightTrajectory: Array<{ x: number; y: number; z: number; timestamp: string }>;
}

export interface Survivor {
  id: string;
  detectionType: 'Person' | 'Thermal Hotspot' | 'Acoustic Tap' | 'Visual Motion';
  confidence: number;
  latitude: number;
  longitude: number;
  zone: string;
  nearbyHazard: string;
  riskLevel: RiskLevel;
  status: SurvivorStatus;
  detectedAt: string;
  timeAgo: string;
  thermalTemp: number; // e.g. 36.6 °C
  notes: string;
  assignedTeam?: string;
  coordinates3D: { x: number; y: number; z: number };
  priorityScore: number; // 0 - 100
}

export interface Hazard {
  id: string;
  type: 'Fire' | 'Flood' | 'Structural Collapse' | 'Landslide' | 'Debris' | 'Exposed Electrical' | 'Chemical / Gas';
  location: string;
  zone: string;
  coordinates: { lat: number; lon: number };
  coordinates3D: { x: number; y: number; z: number };
  confidence: number;
  severity: RiskLevel;
  detectedAt: string;
  status: 'Active' | 'Spreading' | 'Contained' | 'Monitored';
  details: string;
}

export interface AIDetection {
  id: string;
  objectType: 'Person / Survivor' | 'Fire' | 'Flood water' | 'Structural damage' | 'Debris' | 'Landslide' | 'Chemical / Gas' | 'Vehicle';
  confidence: number;
  location: string;
  detectionTime: string;
  riskLevel: RiskLevel;
  droneSource: string;
  bbox: [number, number, number, number]; // [x, y, w, h] normalized 0-100
  snapshotColor: string;
}

export interface EmergencyAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  description: string;
  location: string;
  zone: string;
  timestamp: string;
  acknowledged: boolean;
  source: string;
}

export interface ZoneCoverage {
  id: string;
  name: string;
  status: 'Complete' | 'In Progress' | 'Not Searched';
  coveragePercent: number;
  areaSqKm: number;
  survivorsFound: number;
  hazardsFound: number;
  assignedDrone: string;
}

export interface SensorHealth {
  id: string;
  name: string;
  status: 'Online' | 'Degraded' | 'Offline';
  rate: string;
  detail: string;
  iconType: string;
}

export interface AnalyticsPoint {
  time: string;
  survivors: number;
  hazards: number;
  coverage: number;
  batteryAvg: number;
  aiConfidenceAvg: number;
  rescuedCount: number;
}

export type ColorTheme = 'dark' | 'light';
