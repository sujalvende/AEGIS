import React from 'react';
import { useAegis } from '../store/AegisContext';
import { KPICard, SectionHeader, MonoLabel, Badge, ProgressBar } from '../components/ui';
import type { EmergencyType } from '../types';

const TYPE_COLORS: Record<EmergencyType, string> = {
  PERSON_FALL: '#00d4f7',
  FIRE: '#f43f5e',
  ANIMAL_DISTRESS: '#f59e0b',
  SMOKE: '#fb923c',
  THERMAL_ANOMALY: '#8b5cf6',
};

export function Analytics() {
  const { state } = useAegis();

  const totalEvents = state.events.length;
  const resolvedEvents = state.events.filter(e => e.status === 'RESOLVED').length;
  const activeEvents = state.events.filter(e => e.status !== 'RESOLVED').length;
  const demoEvents = state.events.filter(e => e.isDemo).length;

  const byType = state.events.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  const bySeverity = state.events.reduce<Record<string, number>>((acc, e) => {
    acc[e.severity] = (acc[e.severity] ?? 0) + 1;
    return acc;
  }, {});

  const deviceUptime = state.devices.map(d => ({
    id: d.id,
    name: d.name,
    uptime: d.status === 'offline' ? 0 : d.isStreaming ? 98 + Math.random() * 2 : 95 + Math.random() * 4,
    streaming: d.isStreaming,
  }));

  const hasData = totalEvents > 0;

  return (
    <div className="p-4 space-y-6">
      <SectionHeader
        title="ANALYTICS"
        sub="AEGIS / SYSTEM ANALYTICS"
        actions={
          <Badge label={hasData ? `${totalEvents} EVENTS` : 'NO DATA YET'} color={hasData ? 'cyan' : 'gray'} />
        }
      />

      {!hasData && (
        <div className="py-12 text-center space-y-3 border border-[#1a2840] bg-[#0a1020] rounded-sm">
          <p className="text-[#1a2840] text-4xl">∿</p>
          <p className="text-[10px] font-mono text-[#475569] tracking-widest">NO EVENTS RECORDED YET</p>
          <p className="text-[9px] font-mono text-[#1a2840]">
            Run a demo scenario or trigger a detection to populate analytics
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard label="TOTAL EVENTS" value={totalEvents} accent="text-[#e2e8f0]" />
            <KPICard label="RESOLVED" value={resolvedEvents} accent="text-[#10b981]" sub={`${totalEvents > 0 ? Math.round((resolvedEvents / totalEvents) * 100) : 0}% resolution rate`} />
            <KPICard label="ACTIVE" value={activeEvents} accent={activeEvents > 0 ? 'text-[#f43f5e]' : 'text-[#10b981]'} />
            <KPICard label="DEMO EVENTS" value={demoEvents} accent="text-[#f59e0b]" sub="CLEARLY LABELLED" />
          </div>

          {/* Two-column: by type + by severity */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* By type */}
            <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm">
              <div className="px-4 py-3 border-b border-[#1a2840]">
                <MonoLabel>INCIDENTS BY TYPE</MonoLabel>
              </div>
              <div className="p-4 space-y-3">
                {Object.keys(byType).length === 0 ? (
                  <p className="text-[9px] font-mono text-[#475569]">—</p>
                ) : (
                  Object.entries(byType).map(([type, count]) => (
                    <ProgressBar
                      key={type}
                      label={type.replace('_', ' ')}
                      value={count}
                      max={Math.max(...Object.values(byType))}
                      color={TYPE_COLORS[type as EmergencyType] ?? '#64748b'}
                    />
                  ))
                )}
              </div>
            </div>

            {/* By severity */}
            <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm">
              <div className="px-4 py-3 border-b border-[#1a2840]">
                <MonoLabel>INCIDENTS BY SEVERITY</MonoLabel>
              </div>
              <div className="p-4 space-y-3">
                {Object.keys(bySeverity).length === 0 ? (
                  <p className="text-[9px] font-mono text-[#475569]">—</p>
                ) : (
                  (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).filter(s => bySeverity[s]).map(s => {
                    const colors = { CRITICAL: '#f43f5e', HIGH: '#fb923c', MEDIUM: '#f59e0b', LOW: '#10b981' };
                    return (
                      <ProgressBar
                        key={s}
                        label={s}
                        value={bySeverity[s] ?? 0}
                        max={Math.max(...Object.values(bySeverity))}
                        color={colors[s]}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Device uptime */}
          <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden overflow-x-auto">
            <div className="px-4 py-3 border-b border-[#1a2840]">
              <MonoLabel>DEVICE UPTIME (SIMULATED)</MonoLabel>
            </div>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>DEVICE</th>
                  <th>NAME</th>
                  <th>UPTIME</th>
                  <th>STREAM STATUS</th>
                </tr>
              </thead>
              <tbody>
                {deviceUptime.map(d => (
                  <tr key={d.id}>
                    <td className="text-[#00d4f7]">{d.id}</td>
                    <td className="text-[#94a3b8]">{d.name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-16 bg-[#1a2840] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${d.uptime}%`,
                              backgroundColor: d.uptime > 95 ? '#10b981' : d.uptime > 80 ? '#f59e0b' : '#f43f5e',
                            }}
                          />
                        </div>
                        <span className={`text-[9px] ${d.uptime > 95 ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                          {d.uptime.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={d.streaming ? 'text-[#10b981]' : 'text-[#475569]'}>
                        {d.streaming ? '● ACTIVE' : '○ IDLE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="p-3 border border-[#1a2840] text-[9px] font-mono text-[#475569] leading-relaxed">
        Analytics reflect actual events recorded in the current session. Demo events are clearly labelled. No historical data is fabricated.
      </div>
    </div>
  );
}
