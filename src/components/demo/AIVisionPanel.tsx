import React from 'react';
import { useAegis } from '../../store/AegisContext';
import type { FallState } from '../../types';

const STATE_CONFIG: Record<FallState, { label: string; color: string; motion: string; pose: string }> = {
  NORMAL: { label: 'MONITORING', color: '#475569', motion: 'Normal', pose: 'Upright' },
  PERSON_DETECTED: { label: 'PERSON DETECTED', color: '#00d4f7', motion: 'Tracking', pose: 'Standing' },
  MOVING: { label: 'MOVEMENT ANALYSIS', color: '#00d4f7', motion: 'Active', pose: 'Walking' },
  POSSIBLE_FALL: { label: 'POSSIBLE FALL', color: '#f59e0b', motion: 'Rapid ↓', pose: 'Falling' },
  VERIFYING: { label: 'VERIFYING', color: '#f59e0b', motion: 'Low / Still', pose: 'Ground' },
  EMERGENCY_CONFIRMED: { label: 'EMERGENCY', color: '#f43f5e', motion: 'None', pose: 'Prone' },
  RECOVERED: { label: 'RECOVERED', color: '#10b981', motion: 'Resuming', pose: 'Upright' },
};

interface Row {
  label: string;
  value: string;
  color?: string;
  active?: boolean;
}

export function AIVisionPanel() {
  const { state } = useAegis();
  const cfg = STATE_CONFIG[state.fallState] ?? STATE_CONFIG.NORMAL;

  const personDetected = state.fallState !== 'NORMAL';
  const poseTracking = state.poseConfidence > 0;

  const rows: Row[] = [
    {
      label: 'Person',
      value: personDetected ? 'Detected' : '—',
      color: personDetected ? '#00d4f7' : '#475569',
      active: personDetected,
    },
    {
      label: 'Pose',
      value: poseTracking ? `Tracking (${Math.round(state.poseConfidence * 100)}%)` : '—',
      color: poseTracking ? '#00d4f7' : '#475569',
      active: poseTracking,
    },
    {
      label: 'Motion',
      value: cfg.motion,
      color: cfg.color,
    },
    {
      label: 'Posture',
      value: cfg.pose,
      color: state.fallState === 'VERIFYING' || state.fallState === 'EMERGENCY_CONFIRMED' ? '#f43f5e' : cfg.color,
    },
    {
      label: 'State',
      value: cfg.label,
      color: cfg.color,
    },
  ];

  // Fall confidence shown only when relevant
  if (state.fallConfidence > 0.5) {
    rows.splice(2, 0, {
      label: 'Fall Signal',
      value: `${Math.round(state.fallConfidence * 100)}%`,
      color: state.fallConfidence > 0.8 ? '#f43f5e' : '#f59e0b',
      active: true,
    });
  }

  // Fire/animal special states
  if (state.fireDetected) {
    rows.push({ label: 'Fire Signal', value: 'DETECTED', color: '#f43f5e', active: true });
  }
  if (state.animalDetected) {
    rows.push({ label: 'Animal', value: 'DETECTED', color: '#10b981', active: true });
  }

  return (
    <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#1a2840] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ backgroundColor: cfg.color }} />
          <span className="text-[10px] font-mono text-[#94a3b8] tracking-widest uppercase">AI VISION</span>
        </div>
        <span className="text-[9px] font-mono tracking-widest" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#1a2840]">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2">
            <span className="text-[10px] font-mono text-[#475569] uppercase tracking-wider">{row.label}</span>
            <span
              className="text-[10px] font-mono font-semibold tracking-wide"
              style={{ color: row.color ?? '#94a3b8' }}
            >
              {row.active ? '✓ ' : ''}{row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Thermal status */}
      <div className="px-3 py-2 border-t border-[#1a2840] flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#475569] uppercase tracking-wider">Thermal</span>
        <span className="text-[9px] font-mono text-[#f59e0b]">
          {state.settings.demoThermalMode ? 'DEMO MODE' : 'UNAVAILABLE'}
        </span>
      </div>

      {/* Footer note */}
      <div className="px-3 py-1.5 bg-[#050810]/50">
        <p className="text-[8px] font-mono text-[#1e2d40] leading-relaxed">
          COMPUTER VISION MEASUREMENTS — NOT MEDICAL DATA
        </p>
      </div>
    </div>
  );
}
