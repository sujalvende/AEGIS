import React, { useState } from 'react';
import { useAegis } from '../../store/AegisContext';
import { DEMO_SCENARIOS } from '../../demo/data';
import type { DemoScenarioId } from '../../types';

interface ScenarioMeta {
  code: string;
  badge?: string;
  icon: string;
  color: string;
}

const SCENARIO_META: Record<DemoScenarioId, ScenarioMeta> = {
  human_fall: {
    code: '01',
    icon: '🚶',
    color: '#00d4f7',
  },
  remote_fall: {
    code: '02',
    badge: 'RECOMMENDED',
    icon: '🧍',
    color: '#00d4f7',
  },
  fire_thermal: {
    code: '03',
    icon: '🔥',
    color: '#f43f5e',
  },
  animal_distress: {
    code: '04',
    icon: '🐾',
    color: '#10b981',
  },
  campus_incident: {
    code: '05',
    icon: '👥',
    color: '#00d4f7',
  },
  multi_camera: {
    code: '06',
    icon: '📹',
    color: '#818cf8',
  },
};

export function DemoSelector() {
  const { state, startDemo, setWebcamMode, navigate } = useAegis();
  const [selectedId, setSelectedId] = useState<DemoScenarioId>('remote_fall');

  const selectedScenario = DEMO_SCENARIOS.find(s => s.id === selectedId) ?? DEMO_SCENARIOS[1];

  const handleStart = () => {
    navigate('monitor');
    startDemo(selectedId);
  };

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 flex flex-col items-center justify-center max-w-5xl mx-auto">
      {/* Title & Introduction */}
      <div className="text-center mb-8 space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4f7]" />
          <span className="text-[10px] font-mono text-[#64748b] tracking-[0.25em] uppercase">
            AUTONOMOUS EMERGENCY MANAGEMENT SYSTEM
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-[0.12em] text-[#e2e8f0]">
          AEGIS DEMONSTRATION
        </h1>
        <p className="text-xs font-mono text-[#94a3b8] tracking-wider max-w-lg mx-auto">
          Select a scenario to demonstrate the system. Each workflow executes deterministic real-world sensor telemetry and responder dispatch.
        </p>
      </div>

      {/* 6-Scenario Cards Grid */}
      <div className="w-full grid md:grid-cols-2 gap-3 mb-6">
        {DEMO_SCENARIOS.map(scenario => {
          const meta = SCENARIO_META[scenario.id];
          const isSelected = selectedId === scenario.id;
          const isRecommended = scenario.recommended || meta?.badge === 'RECOMMENDED';

          return (
            <button
              key={scenario.id}
              onClick={() => setSelectedId(scenario.id)}
              className={`text-left p-4 border rounded-sm transition-all duration-150 relative bg-[#0a1020] cursor-pointer group ${
                isSelected
                  ? 'border-[#00d4f7] bg-[#00d4f7]/5 shadow-[inset_0_0_0_1px_#00d4f7]'
                  : 'border-[#1a2840] hover:border-[#334155] hover:bg-[#0d1526]'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#64748b] font-semibold">{meta?.code} —</span>
                  <span className={`font-mono font-bold text-xs tracking-wider uppercase ${
                    isSelected ? 'text-[#e2e8f0]' : 'text-[#cbd5e1]'
                  }`}>
                    {scenario.name}
                  </span>
                </div>

                {isRecommended && (
                  <span className="text-[8px] font-mono font-bold tracking-widest text-[#00d4f7] bg-[#00d4f7]/10 border border-[#00d4f7]/30 px-1.5 py-0.5 rounded-xs shrink-0">
                    RECOMMENDED
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] font-mono text-[#94a3b8] leading-relaxed mb-3">
                “{scenario.description}”
              </p>

              {/* Footer row: Category & Duration */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1a2840]/60 text-[9px] font-mono text-[#64748b]">
                <span className="uppercase tracking-wider">{scenario.category ?? 'Emergency Safety'}</span>
                <span>~{Math.round(scenario.duration / 1000)} sec</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Confirmation & Configuration Strip */}
      <div className="w-full bg-[#0a1020] border border-[#1a2840] rounded-sm p-4 mb-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a2840] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-[10px] font-mono text-[#10b981] tracking-widest uppercase font-semibold">
                SCENARIO READY
              </span>
            </div>
            <p className="font-mono font-bold text-sm text-[#e2e8f0] mt-0.5">
              {selectedScenario.name.toUpperCase()} — {selectedScenario.category}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono text-[#64748b] uppercase tracking-wider block">Estimated Duration</span>
            <span className="text-xs font-mono text-[#00d4f7] font-semibold">~{Math.round(selectedScenario.duration / 1000)} seconds</span>
          </div>
        </div>

        {/* Real Webcam Ingest Option */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-[#e2e8f0] font-semibold tracking-wide">
              LIVE WEBCAM OVERLAY INGESTION
            </span>
            <p className="text-[10px] font-mono text-[#64748b]">
              Overlays real-time AI skeleton and telemetry on your device's actual video feed instead of simulated footage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setWebcamMode(!state.webcamMode)}
            className={`px-3 py-1.5 text-[10px] font-mono border rounded-sm transition-all cursor-pointer flex items-center gap-2 ${
              state.webcamMode
                ? 'border-[#10b981] bg-[#10b981]/15 text-[#10b981]'
                : 'border-[#1a2840] bg-[#050810] text-[#64748b] hover:text-[#94a3b8] hover:border-[#334155]'
            }`}
          >
            <span>{state.webcamMode ? '✓ WEBCAM ENABLED' : 'USE SIMULATED FEED'}</span>
          </button>
        </div>
      </div>

      {/* Start Button (No auto-start, fully under presenter control) */}
      <div className="w-full">
        <button
          onClick={handleStart}
          className="w-full py-3.5 px-6 font-mono font-bold text-sm sm:text-base tracking-[0.2em] uppercase bg-[#00d4f7] text-[#050b14] hover:bg-[#38bdf8] transition-all rounded-sm cursor-pointer shadow-sm text-center"
        >
          [ START DEMONSTRATION ]
        </button>
      </div>

      {/* Bottom professional notice */}
      <p className="mt-4 text-[9px] font-mono text-[#475569] tracking-widest text-center uppercase">
        STANDALONE PRE-CONFIGURED DEMONSTRATION RUNTIME · PRECISE SENSOR TELEMETRY
      </p>
    </div>
  );
}

export default DemoSelector;
