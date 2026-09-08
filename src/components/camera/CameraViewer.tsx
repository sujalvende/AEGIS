import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAegis } from '../../store/AegisContext';
import type { FallState } from '../../types';

interface CameraViewerProps {
  compact?: boolean;
  deviceId?: string;
  forceWebcam?: boolean;
}

// Skeleton connections for simplified pose
const SKELETON_PAIRS: [number, number][] = [
  [0, 1], [1, 2], [2, 3],   // spine
  [1, 4], [4, 5], [5, 6],   // left arm
  [1, 7], [7, 8], [8, 9],   // right arm
  [2, 10], [10, 11], [11, 12], // left leg
  [2, 13], [13, 14], [14, 15], // right leg
];

function getPosePoints(cx: number, cy: number, scale: number, state: FallState): { x: number; y: number }[] {
  const s = scale;
  if (state === 'POSSIBLE_FALL' || state === 'VERIFYING' || state === 'EMERGENCY_CONFIRMED') {
    // Fallen pose — horizontal/ground level
    return [
      { x: cx, y: cy - s * 0.3 },         // 0 head
      { x: cx, y: cy },                     // 1 neck
      { x: cx, y: cy + s * 0.15 },         // 2 hip
      { x: cx, y: cy + s * 0.25 },         // 3 base
      { x: cx - s * 0.25, y: cy - s * 0.1 }, // 4 l shoulder
      { x: cx - s * 0.45, y: cy + s * 0.1 }, // 5 l elbow
      { x: cx - s * 0.6, y: cy + s * 0.2 }, // 6 l hand
      { x: cx + s * 0.25, y: cy + s * 0.05 }, // 7 r shoulder
      { x: cx + s * 0.5, y: cy - s * 0.05 }, // 8 r elbow
      { x: cx + s * 0.65, y: cy - s * 0.1 }, // 9 r hand
      { x: cx - s * 0.2, y: cy + s * 0.3 }, // 10 l hip
      { x: cx - s * 0.45, y: cy + s * 0.25 }, // 11 l knee
      { x: cx - s * 0.65, y: cy + s * 0.15 }, // 12 l foot
      { x: cx + s * 0.2, y: cy + s * 0.3 }, // 13 r hip
      { x: cx + s * 0.5, y: cy + s * 0.35 }, // 14 r knee
      { x: cx + s * 0.7, y: cy + s * 0.25 }, // 15 r foot
    ];
  }
  // Standing pose
  return [
    { x: cx, y: cy - s * 0.7 },         // 0 head
    { x: cx, y: cy - s * 0.45 },         // 1 neck/shoulder
    { x: cx, y: cy },                     // 2 hip
    { x: cx, y: cy + s * 0.1 },         // 3 base
    { x: cx - s * 0.2, y: cy - s * 0.3 }, // 4 l shoulder
    { x: cx - s * 0.25, y: cy - s * 0.05 }, // 5 l elbow
    { x: cx - s * 0.25, y: cy + s * 0.15 }, // 6 l hand
    { x: cx + s * 0.2, y: cy - s * 0.3 }, // 7 r shoulder
    { x: cx + s * 0.25, y: cy - s * 0.05 }, // 8 r elbow
    { x: cx + s * 0.25, y: cy + s * 0.15 }, // 9 r hand
    { x: cx - s * 0.1, y: cy + s * 0.15 }, // 10 l hip
    { x: cx - s * 0.12, y: cy + s * 0.45 }, // 11 l knee
    { x: cx - s * 0.12, y: cy + s * 0.7 }, // 12 l foot
    { x: cx + s * 0.1, y: cy + s * 0.15 }, // 13 r hip
    { x: cx + s * 0.12, y: cy + s * 0.45 }, // 14 r knee
    { x: cx + s * 0.12, y: cy + s * 0.7 }, // 15 r foot
  ];
}

function drawAIOverlay(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  fallState: FallState,
  tick: number,
  poseConf: number,
  fallConf: number,
  animalDetected: boolean,
  fireDetected: boolean,
  multiObject: boolean,
  hasRealVideo: boolean
) {
  if (!hasRealVideo) {
    ctx.clearRect(0, 0, w, h);
    // Dark scene background for demo-only mode
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#050810');
    bg.addColorStop(1, '#0a1020');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Floor line
    ctx.strokeStyle = 'rgba(26, 40, 64, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.78);
    ctx.lineTo(w, h * 0.78);
    ctx.stroke();

    // Grid perspective lines
    ctx.strokeStyle = 'rgba(26, 40, 64, 0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      const x = (w / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.78);
      ctx.lineTo(w / 2, h * 0.2);
      ctx.stroke();
    }
  } else {
    // Real video mode — clear overlay only (video is behind)
    ctx.clearRect(0, 0, w, h);
  }

  // Scan line (subtle on real video, more visible on simulated)
  const scanY = ((tick * 1.5) % (h * 0.78));
  const scanGrad = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 2);
  scanGrad.addColorStop(0, 'transparent');
  scanGrad.addColorStop(1, hasRealVideo ? 'rgba(0, 212, 247, 0.02)' : 'rgba(0, 212, 247, 0.04)');
  ctx.fillStyle = scanGrad;
  ctx.fillRect(0, scanY - 8, w, 10);

  const personX = w * 0.42;
  const personY = h * 0.52;
  const personScale = h * 0.18;

  if (fallState === 'NORMAL' && !animalDetected && !fireDetected && !multiObject) {
    if (!hasRealVideo) {
      // No person in frame yet — subtle indicator
      ctx.fillStyle = 'rgba(0, 212, 247, 0.04)';
      ctx.beginPath();
      ctx.ellipse(personX, personY + personScale * 0.5, personScale * 0.18, personScale * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  // Multi-object mode (Populated Campus)
  if (multiObject) {
    const isAnomaly = fallState !== 'NORMAL';
    const objects = [
      { x: w * 0.2, y: h * 0.55, label: 'PERSON 01 · NORMAL', color: '#00d4f7' },
      {
        x: w * 0.52,
        y: h * 0.58,
        label: isAnomaly ? 'ABNORMAL EVENT · PERSON FALL' : 'PERSON 02 · NORMAL',
        color: isAnomaly ? (fallState === 'EMERGENCY_CONFIRMED' ? '#f43f5e' : '#f59e0b') : '#00d4f7'
      },
      { x: w * 0.78, y: h * 0.6, label: 'VEHICLE · NOMINAL', color: '#94a3b8' },
      { x: w * 0.35, y: h * 0.62, label: 'PERSON 03 · NORMAL', color: '#00d4f7' },
    ];
    objects.forEach(obj => {
      ctx.strokeStyle = obj.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(obj.x - 30, obj.y - 45, 60, 55);
      ctx.fillStyle = obj.color + '15';
      ctx.fillRect(obj.x - 30, obj.y - 45, 60, 55);
      ctx.fillStyle = obj.color;
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText(obj.label, obj.x - 28, obj.y - 50);
    });
  }

  // Fire detection
  if (fireDetected) {
    const fx = w * 0.6, fy = h * 0.6;
    ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
    ctx.beginPath();
    ctx.ellipse(fx, fy, 60, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx - 45, fy - 55, 90, 75);
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.fillText('RGB FIRE / SMOKE DETECTED', fx - 40, fy - 62);
    ctx.fillStyle = '#fb923c';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText(`CONFIDENCE: ${Math.round(fallConf * 100)}%`, fx - 30, fy + 30);
    return;
  }

  // Animal detected
  if (animalDetected) {
    const ax = w * 0.5, ay = h * 0.55;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ax - 45, ay - 35, 90, 50);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.fillText('ANIMAL POSTURE: IMMOBILE', ax - 40, ay - 40);
    ctx.fillStyle = '#10b98115';
    ctx.fillRect(ax - 45, ay - 35, 90, 50);
    ctx.fillStyle = '#10b981';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('POSSIBLE ANIMAL DISTRESS', ax - 40, ay + 8);
    return;
  }

  // Person detection states — draw on top of real video or simulated scene
  if (fallState === 'PERSON_DETECTED' || fallState === 'MOVING' || fallState === 'POSSIBLE_FALL' || fallState === 'VERIFYING' || fallState === 'EMERGENCY_CONFIRMED' || fallState === 'RECOVERED') {
    const pts = getPosePoints(personX, personY, personScale, fallState);

    const bboxColor =
      fallState === 'EMERGENCY_CONFIRMED' ? '#f43f5e' :
      fallState === 'VERIFYING' || fallState === 'POSSIBLE_FALL' ? '#f59e0b' :
      '#00d4f7';

    const bboxPad = 20;
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const bx = Math.min(...xs) - bboxPad;
    const by = Math.min(...ys) - bboxPad;
    const bw = Math.max(...xs) - Math.min(...xs) + bboxPad * 2;
    const bh = Math.max(...ys) - Math.min(...ys) + bboxPad * 2;

    // Stable, calm outline (no blinking or pulse cycling)
    ctx.strokeStyle = bboxColor;
    ctx.lineWidth = hasRealVideo ? 2 : 1.5;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = bboxColor + (hasRealVideo ? '15' : '10');
    ctx.fillRect(bx, by, bw, bh);

    // Corner brackets
    const cs = 10;
    [
      [bx, by], [bx + bw - cs, by],
      [bx, by + bh - cs], [bx + bw - cs, by + bh - cs],
    ].forEach(([cx2, cy2]) => {
      ctx.fillStyle = bboxColor;
      ctx.fillRect(cx2, cy2, cs, 2);
      ctx.fillRect(cx2, cy2, 2, cs);
    });

    // Label
    ctx.fillStyle = bboxColor;
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    const label =
      fallState === 'EMERGENCY_CONFIRMED' ? 'EMERGENCY CONFIRMED' :
      fallState === 'VERIFYING' ? 'VERIFYING INACTIVITY' :
      fallState === 'POSSIBLE_FALL' ? 'POSSIBLE FALL DETECTED' :
      fallState === 'MOVING' ? 'MOVEMENT ANALYSIS' :
      'PERSON DETECTED';
    ctx.fillText(`TARGET — ${label}`, bx, by - 8);
    if (poseConf > 0) {
      ctx.fillStyle = bboxColor;
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`CONFIDENCE: ${Math.round(poseConf * 100)}%`, bx, by - 20);
    }

    // Skeleton
    SKELETON_PAIRS.forEach(([a, b]) => {
      if (a >= pts.length || b >= pts.length) return;
      ctx.strokeStyle =
        fallState === 'EMERGENCY_CONFIRMED' ? '#f43f5e' :
        fallState === 'VERIFYING' ? '#f59e0b' :
        hasRealVideo ? '#00d4f7' : '#00d4f7aa';
      ctx.lineWidth = hasRealVideo ? 2 : 1.5;
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.stroke();
    });

    // Joints
    pts.forEach((p, i) => {
      const r = i === 0 ? 4 : 2.5;
      ctx.fillStyle =
        i === 0
          ? (fallState === 'EMERGENCY_CONFIRMED' ? '#f43f5e' : fallState === 'VERIFYING' ? '#f59e0b' : '#00d4f7')
          : (fallState === 'EMERGENCY_CONFIRMED' ? '#f43f5ecc' : '#00d4f7cc');
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Motion vector (if moving)
    if (fallState === 'MOVING') {
      ctx.strokeStyle = '#00d4f750';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(personX, personY - personScale * 0.7);
      ctx.lineTo(personX + 5, personY - personScale * 0.7 - 25);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrow head
      ctx.fillStyle = '#00d4f7';
      ctx.beginPath();
      ctx.arc(personX + 5, personY - personScale * 0.7 - 25, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fall trajectory arrow
    if (fallState === 'POSSIBLE_FALL' || fallState === 'VERIFYING') {
      ctx.strokeStyle = '#f59e0b90';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(personX, personY - personScale * 0.7);
      ctx.lineTo(personX + 30, personY + personScale * 0.3);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(personX + 30, personY + personScale * 0.3, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stable border on confirmed emergency
    if (fallState === 'EMERGENCY_CONFIRMED') {
      ctx.strokeStyle = 'rgba(244,63,94,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx - 4, by - 4, bw + 8, bh + 8);
    }
  }
}

export function CameraViewer({ compact = false, deviceId, forceWebcam = false }: CameraViewerProps) {
  const { state } = useAegis();
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const tickRef = useRef(0);
  const prevFrameRef = useRef<ImageData | null>(null);

  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'error' | 'denied'>('idle');
  const [fps, setFps] = useState(0);
  const [resolution, setResolution] = useState('');
  const fpsCountRef = useRef({ count: 0, last: Date.now() });

  // Demo mode uses simulated scene UNLESS webcamMode is on or forceWebcam is set
  const isDemo = state.mode === 'demo';
  const useWebcam = !isDemo || state.webcamMode || forceWebcam;
  const hasRealVideo = useWebcam && cameraState === 'active';

  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: w, height: h } = canvas;

    tickRef.current += 1;
    fpsCountRef.current.count++;
    const now = Date.now();
    if (now - fpsCountRef.current.last > 1000) {
      setFps(fpsCountRef.current.count);
      fpsCountRef.current = { count: 0, last: now };
    }

    if (!isDemo || state.webcamMode || forceWebcam) {
      // Live or webcam-demo mode: draw overlay on real video
      drawAIOverlay(
        ctx, w, h,
        state.fallState, tickRef.current,
        state.poseConfidence, state.fallConfidence,
        state.animalDetected, state.fireDetected,
        state.multiObjectMode,
        hasRealVideo
      );

      // Also do motion detection on real video
      if (!hasRealVideo) {
        rafRef.current = requestAnimationFrame(drawOverlay);
        return;
      }
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !isDemo) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.floor(w / 4);
        tempCanvas.height = Math.floor(h / 4);
        const tc = tempCanvas.getContext('2d');
        if (tc) {
          tc.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const current = tc.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          if (prevFrameRef.current && state.fallState !== 'NORMAL') {
            let motionPixels = 0;
            let motionX = 0, motionY = 0;
            for (let i = 0; i < current.data.length; i += 4) {
              const diff = Math.abs(current.data[i] - prevFrameRef.current.data[i]) +
                           Math.abs(current.data[i + 1] - prevFrameRef.current.data[i + 1]) +
                           Math.abs(current.data[i + 2] - prevFrameRef.current.data[i + 2]);
              if (diff > 30) {
                motionPixels++;
                const px = ((i / 4) % tempCanvas.width) * 4;
                const py = Math.floor((i / 4) / tempCanvas.width) * 4;
                motionX += px; motionY += py;
              }
            }
            if (motionPixels > 20) {
              const cx2 = (motionX / motionPixels) | 0;
              const cy2 = (motionY / motionPixels) | 0;
              const size = Math.sqrt(motionPixels) * 2;
              ctx.strokeStyle = '#00d4f760';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(cx2 - size, cy2 - size, size * 2, size * 2);
              ctx.fillStyle = '#00d4f7';
              ctx.font = '10px JetBrains Mono, monospace';
              ctx.fillText('MOTION DETECTED', cx2 - 50, cy2 - size - 4);
            }
          }
          prevFrameRef.current = current;
        }
      }
    } else {
      // Pure demo mode — draw simulated scene + AI overlay
      drawAIOverlay(
        ctx, w, h,
        state.fallState, tickRef.current,
        state.poseConfidence, state.fallConfidence,
        state.animalDetected, state.fireDetected,
        state.multiObjectMode,
        false
      );
    }

    rafRef.current = requestAnimationFrame(drawOverlay);
  }, [isDemo, state.webcamMode, forceWebcam, state.fallState, state.poseConfidence, state.fallConfidence, state.animalDetected, state.fireDetected, state.multiObjectMode, hasRealVideo]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(drawOverlay);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawOverlay]);

  const startCamera = useCallback(async () => {
    setCameraState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          const { videoWidth, videoHeight } = videoRef.current!;
          setResolution(`${videoWidth}×${videoHeight}`);
        };
      }
      setCameraState('active');
    } catch (err) {
      const error = err as Error;
      setCameraState(error.name === 'NotAllowedError' ? 'denied' : 'error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState('idle');
  }, []);

  // Manage webcam stream in demo mode without state loops
  useEffect(() => {
    if (!isDemo) return;

    if (state.webcamMode || forceWebcam) {
      if (!streamRef.current && cameraState !== 'requesting' && cameraState !== 'active') {
        startCamera();
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
      }
      if (cameraState !== 'active') {
        setCameraState('active');
      }
    }
  }, [isDemo, state.webcamMode, forceWebcam, cameraState, startCamera]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(rafRef.current);
  }, []);

  const canvasW = compact ? 480 : 960;
  const canvasH = compact ? 270 : 540;

  return (
    <div className="space-y-3">
      {/* Camera display */}
      <div
        className="relative bg-[#050810] border border-[#1a2840] rounded-sm overflow-hidden camera-aspect"
        style={{ maxWidth: compact ? 480 : '100%' }}
      >
        {/* Real video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            display: hasRealVideo ? 'block' : 'none',
            transform: 'scaleX(-1)',
          }}
        />

        {/* AI Overlay canvas — always on top */}
        <canvas
          ref={overlayRef}
          width={canvasW}
          height={canvasH}
          className="absolute inset-0 w-full h-full"
          style={{ display: cameraState === 'active' ? 'block' : 'none' }}
        />

        {/* Idle state */}
        {cameraState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050810]">
            <div className="grid-bg absolute inset-0 opacity-20" />
            <div className="relative text-center space-y-3">
              <div className="text-4xl text-[#1a2840]">◉</div>
              <p className="text-[11px] font-mono text-[#475569] tracking-widest">
                {isDemo ? 'SELECT A SCENARIO TO BEGIN' : 'CAMERA INACTIVE'}
              </p>
              {!compact && !isDemo && (
                <button
                  onClick={startCamera}
                  className="px-5 py-2 font-mono text-xs tracking-widest uppercase bg-[#00d4f7]/10 border border-[#00d4f7]/30 text-[#00d4f7] hover:bg-[#00d4f7]/20 transition-all rounded-sm"
                >
                  START CAMERA
                </button>
              )}
            </div>
          </div>
        )}

        {/* Requesting */}
        {cameraState === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050810]">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-[#00d4f7] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-mono text-[#64748b] tracking-widest">REQUESTING CAMERA ACCESS...</p>
            </div>
          </div>
        )}

        {/* Error states */}
        {(cameraState === 'denied' || cameraState === 'error') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050810]">
            <p className="text-[#f43f5e] text-xs font-mono tracking-widest">
              {cameraState === 'denied' ? 'CAMERA ACCESS DENIED' : 'CAMERA UNAVAILABLE'}
            </p>
            <p className="text-[10px] font-mono text-[#475569] text-center max-w-xs">
              {cameraState === 'denied'
                ? 'Allow camera access in browser settings. Demo will continue with simulated feed.'
                : 'Camera device not found or in use by another application.'}
            </p>
            <button
              onClick={() => { setCameraState(isDemo ? 'active' : 'idle'); }}
              className="text-[10px] font-mono text-[#64748b] hover:text-[#94a3b8] underline"
            >
              {isDemo ? 'CONTINUE WITH SIMULATED FEED' : 'DISMISS'}
            </button>
          </div>
        )}

        {/* HUD overlays when active */}
        {cameraState === 'active' && (
          <>
            {/* Top-left status */}
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded-sm border border-[#1a2840]">
                <span className={`w-1.5 h-1.5 rounded-full ${state.fallState === 'EMERGENCY_CONFIRMED' ? 'bg-[#f43f5e]' : 'bg-[#10b981]'}`} />
                <span className={`text-[9px] font-mono tracking-widest ${state.fallState === 'EMERGENCY_CONFIRMED' ? 'text-[#f43f5e]' : 'text-[#10b981]'}`}>
                  {hasRealVideo ? 'LIVE' : isDemo ? 'DEMO' : 'LIVE'}
                </span>
              </div>
              {hasRealVideo && (
                <div className="bg-black/70 px-2 py-1 border border-[#00d4f7]/20 rounded-sm">
                  <span className="text-[9px] font-mono text-[#00d4f7] tracking-wider">WEBCAM + AI OVERLAY</span>
                </div>
              )}
              {isDemo && !hasRealVideo && (
                <div className="bg-black/70 px-2 py-1 border border-[#f59e0b]/20 rounded-sm">
                  <span className="text-[9px] font-mono text-[#f59e0b]">SIMULATED FEED</span>
                </div>
              )}
              {!isDemo && fps > 0 && (
                <div className="bg-black/60 px-2 py-1 border border-[#1a2840] rounded-sm">
                  <span className="text-[9px] font-mono text-[#64748b]">{fps} FPS</span>
                </div>
              )}
            </div>

            {/* Bottom status strip */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-black/70 border-t border-[#1a2840]">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-[#475569]">
                  {deviceId ?? (hasRealVideo ? 'AEGIS-CAM-LIVE' : 'AEGIS-CAM-DEMO')}
                </span>
                {resolution && <span className="text-[9px] font-mono text-[#475569]">{resolution}</span>}
              </div>
              <span className="text-[9px] font-mono text-[#475569]">
                {new Date().toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>

            {/* Emergency border - stable, solid border */}
            {state.fallState === 'EMERGENCY_CONFIRMED' && (
              <div className="absolute inset-0 border-2 border-[#f43f5e] pointer-events-none rounded-sm" />
            )}
          </>
        )}
      </div>

      {/* Controls (non-compact, live mode only) */}
      {!compact && !isDemo && (
        <div className="flex items-center gap-2">
          {cameraState === 'idle' ? (
            <button
              onClick={startCamera}
              className="px-4 py-2 font-mono text-[10px] tracking-widest uppercase bg-[#00d4f7]/10 border border-[#00d4f7]/30 text-[#00d4f7] hover:bg-[#00d4f7]/20 transition-all rounded-sm flex items-center gap-2"
            >
              <span>◉</span> START CAMERA
            </button>
          ) : cameraState === 'active' ? (
            <button
              onClick={stopCamera}
              className="px-4 py-2 font-mono text-[10px] tracking-widest uppercase bg-white/5 border border-[#1a2840] text-[#94a3b8] hover:bg-white/10 transition-all rounded-sm flex items-center gap-2"
            >
              <span>◻</span> STOP
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
