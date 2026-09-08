import React, { useState } from 'react';
import { useAegis } from '../../store/AegisContext';
import type { Device, Responder } from '../../types';

// Simple mercator projection clamped to a small area
function project(lat: number, lon: number, bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }, w: number, h: number) {
  const xPct = (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon);
  const yPct = 1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat);
  return { x: xPct * w, y: yPct * h };
}

const BOUNDS = {
  minLat: 12.9690,
  maxLat: 12.9740,
  minLon: 77.5920,
  maxLon: 77.5975,
};

interface MarkerProps {
  x: number;
  y: number;
  color: string;
  label: string;
  sub?: string;
  icon: string;
  pulse?: boolean;
  onClick?: () => void;
}

function MapMarker({ x, y, color, label, sub, icon, pulse, onClick }: MarkerProps) {
  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      transform={`translate(${x}, ${y})`}
    >
      {pulse && (
        <>
          <circle r="14" fill={color} fillOpacity="0.08">
            <animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      <circle r="8" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
      <text textAnchor="middle" dy="4" fontSize="9" fill={color}>{icon}</text>
      <text x="12" y="-2" fontSize="7" fill={color} fontFamily="JetBrains Mono, monospace" fontWeight="600">{label}</text>
      {sub && <text x="12" y="8" fontSize="6" fill={color} fillOpacity="0.6" fontFamily="JetBrains Mono, monospace">{sub}</text>}
    </g>
  );
}

interface AegisMapProps {
  height?: number;
  showAllDevices?: boolean;
}

export function AegisMap({ height = 400, showAllDevices = true }: AegisMapProps) {
  const { state } = useAegis();
  const [selected, setSelected] = useState<string | null>(null);
  const W = 600, H = height;

  const activeEvents = state.events.filter(e => e.status !== 'RESOLVED');

  const deviceColor = (d: Device) => {
    if (d.status === 'emergency') return '#f43f5e';
    if (d.status === 'streaming') return '#10b981';
    if (d.status === 'offline') return '#475569';
    return '#00d4f7';
  };

  const responderColor = (r: Responder) => {
    if (r.status === 'en_route') return '#f59e0b';
    if (r.status === 'arrived') return '#10b981';
    if (r.status === 'offline') return '#475569';
    return '#00d4f7';
  };

  const selectedDevice = state.devices.find(d => d.id === selected);
  const selectedEvent = activeEvents.find(e => e.sourceDeviceId === selected);
  const selectedResponder = state.responders.find(r => r.id === selected);

  return (
    <div className="relative bg-[#0a1020] border border-[#1a2840] rounded-sm overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
      >
        {/* Background */}
        <rect width={W} height={H} fill="#050810" />

        {/* Grid */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`vg-${i}`}
            x1={(W / 12) * i} y1={0}
            x2={(W / 12) * i} y2={H}
            stroke="#1a2840" strokeWidth="0.5" strokeOpacity="0.5"
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`hg-${i}`}
            x1={0} y1={(H / 8) * i}
            x2={W} y2={(H / 8) * i}
            stroke="#1a2840" strokeWidth="0.5" strokeOpacity="0.5"
          />
        ))}

        {/* Area labels */}
        <text x="16" y="20" fontSize="7" fill="#1a2840" fontFamily="JetBrains Mono, monospace">AEGIS CAMPUS MAP — DEMO</text>
        <text x="16" y={H - 10} fontSize="7" fill="#1a2840" fontFamily="JetBrains Mono, monospace">
          {`BOUNDS: ${BOUNDS.minLat.toFixed(4)}N ${BOUNDS.minLon.toFixed(4)}E`}
        </text>

        {/* Roads / paths */}
        <path d={`M ${W * 0.1} ${H * 0.5} Q ${W * 0.5} ${H * 0.3} ${W * 0.9} ${H * 0.6}`}
          stroke="#1a2840" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d={`M ${W * 0.3} ${H * 0.1} L ${W * 0.4} ${H * 0.85}`}
          stroke="#1a2840" strokeWidth="4" fill="none" />
        <text x={W * 0.06} y={H * 0.47} fontSize="6" fill="#1a2840" fontFamily="JetBrains Mono, monospace">CAMPUS ROAD</text>
        <text x={W * 0.2} y={H * 0.9} fontSize="6" fill="#1a2840" fontFamily="JetBrains Mono, monospace">SERVICE ROAD</text>

        {/* Buildings */}
        <rect x={W * 0.4} y={H * 0.35} width={W * 0.15} height={H * 0.18} rx="1" fill="#0f1928" stroke="#1a2840" strokeWidth="0.5" />
        <text x={W * 0.48} y={H * 0.45} fontSize="6" fill="#1a2840" fontFamily="JetBrains Mono, monospace" textAnchor="middle">BLDG A</text>
        <rect x={W * 0.6} y={H * 0.2} width={W * 0.12} height={H * 0.15} rx="1" fill="#0f1928" stroke="#1a2840" strokeWidth="0.5" />
        <text x={W * 0.66} y={H * 0.29} fontSize="6" fill="#1a2840" fontFamily="JetBrains Mono, monospace" textAnchor="middle">PARKING</text>

        {/* Emergency responder routes */}
        {state.responders
          .filter(r => r.status === 'en_route' && r.assignedEventId)
          .map(r => {
            const evt = state.events.find(e => e.id === r.assignedEventId);
            if (!evt) return null;
            const src = project(r.location.lat, r.location.lon, BOUNDS, W, H);
            const dst = project(evt.location.lat, evt.location.lon, BOUNDS, W, H);
            return (
              <g key={`route-${r.id}`}>
                <line
                  x1={src.x} y1={src.y} x2={dst.x} y2={dst.y}
                  stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6,4" strokeOpacity="0.6"
                />
                <circle cx={dst.x} cy={dst.y} r="20" fill="#f59e0b" fillOpacity="0.06" />
              </g>
            );
          })}

        {/* Active emergency zones */}
        {activeEvents.map(evt => {
          const p = project(evt.location.lat, evt.location.lon, BOUNDS, W, H);
          return (
            <circle
              key={`zone-${evt.id}`}
              cx={p.x} cy={p.y} r="25"
              fill="#f43f5e" fillOpacity="0.05"
              stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4,4"
            />
          );
        })}

        {/* Device markers */}
        {showAllDevices && state.devices.map(d => {
          const p = project(d.location.lat, d.location.lon, BOUNDS, W, H);
          return (
            <MapMarker
              key={d.id}
              x={p.x} y={p.y}
              color={deviceColor(d)}
              label={d.id.replace('AEGIS-', '')}
              sub={d.location.label.split('–')[0].trim()}
              icon={d.status === 'emergency' ? '⚠' : '◉'}
              pulse={d.status === 'emergency' || d.status === 'streaming'}
              onClick={() => setSelected(selected === d.id ? null : d.id)}
            />
          );
        })}

        {/* Responder markers */}
        {state.responders
          .filter(r => r.status !== 'offline')
          .map(r => {
            const p = project(r.location.lat, r.location.lon, BOUNDS, W, H);
            return (
              <MapMarker
                key={r.id}
                x={p.x} y={p.y}
                color={responderColor(r)}
                label={r.name.split(' ').slice(-2).join(' ')}
                icon={r.type === 'fire' ? '🔥' : r.type === 'medical' ? '+' : r.type === 'animal_rescue' ? '◈' : '◆'}
                pulse={r.status === 'en_route'}
                onClick={() => setSelected(selected === r.id ? null : r.id)}
              />
            );
          })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-[#0a1020]/90 border border-[#1a2840] p-2 rounded-sm text-[8px] font-mono space-y-1">
        {[
          { color: '#10b981', label: 'STREAMING' },
          { color: '#00d4f7', label: 'ONLINE' },
          { color: '#f43f5e', label: 'EMERGENCY' },
          { color: '#475569', label: 'OFFLINE' },
          { color: '#f59e0b', label: 'RESPONDER' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            <span style={{ color }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Info panel */}
      {selected && (selectedDevice || selectedResponder) && (
        <div className="absolute top-2 right-2 bg-[#0a1020]/95 border border-[#1a2840] p-3 rounded-sm text-[9px] font-mono w-44 space-y-2">
          {selectedDevice && (
            <>
              <p className="text-[#00d4f7] font-semibold">{selectedDevice.id}</p>
              <p className="text-[#94a3b8]">{selectedDevice.location.label}</p>
              <p className="text-[#64748b]">STATUS: <span className="text-[#e2e8f0]">{selectedDevice.status.toUpperCase()}</span></p>
              {selectedEvent && (
                <p className="text-[#f43f5e]">⚠ {selectedEvent.type.replace('_', ' ')}</p>
              )}
            </>
          )}
          {selectedResponder && (
            <>
              <p className="text-[#f59e0b] font-semibold">{selectedResponder.name}</p>
              <p className="text-[#94a3b8]">{selectedResponder.type.toUpperCase()}</p>
              <p className="text-[#64748b]">STATUS: <span className="text-[#e2e8f0]">{selectedResponder.status.toUpperCase()}</span></p>
              {selectedResponder.distance && (
                <p className="text-[#64748b]">DIST: <span className="text-[#e2e8f0]">{selectedResponder.distance}m</span></p>
              )}
            </>
          )}
          <button onClick={() => setSelected(null)} className="text-[#475569] hover:text-[#94a3b8]">✕ CLOSE</button>
        </div>
      )}
    </div>
  );
}
