import React from 'react';
import { useAegis } from '../store/AegisContext';
import { SectionHeader, MonoLabel, Button, Divider } from '../components/ui';

function ToggleSetting({ label, sub, value, onChange }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#1a2840] last:border-0">
      <div>
        <p className="text-xs font-mono text-[#e2e8f0]">{label}</p>
        {sub && <p className="text-[9px] font-mono text-[#475569] mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full border transition-all ${
          value ? 'bg-[#00d4f7]/20 border-[#00d4f7]/40' : 'bg-[#1a2840] border-[#1a2840]'
        }`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
            value ? 'left-5 bg-[#00d4f7]' : 'left-0.5 bg-[#475569]'
          }`}
        />
      </button>
    </div>
  );
}

function NumberSetting({ label, sub, value, onChange, min, max, unit }: {
  label: string; sub?: string; value: number; onChange: (v: number) => void;
  min: number; max: number; unit?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#1a2840] last:border-0">
      <div>
        <p className="text-xs font-mono text-[#e2e8f0]">{label}</p>
        {sub && <p className="text-[9px] font-mono text-[#475569] mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-6 h-6 border border-[#1a2840] text-[#94a3b8] hover:border-[#475569] transition-all font-mono text-sm"
        >−</button>
        <span className="font-mono text-sm text-[#00d4f7] w-8 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-6 h-6 border border-[#1a2840] text-[#94a3b8] hover:border-[#475569] transition-all font-mono text-sm"
        >+</button>
        {unit && <span className="text-[9px] font-mono text-[#475569]">{unit}</span>}
      </div>
    </div>
  );
}

export function Settings() {
  const { state, updateSettings } = useAegis();
  const s = state.settings;

  return (
    <div className="p-4 space-y-6 max-w-2xl">
      <SectionHeader title="SETTINGS" sub="AEGIS / CONFIGURATION" />

      {/* Detection settings */}
      <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a2840]">
          <MonoLabel>DETECTION PARAMETERS</MonoLabel>
        </div>
        <div className="px-4">
          <NumberSetting
            label="FALL VERIFICATION WINDOW"
            sub="Seconds person must remain motionless before emergency is confirmed"
            value={s.fallVerificationSeconds}
            onChange={v => updateSettings({ fallVerificationSeconds: v })}
            min={3} max={30} unit="sec"
          />
          <NumberSetting
            label="MOTIONLESS THRESHOLD"
            sub="Minimum seconds of motionlessness before fall verification begins"
            value={s.motionlessThresholdSeconds}
            onChange={v => updateSettings({ motionlessThresholdSeconds: v })}
            min={1} max={10} unit="sec"
          />
        </div>
      </div>

      {/* Display and mode settings */}
      <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a2840]">
          <MonoLabel>VISUALIZATION</MonoLabel>
        </div>
        <div className="px-4">
          <ToggleSetting
            label="DEMO THERMAL MODE"
            sub="Show simulated thermal visualization (clearly labelled as demo data)"
            value={s.demoThermalMode}
            onChange={v => updateSettings({ demoThermalMode: v })}
          />
        </div>
      </div>

      {/* Notification settings */}
      <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a2840]">
          <MonoLabel>NOTIFICATIONS</MonoLabel>
        </div>
        <div className="px-4">
          <ToggleSetting
            label="IN-APP NOTIFICATIONS"
            sub="Show notification toasts for emergency events"
            value={s.notificationsEnabled}
            onChange={v => updateSettings({ notificationsEnabled: v })}
          />
        </div>
      </div>

      {/* Privacy */}
      <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a2840]">
          <MonoLabel>PRIVACY & DATA</MonoLabel>
        </div>
        <div className="px-4">
          <NumberSetting
            label="EVENT RETENTION"
            sub="Days to retain event records (future server-side setting)"
            value={s.retentionDays}
            onChange={v => updateSettings({ retentionDays: v })}
            min={1} max={365} unit="days"
          />
        </div>
        <div className="px-4 py-4">
          <div className="p-3 border border-[#1a2840] text-[9px] font-mono text-[#475569] leading-relaxed">
            AEGIS analyzes authorized camera feeds for predefined emergency indicators only. Camera and location access requires explicit user permission. This prototype stores data in browser memory only — no data is sent to external servers.
          </div>
        </div>
      </div>

      {/* System info */}
      <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a2840]">
          <MonoLabel>SYSTEM INFO</MonoLabel>
        </div>
        <div className="px-4 py-4 space-y-2 text-[9px] font-mono text-[#475569]">
          <div className="flex justify-between">
            <span>VERSION</span><span className="text-[#64748b]">AEGIS v0.1-prototype</span>
          </div>
          <div className="flex justify-between">
            <span>BUILD</span><span className="text-[#64748b]">Competition Demo 2024</span>
          </div>
          <div className="flex justify-between">
            <span>PLATFORM</span><span className="text-[#64748b]">React + Vite + Tailwind v4</span>
          </div>
          <div className="flex justify-between">
            <span>VISION ENGINE</span><span className="text-[#64748b]">Canvas-based simulation</span>
          </div>
          <div className="flex justify-between">
            <span>THERMAL</span><span className="text-[#f59e0b]">DEMO MODE — NOT REAL SENSOR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
