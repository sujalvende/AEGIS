import React from 'react';
import { useAegis } from '../../store/AegisContext';
import type { DemoPhase } from '../../types';

interface StageDef {
  code: string;
  name: string;
  desc: string;
  activeWhen: (phase: DemoPhase, fallState: string, eventStatus?: string) => 'pending' | 'current' | 'completed';
}

const TIMELINE_STAGES: StageDef[] = [
  {
    code: '01',
    name: 'MONITOR',
    desc: 'Surveillance stream active & baseline nominal',
    activeWhen: (phase, fallState) => {
      if (phase === 'monitoring' && fallState === 'NORMAL') return 'current';
      if (phase === 'selector') return 'pending';
      return 'completed';
    },
  },
  {
    code: '02',
    name: 'DETECT',
    desc: 'Subject acquired & anomalous trajectory detected',
    activeWhen: (phase, fallState) => {
      if (phase === 'movement' || phase === 'fall' || fallState === 'PERSON_DETECTED' || fallState === 'MOVING' || fallState === 'POSSIBLE_FALL') {
        return 'current';
      }
      if (['verifying', 'confirmed', 'located', 'alerted', 'accepted', 'enroute'].includes(phase) || fallState === 'VERIFYING' || fallState === 'EMERGENCY_CONFIRMED') {
        return 'completed';
      }
      return 'pending';
    },
  },
  {
    code: '03',
    name: 'VERIFY',
    desc: 'Inactivity & posture verification countdown',
    activeWhen: (phase, fallState) => {
      if (phase === 'verifying' || fallState === 'VERIFYING') return 'current';
      if (['confirmed', 'located', 'alerted', 'accepted', 'enroute'].includes(phase) || fallState === 'EMERGENCY_CONFIRMED' || fallState === 'RECOVERED') {
        return 'completed';
      }
      return 'pending';
    },
  },
  {
    code: '04',
    name: 'ASSESS',
    desc: 'Multi-modal severity & danger matrix computed',
    activeWhen: (phase) => {
      if (phase === 'confirmed') return 'current';
      if (['located', 'alerted', 'accepted', 'enroute'].includes(phase)) return 'completed';
      return 'pending';
    },
  },
  {
    code: '05',
    name: 'LOCATE',
    desc: 'GPS coordinates & camera sector identified',
    activeWhen: (phase) => {
      if (phase === 'located') return 'current';
      if (['alerted', 'accepted', 'enroute'].includes(phase)) return 'completed';
      return 'pending';
    },
  },
  {
    code: '06',
    name: 'ALERT',
    desc: 'Autonomous dispatch sent to nearest registered unit',
    activeWhen: (phase, _fs, eventStatus) => {
      if (phase === 'alerted' || eventStatus === 'RESPONDER_ALERTED') return 'current';
      if (phase === 'accepted' || phase === 'enroute' || eventStatus === 'RESPONDER_ACCEPTED' || eventStatus === 'EN_ROUTE') return 'completed';
      return 'pending';
    },
  },
  {
    code: '07',
    name: 'RESPOND',
    desc: 'Responder acknowledged & in transit to coordinates',
    activeWhen: (phase, _fs, eventStatus) => {
      if (phase === 'accepted' || phase === 'enroute' || eventStatus === 'RESPONDER_ACCEPTED' || eventStatus === 'EN_ROUTE') {
        return phase === 'enroute' || eventStatus === 'EN_ROUTE' ? 'completed' : 'current';
      }
      return 'pending';
    },
  },
];

export function IncidentTimeline() {
  const { state } = useAegis();

  const activeEvent = state.activeEventId
    ? state.events.find(e => e.id === state.activeEventId)
    : null;

  return (
    <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a2840] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4f7]" />
          <span className="text-[10px] font-mono text-[#94a3b8] tracking-widest uppercase">
            PROTOCOL TIMELINE
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#64748b]">
          7-STAGE LIFECYCLE
        </span>
      </div>

      <div className="p-3">
        <div className="space-y-2">
          {TIMELINE_STAGES.map((stage) => {
            const status = stage.activeWhen(state.demoPhase, state.fallState, activeEvent?.status);
            const isCurrent = status === 'current';
            const isCompleted = status === 'completed';

            return (
              <div
                key={stage.code}
                className={`flex items-start gap-2.5 p-2 rounded-sm transition-colors ${
                  isCurrent
                    ? 'bg-[#00d4f7]/8 border border-[#00d4f7]/30'
                    : isCompleted
                    ? 'bg-transparent border border-transparent'
                    : 'opacity-45'
                }`}
              >
                {/* Stage status indicator */}
                <div
                  className={`w-4 h-4 rounded-xs border flex items-center justify-center font-mono text-[9px] shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'border-[#10b981] bg-[#10b981]/20 text-[#10b981] font-bold'
                      : isCurrent
                      ? 'border-[#00d4f7] bg-[#00d4f7] text-[#050b14] font-bold'
                      : 'border-[#334155] text-[#475569]'
                  }`}
                >
                  {isCompleted ? '✓' : stage.code}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-mono font-bold tracking-wider ${
                        isCurrent
                          ? 'text-[#00d4f7]'
                          : isCompleted
                          ? 'text-[#10b981]'
                          : 'text-[#64748b]'
                      }`}
                    >
                      {stage.code} {stage.name}
                    </span>

                    {isCurrent && (
                      <span className="text-[8px] font-mono tracking-widest text-[#00d4f7] bg-[#00d4f7]/10 px-1 py-0.5 rounded-xs font-semibold uppercase">
                        ACTIVE
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[8px] font-mono text-[#10b981] uppercase">
                        DONE
                      </span>
                    )}
                  </div>
                  <p className={`text-[9px] font-mono leading-tight mt-0.5 ${isCurrent ? 'text-[#cbd5e1]' : 'text-[#64748b]'}`}>
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default IncidentTimeline;
