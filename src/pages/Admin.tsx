import React, { useState } from 'react';
import { useAegis } from '../store/AegisContext';
import { KPICard, SectionHeader, Button, DeviceStatusBadge, SeverityBadge, EmergencyStatusBadge, MonoLabel } from '../components/ui';
import { DEMO_SCENARIOS } from '../demo/data';

export function Admin() {
  const { state, startDemo, resetDemo, acceptResponder, resolveEvent } = useAegis();
  const [liveViewDevice, setLiveViewDevice] = useState<string | null>(null);

  const activeEvents = state.events.filter(e => e.status !== 'RESOLVED');
  const streamingDevices = state.devices.filter(d => d.isStreaming);
  const offlineDevices = state.devices.filter(d => d.status === 'offline');
  const availableResponders = state.responders.filter(r => r.status === 'available');

  return (
    <div className="p-4 space-y-6">
      <SectionHeader
        title="ADMIN DASHBOARD"
        sub="AEGIS / COMMAND CENTER"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-[#475569]">
              LAST UPDATE: {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <KPICard
          label="TOTAL DEVICES"
          value={state.devices.length}
          sub="REGISTERED"
          accent="text-[#e2e8f0]"
        />
        <KPICard
          label="STREAMING"
          value={streamingDevices.length}
          sub="ACTIVE FEEDS"
          accent="text-[#10b981]"
        />
        <KPICard
          label="ONLINE IDLE"
          value={state.devices.filter(d => d.status === 'online').length}
          sub="CONNECTED"
          accent="text-[#00d4f7]"
        />
        <KPICard
          label="OFFLINE"
          value={offlineDevices.length}
          sub="UNREACHABLE"
          accent={offlineDevices.length > 1 ? 'text-[#f59e0b]' : 'text-[#475569]'}
        />
        <KPICard
          label="ACTIVE INCIDENTS"
          value={activeEvents.length}
          sub="UNRESOLVED"
          accent={activeEvents.length > 0 ? 'text-[#f43f5e]' : 'text-[#10b981]'}
        />
        <KPICard
          label="RESPONDERS"
          value={`${availableResponders.length}/${state.responders.length}`}
          sub="AVAILABLE"
          accent="text-[#00d4f7]"
        />
      </div>

      {/* Emergency alert strip */}
      {activeEvents.length > 0 && (
        <div className="p-4 border border-[#f43f5e]/30 bg-[#f43f5e]/5 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono font-bold text-[#f43f5e] tracking-wider">
              🚨 {activeEvents.length} ACTIVE EMERGENCY{activeEvents.length > 1 ? 'S' : ''}
            </p>
          </div>
          <div className="space-y-2">
            {activeEvents.map(evt => {
              const responder = state.responders.find(r => r.id === evt.assignedResponderId);
              return (
                <div key={evt.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#1a2840] last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <SeverityBadge level={evt.severity} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-[#e2e8f0] font-semibold">{evt.id}</p>
                      <p className="text-[9px] font-mono text-[#64748b] truncate">{evt.location.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EmergencyStatusBadge status={evt.status} />
                    {evt.status === 'RESPONDER_ALERTED' && responder && (
                      <Button size="sm" variant="success" onClick={() => acceptResponder(evt.id, responder.id)}>
                        ACCEPT
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => resolveEvent(evt.id)}>
                      RESOLVE
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-column: devices + responders */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Camera feed overview */}
        <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a2840] flex items-center justify-between">
            <MonoLabel>DEVICE NETWORK</MonoLabel>
            <span className="text-[9px] font-mono text-[#64748b]">{state.devices.length} REGISTERED</span>
          </div>
          <div className="divide-y divide-[#1a2840]">
            {state.devices.map(device => (
              <div
                key={device.id}
                className={`flex items-center justify-between px-4 py-3 hover:bg-[#0f1928] transition-colors cursor-pointer ${
                  device.status === 'emergency' ? 'bg-[#f43f5e]/5' : ''
                }`}
                onClick={() => setLiveViewDevice(liveViewDevice === device.id ? null : device.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    device.status === 'emergency' ? 'bg-[#f43f5e] animate-pulse' :
                    device.isStreaming ? 'bg-[#10b981] animate-pulse' :
                    device.status === 'offline' ? 'bg-[#475569]' :
                    'bg-[#00d4f7]'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-[#00d4f7] font-semibold">{device.id}</p>
                    <p className="text-[9px] font-mono text-[#64748b] truncate">{device.location.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <DeviceStatusBadge status={device.status} />
                  {device.isStreaming && (
                    <span className="text-[9px] font-mono text-[#10b981]">
                      {device.fps ?? 0} fps
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {liveViewDevice && (
            <div className="border-t border-[#1a2840] p-4 bg-[#050810]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-mono text-[#00d4f7]">{liveViewDevice} — LIVE VIEW</p>
                <button onClick={() => setLiveViewDevice(null)} className="text-[#475569] font-mono text-xs">✕</button>
              </div>
              <div className="aspect-video bg-[#0a1020] border border-[#1a2840] flex items-center justify-center rounded-sm">
                <div className="text-center space-y-2">
                  <p className="text-[9px] font-mono text-[#475569]">STREAM PREVIEW</p>
                  <p className="text-[8px] font-mono text-[#1a2840]">Select Monitor to view live feed</p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="primary">WATCH LIVE</Button>
                    <Button size="sm" variant="secondary">FULLSCREEN</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Responders panel */}
        <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a2840] flex items-center justify-between">
            <MonoLabel>RESPONDER NETWORK</MonoLabel>
            <span className="text-[9px] font-mono text-[#10b981]">{availableResponders.length} AVAILABLE</span>
          </div>
          <div className="divide-y divide-[#1a2840]">
            {state.responders.map(r => {
              const assignedEvt = r.assignedEventId ? state.events.find(e => e.id === r.assignedEventId) : null;
              return (
                <div key={r.id} className={`px-4 py-3 ${r.status === 'en_route' ? 'bg-[#f59e0b]/5' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-[#e2e8f0] font-semibold">{r.name}</p>
                      <p className="text-[9px] font-mono text-[#64748b]">
                        {r.type.replace('_', ' ').toUpperCase()} · {r.distance}m
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono ${
                        r.status === 'available' ? 'text-[#10b981]' :
                        r.status === 'en_route' ? 'text-[#f59e0b] animate-pulse' :
                        r.status === 'arrived' ? 'text-[#00d4f7]' :
                        'text-[#475569]'
                      }`}>
                        {r.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {assignedEvt && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[8px] font-mono text-[#475569]">ASSIGNED:</span>
                      <span className="text-[8px] font-mono text-[#f59e0b]">{assignedEvt.id}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Demo control */}
      {state.mode === 'demo' && (
        <div className="border border-[#f59e0b]/20 bg-[#f59e0b]/5 rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f59e0b]/20 flex items-center justify-between">
            <MonoLabel>DEMO SCENARIO CONTROL</MonoLabel>
            <Button size="sm" variant="secondary" onClick={resetDemo}>↺ RESET ALL</Button>
          </div>
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {DEMO_SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => startDemo(s.id)}
                disabled={state.demoRunning}
                className={`p-3 text-left border rounded-sm transition-all
                  ${state.demoScenarioId === s.id && state.demoRunning
                    ? 'border-[#00d4f7]/40 bg-[#00d4f7]/8'
                    : 'border-[#1a2840] hover:border-[#475569] disabled:opacity-40'
                  }`}
              >
                <p className="text-[10px] font-mono text-[#e2e8f0] font-semibold">{s.name}</p>
                <p className="text-[8px] font-mono text-[#64748b] mt-1">{s.description}</p>
                {state.demoScenarioId === s.id && state.demoRunning && (
                  <p className="text-[8px] font-mono text-[#00d4f7] mt-1 animate-blink">▶ RUNNING</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
