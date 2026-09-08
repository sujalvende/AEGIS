import React from 'react';
import { useAegis } from '../store/AegisContext';
import { AegisMap } from '../components/map/AegisMap';
import { SectionHeader, MonoLabel, SeverityBadge } from '../components/ui';

export function MapPage() {
  const { state } = useAegis();
  const activeEvents = state.events.filter(e => e.status !== 'RESOLVED');
  const streamingCount = state.devices.filter(d => d.isStreaming).length;

  return (
    <div className="p-4 space-y-4">
      <SectionHeader
        title="SITUATION MAP"
        sub="AEGIS / SPATIAL OVERVIEW"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-[#64748b]">
              {streamingCount} STREAMING · {activeEvents.length} ACTIVE INCIDENTS
            </span>
            {state.mode === 'demo' && (
              <span className="text-[9px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-1 rounded-sm">
                DEMO COORDINATES
              </span>
            )}
          </div>
        }
      />

      {/* Map */}
      <AegisMap height={480} />

      {/* Event summary */}
      {activeEvents.length > 0 && (
        <div className="border border-[#f43f5e]/20 bg-[#f43f5e]/5 rounded-sm">
          <div className="px-4 py-3 border-b border-[#f43f5e]/20">
            <MonoLabel>ACTIVE EMERGENCY LOCATIONS</MonoLabel>
          </div>
          <div className="divide-y divide-[#1a2840]">
            {activeEvents.map(evt => (
              <div key={evt.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono text-[#f43f5e] font-bold">{evt.id}</p>
                  <p className="text-[9px] font-mono text-[#94a3b8]">{evt.location.label}</p>
                  <p className="text-[8px] font-mono text-[#475569]">
                    {evt.location.lat.toFixed(6)}°N, {evt.location.lon.toFixed(6)}°E
                  </p>
                </div>
                <div className="text-right">
                  <SeverityBadge level={evt.severity} />
                  <p className="text-[8px] font-mono text-[#475569] mt-1">
                    {evt.createdAt.toLocaleTimeString('en-US', { hour12: false })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device locations */}
      <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden overflow-x-auto">
        <div className="px-4 py-3 border-b border-[#1a2840]">
          <MonoLabel>DEVICE COORDINATES</MonoLabel>
        </div>
        <table className="ops-table">
          <thead>
            <tr>
              <th>DEVICE</th>
              <th>LATITUDE</th>
              <th>LONGITUDE</th>
              <th>LOCATION</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {state.devices.map(d => (
              <tr key={d.id}>
                <td className="text-[#00d4f7]">{d.id}</td>
                <td>{d.location.lat.toFixed(6)}° N</td>
                <td>{d.location.lon.toFixed(6)}° E</td>
                <td className="text-[#94a3b8]">{d.location.label}</td>
                <td>
                  <span className={`text-[9px] font-mono ${
                    d.status === 'emergency' ? 'text-[#f43f5e]' :
                    d.isStreaming ? 'text-[#10b981]' :
                    d.status === 'offline' ? 'text-[#475569]' :
                    'text-[#00d4f7]'
                  }`}>
                    {d.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
