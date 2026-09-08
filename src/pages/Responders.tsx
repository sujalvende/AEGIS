import React from 'react';
import { useAegis } from '../store/AegisContext';
import { SectionHeader, ResponderStatusBadge, SeverityBadge, MonoLabel } from '../components/ui';

const TYPE_ICONS: Record<string, string> = {
  security: '◆',
  medical: '+',
  fire: '🔥',
  animal_rescue: '◈',
};

const TYPE_COLORS: Record<string, string> = {
  security: 'text-[#00d4f7]',
  medical: 'text-[#10b981]',
  fire: 'text-[#f43f5e]',
  animal_rescue: 'text-[#f59e0b]',
};

export function Responders() {
  const { state, acceptResponder } = useAegis();

  const available = state.responders.filter(r => r.status === 'available');
  const active = state.responders.filter(r => r.status === 'en_route' || r.status === 'arrived');

  return (
    <div className="p-4 space-y-4">
      <SectionHeader
        title="RESPONDERS"
        sub="AEGIS / RESPONDER NETWORK"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-[#10b981]">{available.length} AVAILABLE</span>
            {active.length > 0 && (
              <span className="text-[9px] font-mono text-[#f59e0b]">{active.length} DEPLOYED</span>
            )}
          </div>
        }
      />

      {/* Active deployments */}
      {active.length > 0 && (
        <div className="border border-[#f59e0b]/20 bg-[#f59e0b]/5 rounded-sm">
          <div className="px-4 py-3 border-b border-[#f59e0b]/20">
            <MonoLabel>ACTIVE DEPLOYMENTS</MonoLabel>
          </div>
          <div className="divide-y divide-[#1a2840]">
            {active.map(r => {
              const evt = r.assignedEventId ? state.events.find(e => e.id === r.assignedEventId) : null;
              return (
                <div key={r.id} className="px-4 py-4 flex items-center gap-4">
                  <span className={`text-xl ${TYPE_COLORS[r.type]}`}>{TYPE_ICONS[r.type]}</span>
                  <div className="flex-1">
                    <p className="text-sm font-mono text-[#e2e8f0] font-semibold">{r.name}</p>
                    <p className="text-[9px] font-mono text-[#64748b]">
                      {r.type.replace('_', ' ').toUpperCase()} · {r.distance}m
                    </p>
                    {evt && (
                      <p className="text-[9px] font-mono text-[#f59e0b] mt-1">
                        → {evt.id} · {evt.location.label}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <ResponderStatusBadge status={r.status} />
                    {evt && <SeverityBadge level={evt.severity} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All responders */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.responders.map(r => {
          const evt = r.assignedEventId ? state.events.find(e => e.id === r.assignedEventId) : null;
          return (
            <div
              key={r.id}
              className={`border rounded-sm p-4 space-y-3 transition-colors ${
                r.status === 'en_route' ? 'border-[#f59e0b]/30 bg-[#f59e0b]/5' :
                r.status === 'available' ? 'border-[#1a2840] bg-[#0a1020]' :
                'border-[#1a2840] bg-[#0a1020] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xl ${TYPE_COLORS[r.type]}`}>{TYPE_ICONS[r.type]}</span>
                  <p className="font-mono text-sm text-[#e2e8f0] font-semibold mt-1">{r.name}</p>
                  <p className="text-[9px] font-mono text-[#64748b]">
                    {r.type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <ResponderStatusBadge status={r.status} />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-[#475569]">LOCATION</span>
                  <span className="text-[#94a3b8]">{r.location.label.split('–')[0].trim()}</span>
                </div>
                {r.distance && (
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-[#475569]">DISTANCE</span>
                    <span className="text-[#94a3b8]">{r.distance}m</span>
                  </div>
                )}
              </div>

              {evt && (
                <div className="p-2 bg-[#050810] border border-[#1a2840] space-y-1">
                  <p className="text-[8px] font-mono text-[#f59e0b]">ASSIGNED EVENT</p>
                  <p className="text-[9px] font-mono text-[#e2e8f0]">{evt.id}</p>
                  <p className="text-[8px] font-mono text-[#64748b]">{evt.location.label}</p>
                </div>
              )}

              {r.status === 'available' && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span className="text-[8px] font-mono text-[#10b981]">READY TO RESPOND</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="p-3 border border-[#1a2840] bg-[#0a1020] text-[9px] font-mono text-[#475569] leading-relaxed">
        AEGIS automatically matches responders to emergencies based on proximity, availability, and emergency type. Responder locations are updated in real time. Demo coordinates are predefined.
      </div>
    </div>
  );
}
