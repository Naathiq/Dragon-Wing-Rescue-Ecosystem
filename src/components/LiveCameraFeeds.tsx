import React, { useEffect, useRef, useState } from 'react';
import { Drone, Survivor, Hazard } from '../types';
import { Camera, Flame, Eye, ZoomIn, ZoomOut, Crosshair, Thermometer, ShieldAlert, Cpu, Maximize2 } from 'lucide-react';

interface LiveCameraFeedsProps {
  currentDrone: Drone;
  survivors: Survivor[];
  hazards: Hazard[];
}

export const LiveCameraFeeds: React.FC<LiveCameraFeedsProps> = ({ currentDrone, survivors, hazards }) => {
  const rgbCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const thermalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [thermalPalette, setThermalPalette] = useState<'ironbow' | 'whitehot' | 'blackhot' | 'rainbow'>('ironbow');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showHUD, setShowHUD] = useState(true);
  const [hoveredTemp, setHoveredTemp] = useState<{ x: number; y: number; temp: number } | null>(null);
  const [isRecording, setIsRecording] = useState(true);

  // RGB CAMERA SIMULATION LOOP
  useEffect(() => {
    const canvas = rgbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const renderRGB = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark disaster landscape background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Simulated perspective terrain ground
      const groundGradient = ctx.createLinearGradient(0, h * 0.35, 0, h);
      groundGradient.addColorStop(0, '#1e293b');
      groundGradient.addColorStop(0.6, '#334155');
      groundGradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, h * 0.35, w, h * 0.65);

      // Sky / Horizon with hazy disaster smoke
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.35);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(0.8, '#1e293b');
      skyGrad.addColorStop(1, '#334155');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.35);

      // Simulated Damaged Buildings in background
      ctx.fillStyle = '#1e293b';
      // Left building (intact)
      ctx.fillRect(w * 0.05, h * 0.2, w * 0.22, h * 0.45);
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.05, h * 0.2, w * 0.22, h * 0.45);

      // Center building (fractured roof with smoke)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h * 0.25);
      ctx.lineTo(w * 0.58, h * 0.22);
      ctx.lineTo(w * 0.62, h * 0.65);
      ctx.lineTo(w * 0.30, h * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.stroke();

      // Right building
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w * 0.7, h * 0.18, w * 0.25, h * 0.5);

      // Water flood surge on bottom right
      ctx.fillStyle = 'rgba(2, 132, 199, 0.45)';
      ctx.beginPath();
      ctx.moveTo(w * 0.45, h);
      ctx.bezierCurveTo(w * 0.55, h * 0.8, w * 0.85, h * 0.75, w, h * 0.72);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Active Fire simulation on center roof
      const fireFlicker = Math.sin(frame * 0.3) * 6;
      const fireGrad = ctx.createRadialGradient(
        w * 0.48, h * 0.26 + fireFlicker, 2,
        w * 0.48, h * 0.26, 32 + fireFlicker
      );
      fireGrad.addColorStop(0, '#ffffff');
      fireGrad.addColorStop(0.3, '#f59e0b');
      fireGrad.addColorStop(0.7, '#ef4444');
      fireGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(w * 0.48, h * 0.26, 35 + fireFlicker, 0, Math.PI * 2);
      ctx.fill();

      // Smoke particles drifting upwards
      ctx.fillStyle = 'rgba(100, 116, 139, 0.25)';
      for (let i = 0; i < 6; i++) {
        const sx = w * 0.48 + Math.sin((frame + i * 20) * 0.05) * 20 + (i * 8);
        const sy = (h * 0.26) - ((frame * 1.2 + i * 35) % (h * 0.3));
        const sRad = 15 + i * 8;
        ctx.beginPath();
        ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Simulated survivor on balcony (left of fire)
      const survivorX = w * 0.36;
      const survivorY = h * 0.34;
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(survivorX, survivorY, 4, 0, Math.PI * 2);
      ctx.fill();
      // Body & waving arm
      ctx.strokeStyle = '#f97316'; // orange emergency cloth
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(survivorX, survivorY + 4);
      ctx.lineTo(survivorX, survivorY + 16);
      // Waving arm
      const armWiggle = Math.sin(frame * 0.15) * 6;
      ctx.moveTo(survivorX, survivorY + 8);
      ctx.lineTo(survivorX + 8, survivorY + armWiggle);
      ctx.stroke();

      // Bounding Boxes (YOLO Simulation)
      if (showBoundingBoxes) {
        // Bounding Box 1: SURVIVOR
        const bx = survivorX - 16;
        const by = survivorY - 12;
        const bw = 32;
        const bh = 42;

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Tag label
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.fillRect(bx, by - 16, 110, 16);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('PERSON 96% [S001]', bx + 4, by - 4);

        // Corner tick marks
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(bx - 2, by + 6);
        ctx.lineTo(bx - 2, by - 2);
        ctx.lineTo(bx + 6, by - 2);
        ctx.stroke();

        // Bounding Box 2: FIRE
        const fx = w * 0.44;
        const fy = h * 0.20;
        const fw = 60;
        const fh = 45;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(fx, fy, fw, fh);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(fx, fy - 16, 85, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('FIRE 94% [H001]', fx + 4, fy - 4);

        // Bounding Box 3: STRUCTURAL DAMAGE
        const dx = w * 0.30;
        const dy = h * 0.38;
        const dw = 140;
        const dh = 70;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(dx, dy, dw, dh);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.fillRect(dx, dy - 16, 118, 16);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('STRUCTURAL CRACK 91%', dx + 4, dy - 4);
      }

      // HUD Overlay & Crosshairs
      if (showHUD) {
        // Center reticle
        const cx = w / 2;
        const cy = h / 2;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 1;

        // Reticle ring
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.stroke();

        // Cross lines
        ctx.beginPath();
        ctx.moveTo(cx - 36, cy); ctx.lineTo(cx - 12, cy);
        ctx.moveTo(cx + 12, cy); ctx.lineTo(cx + 36, cy);
        ctx.moveTo(cx, cy - 36); ctx.lineTo(cx, cy - 12);
        ctx.moveTo(cx, cy + 12); ctx.lineTo(cx, cy + 36);
        ctx.stroke();

        // Artificial Horizon Line
        const pitchOffset = Math.sin(frame * 0.02) * 8;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.beginPath();
        ctx.moveTo(w * 0.2, cy + pitchOffset);
        ctx.lineTo(w * 0.4, cy + pitchOffset);
        ctx.moveTo(w * 0.6, cy + pitchOffset);
        ctx.lineTo(w * 0.8, cy + pitchOffset);
        ctx.stroke();

        // Telemetry Text
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText(`CAM: RGB-4K SONY-EXMOR`, 12, 22);
        ctx.fillText(`GIMBAL: PITCH -24.5° ROLL +0.8°`, 12, 36);
        ctx.fillText(`AI INFERENCE: 4.2ms (YOLOv11s-Edge)`, 12, 50);

        // Top right telemetry
        ctx.textAlign = 'right';
        ctx.fillText(`ZOOM: ${zoomLevel}.0X`, w - 12, 22);
        ctx.fillText(`FOV: 84.2°`, w - 12, 36);
        ctx.fillText(`GPS: LOCK (14 SATS)`, w - 12, 50);
        ctx.textAlign = 'left';

        // Scanlines effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let y = 0; y < h; y += 4) {
          ctx.fillRect(0, y, w, 1);
        }
      }

      animId = requestAnimationFrame(renderRGB);
    };

    renderRGB();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [showBoundingBoxes, showHUD, zoomLevel]);

  // THERMAL CAMERA SIMULATION LOOP (FLIR Infrared microbolometer simulation)
  useEffect(() => {
    const canvas = thermalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const renderThermal = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Base thermal background (cool ambient: 16°C - 20°C)
      let baseGrad: CanvasGradient;
      if (thermalPalette === 'whitehot') {
        baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, '#111111');
        baseGrad.addColorStop(1, '#333333');
      } else if (thermalPalette === 'blackhot') {
        baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, '#eeeeee');
        baseGrad.addColorStop(1, '#cccccc');
      } else if (thermalPalette === 'rainbow') {
        baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, '#000044');
        baseGrad.addColorStop(1, '#004466');
      } else {
        // Ironbow default
        baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, '#05051a');
        baseGrad.addColorStop(0.7, '#1a0b2e');
        baseGrad.addColorStop(1, '#2c0c3e');
      }
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // Cool Flood Water (12°C - darkest in Ironbow/White-hot)
      const waterGrad = ctx.createLinearGradient(w * 0.5, h * 0.7, w, h);
      if (thermalPalette === 'ironbow') {
        waterGrad.addColorStop(0, '#030213');
        waterGrad.addColorStop(1, '#060424');
      } else if (thermalPalette === 'whitehot') {
        waterGrad.addColorStop(0, '#080808');
        waterGrad.addColorStop(1, '#000000');
      } else if (thermalPalette === 'blackhot') {
        waterGrad.addColorStop(0, '#f8f8f8');
        waterGrad.addColorStop(1, '#ffffff');
      } else {
        waterGrad.addColorStop(0, '#000088');
        waterGrad.addColorStop(1, '#0000ff');
      }
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.moveTo(w * 0.45, h);
      ctx.bezierCurveTo(w * 0.55, h * 0.8, w * 0.85, h * 0.75, w, h * 0.72);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Extreme Heat: Fire zone (420°C - 550°C glowing white-yellow in Ironbow)
      const fireX = w * 0.48;
      const fireY = h * 0.26;
      const fireFlicker = Math.sin(frame * 0.25) * 4;

      const fireThermalGrad = ctx.createRadialGradient(
        fireX, fireY, 3,
        fireX, fireY, 40 + fireFlicker
      );
      if (thermalPalette === 'ironbow') {
        fireThermalGrad.addColorStop(0, '#ffffff'); // >500°C White
        fireThermalGrad.addColorStop(0.2, '#fef08a'); // 400°C Yellow
        fireThermalGrad.addColorStop(0.5, '#f97316'); // 250°C Orange
        fireThermalGrad.addColorStop(0.8, '#a21caf'); // 80°C Magenta
        fireThermalGrad.addColorStop(1, 'rgba(44, 12, 62, 0)');
      } else if (thermalPalette === 'whitehot') {
        fireThermalGrad.addColorStop(0, '#ffffff');
        fireThermalGrad.addColorStop(0.7, '#aaaaaa');
        fireThermalGrad.addColorStop(1, 'rgba(50, 50, 50, 0)');
      } else if (thermalPalette === 'blackhot') {
        fireThermalGrad.addColorStop(0, '#000000');
        fireThermalGrad.addColorStop(0.7, '#555555');
        fireThermalGrad.addColorStop(1, 'rgba(200, 200, 200, 0)');
      } else {
        fireThermalGrad.addColorStop(0, '#ffffff');
        fireThermalGrad.addColorStop(0.3, '#ff0000');
        fireThermalGrad.addColorStop(0.6, '#ffff00');
        fireThermalGrad.addColorStop(1, 'rgba(0, 0, 100, 0)');
      }
      ctx.fillStyle = fireThermalGrad;
      ctx.beginPath();
      ctx.arc(fireX, fireY, 45 + fireFlicker, 0, Math.PI * 2);
      ctx.fill();

      // Human Body Thermal Signature (Survivor: 36.8°C - 37.2°C glowing clearly through dark)
      const survivorX = w * 0.36;
      const survivorY = h * 0.34;

      // Human heat glow halo
      const humanGlow = ctx.createRadialGradient(
        survivorX, survivorY + 8, 2,
        survivorX, survivorY + 8, 20
      );
      if (thermalPalette === 'ironbow') {
        humanGlow.addColorStop(0, '#fef08a'); // Warm yellow core 37.2°C
        humanGlow.addColorStop(0.4, '#ea580c'); // Orange 34°C
        humanGlow.addColorStop(0.8, '#9333ea'); // Purple 28°C
        humanGlow.addColorStop(1, 'rgba(26, 11, 46, 0)');
      } else if (thermalPalette === 'whitehot') {
        humanGlow.addColorStop(0, '#ffffff');
        humanGlow.addColorStop(0.5, '#cccccc');
        humanGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (thermalPalette === 'blackhot') {
        humanGlow.addColorStop(0, '#000000');
        humanGlow.addColorStop(0.5, '#333333');
        humanGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        humanGlow.addColorStop(0, '#ffff00');
        humanGlow.addColorStop(0.5, '#ff0000');
        humanGlow.addColorStop(1, 'rgba(0, 0, 100, 0)');
      }
      ctx.fillStyle = humanGlow;
      ctx.beginPath();
      ctx.arc(survivorX, survivorY + 8, 20, 0, Math.PI * 2);
      ctx.fill();

      // Human anatomical silhouette
      ctx.fillStyle = thermalPalette === 'blackhot' ? '#000000' : '#ffffff';
      // Head
      ctx.beginPath();
      ctx.arc(survivorX, survivorY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // Torso & arms
      ctx.fillRect(survivorX - 3.5, survivorY + 4, 7, 12);
      // Legs
      ctx.fillRect(survivorX - 3.5, survivorY + 16, 3, 8);
      ctx.fillRect(survivorX + 0.5, survivorY + 16, 3, 8);

      // Thermal AI Detection Bounding Box
      if (showBoundingBoxes) {
        const bx = survivorX - 18;
        const by = survivorY - 14;
        const bw = 36;
        const bh = 44;

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bw, bh);

        // Heat measurement badge
        ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
        ctx.fillRect(bx, by - 16, 125, 16);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText('THERMAL SIGNATURE 37.2°C', bx + 3, by - 4);
      }

      // Thermal HUD & Calibration Scale
      if (showHUD) {
        // Temperature scale bar on right edge
        const barX = w - 24;
        const barY = h * 0.2;
        const barH = h * 0.6;
        const barW = 10;

        const scaleGrad = ctx.createLinearGradient(0, barY, 0, barY + barH);
        if (thermalPalette === 'ironbow') {
          scaleGrad.addColorStop(0, '#ffffff'); // >500°C
          scaleGrad.addColorStop(0.25, '#fef08a');
          scaleGrad.addColorStop(0.5, '#ea580c');
          scaleGrad.addColorStop(0.75, '#9333ea');
          scaleGrad.addColorStop(1, '#05051a'); // 10°C
        } else if (thermalPalette === 'whitehot') {
          scaleGrad.addColorStop(0, '#ffffff');
          scaleGrad.addColorStop(1, '#000000');
        } else if (thermalPalette === 'blackhot') {
          scaleGrad.addColorStop(0, '#000000');
          scaleGrad.addColorStop(1, '#ffffff');
        } else {
          scaleGrad.addColorStop(0, '#ffffff');
          scaleGrad.addColorStop(0.33, '#ff0000');
          scaleGrad.addColorStop(0.66, '#ffff00');
          scaleGrad.addColorStop(1, '#000088');
        }

        ctx.fillStyle = scaleGrad;
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        // Scale values
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText('500°C', barX - 32, barY + 8);
        ctx.fillText('37°C', barX - 26, barY + barH * 0.6);
        ctx.fillText('10°C', barX - 26, barY + barH);

        // Header info
        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px monospace';
        ctx.fillText(`FLIR LWIR 640x512 | <40mK`, 12, 22);
        ctx.fillText(`PALETTE: ${thermalPalette.toUpperCase()}`, 12, 36);
        ctx.fillText(`SPOT 1: 37.2°C (HUMAN TARGET)`, 12, 50);

        // Dynamic Temperature Crosshair on hover
        if (hoveredTemp) {
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(hoveredTemp.x - 15, hoveredTemp.y);
          ctx.lineTo(hoveredTemp.x + 15, hoveredTemp.y);
          ctx.moveTo(hoveredTemp.x, hoveredTemp.y - 15);
          ctx.lineTo(hoveredTemp.x, hoveredTemp.y + 15);
          ctx.stroke();

          ctx.fillStyle = '#00ffff';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`${hoveredTemp.temp.toFixed(1)}°C`, hoveredTemp.x + 8, hoveredTemp.y - 8);
        }
      }

      animId = requestAnimationFrame(renderThermal);
    };

    renderThermal();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [thermalPalette, showBoundingBoxes, showHUD, hoveredTemp]);

  const handleThermalMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = thermalCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Calculate approximate simulated temperature at point
    const distToFire = Math.hypot(x - canvas.width * 0.48, y - canvas.height * 0.26);
    const distToHuman = Math.hypot(x - canvas.width * 0.36, y - canvas.height * 0.34);

    let temp = 19.5; // ambient debris
    if (distToFire < 45) {
      temp = 480 - distToFire * 8;
    } else if (distToHuman < 25) {
      temp = 37.2 - distToHuman * 0.4;
    } else if (x > canvas.width * 0.5 && y > canvas.height * 0.7) {
      temp = 12.8; // water
    } else {
      temp = 18.0 + (Math.sin(x * 0.05) + Math.cos(y * 0.05)) * 2;
    }

    setHoveredTemp({ x, y, temp });
  };

  return (
    <div id="live-camera-section" className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl">
      {/* Feed Section Header with controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white tracking-tight">
                Dual Sensor Feed – {currentDrone.name}
              </h2>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronized 4K RGB & FLIR Thermal Radiometric Stream
            </p>
          </div>
        </div>

        {/* Global Feed Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-3 py-1 rounded-full border transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
              showBoundingBoxes
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-950/40 text-slate-400 border-white/[0.08] hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            AI Boxes: {showBoundingBoxes ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowHUD(!showHUD)}
            className={`px-3 py-1 rounded-full border transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
              showHUD
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-slate-950/40 text-slate-400 border-white/[0.08] hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            HUD: {showHUD ? 'ON' : 'OFF'}
          </button>

          <div className="flex items-center bg-slate-950/60 rounded-full border border-white/[0.08] px-1 py-0.5">
            <button
              onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
              className="p-1 hover:text-cyan-400 text-slate-400 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono px-1.5 text-xs text-cyan-300 font-medium">{zoomLevel}x</span>
            <button
              onClick={() => setZoomLevel(Math.min(4, zoomLevel + 1))}
              className="p-1 hover:text-cyan-400 text-slate-400 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Synchronized Cameras Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PANEL 1: RGB CAMERA */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-950 shadow-sm group">
          {/* Top Camera Header bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.08] text-xs">
              <span className="text-cyan-300 font-medium">RGB Optical</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-mono text-[11px]">60 FPS</span>
            </div>
            <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/[0.08] text-[10px] text-slate-300 font-mono">
              YOLOv11s Edge
            </div>
          </div>

          {/* Canvas RGB */}
          <canvas
            ref={rgbCanvasRef}
            width={580}
            height={340}
            className="w-full h-auto object-cover aspect-[16/9] block"
          />

          {/* Bottom Bar */}
          <div className="p-3 bg-slate-950/80 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>3 Objects Detected</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 font-medium">Survivor 96%</span>
            </div>
            <span className="text-xs text-slate-400">Sony IMX586 4K</span>
          </div>
        </div>

        {/* PANEL 2: THERMAL CAMERA */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-950 shadow-sm group">
          {/* Top Camera Header bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.08] text-xs">
              <span className="text-amber-300 font-medium flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Thermal FLIR
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 font-mono text-[11px]">Active</span>
            </div>

            {/* Thermal Palette Selector */}
            <div className="pointer-events-auto flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-full border border-white/[0.08] text-[10px]">
              {(['ironbow', 'whitehot', 'blackhot', 'rainbow'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setThermalPalette(p)}
                  className={`px-2 py-0.5 rounded-full capitalize font-medium cursor-pointer transition-colors ${
                    thermalPalette === p
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Thermal */}
          <canvas
            ref={thermalCanvasRef}
            width={580}
            height={340}
            onMouseMove={handleThermalMouseMove}
            onMouseLeave={() => setHoveredTemp(null)}
            className="w-full h-auto object-cover aspect-[16/9] block cursor-crosshair"
          />

          {/* Bottom Bar */}
          <div className="p-3 bg-slate-950/80 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Bio-Thermal: Confirmed (37.2°C)</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-medium">Smoke Penetration OK</span>
            </div>
            <span className="text-xs text-slate-400">Hover canvas to inspect temps</span>
          </div>
        </div>
      </div>
    </div>
  );
};
