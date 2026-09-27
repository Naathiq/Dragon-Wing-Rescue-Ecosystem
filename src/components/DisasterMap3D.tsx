import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Drone, Survivor, Hazard } from '../types';
import { 
  Sun, 
  Sunset,
  Moon, 
  CloudRain, 
  Zap, 
  Maximize2, 
  Minimize2, 
  Navigation, 
  RefreshCw, 
  Flame, 
  Users, 
  Radio, 
  Compass, 
  Eye, 
  MapPin, 
  Battery, 
  X,
  ChevronRight,
  ShieldCheck,
  Crosshair,
  AlertTriangle
} from 'lucide-react';

interface DisasterMap3DProps {
  drones: Drone[];
  selectedDroneId: string;
  onSelectDrone: (id: string) => void;
  survivors: Survivor[];
  hazards: Hazard[];
  onSelectSurvivor?: (s: Survivor) => void;
  onSelectHazard?: (h: Hazard) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

type ViewMode = 'twin' | 'thermal' | 'lidar' | 'nvg';
type CameraAngle = 'orbit' | 'chase' | 'cockpit' | 'top';
type EnvironmentAtmosphere = 'day' | 'golden' | 'night' | 'storm';

// High-DPI 3D Billboard Badge for Master and Slave Drones
function createDroneLabelTexture(drone: Drone, isSelected: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const isMaster = drone.id === 'd4' || drone.type === 'relay' || drone.name.toLowerCase().includes('master');

  ctx.save();
  ctx.clearRect(0, 0, 512, 160);

  const radius = 24;
  const x = 16;
  const y = 14;
  const w = 480;
  const h = 105;

  // Background glow
  ctx.shadowColor = isMaster
    ? (isSelected ? 'rgba(251, 191, 36, 0.95)' : 'rgba(245, 158, 11, 0.55)')
    : (isSelected ? 'rgba(56, 189, 248, 0.95)' : 'rgba(6, 182, 212, 0.55)');
  ctx.shadowBlur = isSelected ? 24 : 14;

  // Fill path
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fillStyle = isMaster ? 'rgba(18, 10, 36, 0.94)' : 'rgba(8, 18, 32, 0.92)';
  ctx.fill();

  // Stroke border
  ctx.lineWidth = isSelected ? 5 : 3;
  ctx.strokeStyle = isMaster
    ? (isSelected ? '#fde047' : '#f59e0b')
    : (isSelected ? '#38bdf8' : '#06b6d4');
  ctx.stroke();

  // Pointer notch pointing downward to drone
  ctx.beginPath();
  ctx.moveTo(238, 119);
  ctx.lineTo(256, 138);
  ctx.lineTo(274, 119);
  ctx.closePath();
  ctx.fillStyle = isMaster ? '#f59e0b' : '#06b6d4';
  ctx.fill();

  ctx.shadowBlur = 0; // reset shadow for crisp typography

  if (isMaster) {
    // Star glyph
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 42px system-ui, sans-serif';
    ctx.fillText('★', 40, 68);

    // Title: MASTER
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 40px system-ui, sans-serif';
    ctx.fillText('MASTER', 92, 68);

    // Pill badge: TOP RELAY
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(288, 36, 184, 34, 10);
    else ctx.rect(288, 36, 184, 34);
    ctx.fill();

    ctx.fillStyle = '#1e1035';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('TOP RELAY · 120m', 302, 60);

    // Subtitle telemetry
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`SWARM COMMAND · ${Math.round(drone.battery)}% BAT · MESH BRIDGE`, 40, 104);
  } else {
    // Slave 1, Slave 2, Slave 3
    const num = drone.name.replace(/[^0-9]/g, '') || (drone.id === 'd1' ? '1' : drone.id === 'd2' ? '2' : '3');

    // Number disc
    ctx.beginPath();
    ctx.arc(65, 58, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();

    ctx.fillStyle = '#081220';
    ctx.font = '900 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num, 65, 59);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Title: SLAVE 1/2/3
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 40px system-ui, sans-serif';
    ctx.fillText(`SLAVE ${num}`, 105, 68);

    // Altitude Badge
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(290, 36, 180, 34, 10);
    else ctx.rect(290, 36, 180, 34);
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`ALT: ${Math.round(drone.altitude)}m AGL`, 310, 60);

    // Subtitle telemetry
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`SCOUT · ${drone.status.toUpperCase()} · ${Math.round(drone.battery)}% BAT`, 40, 104);
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export const DisasterMap3D: React.FC<DisasterMap3DProps> = ({
  drones,
  selectedDroneId,
  onSelectDrone,
  survivors,
  hazards,
  onSelectSurvivor,
  onSelectHazard,
  isExpanded = false,
  onToggleExpand
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Display Settings: Default to realistic bright daylight!
  const [viewMode, setViewMode] = useState<ViewMode>('twin');
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('orbit');
  const [atmosphere, setAtmosphere] = useState<EnvironmentAtmosphere>('day');
  const [showSearchlight, setShowSearchlight] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [inspectedEntity, setInspectedEntity] = useState<{
    type: 'drone' | 'survivor' | 'hazard';
    id: string;
    data: any;
  } | null>(null);

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Mesh & Particle Refs
  const dronesGroupRef = useRef<Map<string, THREE.Group>>(new Map());
  const rotorsRef = useRef<THREE.Mesh[]>([]);
  const blurDiscsRef = useRef<THREE.Mesh[]>([]);
  const strobesRef = useRef<THREE.PointLight[]>([]);
  const searchlightsRef = useRef<Map<string, THREE.SpotLight>>(new Map());
  const radarRingsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const survivorMarkersRef = useRef<Map<string, THREE.Group>>(new Map());
  const hazardMarkersRef = useRef<Map<string, THREE.Group>>(new Map());
  const emergencyStrobesRef = useRef<THREE.PointLight[]>([]);
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);
  const trajectoryLinesRef = useRef<Map<string, THREE.Line>>(new Map());
  const droneLabelsRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const meshLinkLinesRef = useRef<THREE.Line[]>([]);

  // Environment Refs
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const waterGeometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const waterOriginalVerticesRef = useRef<Float32Array | null>(null);
  const fireParticlesRef = useRef<THREE.Points | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const lidarPointsRef = useRef<THREE.Points | null>(null);

  // Camera Damped Inertia State
  const targetSphericalRef = useRef({ radius: 76, theta: 0.85, phi: 1.05 });
  const currentSphericalRef = useRef({ radius: 76, theta: 0.85, phi: 1.05 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 3, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 3, 0));

  // Interaction State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef(0);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseCoordsRef = useRef(new THREE.Vector2());

  const currentDrone = drones.find(d => d.id === selectedDroneId) || drones[0];

  // Helper: Procedural Photorealistic Disaster Zone Ground Canvas Texture (2048x2048)
  const generateRealisticTerrainTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Natural Earth / Soil Base with vegetation variations
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 2048, 2048);

    // Weathered grass patches & soil variation
    const grassColors = ['#3f6212', '#4d7c0f', '#365314', '#52525b', '#334155'];
    for (let i = 0; i < 600; i++) {
      const gx = Math.random() * 2048;
      const gy = Math.random() * 2048;
      const gr = 15 + Math.random() * 45;
      ctx.fillStyle = grassColors[Math.floor(Math.random() * grassColors.length)];
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 2. Main Roads Network (North-South Boulevard & East-West Avenue)
    // North-South Avenue
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(940, 0, 168, 2048);
    // Concrete Sidewalks & Curbs
    ctx.fillStyle = '#64748b';
    ctx.fillRect(920, 0, 20, 2048);
    ctx.fillRect(1108, 0, 20, 2048);

    // East-West Boulevard
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 940, 2048, 168);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 920, 2048, 20);
    ctx.fillRect(0, 1108, 2048, 20);

    // Double Solid Yellow Center Line (North-South)
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(1020, 0); ctx.lineTo(1020, 915);
    ctx.moveTo(1020, 1135); ctx.lineTo(1020, 2048);
    ctx.moveTo(1028, 0); ctx.lineTo(1028, 915);
    ctx.moveTo(1028, 1135); ctx.lineTo(1028, 2048);
    ctx.stroke();

    // Double Solid Yellow Center Line (East-West)
    ctx.beginPath();
    ctx.moveTo(0, 1020); ctx.lineTo(915, 1020);
    ctx.moveTo(1135, 1020); ctx.lineTo(2048, 1020);
    ctx.moveTo(0, 1028); ctx.lineTo(915, 1028);
    ctx.moveTo(1135, 1028); ctx.lineTo(2048, 1028);
    ctx.stroke();

    // Dashed White Lane Dividers
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.setLineDash([25, 25]);
    ctx.beginPath();
    ctx.moveTo(980, 0); ctx.lineTo(980, 915);
    ctx.moveTo(980, 1135); ctx.lineTo(980, 2048);
    ctx.moveTo(1068, 0); ctx.lineTo(1068, 915);
    ctx.moveTo(1068, 1135); ctx.lineTo(1068, 2048);
    ctx.moveTo(0, 980); ctx.lineTo(915, 980);
    ctx.moveTo(1135, 980); ctx.lineTo(2048, 980);
    ctx.moveTo(0, 1068); ctx.lineTo(915, 1068);
    ctx.moveTo(1135, 1068); ctx.lineTo(2048, 1068);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pedestrian Zebra Crosswalks at Intersection
    ctx.fillStyle = '#f8fafc';
    for (let c = 945; c < 1100; c += 22) {
      ctx.fillRect(c, 915, 12, 22);
      ctx.fillRect(c, 1110, 12, 22);
    }
    for (let c = 945; c < 1100; c += 22) {
      ctx.fillRect(915, c, 22, 12);
      ctx.fillRect(1110, c, 22, 12);
    }

    // 3. Staging Helipad / Safe Evacuation Apron (South-East Zone)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(1450, 1450, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.stroke();
    // Yellow "H" Marking
    ctx.fillStyle = '#facc15';
    ctx.fillRect(1415, 1370, 18, 160);
    ctx.fillRect(1467, 1370, 18, 160);
    ctx.fillRect(1415, 1440, 70, 18);

    // 4. Disaster Scorched Ground (Industrial Hazard Zone)
    const fireBurn = ctx.createRadialGradient(580, 760, 20, 580, 760, 280);
    fireBurn.addColorStop(0, 'rgba(24, 24, 27, 0.95)');
    fireBurn.addColorStop(0.4, 'rgba(41, 37, 36, 0.7)');
    fireBurn.addColorStop(0.7, 'rgba(68, 64, 60, 0.4)');
    fireBurn.addColorStop(1, 'rgba(71, 85, 105, 0)');
    ctx.fillStyle = fireBurn;
    ctx.beginPath();
    ctx.arc(580, 760, 280, 0, Math.PI * 2);
    ctx.fill();

    // 5. Earthquake Fault Fissure (Cracked asphalt cutting across roadway)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(880, 840);
    ctx.lineTo(950, 890);
    ctx.lineTo(1030, 875);
    ctx.lineTo(1090, 930);
    ctx.lineTo(1180, 910);
    ctx.lineTo(1240, 960);
    ctx.stroke();

    // 6. River Embankment Transition (East Sector)
    const riverBed = ctx.createLinearGradient(1480, 0, 2048, 0);
    riverBed.addColorStop(0, 'rgba(71, 85, 105, 0)');
    riverBed.addColorStop(0.2, '#0369a1');
    riverBed.addColorStop(0.5, '#0284c7');
    riverBed.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = riverBed;
    ctx.fillRect(1480, 0, 568, 2048);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  // Helper: Procedural Architectural Building Facade Texture
  const generateBuildingFacadeTexture = (isDamaged = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Concrete facade background
    ctx.fillStyle = isDamaged ? '#334155' : '#475569';
    ctx.fillRect(0, 0, 512, 512);

    // Architectural window grid
    const cols = 8;
    const rows = 12;
    const winW = 38;
    const winH = 24;
    const gapX = 26;
    const gapY = 18;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 16 + c * (winW + gapX);
        const y = 14 + r * (winH + gapY);

        if (isDamaged && Math.random() < 0.35) {
          // Broken / blackened window
          ctx.fillStyle = '#0f172a';
        } else {
          // Reflective glass pane with subtle daylight glint
          const isLit = !isDamaged && (c + r) % 5 === 0;
          ctx.fillStyle = isLit ? '#fef08a' : '#38bdf8';
        }

        ctx.fillRect(x, y, winW, winH);

        // Window frame
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, winW, winH);
      }
    }

    if (isDamaged) {
      // Crack lines across facade
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 40);
      ctx.lineTo(240, 220);
      ctx.lineTo(310, 450);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  // Helper: Particle Spark Texture
  const generateGlowTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(249, 115, 22, 0.9)');
    grad.addColorStop(0.7, 'rgba(239, 68, 68, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  };

  // Helper: Soft Smoke Puff Texture
  const generateSmokeTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(203, 213, 225, 0.7)');
    grad.addColorStop(0.4, 'rgba(100, 116, 139, 0.45)');
    grad.addColorStop(0.8, 'rgba(51, 65, 85, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  };

  // 1. INITIALIZE THREE.JS SCENE ON MOUNT
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 560;

    // Scene: Bright, crisp daylight sky and soft atmospheric haze
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0c4e2);
    scene.fog = new THREE.FogExp2(0xa0c4e2, 0.0035);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    cameraRef.current = camera;

    // Renderer with ACES Tone Mapping & Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Rich Daylight Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Sky Dome / Hemispheric Natural Light (Sky blue to warm earth)
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x64748b, 1.8);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Main Crisp Sunlight
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 3.2);
    dirLight.position.set(55, 80, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 220;
    dirLight.shadow.camera.left = -80;
    dirLight.shadow.camera.right = 80;
    dirLight.shadow.camera.top = 80;
    dirLight.shadow.camera.bottom = -80;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Soft Daylight Fill Light (prevents pitch-black shadows)
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.8);
    fillLight.position.set(-45, 45, -45);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 2. PROCEDURAL PHOTOREALISTIC TERRAIN (Natural Elevation & Paved Roads)
    const terrainGeo = new THREE.PlaneGeometry(160, 160, 80, 80);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);

      // Elevated hill slope on North-West quadrant
      let vy = 0;
      if (vx < -8 && vz < -8) {
        vy = Math.sin((vx + 8) * 0.07) * Math.sin((vz + 8) * 0.07) * 10;
      }
      // Natural slope down into riverbed on East
      if (vx > 34) {
        vy = -1.9 - (vx - 34) * 0.04;
      }
      posAttr.setY(i, vy);
    }
    terrainGeo.computeVertexNormals();

    const terrainTexture = generateRealisticTerrainTexture();
    const terrainMat = new THREE.MeshStandardMaterial({
      map: terrainTexture || undefined,
      color: 0xffffff, // full canvas color fidelity
      roughness: 0.85,
      metalness: 0.1
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // 3. REFLECTIVE WATER PLANE (River & Flooded Basin)
    const waterGeo = new THREE.PlaneGeometry(55, 160, 40, 40);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.12,
      metalness: 0.65,
      transparent: true,
      opacity: 0.85
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(60, -1.3, 0);
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;
    waterGeometryRef.current = waterGeo;
    waterOriginalVerticesRef.current = new Float32Array(waterGeo.attributes.position.array);

    // 4. REALISTIC ARCHITECTURAL BUILDINGS & DISASTER LANDMARKS
    const buildingMatPristine = new THREE.MeshStandardMaterial({
      map: generateBuildingFacadeTexture(false) || undefined,
      roughness: 0.5,
      metalness: 0.3
    });
    const buildingMatDamaged = new THREE.MeshStandardMaterial({
      map: generateBuildingFacadeTexture(true) || undefined,
      roughness: 0.85,
      metalness: 0.15
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.2
    });
    const rubbleMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.95,
      metalness: 0.05
    });

    // Building 1: Tall City Tower (Commercial high-rise)
    const towerGeo = new THREE.BoxGeometry(13, 24, 13);
    const towerMesh = new THREE.Mesh(towerGeo, buildingMatPristine);
    towerMesh.position.set(-18, 12, -20);
    towerMesh.castShadow = true;
    towerMesh.receiveShadow = true;
    scene.add(towerMesh);
    // Rooftop Elevator Penthouse & HVAC
    const hvacGeo = new THREE.BoxGeometry(4, 2.5, 4);
    const hvacMesh = new THREE.Mesh(hvacGeo, roofMat);
    hvacMesh.position.set(-18, 25.2, -20);
    scene.add(hvacMesh);
    // Antenna with aviation warning strobe
    const antGeo = new THREE.CylinderGeometry(0.06, 0.06, 6, 8);
    const antMesh = new THREE.Mesh(antGeo, roofMat);
    antMesh.position.set(-18, 28, -20);
    scene.add(antMesh);
    const towerBeacon = new THREE.PointLight(0xef4444, 2.0, 30);
    towerBeacon.position.set(-18, 31, -20);
    scene.add(towerBeacon);

    // Building 2: Medical Command Hospital
    const hospGeo = new THREE.BoxGeometry(14, 16, 14);
    const hospMesh = new THREE.Mesh(hospGeo, buildingMatPristine);
    hospMesh.position.set(14, 8, 18);
    hospMesh.castShadow = true;
    hospMesh.receiveShadow = true;
    scene.add(hospMesh);
    // Rooftop Helipad with yellow "H" circle
    const helipadRoofGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.2, 32);
    const helipadRoofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const helipadRoof = new THREE.Mesh(helipadRoofGeo, helipadRoofMat);
    helipadRoof.position.set(14, 16.1, 18);
    scene.add(helipadRoof);

    // Building 3: Multi-Story Office Complex
    const officeGeo = new THREE.BoxGeometry(14, 18, 14);
    const officeMesh = new THREE.Mesh(officeGeo, buildingMatPristine);
    officeMesh.position.set(-18, 9, 20);
    officeMesh.castShadow = true;
    officeMesh.receiveShadow = true;
    scene.add(officeMesh);

    // Building 4: DISASTER LANDMARK – Partially Collapsed Residential Complex
    const collapseGroup = new THREE.Group();
    collapseGroup.position.set(8, 0, -14);

    // Tilted buckled core structure
    const collapsedCoreGeo = new THREE.BoxGeometry(12, 10, 12);
    const collapsedCore = new THREE.Mesh(collapsedCoreGeo, buildingMatDamaged);
    collapsedCore.position.set(0, 4.5, 0);
    collapsedCore.rotation.set(0.12, 0.08, -0.16); // natural structural tilt
    collapsedCore.castShadow = true;
    collapsedCore.receiveShadow = true;
    collapseGroup.add(collapsedCore);

    // Broken concrete floor slabs pancake stack
    for (let s = 0; s < 3; s++) {
      const slabGeo = new THREE.BoxGeometry(13, 0.5, 13);
      const slabMesh = new THREE.Mesh(slabGeo, rubbleMat);
      slabMesh.position.set((s - 1) * 0.8, 0.3 + s * 0.6, (s - 1) * 0.6);
      slabMesh.rotation.set((s - 1) * 0.06, 0.05, -(s - 1) * 0.08);
      slabMesh.castShadow = true;
      collapseGroup.add(slabMesh);
    }

    // Exposed structural steel rebar rods
    const rebarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.3 });
    for (let r = 0; r < 5; r++) {
      const rebarGeo = new THREE.CylinderGeometry(0.06, 0.06, 5 + Math.random() * 2, 6);
      const rebar = new THREE.Mesh(rebarGeo, rebarMat);
      rebar.position.set(4 + (r - 2) * 1.2, 5, 4 + (Math.random() - 0.5) * 2);
      rebar.rotation.set(0.3, Math.random() * 0.5, -0.4);
      collapseGroup.add(rebar);
    }

    // Scattered concrete rubble blocks & masonry chunks around the base
    for (let i = 0; i < 22; i++) {
      const rSize = 0.5 + Math.random() * 1.4;
      const rGeo = new THREE.DodecahedronGeometry(rSize, 0);
      const rMesh = new THREE.Mesh(rGeo, rubbleMat);
      const angle = Math.random() * Math.PI * 2;
      const dist = 7 + Math.random() * 7;
      rMesh.position.set(Math.cos(angle) * dist, rSize * 0.5, Math.sin(angle) * dist);
      rMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rMesh.castShadow = true;
      collapseGroup.add(rMesh);
    }
    scene.add(collapseGroup);

    // Building 5: DISASTER LANDMARK – Industrial Chemical Warehouse (Fire Zone)
    const warehouseGeo = new THREE.BoxGeometry(16, 7, 14);
    const warehouseMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // scorched black industrial walls
      roughness: 0.9,
      metalness: 0.2
    });
    const warehouse = new THREE.Mesh(warehouseGeo, warehouseMat);
    warehouse.position.set(-18, 3.5, 3);
    warehouse.castShadow = true;
    warehouse.receiveShadow = true;
    scene.add(warehouse);

    // 5. 3D VEGETATION (Natural Trees & Foliage across parks and sidewalks)
    const treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.4, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const treeFoliageColors = [0x15803d, 0x16a34a, 0x22c55e, 0x166534];

    const treePositions = [
      { x: -6, z: -10 }, { x: -4, z: -16 }, { x: 2, z: -8 }, { x: 4, z: -4 },
      { x: -6, z: 8 }, { x: -4, z: 14 }, { x: 2, z: 6 }, { x: 4, z: 12 },
      { x: -14, z: -6 }, { x: -12, z: -12 }, { x: 20, z: -8 }, { x: 22, z: -14 },
      { x: 22, z: 6 }, { x: 24, z: 12 }, { x: -26, z: -14 }, { x: -28, z: -8 },
      { x: 28, z: -20 }, { x: 30, z: -6 }, { x: 30, z: 8 }, { x: 28, z: 22 }
    ];

    treePositions.forEach(tp => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tp.x, 0, tp.z);

      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.y = 1.2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Layered organic foliage cones
      for (let l = 0; l < 3; l++) {
        const fRadius = 1.6 - l * 0.35;
        const fHeight = 2.0 - l * 0.3;
        const folGeo = new THREE.ConeGeometry(fRadius, fHeight, 7);
        const folMat = new THREE.MeshStandardMaterial({
          color: treeFoliageColors[l % treeFoliageColors.length],
          roughness: 0.8
        });
        const foliage = new THREE.Mesh(folGeo, folMat);
        foliage.position.y = 2.2 + l * 1.1;
        foliage.castShadow = true;
        treeGroup.add(foliage);
      }
      scene.add(treeGroup);
    });

    // 6. 3D EMERGENCY RESPONSE VEHICLES & TRIAGE BASE
    const emergencyStrobes: THREE.PointLight[] = [];

    // Red Fire Rescue Truck near the Industrial Fire zone
    const fireTruckGroup = new THREE.Group();
    fireTruckGroup.position.set(-8, 0, 2);
    fireTruckGroup.rotation.y = Math.PI / 2;

    const truckBodyGeo = new THREE.BoxGeometry(2.4, 1.8, 5.5);
    const truckBodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7, roughness: 0.3 });
    const truckBody = new THREE.Mesh(truckBodyGeo, truckBodyMat);
    truckBody.position.y = 1.1;
    truckBody.castShadow = true;
    fireTruckGroup.add(truckBody);

    // Chrome Ladder on roof
    const ladderGeo = new THREE.BoxGeometry(1.2, 0.15, 4.2);
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const ladder = new THREE.Mesh(ladderGeo, ladderMat);
    ladder.position.set(0, 2.1, 0);
    fireTruckGroup.add(ladder);

    // Flashing Red & Blue Emergency Lightbar
    const fireStrobeRed = new THREE.PointLight(0xef4444, 2.5, 14);
    fireStrobeRed.position.set(-0.6, 2.3, 1.5);
    fireTruckGroup.add(fireStrobeRed);
    emergencyStrobes.push(fireStrobeRed);

    const fireStrobeBlue = new THREE.PointLight(0x38bdf8, 2.5, 14);
    fireStrobeBlue.position.set(0.6, 2.3, 1.5);
    fireTruckGroup.add(fireStrobeBlue);
    emergencyStrobes.push(fireStrobeBlue);
    scene.add(fireTruckGroup);

    // White/Orange Rescue Ambulance near Safe Command Zone
    const ambGroup = new THREE.Group();
    ambGroup.position.set(4, 0, 14);
    ambGroup.rotation.y = -Math.PI / 4;

    const ambBodyGeo = new THREE.BoxGeometry(2.2, 1.7, 4.8);
    const ambBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const ambBody = new THREE.Mesh(ambBodyGeo, ambBodyMat);
    ambBody.position.y = 1.05;
    ambBody.castShadow = true;
    ambGroup.add(ambBody);

    const ambStrobe = new THREE.PointLight(0x38bdf8, 2.0, 12);
    ambStrobe.position.set(0, 2.1, 1.2);
    ambGroup.add(ambStrobe);
    emergencyStrobes.push(ambStrobe);
    scene.add(ambGroup);

    // Field Triage Shelter Tent (Orange/White canopy)
    const tentGroup = new THREE.Group();
    tentGroup.position.set(0, 0, 22);
    const tentGeo = new THREE.ConeGeometry(3.5, 2.8, 4);
    tentGeo.rotateY(Math.PI / 4);
    const tentMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.8 });
    const tent = new THREE.Mesh(tentGeo, tentMat);
    tent.position.y = 1.4;
    tent.castShadow = true;
    tentGroup.add(tent);
    scene.add(tentGroup);

    emergencyStrobesRef.current = emergencyStrobes;

    // 7. REALISTIC INCANDESCENT FIRE PARTICLES & BILLOWING SMOKE
    const fireCount = 180;
    const fireGeo = new THREE.BufferGeometry();
    const firePositions = new Float32Array(fireCount * 3);
    for (let i = 0; i < fireCount; i++) {
      firePositions[i * 3] = -18 + (Math.random() - 0.5) * 8;
      firePositions[i * 3 + 1] = Math.random() * 8;
      firePositions[i * 3 + 2] = 3 + (Math.random() - 0.5) * 8;
    }
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePositions, 3));

    const fireMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 1.4,
      map: generateGlowTexture() || undefined,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const firePoints = new THREE.Points(fireGeo, fireMat);
    scene.add(firePoints);
    fireParticlesRef.current = firePoints;

    const fireLight = new THREE.PointLight(0xf97316, 4.0, 35);
    fireLight.position.set(-18, 5, 3);
    scene.add(fireLight);

    // Billowing Gray Smoke Column
    const smokeCount = 120;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = -18 + (Math.random() - 0.5) * 6;
      smokePositions[i * 3 + 1] = 4 + Math.random() * 20;
      smokePositions[i * 3 + 2] = 3 + (Math.random() - 0.5) * 6;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));

    const smokeMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 4.5,
      map: generateSmokeTexture() || undefined,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokePoints);
    smokeParticlesRef.current = smokePoints;

    // Rain Particle System (for Storm Atmosphere)
    const rainCount = 1500;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 160;
      rainPositions[i * 3 + 1] = Math.random() * 60;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.6,
      transparent: true,
      opacity: 0.0 // enabled in storm mode
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    scene.add(rainPoints);
    rainParticlesRef.current = rainPoints;

    // 8. 3D LIDAR POINT CLOUD
    const lidarCount = 4500;
    const lidarGeo = new THREE.BufferGeometry();
    const lidarPositions = new Float32Array(lidarCount * 3);
    const lidarColors = new Float32Array(lidarCount * 3);

    for (let i = 0; i < lidarCount; i++) {
      const lx = (Math.random() - 0.5) * 110;
      const lz = (Math.random() - 0.5) * 110;
      let ly = 0.2;
      if (Math.abs(lx + 18) < 8 && Math.abs(lz + 20) < 8) ly = Math.random() * 24;
      else if (Math.abs(lx - 8) < 8 && Math.abs(lz + 14) < 8) ly = Math.random() * 12;

      lidarPositions[i * 3] = lx;
      lidarPositions[i * 3 + 1] = ly;
      lidarPositions[i * 3 + 2] = lz;

      const normH = Math.min(ly / 24, 1);
      lidarColors[i * 3] = normH * 0.9;
      lidarColors[i * 3 + 1] = 0.8 - normH * 0.3;
      lidarColors[i * 3 + 2] = 1.0 - normH * 0.8;
    }
    lidarGeo.setAttribute('position', new THREE.BufferAttribute(lidarPositions, 3));
    lidarGeo.setAttribute('color', new THREE.BufferAttribute(lidarColors, 3));

    const lidarMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.0
    });
    const lidarMesh = new THREE.Points(lidarGeo, lidarMat);
    scene.add(lidarMesh);
    lidarPointsRef.current = lidarMesh;

    // 9. INTERACTIVE 3D DISASTER HAZARDS (Fire, Collapse, Flood, Landslide)
    const hazardGroupMap = new Map<string, THREE.Group>();

    hazards.forEach(h => {
      const hGroup = new THREE.Group();
      hGroup.position.set(h.coordinates3D.x, h.coordinates3D.y, h.coordinates3D.z);
      (hGroup as any).userData = { type: 'hazard', id: h.id, data: h };

      const hColor = h.type === 'Fire'
        ? 0xf97316
        : h.type === 'Flood'
        ? 0x06b6d4
        : h.type === 'Structural Collapse'
        ? 0xf43f5e
        : 0xeab308;

      // Hazard Warning Octahedron Badge
      const hBadgeGeo = new THREE.OctahedronGeometry(0.85, 0);
      const hBadgeMat = new THREE.MeshStandardMaterial({
        color: hColor,
        emissive: hColor,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.8
      });
      const badge = new THREE.Mesh(hBadgeGeo, hBadgeMat);
      badge.position.y = 2.0;
      hGroup.add(badge);

      // Vertical Caution Pillar
      const hPillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 18, 6);
      const hPillarMat = new THREE.MeshBasicMaterial({
        color: hColor,
        transparent: true,
        opacity: 0.35
      });
      const pillar = new THREE.Mesh(hPillarGeo, hPillarMat);
      pillar.position.y = 9;
      hGroup.add(pillar);

      // Warning Ground Perimeter Ring
      const hRingGeo = new THREE.RingGeometry(1.8, 2.2, 32);
      hRingGeo.rotateX(-Math.PI / 2);
      const hRingMat = new THREE.MeshBasicMaterial({
        color: hColor,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide
      });
      const hRing = new THREE.Mesh(hRingGeo, hRingMat);
      hRing.position.y = 0.2;
      hGroup.add(hRing);

      scene.add(hGroup);
      hazardGroupMap.set(h.id, hGroup);
    });
    hazardMarkersRef.current = hazardGroupMap;

    // 10. REALISTIC 3D SURVIVORS (Human Figure Silhouette + Beacon)
    const survivorGroupMap = new Map<string, THREE.Group>();
    const pulseRings: THREE.Mesh[] = [];

    survivors.forEach(s => {
      const sGroup = new THREE.Group();
      sGroup.position.set(s.coordinates3D.x, s.coordinates3D.y, s.coordinates3D.z);
      (sGroup as any).userData = { type: 'survivor', id: s.id, data: s };

      const markerColor = s.status === 'Rescued' 
        ? 0x10b981 
        : s.riskLevel === 'Critical' 
        ? 0xf43f5e 
        : 0xf59e0b;

      // Realistic 3D Human Figure Silhouette (torso + head)
      const humanGroup = new THREE.Group();
      const torsoGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.8, 8);
      const humanMat = new THREE.MeshStandardMaterial({
        color: markerColor,
        emissive: markerColor,
        emissiveIntensity: 0.4,
        roughness: 0.4
      });
      const torso = new THREE.Mesh(torsoGeo, humanMat);
      torso.position.y = 0.5;
      humanGroup.add(torso);

      const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const head = new THREE.Mesh(headGeo, humanMat);
      head.position.y = 1.05;
      humanGroup.add(head);

      sGroup.add(humanGroup);

      // Floating Holographic Beacon Diamond
      const crystalGeo = new THREE.OctahedronGeometry(0.7, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: markerColor,
        emissive: markerColor,
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.2
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 2.4;
      sGroup.add(crystal);

      // Vertical rescue laser pillar reaching high into the sky
      const laserGeo = new THREE.CylinderGeometry(0.05, 0.05, 30, 6);
      const laserMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        transparent: true,
        opacity: 0.5
      });
      const laser = new THREE.Mesh(laserGeo, laserMat);
      laser.position.y = 15;
      sGroup.add(laser);

      // Ground pulsing wave ring
      const ringGeo = new THREE.RingGeometry(1.0, 1.4, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.15;
      sGroup.add(ring);
      pulseRings.push(ring);

      scene.add(sGroup);
      survivorGroupMap.set(s.id, sGroup);
    });
    survivorMarkersRef.current = survivorGroupMap;
    pulseRingsRef.current = pulseRings;

    // 11. ENTERPRISE AUTONOMOUS DRONES WITH ROTOR BLUR & LIGHTING
    const rotors: THREE.Mesh[] = [];
    const blurDiscs: THREE.Mesh[] = [];
    const strobes: THREE.PointLight[] = [];
    const droneGroups = new Map<string, THREE.Group>();
    const droneLabels = new Map<string, THREE.Sprite>();
    const searchlights = new Map<string, THREE.SpotLight>();
    const radarRings = new Map<string, THREE.Mesh>();
    const trajLines = new Map<string, THREE.Line>();

    drones.forEach((d, idx) => {
      const isMasterDrone = d.id === 'd4' || d.type === 'relay' || d.name.toLowerCase().includes('master');
      const droneGroup = new THREE.Group();
      droneGroup.position.set(d.position3D.x, d.position3D.y, d.position3D.z);
      (droneGroup as any).userData = { type: 'drone', id: d.id, data: d };

      // Sleek Carbon Fuselage Body
      const bodyGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: isMasterDrone ? 0x130e20 : 0x090d16,
        metalness: 0.9,
        roughness: 0.25
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      droneGroup.add(body);

      // Top Dome
      const domeGeo = new THREE.CylinderGeometry(0.5, 0.7, 0.3, 8);
      const domeMat = new THREE.MeshStandardMaterial({
        color: isMasterDrone ? 0xa855f7 : 0x06b6d4,
        emissive: isMasterDrone ? 0x7e22ce : 0x0891b2,
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.2
      });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = 0.3;
      droneGroup.add(dome);

      // If Master: Add High-Gain Satellite Parabolic Dish Antenna & Beacon
      if (isMasterDrone) {
        // Satellite Parabolic Dish
        const dishGeo = new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const dishMat = new THREE.MeshStandardMaterial({
          color: 0xf1f5f9,
          metalness: 0.9,
          roughness: 0.15
        });
        const dish = new THREE.Mesh(dishGeo, dishMat);
        dish.rotation.x = Math.PI * 0.7;
        dish.position.set(0, 0.75, 0);
        droneGroup.add(dish);

        // Antenna Feed Horn
        const hornGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
        const hornMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.95
        });
        const horn = new THREE.Mesh(hornGeo, hornMat);
        horn.position.set(0, 1.05, 0);
        droneGroup.add(horn);

        // Golden Command Beacon Light
        const beaconLight = new THREE.PointLight(0xf59e0b, 2.5, 12);
        beaconLight.position.set(0, 1.4, 0);
        droneGroup.add(beaconLight);
      }

      // 4 Carbon Booms & Motors
      const armAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
      armAngles.forEach((angle, armIdx) => {
        const armGroup = new THREE.Group();
        armGroup.rotation.y = angle;

        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.1, 1.8),
          new THREE.MeshStandardMaterial({ color: isMasterDrone ? 0x2e1065 : 0x1e293b, metalness: 0.9 })
        );
        arm.position.z = 0.9;
        armGroup.add(arm);

        // Motor Nacelle
        const motor = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 0.25, 8),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.95 })
        );
        motor.position.set(0, 0.15, 1.7);
        armGroup.add(motor);

        // Propeller Rotor Blade
        const rotor = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 0.02, 0.12),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
        );
        rotor.position.set(0, 0.3, 1.7);
        armGroup.add(rotor);
        rotors.push(rotor);

        // Semi-transparent spinning propeller blur disc
        const blurGeo = new THREE.CircleGeometry(0.7, 16);
        blurGeo.rotateX(-Math.PI / 2);
        const blurMat = new THREE.MeshBasicMaterial({
          color: isMasterDrone ? 0xd8b4fe : 0x94a3b8,
          transparent: true,
          opacity: 0.28,
          side: THREE.DoubleSide
        });
        const blurDisc = new THREE.Mesh(blurGeo, blurMat);
        blurDisc.position.set(0, 0.32, 1.7);
        armGroup.add(blurDisc);
        blurDiscs.push(blurDisc);

        // Navigation Strobes (Port: Red, Starboard: Green)
        if (armIdx === 0 || armIdx === 1) {
          const isLeft = armIdx === 1;
          const strobeColor = isLeft ? 0xef4444 : (isMasterDrone ? 0xf59e0b : 0x10b981);
          const navLed = new THREE.PointLight(strobeColor, 1.2, 6);
          navLed.position.set(0, -0.1, 1.7);
          armGroup.add(navLed);
          strobes.push(navLed);
        }

        droneGroup.add(armGroup);
      });

      // Volumetric Rescue Searchlight
      const spotlight = new THREE.SpotLight(0xffffff, 4.5, 45, Math.PI / 6, 0.45, 1);
      spotlight.position.set(0, -0.4, 0);
      const targetObj = new THREE.Object3D();
      targetObj.position.set(0, -20, 0);
      droneGroup.add(targetObj);
      spotlight.target = targetObj;
      droneGroup.add(spotlight);
      searchlights.set(d.id, spotlight);

      // Ground Radar Sweep Ring directly under drone
      const radarGeo = new THREE.RingGeometry(0.5, isMasterDrone ? 7.5 : 4.5, 32);
      radarGeo.rotateX(-Math.PI / 2);
      const radarMat = new THREE.MeshBasicMaterial({
        color: isMasterDrone ? 0xf59e0b : 0x06b6d4,
        transparent: true,
        opacity: isMasterDrone ? 0.45 : 0.35,
        side: THREE.DoubleSide
      });
      const radarRing = new THREE.Mesh(radarGeo, radarMat);
      radarRing.position.set(0, -d.position3D.y + 0.2, 0);
      droneGroup.add(radarRing);
      radarRings.set(d.id, radarRing);

      // 3D Billboard Sprite Label Floating Above Drone
      const labelTexture = createDroneLabelTexture(d, d.id === selectedDroneId);
      const labelMat = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.scale.set(isMasterDrone ? 8.4 : 7.0, isMasterDrone ? 2.6 : 2.2, 1.0);
      labelSprite.position.set(0, isMasterDrone ? 4.2 : 3.2, 0);
      (labelSprite as any).userData = { type: 'drone', id: d.id, data: d };
      droneGroup.add(labelSprite);
      droneLabels.set(d.id, labelSprite);

      // Flight Trajectory Line
      const trajPoints = d.flightTrajectory.map(pt => new THREE.Vector3(pt.x, pt.y, pt.z));
      trajPoints.push(new THREE.Vector3(d.position3D.x, d.position3D.y, d.position3D.z));
      const lineGeo = new THREE.BufferGeometry().setFromPoints(trajPoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: d.id === selectedDroneId ? 0x38bdf8 : (isMasterDrone ? 0xa855f7 : 0x475569),
        transparent: true,
        opacity: 0.6
      });
      const trajLine = new THREE.Line(lineGeo, lineMat);
      scene.add(trajLine);
      trajLines.set(d.id, trajLine);

      scene.add(droneGroup);
      droneGroups.set(d.id, droneGroup);
    });

    // 3D WIRELESS RADIO MESH LINK BEAMS (Connecting Master at the top down to Slave 1, 2, 3)
    const masterDrone = drones.find(d => d.id === 'd4' || d.type === 'relay' || d.name.toLowerCase().includes('master')) || drones[3];
    const slaveDrones = drones.filter(d => d.id !== masterDrone?.id);
    const meshLines: THREE.Line[] = [];

    if (masterDrone) {
      slaveDrones.forEach(slave => {
        const pts = [
          new THREE.Vector3(masterDrone.position3D.x, masterDrone.position3D.y - 0.5, masterDrone.position3D.z),
          new THREE.Vector3(slave.position3D.x, slave.position3D.y + 0.5, slave.position3D.z)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineDashedMaterial({
          color: 0x38bdf8,
          dashSize: 2.0,
          gapSize: 1.0,
          transparent: true,
          opacity: 0.65
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        scene.add(line);
        meshLines.push(line);
      });
    }
    meshLinkLinesRef.current = meshLines;

    rotorsRef.current = rotors;
    blurDiscsRef.current = blurDiscs;
    strobesRef.current = strobes;
    dronesGroupRef.current = droneGroups;
    droneLabelsRef.current = droneLabels;
    searchlightsRef.current = searchlights;
    radarRingsRef.current = radarRings;
    trajectoryLinesRef.current = trajLines;

    // 9. WINDOW RESIZE OBSERVER
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. MOUSE & TOUCH ORBIT INTERACTION WITH INERTIAL DAMPING
    const domElem = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetSphericalRef.current.theta -= deltaX * 0.007;
      targetSphericalRef.current.phi = Math.max(
        0.18,
        Math.min(Math.PI / 2 - 0.05, targetSphericalRef.current.phi - deltaY * 0.007)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetSphericalRef.current.radius = Math.max(
        18,
        Math.min(140, targetSphericalRef.current.radius + e.deltaY * 0.07)
      );
    };

    // Touch Support for Mobile / Tablets
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDraggingRef.current = false;
        touchStartDistRef.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

        targetSphericalRef.current.theta -= deltaX * 0.007;
        targetSphericalRef.current.phi = Math.max(
          0.18,
          Math.min(Math.PI / 2 - 0.05, targetSphericalRef.current.phi - deltaY * 0.007)
        );

        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = touchStartDistRef.current - currentDist;
        targetSphericalRef.current.radius = Math.max(
          18,
          Math.min(140, targetSphericalRef.current.radius + diff * 0.15)
        );
        touchStartDistRef.current = currentDist;
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // Raycast Click Selection
    const onClick = (e: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseCoordsRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoordsRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseCoordsRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && !(parent as any).userData?.type) {
          parent = parent.parent;
        }

        if (parent && (parent as any).userData?.type) {
          const { type, id, data } = (parent as any).userData;
          setInspectedEntity({ type, id, data });

          if (type === 'drone') {
            onSelectDrone(id);
            // Smoothly glide camera target to drone
            targetLookAtRef.current.set(data.position3D.x, data.position3D.y, data.position3D.z);
          } else if (type === 'survivor') {
            onSelectSurvivor?.(data);
            targetLookAtRef.current.set(data.coordinates3D.x, data.coordinates3D.y + 2, data.coordinates3D.z);
          } else if (type === 'hazard') {
            onSelectHazard?.(data);
            targetLookAtRef.current.set(data.coordinates3D.x, data.coordinates3D.y + 2, data.coordinates3D.z);
          }
          break;
        }
      }
    };

    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('click', onClick);
    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 11. 60FPS PERFECT ANIMATION LOOP (Physics & Inertia)
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Spin Rotor Blades & Propeller Discs
      rotorsRef.current.forEach(rotor => {
        rotor.rotation.y += delta * 42;
      });
      blurDiscsRef.current.forEach(disc => {
        disc.rotation.z += delta * 30;
      });

      // Animate Realistic Undulating Water Surface
      if (waterGeometryRef.current && waterOriginalVerticesRef.current) {
        const pos = waterGeometryRef.current.attributes.position;
        const orig = waterOriginalVerticesRef.current;
        for (let i = 0; i < pos.count; i++) {
          const ox = orig[i * 3];
          const oz = orig[i * 3 + 2];
          const wave =
            Math.sin(ox * 0.25 + time * 2.0) * Math.cos(oz * 0.25 + time * 1.5) * 0.28 +
            Math.sin(ox * 0.1 + time * 0.8) * 0.15;
          pos.setY(i, wave);
        }
        pos.needsUpdate = true;
      }

      // Animate Fire Embers
      if (fireParticlesRef.current) {
        const firePos = fireParticlesRef.current.geometry.attributes.position;
        for (let i = 0; i < fireCount; i++) {
          let py = firePos.getY(i) + delta * 5.0;
          if (py > 13) py = 1.0 + Math.random() * 2;
          firePos.setY(i, py);
        }
        firePos.needsUpdate = true;
      }

      // Animate Billowing Smoke Column
      if (smokeParticlesRef.current) {
        const smokePos = smokeParticlesRef.current.geometry.attributes.position;
        const count = smokePos.count;
        for (let i = 0; i < count; i++) {
          let py = smokePos.getY(i) + delta * 2.2;
          let px = smokePos.getX(i) + Math.sin(time * 0.8 + i) * 0.035;
          if (py > 28) {
            py = 3.5 + Math.random() * 2;
            px = -18 + (Math.random() - 0.5) * 5;
          }
          smokePos.setY(i, py);
          smokePos.setX(i, px);
        }
        smokePos.needsUpdate = true;
      }

      // Animate Rain Particles in Storm Mode
      if (rainParticlesRef.current && rainParticlesRef.current.visible) {
        const rainPos = rainParticlesRef.current.geometry.attributes.position;
        const count = rainPos.count;
        for (let i = 0; i < count; i++) {
          let py = rainPos.getY(i) - delta * 60;
          if (py < 0) py = 55 + Math.random() * 8;
          rainPos.setY(i, py);
        }
        rainPos.needsUpdate = true;
      }

      // Alternating Emergency Vehicle Strobes (Fire Truck & Ambulance)
      if (emergencyStrobesRef.current.length > 0) {
        const flash = Math.sin(time * 14) > 0;
        emergencyStrobesRef.current.forEach((strobe, idx) => {
          strobe.intensity = ((idx % 2 === 0 ? flash : !flash) ? 2.8 : 0.1);
        });
      }

      // Animate Survivor Concentric Sonar Wave Rings
      pulseRingsRef.current.forEach(ring => {
        const scale = 1 + (time * 1.5) % 2.5;
        ring.scale.set(scale, scale, scale);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.75 - (scale - 1) * 0.35);
      });

      // Animate Master-to-Slave Wireless Mesh Link Beams
      meshLinkLinesRef.current.forEach((line, idx) => {
        const mat = line.material as THREE.LineDashedMaterial;
        mat.opacity = 0.45 + Math.sin(time * 3 + idx * 1.2) * 0.25;
      });

      // Smooth Auto-Orbit
      if (isAutoRotating && !isDraggingRef.current && cameraAngle === 'orbit') {
        targetSphericalRef.current.theta += delta * 0.1;
      }

      // Smooth Damped Camera Physics (Lerp Factor 0.08)
      const lerpFactor = 0.08;
      currentSphericalRef.current.theta +=
        (targetSphericalRef.current.theta - currentSphericalRef.current.theta) * lerpFactor;
      currentSphericalRef.current.phi +=
        (targetSphericalRef.current.phi - currentSphericalRef.current.phi) * lerpFactor;
      currentSphericalRef.current.radius +=
        (targetSphericalRef.current.radius - currentSphericalRef.current.radius) * lerpFactor;

      // Smooth LookAt Lerp
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.06);

      // Camera Angle Configurations
      if (cameraRef.current) {
        if (cameraAngle === 'orbit') {
          const { radius, theta, phi } = currentSphericalRef.current;
          cameraRef.current.position.x =
            currentLookAtRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
          cameraRef.current.position.y = currentLookAtRef.current.y + radius * Math.cos(phi);
          cameraRef.current.position.z =
            currentLookAtRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
          cameraRef.current.lookAt(currentLookAtRef.current);
        } else if (cameraAngle === 'chase' && currentDrone) {
          const dPos = currentDrone.position3D;
          const targetCam = new THREE.Vector3(dPos.x - 9, dPos.y + 6, dPos.z + 11);
          cameraRef.current.position.lerp(targetCam, 0.08);
          cameraRef.current.lookAt(dPos.x, dPos.y, dPos.z);
        } else if (cameraAngle === 'cockpit' && currentDrone) {
          const dPos = currentDrone.position3D;
          cameraRef.current.position.set(dPos.x, dPos.y - 0.2, dPos.z + 0.4);
          cameraRef.current.lookAt(dPos.x, dPos.y - 12, dPos.z + 20);
        } else if (cameraAngle === 'top') {
          cameraRef.current.position.lerp(new THREE.Vector3(0, 110, 0), 0.08);
          cameraRef.current.lookAt(0, 0, 0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('click', onClick);
      domElem.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      renderer.dispose();
      scene.clear();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  // DYNAMIC DRONE FLIGHT TELEMETRY (Natural Banking & Hovering)
  useEffect(() => {
    drones.forEach((d, idx) => {
      const group = dronesGroupRef.current.get(d.id);
      if (group) {
        // Natural hovering bobbing motion
        const hoverOffset = Math.sin(Date.now() * 0.003 + idx * 1.5) * 0.25;
        group.position.set(d.position3D.x, d.position3D.y + hoverOffset, d.position3D.z);
        group.rotation.y = (-d.heading * Math.PI) / 180;

        // Subtle aerodynamic roll and pitch during flight
        group.rotation.z = Math.sin(Date.now() * 0.004) * 0.05;
        group.rotation.x = 0.06;

        // Update ground radar ring position
        const ring = radarRingsRef.current.get(d.id);
        if (ring) {
          ring.position.y = -d.position3D.y + 0.2;
        }
      }

      // Update 3D billboard sprite label texture when drone or selection changes
      const sprite = droneLabelsRef.current.get(d.id);
      if (sprite) {
        sprite.material.map?.dispose();
        sprite.material.map = createDroneLabelTexture(d, d.id === selectedDroneId);
        sprite.material.needsUpdate = true;
      }

      // Update trajectory lines
      const line = trajectoryLinesRef.current.get(d.id);
      if (line) {
        const pts = d.flightTrajectory.map(pt => new THREE.Vector3(pt.x, pt.y, pt.z));
        pts.push(new THREE.Vector3(d.position3D.x, d.position3D.y, d.position3D.z));
        line.geometry.setFromPoints(pts);
      }
    });

    // Update Master-to-Slave 3D wireless link beam lines
    const masterDrone = drones.find(d => d.id === 'd4' || d.type === 'relay' || d.name.toLowerCase().includes('master')) || drones[3];
    const slaveDrones = drones.filter(d => d.id !== masterDrone?.id);
    const masterGroup = masterDrone ? dronesGroupRef.current.get(masterDrone.id) : null;

    if (masterGroup && meshLinkLinesRef.current.length > 0) {
      slaveDrones.forEach((slave, idx) => {
        const line = meshLinkLinesRef.current[idx];
        const slaveGroup = dronesGroupRef.current.get(slave.id);
        if (line && slaveGroup) {
          const pos = line.geometry.attributes.position;
          pos.setXYZ(0, masterGroup.position.x, masterGroup.position.y - 0.5, masterGroup.position.z);
          pos.setXYZ(1, slaveGroup.position.x, slaveGroup.position.y + 0.5, slaveGroup.position.z);
          pos.needsUpdate = true;
          line.computeLineDistances();
        }
      });
    }
  }, [drones, selectedDroneId]);

  // TOGGLE ATMOSPHERE LIGHTING (Day / Golden Hour / Night / Storm)
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !ambientLightRef.current) return;

    if (atmosphere === 'day') {
      sceneRef.current.background = new THREE.Color(0xa0c4e2);
      sceneRef.current.fog = new THREE.FogExp2(0xa0c4e2, 0.0035);
      dirLightRef.current.color = new THREE.Color(0xfffbeb);
      dirLightRef.current.intensity = 3.2;
      ambientLightRef.current.color = new THREE.Color(0xffffff);
      ambientLightRef.current.intensity = 0.95;
      if (hemiLightRef.current) {
        hemiLightRef.current.color = new THREE.Color(0xbae6fd);
        hemiLightRef.current.groundColor = new THREE.Color(0x64748b);
        hemiLightRef.current.intensity = 1.8;
      }
      if (fillLightRef.current) fillLightRef.current.intensity = 0.8;
      if (rainParticlesRef.current) {
        rainParticlesRef.current.visible = false;
        (rainParticlesRef.current.material as THREE.PointsMaterial).opacity = 0;
      }
      if (rendererRef.current) rendererRef.current.toneMappingExposure = 1.25;
    } else if (atmosphere === 'golden') {
      sceneRef.current.background = new THREE.Color(0xfdba74);
      sceneRef.current.fog = new THREE.FogExp2(0xfdba74, 0.004);
      dirLightRef.current.color = new THREE.Color(0xffedd5);
      dirLightRef.current.intensity = 2.8;
      ambientLightRef.current.color = new THREE.Color(0xfde68a);
      ambientLightRef.current.intensity = 0.85;
      if (hemiLightRef.current) {
        hemiLightRef.current.color = new THREE.Color(0xfed7aa);
        hemiLightRef.current.groundColor = new THREE.Color(0x78350f);
        hemiLightRef.current.intensity = 1.5;
      }
      if (fillLightRef.current) fillLightRef.current.intensity = 0.6;
      if (rainParticlesRef.current) {
        rainParticlesRef.current.visible = false;
        (rainParticlesRef.current.material as THREE.PointsMaterial).opacity = 0;
      }
      if (rendererRef.current) rendererRef.current.toneMappingExposure = 1.15;
    } else if (atmosphere === 'night') {
      sceneRef.current.background = new THREE.Color(0x0a1120);
      sceneRef.current.fog = new THREE.FogExp2(0x0a1120, 0.007);
      dirLightRef.current.color = new THREE.Color(0x38bdf8);
      dirLightRef.current.intensity = 1.0;
      ambientLightRef.current.color = new THREE.Color(0x1e293b);
      ambientLightRef.current.intensity = 0.65;
      if (hemiLightRef.current) {
        hemiLightRef.current.color = new THREE.Color(0x1e3a8a);
        hemiLightRef.current.groundColor = new THREE.Color(0x030712);
        hemiLightRef.current.intensity = 0.8;
      }
      if (fillLightRef.current) fillLightRef.current.intensity = 0.3;
      if (rainParticlesRef.current) {
        rainParticlesRef.current.visible = false;
        (rainParticlesRef.current.material as THREE.PointsMaterial).opacity = 0;
      }
      if (rendererRef.current) rendererRef.current.toneMappingExposure = 1.05;
    } else if (atmosphere === 'storm') {
      sceneRef.current.background = new THREE.Color(0x334155);
      sceneRef.current.fog = new THREE.FogExp2(0x334155, 0.008);
      dirLightRef.current.color = new THREE.Color(0x94a3b8);
      dirLightRef.current.intensity = 1.6;
      ambientLightRef.current.color = new THREE.Color(0x475569);
      ambientLightRef.current.intensity = 0.95;
      if (hemiLightRef.current) {
        hemiLightRef.current.color = new THREE.Color(0x64748b);
        hemiLightRef.current.groundColor = new THREE.Color(0x1e293b);
        hemiLightRef.current.intensity = 1.2;
      }
      if (fillLightRef.current) fillLightRef.current.intensity = 0.5;
      if (rainParticlesRef.current) {
        rainParticlesRef.current.visible = true;
        (rainParticlesRef.current.material as THREE.PointsMaterial).opacity = 0.75;
      }
      if (rendererRef.current) rendererRef.current.toneMappingExposure = 1.1;
    }
  }, [atmosphere]);

  // TOGGLE SENSOR VIEW MODES (Twin / Thermal / LiDAR / NVG)
  useEffect(() => {
    if (!terrainMeshRef.current || !waterMeshRef.current || !lidarPointsRef.current) return;

    if (viewMode === 'twin') {
      terrainMeshRef.current.visible = true;
      waterMeshRef.current.visible = true;
      (lidarPointsRef.current.material as THREE.PointsMaterial).opacity = 0.0;
    } else if (viewMode === 'thermal') {
      terrainMeshRef.current.visible = true;
      waterMeshRef.current.visible = true;
      (lidarPointsRef.current.material as THREE.PointsMaterial).opacity = 0.2;
    } else if (viewMode === 'lidar') {
      terrainMeshRef.current.visible = false;
      waterMeshRef.current.visible = false;
      (lidarPointsRef.current.material as THREE.PointsMaterial).opacity = 0.95;
    } else if (viewMode === 'nvg') {
      terrainMeshRef.current.visible = true;
      waterMeshRef.current.visible = true;
      (lidarPointsRef.current.material as THREE.PointsMaterial).opacity = 0.0;
    }
  }, [viewMode]);

  // TOGGLE SEARCHLIGHT BEAMS
  useEffect(() => {
    searchlightsRef.current.forEach(spot => {
      spot.visible = showSearchlight;
    });
  }, [showSearchlight]);

  return (
    <div
      id="disaster-3d-digital-twin-container"
      className="relative w-full h-full min-h-[520px] bg-slate-950 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl select-none"
    >
      {/* 1. TOP MINIMALIST FLOATING CONTROLS (NO MECH, SLEEK CAPSULE) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Active Drone Quick Switcher */}
        <div className="pointer-events-auto flex items-center bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 shadow-xl text-xs gap-1.5">
          <div className="flex items-center gap-1.5 pr-2 border-r border-white/10 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-white">3D Live</span>
          </div>

          <div className="flex items-center gap-1">
            {drones.map(d => {
              const isMaster = d.id === 'd4' || d.type === 'relay' || d.name.toLowerCase().includes('master');
              const isSelected = d.id === selectedDroneId;
              const displayName = isMaster ? '★ Master' : d.name;

              return (
                <button
                  key={d.id}
                  onClick={() => {
                    onSelectDrone(d.id);
                    targetLookAtRef.current.set(d.position3D.x, d.position3D.y, d.position3D.z);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? isMaster
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : isMaster
                      ? 'text-amber-300 hover:text-white hover:bg-amber-500/20 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Clean View Mode, Camera & Weather Controls */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-xl text-xs">
          {/* View Modes */}
          <div className="flex items-center bg-slate-950/60 rounded-full p-0.5 border border-white/[0.06]">
            {(['twin', 'thermal', 'lidar', 'nvg'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'twin' ? 'Realistic' : mode}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Camera Angles */}
          <div className="flex items-center bg-slate-950/60 rounded-full p-0.5 border border-white/[0.06]">
            {(['orbit', 'chase', 'cockpit', 'top'] as const).map(angle => (
              <button
                key={angle}
                onClick={() => setCameraAngle(angle)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize transition-all cursor-pointer ${
                  cameraAngle === angle
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {angle}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Atmosphere / Time of Day */}
          <div className="flex items-center gap-1 px-1">
            <button
              onClick={() => setAtmosphere('day')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                atmosphere === 'day' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Daylight Operations (Clear Sky)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAtmosphere('golden')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                atmosphere === 'golden' ? 'bg-orange-500/20 text-orange-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Golden Hour Sunset"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAtmosphere('night')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                atmosphere === 'night' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Tactical Night Ops"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAtmosphere('storm')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                atmosphere === 'storm' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Storm & Rain Atmosphere"
            >
              <CloudRain className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Searchlight Toggle */}
          <button
            onClick={() => setShowSearchlight(!showSearchlight)}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              showSearchlight ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Searchlight"
          >
            <Zap className="w-3.5 h-3.5" />
          </button>

          {/* Auto-Rotation */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isAutoRotating ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle 360° Cinematic Orbit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </button>

          {/* Fullscreen */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
              title={isExpanded ? 'Minimize' : 'Expand 3D Map'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. THREE.JS VIEWPORT */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3. CLICK INSPECTOR MODAL POPUP (IF CLICKED ENTITY) */}
      {inspectedEntity && (
        <div className="absolute top-16 left-4 z-30 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl max-w-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              {inspectedEntity.type === 'drone' ? (
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
              ) : inspectedEntity.type === 'survivor' ? (
                <Users className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              {inspectedEntity.type === 'drone'
                ? inspectedEntity.data.name
                : inspectedEntity.type === 'survivor'
                ? `Survivor ${inspectedEntity.data.id}`
                : `Hazard: ${inspectedEntity.data.type}`}
            </span>
            <button
              onClick={() => setInspectedEntity(null)}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {inspectedEntity.type === 'drone' ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Role:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  inspectedEntity.data.id === 'd4' || inspectedEntity.data.type === 'relay' || inspectedEntity.data.name.toLowerCase().includes('master')
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {inspectedEntity.data.id === 'd4' || inspectedEntity.data.type === 'relay' || inspectedEntity.data.name.toLowerCase().includes('master')
                    ? '★ Swarm Master (Top Relay)'
                    : 'Tactical Autonomous Scout'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Callsign:</span>
                <span className="text-white font-medium">{inspectedEntity.data.callsign}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Altitude:</span>
                <span className="text-cyan-300 font-medium">{inspectedEntity.data.altitude} m AGL</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Speed:</span>
                <span className="text-cyan-300 font-medium">{inspectedEntity.data.speed} m/s</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Battery:</span>
                <span className="text-emerald-400 font-medium">{Math.round(inspectedEntity.data.battery)}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-white font-medium capitalize">{inspectedEntity.data.status}</span>
              </div>
            </div>
          ) : inspectedEntity.type === 'survivor' ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Risk Level:</span>
                <span className={`font-semibold ${inspectedEntity.data.riskLevel === 'Critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {inspectedEntity.data.riskLevel}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-white font-medium">{inspectedEntity.data.status}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Confidence:</span>
                <span className="text-emerald-400 font-medium">{inspectedEntity.data.confidence}%</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-white/[0.06]">
                {inspectedEntity.data.notes}
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Severity:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                    inspectedEntity.data.severity === 'Extreme'
                      ? 'bg-rose-500/20 text-rose-300'
                      : inspectedEntity.data.severity === 'High'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {inspectedEntity.data.severity}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-white font-medium">{inspectedEntity.data.status}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Coordinates:</span>
                <span className="text-cyan-300 font-mono text-[11px]">
                  {inspectedEntity.data.coordinates3D.x.toFixed(1)}, {inspectedEntity.data.coordinates3D.z.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-white/[0.06]">
                {inspectedEntity.data.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. BOTTOM FLOATING HUD (SLEEK AVIONICS & MINIMAL LEGEND) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
        {/* Drone Telemetry Pill */}
        <div className="pointer-events-auto bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2.5 pr-3 border-r border-white/10">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Active Unit</span>
              <span className="font-semibold text-white text-sm">{currentDrone.callsign}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">ALT</span>
              <span className="text-cyan-300 font-bold">{currentDrone.altitude}m</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">SPEED</span>
              <span className="text-cyan-300 font-bold">{currentDrone.speed} m/s</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">HEADING</span>
              <span className="text-white font-bold">{currentDrone.heading}°</span>
            </div>
            <div className="min-w-[60px]">
              <span className="text-[10px] text-slate-400 block">BATTERY</span>
              <span className="text-emerald-400 font-bold">{Math.round(currentDrone.battery)}%</span>
            </div>
          </div>
        </div>

        {/* Minimal Legend */}
        <div className="pointer-events-auto bg-slate-900/70 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-full shadow-xl flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <span className="text-slate-300 text-[11px]">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-300 text-[11px]">Assigned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300 text-[11px]">Rescued</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span className="text-slate-300 text-[11px]">Hazard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
