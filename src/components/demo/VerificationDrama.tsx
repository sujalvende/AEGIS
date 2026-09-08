import React, { useEffect, useRef } from 'react';
import { useAegis } from '../../store/AegisContext';

interface VerificationDramaProps {
  onComplete?: () => void;
}

export function VerificationDrama({ onComplete }: VerificationDramaProps) {
  const { state } = useAegis();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const isVerifying = state.fallState === 'VERIFYING';
  const isConfirmed = state.fallState === 'EMERGENCY_CONFIRMED' || state.fallState === 'RECOVERED';
  const countdown = state.verifyCountdown;
  const total = state.settings.fallVerificationSeconds || 10;

  useEffect(() => {
    if (isConfirmed && onComplete) {
      onComplete();
    }
  }, [isConfirmed, onComplete]);

  // Clean, steady canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.38;
      const strokeW = 4;

      // Track ring (subtle background track)
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#1a2840';
      ctx.lineWidth = strokeW;
      ctx.stroke();

      if (isConfirmed) {
        // Confirmed state: stable solid red ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = strokeW;
        ctx.stroke();

        // Inner fill: stable subtle red
        ctx.beginPath();
        ctx.arc(cx, cy, radius - strokeW / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
        ctx.fill();

        // Warning Icon
        ctx.font = `bold ${Math.round(radius * 0.55)}px sans-serif`;
        ctx.fillStyle = '#f43f5e';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠', cx, cy);
      } else if (isVerifying) {
        // Progress ring: sweeping smoothly
        const progress = Math.min(1, Math.max(0, (total - countdown) / total));
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + progress * Math.PI * 2;

        // Steady Amber arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = strokeW;
        ctx.stroke();

        // Inner fill: subtle amber
        ctx.beginPath();
        ctx.arc(cx, cy, radius - strokeW / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
        ctx.fill();

        // Large, clear countdown number
        ctx.font = `bold ${Math.round(radius * 0.72)}px JetBrains Mono, monospace`;
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(Math.max(0, countdown)), cx, cy);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isVerifying, isConfirmed, countdown, total]);

  const signalRows = [
    {
      label: 'Recovery Motion',
      value: isVerifying || isConfirmed ? 'NONE DETECTED' : '—',
      color: isVerifying || isConfirmed ? '#f43f5e' : '#64748b',
    },
    {
      label: 'Center of Gravity',
      value: isVerifying || isConfirmed ? 'GROUND LEVEL (<20%)' : '—',
      color: isVerifying ? '#f59e0b' : isConfirmed ? '#f43f5e' : '#64748b',
    },
    {
      label: 'Skeletal Posture',
      value: isVerifying || isConfirmed ? 'HORIZONTAL (92°)' : '—',
      color: isVerifying || isConfirmed ? '#f43f5e' : '#64748b',
    },
  ];

  if (!isVerifying && !isConfirmed) return null;

  return (
    <div className={`border rounded-sm overflow-hidden transition-all duration-200 ${
      isConfirmed ? 'border-[#f43f5e]/50 bg-[#f43f5e]/5' : 'border-[#f59e0b]/40 bg-[#f59e0b]/5'
    }`}>
      {/* Top Header */}
      <div className={`px-3 py-2 border-b flex items-center justify-between ${
        isConfirmed ? 'border-[#f43f5e]/30 bg-[#f43f5e]/10' : 'border-[#f59e0b]/30 bg-[#f59e0b]/10'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConfirmed ? 'bg-[#f43f5e]' : 'bg-[#f59e0b]'}`} />
          <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${
            isConfirmed ? 'text-[#f43f5e]' : 'text-[#f59e0b]'
          }`}>
            {isConfirmed ? 'EMERGENCY VERIFIED' : 'VERIFICATION IN PROGRESS'}
          </span>
        </div>
        {isVerifying && (
          <span className="text-[10px] font-mono font-bold text-[#f59e0b]">{countdown}s REMAINING</span>
        )}
      </div>

      <div className="p-3 flex gap-4 items-center">
        {/* Ring Canvas */}
        <div className="shrink-0">
          <canvas ref={canvasRef} width={100} height={100} className="w-[100px] h-[100px]" />
        </div>

        {/* Signal Analysis Table */}
        <div className="flex-1 space-y-2">
          {signalRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between border-b border-[#1a2840]/60 pb-1">
              <span className="text-[9px] font-mono text-[#64748b] uppercase tracking-wider">{row.label}</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: row.color }}>
                {row.value}
              </span>
            </div>
          ))}

          {isConfirmed && (
            <div className="pt-1">
              <p className="text-[10px] font-mono text-[#f43f5e] font-bold tracking-wide">
                AUTONOMOUS EMERGENCY DISPATCH TRIGGERED
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerificationDrama;
