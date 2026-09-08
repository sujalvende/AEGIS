import React from 'react';
import { useAegis } from '../../store/AegisContext';
import { DEMO_RESPONDERS } from '../../demo/data';

interface ResponderDeviceModalProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

export function ResponderDeviceModal({ onClose, isStandalone = false }: ResponderDeviceModalProps) {
  const { state, acceptResponder } = useAegis();

  const activeEvent = state.activeEventId
    ? state.events.find(e => e.id === state.activeEventId)
    : state.events[0];

  const responderId = activeEvent?.assignedResponderId ?? 'RESP-SEC-01';
  const responder = DEMO_RESPONDERS.find(r => r.id === responderId) ?? DEMO_RESPONDERS[0];

  const isAlerted = activeEvent && (activeEvent.status === 'RESPONDER_ALERTED' || (state.fallState === 'EMERGENCY_CONFIRMED' && activeEvent.status !== 'RESOLVED' && activeEvent.status !== 'EN_ROUTE' && activeEvent.status !== 'RESPONDER_ACCEPTED'));
  const isAccepted = activeEvent && (activeEvent.status === 'RESPONDER_ACCEPTED' || activeEvent.status === 'EN_ROUTE');
  const isEnRoute = activeEvent?.status === 'EN_ROUTE';

  const emergencyTypeLabel = activeEvent?.type === 'PERSON_FALL' ? 'PERSON FALL' :
    activeEvent?.type === 'FIRE' ? 'FIRE / HAZARD' :
    activeEvent?.type === 'ANIMAL_DISTRESS' ? 'ANIMAL DISTRESS' :
    'EMERGENCY INCIDENT';

  const priorityLabel = activeEvent?.severity === 'CRITICAL' ? 'CRITICAL PRIORITY' :
    activeEvent?.severity === 'HIGH' ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY';

  const priorityColor = activeEvent?.severity === 'CRITICAL' ? '#f43f5e' :
    activeEvent?.severity === 'HIGH' ? '#fb923c' : '#f59e0b';

  const content = (
    <div className="w-[320px] bg-[#050810] border-2 border-[#1a2840] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-[#e2e8f0]">
      {/* Phone status bar */}
      <div className="h-6 bg-[#0a1020] px-3 flex items-center justify-between text-[8px] text-[#64748b] border-b border-[#1a2840]">
        <span>AEGIS-5G</span>
        <div className="w-12 h-2.5 bg-black rounded-full mx-auto" />
        <div className="flex items-center gap-1.5">
          <span>98%</span>
          <div className="w-3 h-1.5 border border-[#64748b] rounded-2xs p-0.5">
            <div className="h-full bg-[#10b981] w-full" />
          </div>
        </div>
      </div>

      {/* Terminal Title */}
      <div className="px-4 py-2.5 bg-[#0a1020] border-b border-[#1a2840] flex items-center justify-between">
        <div>
          <span className="text-[9px] text-[#64748b] uppercase tracking-widest block">FIELD TERMINAL</span>
          <span className="text-xs font-bold text-[#e2e8f0]">CAMPUS SECURITY 01</span>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 rounded-xs bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-semibold">
          {isEnRoute ? 'EN ROUTE' : isAccepted ? 'ACCEPTED' : isAlerted ? 'ALERT' : 'STANDBY'}
        </span>
      </div>

      {/* Terminal Body */}
      <div className="p-4 flex-1 space-y-4">
        {isAlerted && activeEvent ? (
          <div className="space-y-3">
            {/* Alert banner */}
            <div className="p-3 bg-[#f43f5e]/15 border border-[#f43f5e]/50 rounded-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base">🚨</span>
                <span className="text-xs font-bold text-[#f43f5e] tracking-wider">
                  AEGIS EMERGENCY
                </span>
              </div>
              <p className="text-sm font-bold text-[#e2e8f0] tracking-wide pt-1">
                {emergencyTypeLabel}
              </p>
              <p className="text-[10px] font-bold tracking-widest" style={{ color: priorityColor }}>
                {priorityLabel}
              </p>
            </div>

            {/* Location & Distance */}
            <div className="p-3 bg-[#0a1020] border border-[#1a2840] rounded-sm space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#64748b]">DISTANCE:</span>
                <span className="font-bold text-[#00d4f7]">{responder.distance ?? 180} m AWAY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">LOCATION:</span>
                <span className="text-[#cbd5e1] font-semibold truncate max-w-[170px]">
                  {activeEvent.location?.label ?? 'Remote Service Road'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">EST. ARRIVAL:</span>
                <span className="text-[#10b981]">~2 MINS</span>
              </div>
            </div>

            {/* Accept Button */}
            <button
              onClick={() => acceptResponder(activeEvent.id, responder.id)}
              className="w-full py-3 bg-[#10b981] text-[#050b14] font-bold text-xs tracking-widest uppercase rounded-sm hover:bg-[#34d399] transition-all cursor-pointer shadow-md text-center"
            >
              [ ACCEPT RESPONSE ]
            </button>
          </div>
        ) : isAccepted ? (
          <div className="space-y-3">
            <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/40 rounded-sm space-y-1.5 text-center">
              <span className="text-lg">✓</span>
              <p className="text-xs font-bold text-[#10b981] tracking-widest uppercase">
                {isEnRoute ? 'RESPONDER EN ROUTE' : 'RESPONSE ACCEPTED'}
              </p>
              <p className="text-[10px] text-[#94a3b8]">
                GPS Guidance Active · Unit Moving to Scene
              </p>
            </div>

            <div className="p-3 bg-[#0a1020] border border-[#1a2840] rounded-sm space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#64748b]">DESTINATION:</span>
                <span className="text-[#cbd5e1] font-semibold">
                  {activeEvent?.location?.label ?? 'Remote Service Road'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">TELEMETRY LINK:</span>
                <span className="text-[#10b981]">CONNECTED (LORA MESH)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">ADMIN NOTIFIED:</span>
                <span className="text-[#00d4f7]">CONFIRMED (SYNCED)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-6 text-center">
            <div className="w-10 h-10 rounded-full border border-[#1a2840] bg-[#0a1020] flex items-center justify-center mx-auto text-[#64748b]">
              ◎
            </div>
            <p className="text-xs font-semibold text-[#64748b] tracking-wider uppercase">
              STATUS: ON PATROL
            </p>
            <p className="text-[10px] text-[#475569]">
              Connected to AEGIS mesh network. Awaiting autonomous dispatch alert.
            </p>
          </div>
        )}
      </div>

      {/* Footer / Home Bar */}
      <div className="h-5 bg-[#0a1020] flex items-center justify-center border-t border-[#1a2840]">
        <div className="w-20 h-1 bg-[#334155] rounded-full" />
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-4">
        <div className="mb-4 text-center">
          <p className="text-[9px] font-mono text-[#64748b] tracking-widest uppercase">AEGIS RESPONDER TERMINAL</p>
          <p className="text-xs font-mono text-[#94a3b8]">Live synchronized mobile receiver</p>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-7 h-7 bg-[#1a2840] text-[#cbd5e1] hover:text-white rounded-full border border-[#334155] flex items-center justify-center text-xs font-bold cursor-pointer z-10"
        >
          ✕
        </button>
        {content}
      </div>
    </div>
  );
}

export default ResponderDeviceModal;
