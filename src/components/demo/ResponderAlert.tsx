import React, { useEffect, useState } from 'react';
import { useAegis } from '../../store/AegisContext';
import { DEMO_RESPONDERS } from '../../demo/data';

export function ResponderAlert() {
  const { state, acceptResponder } = useAegis();
  const [visible, setVisible] = useState(false);

  const activeEvent = state.activeEventId
    ? state.events.find(e => e.id === state.activeEventId)
    : null;

  const responder = activeEvent?.assignedResponderId
    ? DEMO_RESPONDERS.find(r => r.id === activeEvent.assignedResponderId)
    : null;

  const isAlerted = activeEvent?.status === 'RESPONDER_ALERTED';
  const isAccepted = activeEvent?.status === 'RESPONDER_ACCEPTED' || activeEvent?.status === 'EN_ROUTE';
  const isEnRoute = activeEvent?.status === 'EN_ROUTE';
  const isResolved = activeEvent?.status === 'RESOLVED';

  useEffect(() => {
    if (isAlerted || isAccepted || isEnRoute) {
      setTimeout(() => setVisible(true), 100);
    } else {
      setVisible(false);
    }
  }, [isAlerted, isAccepted, isEnRoute]);

  if (!activeEvent || (!isAlerted && !isAccepted && !isEnRoute) || isResolved) return null;

  const emergencyLabel = activeEvent.type === 'PERSON_FALL' ? 'PERSON FALL' :
    activeEvent.type === 'FIRE' ? 'FIRE' :
    activeEvent.type === 'ANIMAL_DISTRESS' ? 'ANIMAL DISTRESS' : activeEvent.type;

  const priorityLabel = activeEvent.severity === 'CRITICAL' ? 'CRITICAL PRIORITY' :
    activeEvent.severity === 'HIGH' ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY';

  const priorityColor = activeEvent.severity === 'CRITICAL' ? '#f43f5e' :
    activeEvent.severity === 'HIGH' ? '#fb923c' : '#f59e0b';

  const responderIcon = activeEvent.type === 'FIRE' ? '🚒' :
    activeEvent.type === 'ANIMAL_DISTRESS' ? '🐾' : '🚨';

  return (
    <div className={`border border-[#f43f5e]/30 bg-[#f43f5e]/5 rounded-sm overflow-hidden transition-all duration-500 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      {/* Emergency header */}
      <div className="px-3 py-2.5 bg-[#f43f5e]/10 border-b border-[#f43f5e]/20 flex items-center gap-2">
        <span className="text-base">{responderIcon}</span>
        <div>
          <p className="text-[11px] font-mono font-bold text-[#f43f5e] tracking-widest">AEGIS EMERGENCY</p>
          <p className="text-[9px] font-mono text-[#94a3b8]">{activeEvent.id}</p>
        </div>
        {isEnRoute && (
          <div className="ml-auto">
            <span className="text-[9px] font-mono bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 px-2 py-0.5 rounded-sm tracking-widest">
              EN ROUTE
            </span>
          </div>
        )}
        {isAccepted && !isEnRoute && (
          <div className="ml-auto">
            <span className="text-[9px] font-mono bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 px-2 py-0.5 rounded-sm tracking-widest">
              ACCEPTED
            </span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Emergency type + priority */}
        <div className="space-y-1">
          <p className="font-display font-bold text-xl tracking-widest text-[#e2e8f0]">{emergencyLabel}</p>
          <p className="text-[10px] font-mono font-semibold tracking-widest" style={{ color: priorityColor }}>
            {priorityLabel}
          </p>
          <p className="text-[10px] font-mono text-[#64748b]">{activeEvent.location.label}</p>
        </div>

        {/* Responder info */}
        {responder && (
          <div className="p-2 border border-[#1a2840] bg-[#050810] rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-mono text-[#475569] tracking-wider">ASSIGNED RESPONDER</p>
                <p className="text-xs font-mono text-[#e2e8f0] mt-0.5">{responder.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-mono text-[#475569]">DISTANCE</p>
                <p className="text-sm font-mono font-bold text-[#00d4f7]">{responder.distance}m</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {isAlerted && responder && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => acceptResponder(activeEvent.id, responder.id)}
              className="py-2.5 font-mono text-[10px] tracking-widest uppercase font-semibold bg-[#10b981]/10 border border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/20 transition-all rounded-sm"
            >
              ACCEPT RESPONSE
            </button>
            <button className="py-2.5 font-mono text-[10px] tracking-widest uppercase bg-white/5 border border-[#1a2840] text-[#64748b] hover:bg-white/10 transition-all rounded-sm">
              VIEW LOCATION
            </button>
          </div>
        )}

        {/* En route status */}
        {(isAccepted || isEnRoute) && (
          <div className={`p-2 border rounded-sm text-center transition-all ${
            isEnRoute ? 'border-[#10b981]/30 bg-[#10b981]/5' : 'border-[#f59e0b]/20 bg-[#f59e0b]/5'
          }`}>
            <p className={`text-[10px] font-mono font-semibold tracking-widest ${isEnRoute ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
              {isEnRoute ? '◉ RESPONDER EN ROUTE' : '◉ RESPONSE ACCEPTED'}
            </p>
            {responder && (
              <p className="text-[9px] font-mono text-[#475569] mt-1">{responder.name}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
