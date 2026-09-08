import React, { useEffect, useRef, useState } from 'react';
import { useAegis } from '../store/AegisContext';
import { CameraViewer } from '../components/camera/CameraViewer';
import { DEMO_SCENARIOS } from '../demo/data';
import {
  Badge, Button, MetricRow, CountdownRing,
  MonoLabel, Divider, KPICard,
} from '../components/ui';

// Demo Components
import { DemoSelector } from '../components/demo/DemoSelector';
import { AIVisionPanel } from '../components/demo/AIVisionPanel';
import { MovementGraph } from '../components/demo/MovementGraph';
import { VerificationDrama } from '../components/demo/VerificationDrama';
import { EvidenceStack } from '../components/demo/EvidenceStack';
import { ResponderAlert } from '../components/demo/ResponderAlert';
import { IncidentTimeline } from '../components/demo/IncidentTimeline';
import { ResponderDeviceModal } from '../components/demo/ResponderDeviceModal';

function ThermalPanel() {
  const { state } = useAegis();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tickRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      tickRef.current++;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, w, h);

      const t = tickRef.current;
      if (!state.settings.demoThermalMode) {
        ctx.fillStyle = '#1a2840';
        ctx.fillRect(0, 0, w, h);
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.fillText('THERMAL SENSOR', w / 2, h / 2 - 8);
        ctx.fillText('UNAVAILABLE', w / 2, h / 2 + 8);
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Smooth, slow thermal visualization (no aggressive pulsing or flashing)
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#000818');
      bg.addColorStop(1, '#040a18');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const drawHotspot = (cx: number, cy: number, r: number, heat: number, label: string, color: string) => {
        // Very slow breathing (no flashing)
        const anim = Math.sin(t / 80) * 0.04 + 0.98;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * anim);
        if (state.fireDetected && label === 'FIRE') {
          g.addColorStop(0, '#ffffff');
          g.addColorStop(0.15, '#ffdd00');
          g.addColorStop(0.4, '#ff4500');
          g.addColorStop(0.7, '#ff000030');
          g.addColorStop(1, 'transparent');
        } else {
          g.addColorStop(0, color + 'cc');
          g.addColorStop(0.35, color + '60');
          g.addColorStop(0.75, color + '15');
          g.addColorStop(1, 'transparent');
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r * anim, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(label, cx, cy - r * 0.5 - 3);
        ctx.fillText(`${Math.round(heat)}°C`, cx, cy + r * 0.5 + 8);
      };

      // Human signature (calm baseline 36.8°C)
      if (state.fallState !== 'NORMAL') {
        const heatInt = state.fallState === 'EMERGENCY_CONFIRMED' ? 36.4 : 36.7;
        drawHotspot(w * 0.4, h * 0.5, Math.min(w, h) * 0.22, heatInt, 'HUMAN', '#ff4500');
      } else {
        drawHotspot(w * 0.35, h * 0.5, Math.min(w, h) * 0.18, 36.8, 'HUMAN', '#ff6030');
      }

      // Animal
      if (state.animalDetected) {
        drawHotspot(w * 0.7, h * 0.55, Math.min(w, h) * 0.14, 38.2, 'ANIMAL', '#ff8c00');
      }

      // Fire
      if (state.fireDetected) {
        drawHotspot(w * 0.6, h * 0.45, Math.min(w, h) * 0.22, 640, 'FIRE', '#ff4500');
      }

      // Slow scan line
      const scanY = ((t * 0.4) % h);
      ctx.fillStyle = 'rgba(0, 150, 255, 0.03)';
      ctx.fillRect(0, scanY, w, 2);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.fallState, state.animalDetected, state.fireDetected, state.settings.demoThermalMode]);

  return (
    <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a2840] flex items-center justify-between">
        <MonoLabel>THERMAL SENSOR CONTEXT</MonoLabel>
        <span className="text-[9px] font-mono text-[#64748b]">DUAL-SPECTRUM</span>
      </div>
      <canvas ref={canvasRef} width={240} height={140} className="w-full" />
      {state.settings.demoThermalMode && (
        <div className="px-3 py-2 border-t border-[#1a2840] flex items-center justify-between text-[8px] font-mono text-[#64748b]">
          <span>CALIBRATED AMBIENT</span>
          <span className="text-[#00d4f7]">36.8°C NOMINAL</span>
        </div>
      )}
    </div>
  );
}

function StateLabel({ state }: { state: string }) {
  const configs: Record<string, { color: string; label: string }> = {
    NORMAL: { color: '#64748b', label: 'MONITORING' },
    PERSON_DETECTED: { color: '#00d4f7', label: 'PERSON DETECTED' },
    MOVING: { color: '#00d4f7', label: 'MOVEMENT ANALYSIS' },
    POSSIBLE_FALL: { color: '#f59e0b', label: 'POSSIBLE FALL' },
    VERIFYING: { color: '#f59e0b', label: 'VERIFYING INACTIVITY' },
    EMERGENCY_CONFIRMED: { color: '#f43f5e', label: 'EMERGENCY CONFIRMED' },
    RECOVERED: { color: '#10b981', label: 'RECOVERED' },
  };
  const cfg = configs[state] ?? configs['NORMAL'];
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
      <span className="font-mono font-bold text-xs tracking-wider" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

function DemoControlPanel() {
  const { startDemo, resetDemo, triggerFallDetection, triggerFire, triggerAnimalDistress } = useAegis();

  return (
    <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a2840] flex items-center justify-between">
        <MonoLabel>TELEMETRY INJECTION</MonoLabel>
        <span className="text-[8px] font-mono text-[#64748b]">PRESENTER OVERRIDE</span>
      </div>
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-1.5">
          <Button size="sm" variant="danger" onClick={triggerFallDetection}>TRIGGER FALL</Button>
          <Button size="sm" variant="danger" onClick={triggerFire}>TRIGGER FIRE</Button>
          <Button size="sm" variant="secondary" onClick={triggerAnimalDistress}>ANIMAL DISTRESS</Button>
          <Button size="sm" variant="ghost" onClick={resetDemo}>RESET DEMO</Button>
        </div>

        <Divider />

        <div>
          <p className="text-[9px] font-mono text-[#64748b] mb-1.5 tracking-widest uppercase">QUICK SWITCH SCENARIO</p>
          <div className="grid grid-cols-2 gap-1">
            {DEMO_SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => startDemo(s.id)}
                className="text-left px-2 py-1 text-[9px] font-mono border border-[#1a2840] text-[#94a3b8] hover:border-[#334155] hover:text-[#e2e8f0] rounded-xs truncate cursor-pointer"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventTimeline({ eventId }: { eventId: string }) {
  const { state, acceptResponder, resolveEvent } = useAegis();
  const event = state.events.find(e => e.id === eventId);
  if (!event) return null;
  const responder = state.responders.find(r => r.id === event.assignedResponderId);

  return (
    <div className="border border-[#f43f5e]/30 bg-[#f43f5e]/5 rounded-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-[#f43f5e]/20 flex items-center justify-between">
        <MonoLabel>INCIDENT CONSOLE</MonoLabel>
        <span className="text-[8px] font-mono font-bold text-[#f43f5e]">ACTIVE</span>
      </div>
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-mono text-[#f43f5e] font-bold">{event.id}</p>
          <p className="text-[10px] font-mono text-[#e2e8f0]">{event.type.replace('_', ' ')}</p>
          <p className="text-[9px] font-mono text-[#64748b]">{event.location.label}</p>
        </div>

        {/* Timeline */}
        <div className="space-y-1.5">
          {event.timeline.map((entry, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#10b981] text-[9px] mt-0.5">✓</span>
              <div>
                <p className="text-[9px] font-mono text-[#10b981] tracking-wider">{entry.stage}</p>
                <p className="text-[8px] font-mono text-[#475569]">
                  {entry.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                </p>
              </div>
            </div>
          ))}
          {(event.status === 'RESPONDER_ALERTED' || event.status === 'CONFIRMED') && (
            <div className="flex items-start gap-2">
              <span className="text-[#f59e0b] text-[9px] mt-0.5">◉</span>
              <p className="text-[9px] font-mono text-[#f59e0b]">AWAITING RESPONDER ACCEPT</p>
            </div>
          )}
        </div>

        {responder && event.status === 'RESPONDER_ALERTED' && (
          <div className="p-2.5 border border-[#1a2840] bg-[#0a1020] space-y-2">
            <p className="text-[9px] font-mono text-[#64748b]">ASSIGNED UNIT</p>
            <p className="text-xs font-mono text-[#e2e8f0] font-semibold">{responder.name}</p>
            <p className="text-[9px] font-mono text-[#64748b]">{responder.distance}m away</p>
            <Button
              size="sm" variant="success" className="w-full justify-center"
              onClick={() => acceptResponder(event.id, responder.id)}
            >
              [ ACCEPT RESPONSE ]
            </Button>
          </div>
        )}

        {(event.status === 'RESPONDER_ACCEPTED' || event.status === 'EN_ROUTE') && (
          <div className="p-2 border border-[#10b981]/30 bg-[#10b981]/5 text-[9px] font-mono text-[#10b981]">
            ◉ RESPONDER EN ROUTE
          </div>
        )}

        {event.status !== 'RESOLVED' && (
          <Button size="sm" variant="secondary" className="w-full justify-center" onClick={() => resolveEvent(event.id)}>
            MARK RESOLVED
          </Button>
        )}
      </div>
    </div>
  );
}

export function LiveMonitor() {
  const { state, navigate, resetDemo, startDemo, setPresentationMode } = useAegis();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const isDemo = state.mode === 'demo';

  const activeEvent = state.activeEventId
    ? state.events.find(e => e.id === state.activeEventId)
    : null;

  const currentScenario = (state.demoScenarioId
    ? DEMO_SCENARIOS.find(s => s.id === state.demoScenarioId)
    : null) ?? DEMO_SCENARIOS[1] ?? DEMO_SCENARIOS[0];

  // Demo status: READY (before start), RUNNING (during), COMPLETE (when duration reached)
  const isScenarioComplete = isDemo && !state.demoRunning && state.demoElapsed > 0;
  const isScenarioRunning = isDemo && state.demoRunning;
  const isScenarioReady = isDemo && !isScenarioRunning && !isScenarioComplete && state.demoPhase !== 'selector';

  const demoStatusLabel =
    isScenarioRunning ? 'RUNNING' :
    isScenarioComplete ? 'COMPLETE' :
    'READY';

  const demoStatusColor =
    isScenarioRunning ? '#00d4f7' :
    isScenarioComplete ? '#10b981' :
    '#f59e0b';

  const requestLocation = () => {
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      () => setLocationStatus('granted'),
      () => setLocationStatus('denied')
    );
  };

  // If in demo mode and selector phase is active, show the scenario selector
  const showSelector = isDemo && (!state.demoRunning && (state.demoPhase === 'selector' || (!state.demoScenarioId && state.fallState === 'NORMAL' && state.demoElapsed === 0)));

  if (showSelector) {
    return <DemoSelector />;
  }

  // Calculate elapsed progress
  const scenarioDuration = currentScenario?.duration ?? 45000;
  const progressPercent = Math.min(100, Math.round((state.demoElapsed / scenarioDuration) * 100));

  return (
    <div className={`p-4 space-y-4 min-h-full ${state.presentationMode ? 'max-w-[1700px] mx-auto' : ''}`}>
      {/* 6. Clean Demo Header */}
      <div className="bg-[#0a1020] border border-[#1a2840] rounded-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#64748b] tracking-[0.2em] uppercase font-semibold">
                {isDemo ? 'AEGIS DEMONSTRATION' : 'AEGIS MONITOR'}
              </span>
              {state.webcamMode && isDemo && (
                <span className="text-[8px] font-mono bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 px-1.5 py-0.5 rounded font-semibold">
                  LIVE WEBCAM ACTIVE
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono">
              <div>
                <span className="text-[#64748b]">Scenario: </span>
                <span className="font-bold text-[#e2e8f0] uppercase">
                  {currentScenario ? currentScenario.name : 'MANUAL SIMULATION'}
                </span>
              </div>

              <div>
                <span className="text-[#64748b]">Mode: </span>
                <span className="font-bold text-[#f59e0b]">DEMO</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#64748b]">Status: </span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: demoStatusColor }} />
                <span className="font-bold" style={{ color: demoStatusColor }}>
                  {demoStatusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Start Button if Ready */}
            {isScenarioReady && currentScenario && (
              <button
                onClick={() => startDemo(currentScenario.id)}
                className="px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider uppercase bg-[#00d4f7] text-[#050b14] hover:bg-[#38bdf8] rounded-sm transition-all cursor-pointer"
              >
                [ START DEMONSTRATION ]
              </button>
            )}

            {/* Run Again when Complete */}
            {isScenarioComplete && currentScenario && (
              <button
                onClick={() => startDemo(currentScenario.id)}
                className="px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase bg-[#10b981] text-[#050b14] hover:bg-[#34d399] rounded-sm transition-all cursor-pointer"
              >
                [ ↺ RUN AGAIN ]
              </button>
            )}

            {/* Reset Demo Button (Immediate clean reset) */}
            <button
              onClick={resetDemo}
              className="px-3 py-1.5 text-[11px] font-mono border border-[#1a2840] text-[#94a3b8] hover:border-[#475569] hover:text-[#e2e8f0] bg-[#050810] rounded-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>↺</span>
              <span>RESET DEMO</span>
            </button>

            {/* Select Another Scenario */}
            <button
              onClick={resetDemo}
              className="px-3 py-1.5 text-[11px] font-mono border border-[#1a2840] text-[#94a3b8] hover:border-[#475569] hover:text-[#e2e8f0] bg-[#050810] rounded-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>☰</span>
              <span>SELECT SCENARIO</span>
            </button>

            {/* Second Device / Responder Phone Simulator Modal */}
            <button
              onClick={() => setShowPhoneModal(true)}
              className="px-3 py-1.5 text-[11px] font-mono border border-[#00d4f7]/30 text-[#00d4f7] hover:bg-[#00d4f7]/10 bg-[#00d4f7]/5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5"
              title="Open Responder Handset Simulator or use #responder on your mobile phone"
            >
              <span>📱</span>
              <span>RESPONDER PHONE</span>
            </button>

            {/* Presentation Mode Toggle */}
            <button
              onClick={() => setPresentationMode(!state.presentationMode)}
              className={`px-3 py-1.5 text-[11px] font-mono border rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                state.presentationMode
                  ? 'border-[#10b981] bg-[#10b981]/15 text-[#10b981]'
                  : 'border-[#1a2840] text-[#64748b] hover:text-[#94a3b8] bg-[#050810]'
              }`}
            >
              <span>⛶</span>
              <span>{state.presentationMode ? 'EXIT PRESENTATION' : 'PRESENTATION MODE'}</span>
            </button>
          </div>
        </div>

        {/* Linear duration progress bar (smooth, calm, non-blinking) */}
        {isScenarioRunning && (
          <div className="mt-3 pt-3 border-t border-[#1a2840] flex items-center gap-3">
            <div className="flex-1 bg-[#050810] h-1.5 rounded-full overflow-hidden border border-[#1a2840]">
              <div
                className="bg-[#00d4f7] h-full transition-all duration-200 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-[#64748b]">
              {Math.floor(state.demoElapsed / 1000)}s / {Math.floor(scenarioDuration / 1000)}s
            </span>
          </div>
        )}
      </div>

      {/* Emergency Confirmed Notice — Stable, calm, high-contrast, NO flashing */}
      {state.fallState === 'EMERGENCY_CONFIRMED' && (
        <div className="p-4 bg-[#f43f5e]/10 border-2 border-[#f43f5e] rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-mono font-bold text-sm text-[#f43f5e] tracking-wider">
                AEGIS AUTONOMOUS EMERGENCY PROTOCOL ACTIVATED
              </p>
              <p className="text-xs font-mono text-[#cbd5e1] mt-0.5">
                {activeEvent?.location?.label ?? 'Remote Service Road'} — IMMOBILITY CONFIRMED · NEARBY UNIT ALERTED
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={() => navigate('emergencies')}>
              VIEW INCIDENT →
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid: Left (Primary Camera + Graph + Telemetry), Right (AI Intelligence Stack) */}
      <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_390px] gap-4">
        {/* Left Column: Visual Focus */}
        <div className="space-y-4">
          {/* Primary Camera Viewer */}
          <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-[#1a2840] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <MonoLabel>OPTICAL FEED</MonoLabel>
                <Badge label={state.activeDeviceId ?? 'AEGIS-CAM-004'} color="gray" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-[#64748b]">1080p · 30 FPS</span>
                <StateLabel state={state.fallState} />
              </div>
            </div>
            <div className="p-3">
              <CameraViewer deviceId={state.activeDeviceId ?? undefined} />
            </div>
          </div>

          {/* Real-time Movement Velocity Graph */}
          <MovementGraph />

          {/* Geographic & Situational Coordinates */}
          <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm">
            <div className="px-3 py-2 border-b border-[#1a2840] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#00d4f7]">◎</span>
                <MonoLabel>GEOSPATIAL & SENSOR TELEMETRY</MonoLabel>
              </div>
              <Badge
                label={isDemo ? 'SIMULATED GPS' : locationStatus === 'granted' ? 'GPS ACTIVE' : 'GPS INACTIVE'}
                color={locationStatus === 'granted' ? 'green' : isDemo ? 'amber' : 'gray'}
              />
            </div>
            <div className="p-3">
              {isDemo ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <MonoLabel dim>COORDINATES</MonoLabel>
                    <p className="font-mono text-xs text-[#00d4f7] mt-1 font-semibold">12.9698° N, 77.5930° E</p>
                  </div>
                  <div>
                    <MonoLabel dim>ZONE DESIGNATION</MonoLabel>
                    <p className="font-mono text-xs text-[#94a3b8] mt-1 truncate">
                      {state.activeDeviceId === 'AEGIS-CAM-004' ? 'Remote Service Rd — Sector 4' : 'Campus Main Courtyard'}
                    </p>
                  </div>
                  <div>
                    <MonoLabel dim>ENVIRONMENT</MonoLabel>
                    <p className="font-mono text-xs text-[#94a3b8] mt-1">420 LUX · CLEAR VISIBILITY</p>
                  </div>
                  <div>
                    <MonoLabel dim>MESH LINK</MonoLabel>
                    <p className="font-mono text-xs text-[#10b981] mt-1">99.8% LORA + 5G BACKHAUL</p>
                  </div>
                </div>
              ) : locationStatus === 'idle' ? (
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-mono text-[#64748b]">Device location permissions needed</p>
                  <Button size="sm" variant="primary" onClick={requestLocation}>REQUEST GPS</Button>
                </div>
              ) : locationStatus === 'requesting' ? (
                <p className="text-[10px] font-mono text-[#64748b]">Requesting location coordinates...</p>
              ) : locationStatus === 'denied' ? (
                <p className="text-[10px] font-mono text-[#f43f5e]">LOCATION UNAVAILABLE — permission denied</p>
              ) : (
                <p className="text-[10px] font-mono text-[#10b981]">GPS Telemetry Locked</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Intelligence & Protocol Lifecycle */}
        <div className="space-y-4">
          {/* 1. AI Vision Narrative Panel */}
          <AIVisionPanel />

          {/* 2. Verification Drama (Clean countdown ring, stable emergency state) */}
          <VerificationDrama />

          {/* 3. Evidence Accumulation Stack & Severity Output */}
          <EvidenceStack />

          {/* 4. Incident 7-Stage Timeline (01 MONITOR to 07 RESPOND) */}
          <IncidentTimeline />

          {/* 5. Responder Alert Card */}
          <ResponderAlert />

          {/* 6. Dual-Spectrum Thermal Visualization */}
          <ThermalPanel />

          {/* 7. Active Incident (when viewed outside demo responder card) */}
          {activeEvent && activeEvent.status !== 'RESOLVED' && !isDemo && (
            <EventTimeline eventId={activeEvent.id} />
          )}

          {/* 8. Demo Controls (Presenter Manual Injections) */}
          {isDemo && !state.presentationMode && <DemoControlPanel />}

          {/* 9. Live Mode Fall State Machine (fallback in non-demo mode) */}
          {!isDemo && (
            <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm">
              <div className="px-3 py-2 border-b border-[#1a2840]">
                <MonoLabel>FALL STATE MACHINE</MonoLabel>
              </div>
              <div className="p-3 space-y-3">
                {[
                  { key: 'NORMAL', label: 'MONITORING' },
                  { key: 'PERSON_DETECTED', label: 'PERSON DETECTED' },
                  { key: 'POSSIBLE_FALL', label: 'POSSIBLE FALL' },
                  { key: 'VERIFYING', label: 'VERIFYING' },
                  { key: 'EMERGENCY_CONFIRMED', label: 'EMERGENCY' },
                ].map((step, i) => {
                  const states = ['NORMAL', 'PERSON_DETECTED', 'POSSIBLE_FALL', 'VERIFYING', 'EMERGENCY_CONFIRMED', 'RECOVERED'];
                  const currentIdx = states.indexOf(state.fallState);
                  const stepIdx = states.indexOf(step.key);
                  const isPast = currentIdx > stepIdx;
                  const isCurrent = state.fallState === step.key ||
                    (step.key === 'EMERGENCY_CONFIRMED' && state.fallState === 'RECOVERED');
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-sm border text-[8px] font-mono flex items-center justify-center
                        ${isPast ? 'border-[#10b981]/40 text-[#10b981] bg-[#10b981]/10' :
                          isCurrent ? (step.key === 'EMERGENCY_CONFIRMED' ? 'border-[#f43f5e] text-[#f43f5e] bg-[#f43f5e]/10' : 'border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10') :
                          'border-[#1a2840] text-[#1a2840]'}`}
                      >
                        {isPast ? '✓' : i + 1}
                      </div>
                      <span className={`text-[10px] font-mono tracking-wider ${
                        isCurrent ? 'text-[#e2e8f0]' : isPast ? 'text-[#64748b]' : 'text-[#1a2840]'
                      }`}>
                        {step.label}
                      </span>
                      {step.key === 'VERIFYING' && state.fallState === 'VERIFYING' && (
                        <CountdownRing seconds={state.verifyCountdown} total={state.settings.fallVerificationSeconds} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Fleet Health Stats */}
          {!state.presentationMode && (
            <div className="grid grid-cols-2 gap-2">
              <KPICard
                label="NODES"
                value={state.devices.filter(d => d.status !== 'offline').length}
                sub={`${state.devices.length} REGISTERED`}
                accent="text-[#00d4f7]"
              />
              <KPICard
                label="DISPATCHES"
                value={state.events.filter(e => e.status !== 'RESOLVED').length}
                sub="ACTIVE INCIDENTS"
                accent={state.events.filter(e => e.status !== 'RESOLVED').length > 0 ? 'text-[#f43f5e]' : 'text-[#10b981]'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Responder Phone Simulator Modal */}
      {showPhoneModal && (
        <ResponderDeviceModal onClose={() => setShowPhoneModal(false)} />
      )}
    </div>
  );
}

export default LiveMonitor;
