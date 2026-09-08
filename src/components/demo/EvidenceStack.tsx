import React, { useEffect, useState } from 'react';
import { useAegis } from '../../store/AegisContext';

interface EvidenceSignalDisplay {
  id: string;
  label: string;
  visible: boolean;
}

export function EvidenceStack() {
  const { state } = useAegis();
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  // Animate evidence signals appearing one by one
  useEffect(() => {
    state.evidenceStack.forEach((sig, i) => {
      if (!visibleIds.has(sig.id)) {
        setTimeout(() => {
          setVisibleIds(prev => new Set([...prev, sig.id]));
        }, i * 200);
      }
    });
  }, [state.evidenceStack]);

  // Reset when demo resets
  useEffect(() => {
    if (state.fallState === 'NORMAL' && state.evidenceStack.length === 0) {
      setVisibleIds(new Set());
    }
  }, [state.fallState, state.evidenceStack]);

  const isConfirmed = state.fallState === 'EMERGENCY_CONFIRMED' || state.fallState === 'RECOVERED';
  const hasEvidence = state.evidenceStack.length > 0;

  if (!hasEvidence) return null;

  // Determine severity
  const severity =
    state.fireDetected ? 'CRITICAL' :
    state.animalDetected ? 'MEDIUM' :
    'HIGH';

  const severityColor =
    severity === 'CRITICAL' ? '#f43f5e' :
    severity === 'MEDIUM' ? '#f59e0b' :
    '#fb923c';

  return (
    <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a2840] flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00d4f7]" />
        <span className="text-[10px] font-mono text-[#94a3b8] tracking-widest uppercase">AEGIS AI FUSION</span>
      </div>

      <div className="p-3 space-y-2">
        {/* Evidence signals */}
        {state.evidenceStack.map((sig) => {
          const visible = visibleIds.has(sig.id);
          return (
            <div
              key={sig.id}
              className={`flex items-center gap-2 transition-all duration-300 ${
                visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              <span className="text-[#10b981] text-[10px] shrink-0">✓</span>
              <span className="text-[10px] font-mono text-[#e2e8f0] tracking-wider">{sig.label}</span>
            </div>
          );
        })}

        {/* Severity output — appears after all evidence */}
        {isConfirmed && visibleIds.size >= Math.min(state.evidenceStack.length, 3) && (
          <div className="mt-3 pt-3 border-t border-[#1a2840]">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-px bg-[#1a2840]" />
              <span className="text-[8px] font-mono text-[#475569] tracking-widest">ASSESSMENT</span>
              <div className="flex-1 h-px bg-[#1a2840]" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider font-semibold">Calculated Severity</span>
              <span
                className="font-mono font-bold text-sm tracking-widest px-2 py-0.5 rounded-xs"
                style={{
                  color: severityColor,
                  backgroundColor: `${severityColor}15`,
                  border: `1px solid ${severityColor}40`
                }}
              >
                {severity}
              </span>
            </div>
            {state.animalDetected && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-mono text-[#475569] uppercase tracking-wider">Category</span>
                <span className="text-[10px] font-mono text-[#10b981] tracking-wider">ANIMAL RESCUE</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
