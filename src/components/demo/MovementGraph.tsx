import React, { useEffect, useRef } from 'react';
import { useAegis } from '../../store/AegisContext';

interface MovementGraphProps {
  compact?: boolean;
}

const MOTION_HISTORY_LENGTH = 80;

export function MovementGraph({ compact = false }: MovementGraphProps) {
  const { state } = useAegis();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[]>(new Array(MOTION_HISTORY_LENGTH).fill(0.1));
  const rafRef = useRef<number>(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      tickRef.current++;
      const { width: w, height: h } = canvas;

      // Determine target motion level from fallState
      let targetVelocity = 0.1;
      switch (state.fallState) {
        case 'NORMAL': targetVelocity = 0.12 + Math.sin(tickRef.current / 20) * 0.04; break;
        case 'PERSON_DETECTED': targetVelocity = 0.25 + Math.sin(tickRef.current / 15) * 0.05; break;
        case 'MOVING': targetVelocity = 0.55 + Math.sin(tickRef.current / 8) * 0.15; break;
        case 'POSSIBLE_FALL': targetVelocity = 0.9 + Math.random() * 0.1; break;
        case 'VERIFYING': targetVelocity = 0.08 + Math.abs(Math.sin(tickRef.current / 40)) * 0.05; break;
        case 'EMERGENCY_CONFIRMED': targetVelocity = 0.04 + Math.random() * 0.02; break;
        case 'RECOVERED': targetVelocity = 0.18 + Math.sin(tickRef.current / 18) * 0.06; break;
      }

      // Use motionVelocity from state if set, otherwise compute
      const velocity = state.motionVelocity > 0 ? state.motionVelocity * 0.7 + targetVelocity * 0.3 : targetVelocity;

      // Shift history
      historyRef.current.push(Math.max(0, Math.min(1, velocity + (Math.random() - 0.5) * 0.04)));
      historyRef.current.shift();

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, w, h);

      // Zone labels
      const zones = [
        { label: 'HIGH', y: h * 0.1, color: '#f43f5e20' },
        { label: 'MED', y: h * 0.45, color: '#f59e0b10' },
        { label: 'LOW', y: h * 0.75, color: '#00d4f708' },
      ];
      zones.forEach(z => {
        ctx.fillStyle = z.color;
        ctx.fillRect(0, z.y, w, h * 0.25);
      });

      // Grid lines
      ctx.strokeStyle = 'rgba(26,40,64,0.4)';
      ctx.lineWidth = 0.5;
      [0.25, 0.5, 0.75].forEach(pct => {
        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.moveTo(0, h * (1 - pct));
        ctx.lineTo(w, h * (1 - pct));
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Motion waveform
      const barW = (w / MOTION_HISTORY_LENGTH);
      historyRef.current.forEach((val, i) => {
        const x = i * barW;
        const barH = val * (h - 4);
        const isRecent = i > MOTION_HISTORY_LENGTH * 0.85;

        // Color by intensity
        const color =
          val > 0.8 ? '#f43f5e' :
          val > 0.5 ? '#f59e0b' :
          val > 0.25 ? '#00d4f7' :
          '#1a2840';

        const alpha = isRecent ? 1 : 0.4 + (i / MOTION_HISTORY_LENGTH) * 0.5;
        ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fillRect(x, h - barH - 2, Math.max(1, barW - 0.5), barH);
      });

      // Current value indicator line
      const currentVal = historyRef.current[historyRef.current.length - 1];
      const lineY = h - currentVal * (h - 4) - 2;
      ctx.strokeStyle = currentVal > 0.8 ? '#f43f5e' : currentVal > 0.5 ? '#f59e0b' : '#00d4f7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w - barW * 8, lineY);
      ctx.lineTo(w, lineY);
      ctx.stroke();

      // State label overlay
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = '#1a2840';
      ctx.textAlign = 'right';
      ctx.fillText('HIGH', w - 4, h * 0.18);
      ctx.fillText('MED', w - 4, h * 0.52);
      ctx.fillText('LOW', w - 4, h * 0.82);
      ctx.textAlign = 'left';

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.fallState, state.motionVelocity]);

  const h = compact ? 48 : 60;

  return (
    <div className="border border-[#1a2840] bg-[#050810] rounded-sm overflow-hidden">
      <div className="px-3 py-1.5 border-b border-[#1a2840] flex items-center justify-between">
        <span className="text-[9px] font-mono text-[#475569] tracking-widest uppercase">MOVEMENT VELOCITY</span>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-mono text-[#1a2840]">normal ─── rising ─── ↓↓↓ downward</span>
          <span className={`text-[9px] font-mono tracking-widest ${
            state.fallState === 'POSSIBLE_FALL' ? 'text-[#f43f5e]' :
            state.fallState === 'MOVING' ? 'text-[#f59e0b]' :
            'text-[#475569]'
          }`}>
            {state.fallState === 'POSSIBLE_FALL' ? 'RAPID DESCENT' :
             state.fallState === 'MOVING' ? 'ACTIVE' :
             state.fallState === 'VERIFYING' || state.fallState === 'EMERGENCY_CONFIRMED' ? 'MINIMAL' :
             'NORMAL'}
          </span>
        </div>
      </div>
      <canvas ref={canvasRef} width={600} height={h} className="w-full" style={{ height: h }} />
    </div>
  );
}
