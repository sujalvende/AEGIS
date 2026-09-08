import React from 'react';
import { useAegis } from '../store/AegisContext';
import { KPICard, SeverityBadge, EmergencyStatusBadge, DeviceStatusBadge, MonoLabel, Button } from '../components/ui';
import { AegisMap } from '../components/map/AegisMap';

export function Overview() {
  const { state, navigate } = useAegis();

  const activeEvents = state.events.filter(e => e.status !== 'RESOLVED');
  const streamingDevices = state.devices.filter(d => d.isStreaming);
  const availableResponders = state.responders.filter(r => r.status === 'available');

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <p className="text-[9px] font-mono text-[#475569] tracking-widest mb-1">AEGIS / OVERVIEW</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl tracking-wider">SYSTEM OVERVIEW</h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[9px] font-mono text-[#10b981]">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="DEVICES ONLINE"
          value={`${state.devices.filter(d => d.status !== 'offline').length}/${state.devices.length}`}
          sub={`${streamingDevices.length} STREAMING`}
          accent="text-[#00d4f7]"
        />
        <KPICard
          label="ACTIVE INCIDENTS"
          value={activeEvents.length}
          sub={activeEvents.length === 0 ? 'ALL CLEAR' : 'REQUIRES ATTENTION'}
          accent={activeEvents.length > 0 ? 'text-[#f43f5e]' : 'text-[#10b981]'}
        />
        <KPICard
          label="RESPONDERS READY"
          value={`${availableResponders.length}/${state.responders.length}`}
          sub="AVAILABLE NOW"
          accent="text-[#10b981]"
        />
        <KPICard
          label="SYSTEM MODE"
          value={state.mode.toUpperCase()}
          sub={state.mode === 'demo' ? 'COMPETITION DEMO' : 'REAL HARDWARE'}
          accent={state.mode === 'demo' ? 'text-[#f59e0b]' : 'text-[#00d4f7]'}
        />
      </div>

      {/* Map */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <MonoLabel>DEVICE MAP</MonoLabel>
          <button
            onClick={() => navigate('map')}
            className="text-[9px] font-mono text-[#475569] hover:text-[#94a3b8] transition-colors"
          >
            FULL MAP →
          </button>
        </div>
        <AegisMap height={240} />
      </div>

      {/* Two-column: recent events + device status */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent events */}
        <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a2840] flex items-center justify-between">
            <MonoLabel>RECENT EVENTS</MonoLabel>
            <button
              onClick={() => navigate('emergencies')}
              className="text-[9px] font-mono text-[#475569] hover:text-[#94a3b8]"
            >
              ALL EVENTS →
            </button>
          </div>
          {state.events.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[10px] font-mono text-[#475569]">NO EVENTS — ALL CLEAR</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1a2840]">
              {state.events.slice(0, 5).map(evt => (
                <div key={evt.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-mono text-[#00d4f7] font-semibold">{evt.id}</p>
                    <p className="text-[8px] font-mono text-[#64748b] truncate">{evt.location.label}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <SeverityBadge level={evt.severity} />
                    <EmergencyStatusBadge status={evt.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device health */}
        <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a2840] flex items-center justify-between">
            <MonoLabel>DEVICE HEALTH</MonoLabel>
            <button
              onClick={() => navigate('devices')}
              className="text-[9px] font-mono text-[#475569] hover:text-[#94a3b8]"
            >
              ALL DEVICES →
            </button>
          </div>
          <div className="divide-y divide-[#1a2840]">
            {state.devices.map(d => (
              <div key={d.id} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    d.status === 'emergency' ? 'bg-[#f43f5e] animate-pulse' :
                    d.isStreaming ? 'bg-[#10b981] animate-pulse' :
                    d.status === 'offline' ? 'bg-[#475569]' :
                    'bg-[#00d4f7]'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-mono text-[#94a3b8] truncate">{d.id}</p>
                  </div>
                </div>
                <DeviceStatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm p-4">
        <MonoLabel dim>QUICK ACTIONS</MonoLabel>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button variant="primary" onClick={() => navigate('monitor')}>◉ OPEN MONITOR</Button>
          <Button variant="secondary" onClick={() => navigate('admin')}>⊛ ADMIN CONSOLE</Button>
          <Button variant="secondary" onClick={() => navigate('emergencies')}>⚠ INCIDENTS</Button>
          <Button variant="secondary" onClick={() => navigate('map')}>◎ SITUATION MAP</Button>
        </div>
      </div>
    </div>
  );
}
