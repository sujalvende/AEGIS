import React from 'react';
import type { SeverityLevel, DeviceStatus, EmergencyStatus, ResponderStatus } from '../../types';

// ---- Badge ----
interface BadgeProps { label: string; color?: 'cyan' | 'amber' | 'red' | 'green' | 'gray' | 'orange'; mono?: boolean; }
export function Badge({ label, color = 'gray', mono = true }: BadgeProps) {
  const colors: Record<string, string> = {
    cyan: 'bg-[#06b6d4]/10 text-[#00d4f7] border-[#06b6d4]/30',
    amber: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30',
    red: 'bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30',
    green: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30',
    gray: 'bg-white/5 text-[#94a3b8] border-white/10',
    orange: 'bg-[#fb923c]/10 text-[#fb923c] border-[#fb923c]/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-widest border rounded-sm ${mono ? 'font-mono' : ''} ${colors[color]}`}>
      {label}
    </span>
  );
}

// ---- SeverityBadge ----
export function SeverityBadge({ level }: { level: SeverityLevel }) {
  const map: Record<SeverityLevel, { label: string; color: BadgeProps['color'] }> = {
    NORMAL: { label: 'NORMAL', color: 'gray' },
    LOW: { label: 'LOW', color: 'green' },
    MEDIUM: { label: 'MEDIUM', color: 'amber' },
    HIGH: { label: 'HIGH', color: 'orange' },
    CRITICAL: { label: 'CRITICAL', color: 'red' },
  };
  const { label, color } = map[level];
  return <Badge label={label} color={color} />;
}

// ---- StatusBadge for devices ----
export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const map: Record<DeviceStatus, { label: string; color: BadgeProps['color'] }> = {
    online: { label: 'ONLINE', color: 'cyan' },
    offline: { label: 'OFFLINE', color: 'gray' },
    streaming: { label: 'STREAMING', color: 'green' },
    emergency: { label: 'EMERGENCY', color: 'red' },
    idle: { label: 'IDLE', color: 'amber' },
  };
  const { label, color } = map[status];
  return <Badge label={label} color={color} />;
}

// ---- StatusDot ----
export function StatusDot({ status }: { status: DeviceStatus }) {
  const colors: Record<DeviceStatus, string> = {
    online: 'bg-[#00d4f7]',
    offline: 'bg-[#475569]',
    streaming: 'bg-[#10b981] animate-pulse',
    emergency: 'bg-[#f43f5e] animate-pulse',
    idle: 'bg-[#f59e0b]',
  };
  return <span className={`status-dot ${colors[status]}`} />;
}

// ---- KPI Card ----
interface KPICardProps { label: string; value: string | number; sub?: string; accent?: string; icon?: React.ReactNode; }
export function KPICard({ label, value, sub, accent = 'text-[#e2e8f0]', icon }: KPICardProps) {
  return (
    <div className="p-4 border border-[#1a2840] bg-[#0a1020] rounded-sm">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-mono text-[#475569] tracking-widest uppercase mb-1">{label}</p>
        {icon && <span className="text-[#475569]">{icon}</span>}
      </div>
      <p className={`text-2xl font-display font-bold tracking-wide ${accent}`}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#64748b] mt-1">{sub}</p>}
    </div>
  );
}

// ---- Section Header ----
export function SectionHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-xs font-mono text-[#475569] tracking-[0.2em] uppercase mb-1">{sub ?? ''}</h2>
        <h1 className="text-2xl font-display font-bold text-[#e2e8f0] tracking-wide">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---- Mono Label ----
export function MonoLabel({ children, dim = false }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span className={`text-[10px] font-mono tracking-widest uppercase ${dim ? 'text-[#475569]' : 'text-[#94a3b8]'}`}>
      {children}
    </span>
  );
}

// ---- Divider ----
export function Divider() {
  return <div className="h-px w-full bg-[#1a2840] my-4" />;
}

// ---- Emergency Status Badge ----
export function EmergencyStatusBadge({ status }: { status: EmergencyStatus }) {
  const map: Record<EmergencyStatus, { label: string; color: BadgeProps['color'] }> = {
    DETECTING: { label: 'DETECTING', color: 'cyan' },
    VERIFYING: { label: 'VERIFYING', color: 'amber' },
    CONFIRMED: { label: 'CONFIRMED', color: 'red' },
    RESPONDER_ALERTED: { label: 'RESPONDER ALERTED', color: 'orange' },
    RESPONDER_ACCEPTED: { label: 'ACCEPTED', color: 'amber' },
    EN_ROUTE: { label: 'EN ROUTE', color: 'amber' },
    ARRIVED: { label: 'ARRIVED', color: 'green' },
    RESOLVED: { label: 'RESOLVED', color: 'green' },
  };
  const { label, color } = map[status];
  return <Badge label={label} color={color} />;
}

// ---- Responder Status Badge ----
export function ResponderStatusBadge({ status }: { status: ResponderStatus }) {
  const map: Record<ResponderStatus, { label: string; color: BadgeProps['color'] }> = {
    available: { label: 'AVAILABLE', color: 'green' },
    en_route: { label: 'EN ROUTE', color: 'amber' },
    arrived: { label: 'ARRIVED', color: 'cyan' },
    offline: { label: 'OFFLINE', color: 'gray' },
  };
  const { label, color } = map[status];
  return <Badge label={label} color={color} />;
}

// ---- Button ----
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
}
export function Button({ variant = 'secondary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const variants: Record<string, string> = {
    primary: 'bg-[#00d4f7]/10 border border-[#00d4f7]/40 text-[#00d4f7] hover:bg-[#00d4f7]/20 hover:border-[#00d4f7]/60',
    secondary: 'bg-white/5 border border-[#1a2840] text-[#94a3b8] hover:bg-white/10 hover:text-[#e2e8f0]',
    danger: 'bg-[#f43f5e]/10 border border-[#f43f5e]/40 text-[#f43f5e] hover:bg-[#f43f5e]/20',
    ghost: 'border-transparent text-[#94a3b8] hover:text-[#e2e8f0]',
    success: 'bg-[#10b981]/10 border border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/20',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1 text-[10px] tracking-widest',
    md: 'px-4 py-2 text-xs tracking-wider',
    lg: 'px-6 py-3 text-sm tracking-wider',
  };
  return (
    <button
      {...props}
      className={`font-mono uppercase font-semibold rounded-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

// ---- Metric Row ----
export function MetricRow({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a2840] last:border-0">
      <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">{label}</span>
      <span className={`text-xs font-mono font-semibold ${accent ?? 'text-[#e2e8f0]'}`}>
        {value}{unit && <span className="text-[#64748b] text-[9px] ml-1">{unit}</span>}
      </span>
    </div>
  );
}

// ---- Progress Bar ----
export function ProgressBar({ value, max = 100, color = '#00d4f7', label }: { value: number; max?: number; color?: string; label?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      {label && <div className="flex justify-between text-[10px] font-mono text-[#64748b]">
        <span>{label}</span><span>{Math.round(pct)}%</span>
      </div>}
      <div className="h-1 bg-[#1a2840] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ---- Countdown Ring ----
export function CountdownRing({ seconds, total = 10 }: { seconds: number; total?: number }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const progress = ((total - seconds) / total) * circ;
  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="absolute w-16 h-16 -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#1a2840" strokeWidth="3" />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={circ - progress}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <span className="font-mono font-bold text-[#f59e0b] text-lg relative">{seconds}</span>
    </div>
  );
}
