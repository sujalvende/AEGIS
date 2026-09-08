import React, { useEffect, useRef, useState } from 'react';
import { useAegis } from '../store/AegisContext';

function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const tick = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const NODES: { x: number; y: number; label: string; color: string; type: string }[] = [];
    const rebuild = () => {
      NODES.length = 0;
      const w = canvas.width, h = canvas.height;
      [
        { xF: 0.12, yF: 0.25, label: 'CAM-01\nMAIN ENTRANCE', color: '#10b981', type: 'cam' },
        { xF: 0.28, yF: 0.65, label: 'CAM-02\nPARKING', color: '#10b981', type: 'cam' },
        { xF: 0.45, yF: 0.3, label: 'CAM-03\nCORRIDOR', color: '#10b981', type: 'cam' },
        { xF: 0.62, yF: 0.7, label: 'CAM-04\nREMOTE ROAD', color: '#f59e0b', type: 'cam' },
        { xF: 0.8, yF: 0.35, label: 'CAM-05\nSPORTS AREA', color: '#475569', type: 'cam' },
        { xF: 0.5, yF: 0.5, label: 'AEGIS AI\nCORE', color: '#00d4f7', type: 'core' },
        { xF: 0.15, yF: 0.85, label: 'RESPONDER', color: '#00d4f7', type: 'resp' },
        { xF: 0.85, yF: 0.8, label: 'ADMIN', color: '#94a3b8', type: 'admin' },
      ].forEach(({ xF, yF, label, color, type }) => {
        NODES.push({ x: xF * w, y: yF * h, label, color, type });
      });
    };
    rebuild();
    ro.observe(canvas);

    const EDGES = [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 6], [5, 7]];

    const draw = () => {
      tick.current++;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep background
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(26,40,64,0.4)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Data pulses along edges
      EDGES.forEach(([a, b]) => {
        const na = NODES[a], nb = NODES[b];
        if (!na || !nb) return;
        const phase = (tick.current / 80 + a * 0.3) % 1;
        const px = na.x + (nb.x - na.x) * phase;
        const py = na.y + (nb.y - na.y) * phase;

        ctx.strokeStyle = na.color + '30';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();

        const g = ctx.createRadialGradient(px, py, 0, px, py, 4);
        g.addColorStop(0, na.color + 'cc');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      });

      // Scan line
      const sy = ((tick.current * 1.2) % h);
      const sg = ctx.createLinearGradient(0, sy - 8, 0, sy + 2);
      sg.addColorStop(0, 'transparent');
      sg.addColorStop(1, 'rgba(0,212,247,0.03)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 8, w, 10);

      // Nodes
      NODES.forEach(n => {
        const isCore = n.type === 'core';
        const r = isCore ? 18 : 10;
        const pulseR = r + 5 + Math.sin(tick.current / 30 + NODES.indexOf(n)) * 3;

        const gOut = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulseR);
        gOut.addColorStop(0, n.color + '20');
        gOut.addColorStop(1, 'transparent');
        ctx.fillStyle = gOut;
        ctx.beginPath(); ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = n.color + '20';
        ctx.strokeStyle = n.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        if (isCore) {
          ctx.strokeStyle = n.color + '30';
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 12, 0, Math.PI * 2); ctx.stroke();
        }

        ctx.font = isCore ? 'bold 8px JetBrains Mono, monospace' : '7px JetBrains Mono, monospace';
        ctx.fillStyle = n.color;
        ctx.textAlign = 'center';
        n.label.split('\n').forEach((line, i) => {
          ctx.fillText(line, n.x, n.y + r + 12 + i * 10);
        });
      });

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}

const STEPS = [
  { id: '01', title: 'DETECT', desc: 'Computer vision continuously scans authorized camera feeds for people, animals, vehicles, and environmental hazards.' },
  { id: '02', title: 'VERIFY', desc: 'Before declaring an emergency, AEGIS runs a configurable verification window — eliminating false positives.' },
  { id: '03', title: 'ASSESS', desc: 'Multi-factor severity engine weighs motion, duration, thermal context, and location to determine priority.' },
  { id: '04', title: 'LOCATE', desc: 'GPS and device mapping give precise coordinates — critical for remote areas where nobody nearby can help.' },
  { id: '05', title: 'ALERT', desc: 'Nearest appropriate registered responders receive immediate realtime alerts with location and event context.' },
  { id: '06', title: 'RESPOND', desc: 'Responders accept, update status, and the admin sees the entire chain of response in real time.' },
];

const CAPABILITIES = [
  { icon: '◈', title: 'Fall Detection', desc: 'Pose estimation detects sudden downward movement and sustained motionlessness.' },
  { icon: '◎', title: 'Fire & Smoke', desc: 'RGB camera analysis combined with optional thermal hotspot detection.' },
  { icon: '◉', title: 'Animal Monitoring', desc: 'Posture and movement analysis detects possible animal distress over time.' },
  { icon: '⬡', title: 'Thermal Intelligence', desc: 'Demo thermal visualization; architecture supports real thermal cameras.' },
  { icon: '∿', title: 'Severity Engine', desc: 'NORMAL → LOW → MEDIUM → HIGH → CRITICAL based on combined signals.' },
  { icon: '⊞', title: 'Multi-Camera', desc: 'Up to hundreds of devices monitored from a single command-center dashboard.' },
  { icon: '◆', title: 'Responder Network', desc: 'Registered responders matched by proximity, availability, and emergency type.' },
  { icon: '⊛', title: 'Remote Areas', desc: 'Strongest value where no human observer is nearby — AEGIS is the only watcher.' },
];

export function Landing() {
  const { navigate, setMode } = useAegis();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep(s => (s + 1) % STEPS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-full bg-[#050810] text-[#e2e8f0]">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col">
        {/* Top nav */}
        <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#1a2840]">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4f7] animate-pulse" />
            <span className="font-display font-bold text-xl tracking-[0.25em]">AEGIS</span>
            <span className="text-[9px] font-mono text-[#475569] tracking-widest hidden sm:block">AI EMERGENCY GUARDIAN</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMode('demo'); navigate('monitor'); }}
              className="px-4 py-2 text-[10px] font-mono tracking-widest uppercase text-[#f59e0b] border border-[#f59e0b]/30 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 transition-all rounded-sm"
            >
              ◆ DEMO MODE
            </button>
            <button
              onClick={() => { setMode('live'); navigate('monitor'); }}
              className="px-4 py-2 text-[10px] font-mono tracking-widest uppercase text-[#00d4f7] border border-[#00d4f7]/30 bg-[#00d4f7]/5 hover:bg-[#00d4f7]/15 transition-all rounded-sm"
            >
              LAUNCH CONSOLE
            </button>
          </div>
        </header>

        {/* Hero grid */}
        <div className="flex-1 grid lg:grid-cols-2 items-center px-8 lg:px-16 py-12 gap-8 max-w-7xl mx-auto w-full">
          {/* Left: Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4f7] animate-pulse" />
                <span className="text-[9px] font-mono text-[#475569] tracking-[0.3em] uppercase">Prototype v0.1 — Student Innovation Competition</span>
              </div>
              <h1 className="font-display font-bold text-6xl lg:text-7xl tracking-[0.06em] leading-none">
                AEGIS
              </h1>
              <p className="text-[#00d4f7] font-display font-medium text-xl tracking-wider">
                AI-Powered Emergency Guardian<br />& Intelligent Safety System
              </p>
              <p className="font-mono text-[#64748b] text-sm tracking-[0.2em] uppercase">
                Detect · Verify · Assess · Locate · Alert · Respond
              </p>
            </div>

            <p className="text-[#94a3b8] text-sm leading-relaxed max-w-md font-body">
              AEGIS continuously monitors authorized camera feeds across an environment and automatically identifies, verifies, and responds to human, animal, and environmental emergencies — including in remote areas where no one is nearby to observe.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setMode('demo'); navigate('monitor'); }}
                className="px-6 py-3 font-mono text-xs tracking-widest uppercase bg-[#00d4f7]/10 border border-[#00d4f7]/40 text-[#00d4f7] hover:bg-[#00d4f7]/20 hover:border-[#00d4f7]/70 transition-all rounded-sm"
              >
                ◉ LAUNCH MONITOR
              </button>
              <button
                onClick={() => navigate('overview')}
                className="px-6 py-3 font-mono text-xs tracking-widest uppercase bg-white/5 border border-[#1a2840] text-[#94a3b8] hover:bg-white/10 hover:text-[#e2e8f0] transition-all rounded-sm"
              >
                VIEW OVERVIEW
              </button>
            </div>

            {/* Live metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1a2840]">
              {[
                { label: 'CAMERAS', value: '6' },
                { label: 'AI CLASSES', value: '5+' },
                { label: 'RESPONSE', value: '<30s' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-display font-bold text-2xl text-[#00d4f7]">{value}</p>
                  <p className="text-[9px] font-mono text-[#475569] tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Animated network canvas */}
          <div className="relative h-80 lg:h-96 border border-[#1a2840] rounded-sm overflow-hidden bg-[#050810]">
            <HeroCanvas />
            <div className="absolute bottom-3 left-3 text-[8px] font-mono text-[#475569]">
              AEGIS DEVICE NETWORK — REALTIME MONITORING
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pb-6 flex justify-center">
          <div className="flex flex-col items-center gap-1 text-[#1a2840]">
            <span className="text-xs font-mono">▾</span>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ─────────────────────────────────────── */}
      <section className="py-24 px-8 lg:px-16 border-t border-[#1a2840] max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <p className="text-[9px] font-mono text-[#475569] tracking-[0.3em] mb-4">01 — THE PROBLEM</p>
          <h2 className="font-display font-bold text-4xl lg:text-5xl mb-6 text-[#e2e8f0]">
            EMERGENCIES HAPPEN<br />WHEN NOBODY IS WATCHING.
          </h2>
          <p className="text-[#64748b] leading-relaxed mb-8 text-sm">
            A person falls on a remote campus road at 2 AM. An animal shows signs of distress in an unoccupied care area. A fire starts in an unmanned warehouse. These emergencies often go undetected until it is too late — not because cameras aren't present, but because no human operator is watching every feed, every second.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { stat: '40%', desc: 'of emergencies occur outside peak hours' },
              { stat: '6 min', desc: 'average delay before unwitnessed incidents are reported' },
              { stat: '∞', desc: 'cameras one person can watch simultaneously' },
            ].map(({ stat, desc }) => (
              <div key={stat} className="p-4 border border-[#1a2840] bg-[#0a1020]">
                <p className="font-display font-bold text-3xl text-[#f43f5e] mb-1">{stat}</p>
                <p className="text-[10px] font-mono text-[#64748b] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-24 border-t border-[#1a2840] bg-[#0a1020]">
        <div className="px-8 lg:px-16 max-w-7xl mx-auto">
          <p className="text-[9px] font-mono text-[#475569] tracking-[0.3em] mb-4">02 — HOW AEGIS WORKS</p>
          <h2 className="font-display font-bold text-4xl mb-12">THE AEGIS WORKFLOW</h2>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Step list */}
            <div className="space-y-1">
              {STEPS.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(i)}
                  className={`w-full text-left p-4 border-l-2 transition-all ${
                    activeStep === i
                      ? 'border-[#00d4f7] bg-[#00d4f7]/5'
                      : 'border-[#1a2840] hover:border-[#1a2840] hover:bg-white/3'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-[#475569]">{step.id}</span>
                    <span className={`font-display font-bold text-lg tracking-wider ${activeStep === i ? 'text-[#00d4f7]' : 'text-[#64748b]'}`}>
                      {step.title}
                    </span>
                  </div>
                  {activeStep === i && (
                    <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed font-body">
                      {step.desc}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Visual step diagram */}
            <div className="relative">
              <div className="space-y-3">
                {STEPS.map((step, i) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-3 border rounded-sm transition-all ${
                      i < activeStep
                        ? 'border-[#10b981]/30 bg-[#10b981]/5'
                        : i === activeStep
                        ? 'border-[#00d4f7]/40 bg-[#00d4f7]/8 animate-pulse'
                        : 'border-[#1a2840] opacity-30'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-sm border flex items-center justify-center text-[9px] font-mono ${
                      i < activeStep ? 'border-[#10b981]/40 text-[#10b981]' :
                      i === activeStep ? 'border-[#00d4f7]/40 text-[#00d4f7]' :
                      'border-[#1a2840] text-[#475569]'
                    }`}>
                      {i < activeStep ? '✓' : step.id}
                    </div>
                    <span className={`font-display font-semibold text-sm tracking-wider ${
                      i < activeStep ? 'text-[#10b981]' :
                      i === activeStep ? 'text-[#00d4f7]' :
                      'text-[#475569]'
                    }`}>
                      {step.title}
                    </span>
                    {i === activeStep && (
                      <span className="ml-auto text-[9px] font-mono text-[#00d4f7] animate-blink">ACTIVE</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────────────────────── */}
      <section className="py-24 border-t border-[#1a2840] px-8 lg:px-16 max-w-7xl mx-auto">
        <p className="text-[9px] font-mono text-[#475569] tracking-[0.3em] mb-4">03 — CAPABILITIES</p>
        <h2 className="font-display font-bold text-4xl mb-12">ONE PLATFORM.<br />MULTIPLE EMERGENCIES.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1a2840]">
          {CAPABILITIES.map(cap => (
            <div key={cap.title} className="bg-[#050810] p-5 hover:bg-[#0a1020] transition-colors group">
              <span className="text-[#00d4f7] text-xl mb-3 block group-hover:scale-110 transition-transform">{cap.icon}</span>
              <h3 className="font-display font-semibold text-sm tracking-wider text-[#e2e8f0] mb-2">{cap.title}</h3>
              <p className="text-[10px] text-[#64748b] leading-relaxed font-body">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── REMOTE AREA VALUE ─────────────────────────────────── */}
      <section className="py-24 border-t border-[#1a2840] bg-[#0a1020]">
        <div className="px-8 lg:px-16 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-[9px] font-mono text-[#475569] tracking-[0.3em]">04 — REMOTE AREA STRENGTH</p>
            <h2 className="font-display font-bold text-4xl">
              AEGIS WATCHES<br />WHEN NOBODY ELSE CAN.
            </h2>
            <p className="text-[#64748b] text-sm leading-relaxed">
              The strongest value proposition of AEGIS is in environments where human presence is sparse or absent. Remote roads, isolated warehouses, unoccupied animal care areas, overnight campus corridors — these are exactly the scenarios where traditional CCTV offers no help.
            </p>
            <div className="space-y-3">
              {['Remote service roads', 'Warehouses and industrial areas', 'After-hours campus zones', 'Rural animal care facilities', 'Isolated parking areas'].map(loc => (
                <div key={loc} className="flex items-center gap-3 text-xs font-mono text-[#64748b]">
                  <span className="text-[#00d4f7]">→</span> {loc}
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 border border-[#1a2840] space-y-4 bg-[#050810]">
            <div className="text-[9px] font-mono text-[#475569] tracking-widest">SCENARIO: REMOTE FALL</div>
            <div className="space-y-2">
              {[
                { t: '00:00', label: 'MONITORING', color: '#475569' },
                { t: '00:03', label: 'PERSON DETECTED', color: '#00d4f7' },
                { t: '00:05', label: 'FALL DETECTED', color: '#f59e0b' },
                { t: '00:05–15', label: 'VERIFYING...', color: '#f59e0b' },
                { t: '00:15', label: 'EMERGENCY CONFIRMED', color: '#f43f5e' },
                { t: '00:17', label: 'LOCATION IDENTIFIED', color: '#f43f5e' },
                { t: '00:18', label: 'RESPONDER ALERTED', color: '#f43f5e' },
                { t: '00:20', label: 'RESPONDER ACCEPTED', color: '#f59e0b' },
                { t: '00:21', label: 'RESPONDER EN ROUTE', color: '#10b981' },
              ].map(({ t, label, color }) => (
                <div key={t} className="flex items-center gap-4">
                  <span className="text-[9px] font-mono text-[#475569] w-16 shrink-0">{t}</span>
                  <span className="text-[9px] font-mono" style={{ color }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── THERMAL ─────────────────────────────────────────── */}
      <section className="py-24 border-t border-[#1a2840] px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Thermal demo visual */}
          <div className="h-48 relative overflow-hidden border border-[#1a2840] bg-[#050810] rounded-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full" style={{
                  background: 'radial-gradient(circle, #f43f5e80 0%, #f59e0b60 30%, #1e40af40 60%, transparent 80%)',
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] font-mono text-white/60">HUMAN<br />SIG</span>
                </div>
              </div>
              <div className="absolute right-16 bottom-12">
                <div className="w-12 h-12 rounded-full" style={{
                  background: 'radial-gradient(circle, #f5960080 0%, #1e3a8a60 60%, transparent 80%)',
                }} />
                <span className="text-[7px] font-mono text-[#f59e0b]">ANIMAL</span>
              </div>
            </div>
            <div className="absolute top-2 left-2 text-[8px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-1">
              DEMO THERMAL MODE
            </div>
            <div className="absolute bottom-2 left-2 text-[8px] font-mono text-[#475569]">
              SIMULATED THERMAL VISUALIZATION — NOT A REAL SENSOR
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-mono text-[#475569] tracking-[0.3em]">05 — THERMAL INTELLIGENCE</p>
            <h2 className="font-display font-bold text-4xl">THERMAL CONTEXT<br />WHERE AVAILABLE</h2>
            <p className="text-[#64748b] text-sm leading-relaxed">
              AEGIS architecture supports real thermal camera integration. For demonstration, a clearly labelled simulated thermal visualization is available showing human signatures, animal signatures, and fire hotspots. The UI explicitly explains this is not a real thermal measurement.
            </p>
            <div className="p-3 border border-[#f59e0b]/20 bg-[#f59e0b]/5 text-[10px] font-mono text-[#f59e0b] leading-relaxed">
              "Thermal imaging provides additional environmental and apparent surface-temperature context. It is not a medical diagnostic system."
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 border-t border-[#1a2840] bg-[#0a1020]">
        <div className="px-8 lg:px-16 max-w-4xl mx-auto text-center space-y-8">
          <p className="text-[9px] font-mono text-[#475569] tracking-[0.3em]">06 — LAUNCH AEGIS</p>
          <h2 className="font-display font-bold text-5xl lg:text-6xl">
            READY TO<br />START MONITORING?
          </h2>
          <p className="text-[#64748b] text-sm max-w-xl mx-auto">
            Demo Mode works without any external hardware. Live Mode activates your browser's webcam for real detection. Both modes share the same AEGIS workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { setMode('demo'); navigate('monitor'); }}
              className="px-8 py-4 font-mono text-sm tracking-widest uppercase bg-[#f59e0b]/10 border border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/20 transition-all rounded-sm"
            >
              ◆ DEMO MODE — NO HARDWARE NEEDED
            </button>
            <button
              onClick={() => { setMode('live'); navigate('monitor'); }}
              className="px-8 py-4 font-mono text-sm tracking-widest uppercase bg-[#00d4f7]/10 border border-[#00d4f7]/40 text-[#00d4f7] hover:bg-[#00d4f7]/20 transition-all rounded-sm"
            >
              ● LIVE MODE — USE WEBCAM
            </button>
          </div>
          <p className="text-[9px] font-mono text-[#1a2840]">
            CURRENT PROTOTYPE — v0.1 — STUDENT INNOVATION COMPETITION SUBMISSION
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-[#1a2840] px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4f7]" />
            <span className="text-[9px] font-mono text-[#475569] tracking-widest">AEGIS AI GUARDIAN SYSTEM — PROTOTYPE</span>
          </div>
          <span className="text-[9px] font-mono text-[#1a2840]">NOT FOR PRODUCTION USE</span>
        </div>
      </footer>
    </div>
  );
}
