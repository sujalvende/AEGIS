import React, { useState } from 'react';
import { useAegis } from '../store/AegisContext';
import { SectionHeader, SeverityBadge, EmergencyStatusBadge, Button, MonoLabel, Badge } from '../components/ui';
import type { EmergencyEvent } from '../types';

function EventCard({ event, onAccept, onResolve }: {
  event: EmergencyEvent;
  onAccept?: (responderId: string) => void;
  onResolve?: () => void;
}) {
  const { state } = useAegis();
  const responder = state.responders.find(r => r.id === event.assignedResponderId);
  const [expanded, setExpanded] = useState(false);
  const isActive = event.status !== 'RESOLVED';

  return (
    <div className={`border rounded-sm overflow-hidden transition-colors ${
      isActive && event.severity === 'CRITICAL'
        ? 'border-[#f43f5e]/40 bg-[#f43f5e]/5'
        : isActive && event.severity === 'HIGH'
        ? 'border-[#fb923c]/30 bg-[#fb923c]/5'
        : isActive
        ? 'border-[#1a2840] bg-[#0a1020]'
        : 'border-[#1a2840]/50 bg-[#0a1020]/50 opacity-60'
    }`}>
      <div className="px-4 py-3 flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-[#00d4f7]">{event.id}</span>
            {event.isDemo && <Badge label="DEMO EVENT" color="amber" />}
          </div>
          <p className="font-display font-bold text-sm tracking-wider text-[#e2e8f0]">
            {event.type.replace('_', ' ')}
          </p>
          <p className="text-[9px] font-mono text-[#64748b]">
            Source: {event.sourceDeviceId} · {event.location.label}
          </p>
        </div>
        <div className="flex items-start gap-2 shrink-0 flex-col items-end">
          <div className="flex items-center gap-2">
            <SeverityBadge level={event.severity} />
            <EmergencyStatusBadge status={event.status} />
          </div>
          <span className="text-[8px] font-mono text-[#475569]">
            {event.createdAt.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>

      {/* Responder info */}
      {responder && (
        <div className="px-4 py-2 border-t border-[#1a2840]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-[#64748b]">RESPONDER:</span>
            <span className="text-[9px] font-mono text-[#94a3b8]">{responder.name}</span>
            <span className="text-[9px] font-mono text-[#475569]">{responder.distance}m</span>
          </div>
          <span className={`text-[9px] font-mono ${
            responder.status === 'en_route' ? 'text-[#f59e0b]' :
            responder.status === 'arrived' ? 'text-[#10b981]' : 'text-[#64748b]'
          }`}>
            {responder.status.toUpperCase().replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Action buttons */}
      {isActive && (
        <div className="px-4 py-2 border-t border-[#1a2840]/50 flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[9px] font-mono text-[#475569] hover:text-[#94a3b8] transition-colors"
          >
            {expanded ? '▲ HIDE TIMELINE' : '▼ SHOW TIMELINE'}
          </button>
          <div className="flex-1" />
          {event.status === 'RESPONDER_ALERTED' && responder && onAccept && (
            <Button size="sm" variant="success" onClick={() => onAccept(responder.id)}>
              ACCEPT RESPONSE
            </Button>
          )}
          {event.status !== 'RESOLVED' && onResolve && (
            <Button size="sm" variant="secondary" onClick={onResolve}>
              RESOLVE
            </Button>
          )}
        </div>
      )}

      {/* Timeline */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[#1a2840]/30 space-y-2">
          <MonoLabel dim>EVENT TIMELINE</MonoLabel>
          <div className="space-y-2 mt-2">
            {event.timeline.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-sm bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center">
                    <span className="text-[7px] text-[#10b981]">✓</span>
                  </div>
                  {i < event.timeline.length - 1 && (
                    <div className="w-px h-4 bg-[#1a2840] mt-1" />
                  )}
                </div>
                <div>
                  <p className="text-[9px] font-mono text-[#10b981] tracking-wider">{entry.stage}</p>
                  <p className="text-[8px] font-mono text-[#475569]">
                    {entry.label} · {entry.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Emergencies() {
  const { state, acceptResponder, resolveEvent } = useAegis();
  const [tab, setTab] = useState<'active' | 'all' | 'resolved'>('active');

  const active = state.events.filter(e => e.status !== 'RESOLVED');
  const resolved = state.events.filter(e => e.status === 'RESOLVED');
  const displayed = tab === 'active' ? active : tab === 'resolved' ? resolved : state.events;

  return (
    <div className="p-4 space-y-4">
      <SectionHeader
        title="EMERGENCIES"
        sub="AEGIS / INCIDENT MANAGEMENT"
        actions={
          <div className="flex items-center gap-2">
            {active.length > 0 && (
              <div className="px-3 py-1.5 bg-[#f43f5e]/10 border border-[#f43f5e]/30 rounded-sm">
                <span className="text-[10px] font-mono text-[#f43f5e] font-bold">
                  {active.length} ACTIVE
                </span>
              </div>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'TOTAL EVENTS', value: state.events.length, color: 'text-[#e2e8f0]' },
          { label: 'ACTIVE', value: active.length, color: active.length > 0 ? 'text-[#f43f5e]' : 'text-[#10b981]' },
          { label: 'RESOLVED', value: resolved.length, color: 'text-[#10b981]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 border border-[#1a2840] bg-[#0a1020]">
            <p className="text-[9px] font-mono text-[#475569] tracking-widest mb-1">{label}</p>
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tab */}
      <div className="flex gap-1 border-b border-[#1a2840] pb-2">
        {([
          ['active', 'ACTIVE'],
          ['all', 'ALL EVENTS'],
          ['resolved', 'RESOLVED'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase border-b-2 transition-all ${
              tab === id
                ? 'border-[#00d4f7] text-[#00d4f7]'
                : 'border-transparent text-[#475569] hover:text-[#94a3b8]'
            }`}
          >
            {label}
            {id === 'active' && active.length > 0 && (
              <span className="ml-1.5 text-[#f43f5e]">{active.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="space-y-3">
        {displayed.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-[#1a2840] text-4xl">◎</p>
            <p className="text-[10px] font-mono text-[#475569] tracking-widest">
              {tab === 'active' ? 'NO ACTIVE EMERGENCIES — ALL CLEAR' : 'NO EVENTS RECORDED'}
            </p>
            {tab === 'active' && (
              <p className="text-[9px] font-mono text-[#1a2840]">
                Events appear here when the fall detection or demo scenarios trigger an emergency
              </p>
            )}
          </div>
        ) : (
          displayed.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onAccept={(responderId) => acceptResponder(event.id, responderId)}
              onResolve={() => resolveEvent(event.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
