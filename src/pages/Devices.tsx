import React, { useState } from 'react';
import { useAegis } from '../store/AegisContext';
import { DeviceStatusBadge, StatusDot, SectionHeader, Button, MonoLabel, Badge } from '../components/ui';
import type { Device } from '../types';

function DeviceRow({ device, onSelect }: { device: Device; onSelect: () => void }) {
  return (
    <tr className="cursor-pointer hover:bg-[#0f1928] transition-colors" onClick={onSelect}>
      <td className="px-3 py-3 font-mono text-xs text-[#00d4f7] font-semibold">{device.id}</td>
      <td className="px-3 py-3 font-mono text-xs text-[#e2e8f0]">{device.name}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <StatusDot status={device.status} />
          <DeviceStatusBadge status={device.status} />
        </div>
      </td>
      <td className="px-3 py-3 font-mono text-xs text-[#64748b]">
        {device.isStreaming ? (
          <span className="text-[#10b981]">● STREAMING</span>
        ) : (
          <span className="text-[#475569]">○ IDLE</span>
        )}
      </td>
      <td className="px-3 py-3 font-mono text-xs text-[#64748b]">{device.location.label}</td>
      <td className="px-3 py-3 font-mono text-xs text-[#475569]">
        {device.lastSeen.toLocaleTimeString('en-US', { hour12: false })}
      </td>
      <td className="px-3 py-3">
        {device.currentEventId ? (
          <Badge label={device.currentEventId} color="red" />
        ) : (
          <span className="text-[9px] font-mono text-[#1a2840]">—</span>
        )}
      </td>
    </tr>
  );
}

function DeviceDetail({ device, onClose }: { device: Device; onClose: () => void }) {
  const { state } = useAegis();
  const activeEvent = device.currentEventId
    ? state.events.find(e => e.id === device.currentEventId)
    : null;

  return (
    <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1a2840] flex items-center justify-between">
        <div>
          <p className="font-mono text-[#00d4f7] font-bold text-sm">{device.id}</p>
          <p className="text-[9px] font-mono text-[#475569]">{device.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <DeviceStatusBadge status={device.status} />
          <button onClick={onClose} className="text-[#475569] hover:text-[#94a3b8] text-xs font-mono">✕</button>
        </div>
      </div>
      <div className="p-4 grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <MonoLabel dim>LOCATION</MonoLabel>
            <p className="text-xs font-mono text-[#e2e8f0] mt-1">{device.location.label}</p>
            <p className="text-[9px] font-mono text-[#475569]">
              {device.location.lat.toFixed(6)}° N, {device.location.lon.toFixed(6)}° E
            </p>
          </div>
          <div>
            <MonoLabel dim>STREAM STATUS</MonoLabel>
            <p className={`text-xs font-mono mt-1 ${device.isStreaming ? 'text-[#10b981]' : 'text-[#475569]'}`}>
              {device.isStreaming ? '● STREAMING ACTIVE' : '○ NOT STREAMING'}
            </p>
          </div>
          {device.fps && (
            <div>
              <MonoLabel dim>PERFORMANCE</MonoLabel>
              <p className="text-xs font-mono text-[#94a3b8] mt-1">
                {device.fps} FPS · {device.resolution ?? 'Unknown resolution'}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <MonoLabel dim>LAST SEEN</MonoLabel>
            <p className="text-xs font-mono text-[#94a3b8] mt-1">
              {device.lastSeen.toLocaleTimeString('en-US', { hour12: false })}
            </p>
          </div>
          {activeEvent && (
            <div>
              <MonoLabel dim>ACTIVE EVENT</MonoLabel>
              <p className="text-xs font-mono text-[#f43f5e] mt-1">{activeEvent.id}</p>
              <p className="text-[9px] font-mono text-[#94a3b8]">{activeEvent.type.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <Button size="sm" variant="primary">WATCH LIVE</Button>
        <Button size="sm" variant="secondary">VIEW EVENTS</Button>
        <Button size="sm" variant="secondary">OPEN MAP</Button>
      </div>
    </div>
  );
}

function RegisterDeviceModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', type: 'camera', location: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    const id = `AEGIS-CAM-${String(Math.floor(Math.random() * 900) + 100)}`;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-[#0a1020] border border-[#1a2840] rounded-sm p-6 w-full max-w-sm space-y-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-sm bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center mx-auto">
              <span className="text-[#10b981] font-mono font-bold">✓</span>
            </div>
            <p className="font-display font-bold text-lg text-[#10b981]">DEVICE REGISTERED</p>
            <div className="p-3 bg-[#050810] border border-[#1a2840]">
              <p className="text-[9px] font-mono text-[#475569] mb-1">DEVICE ID</p>
              <p className="font-mono text-[#00d4f7] font-bold">{id}</p>
            </div>
            <p className="text-[10px] font-mono text-[#64748b]">Device is now visible in the device list. Open the monitoring URL on this device to begin streaming.</p>
          </div>
          <Button variant="secondary" className="w-full justify-center" onClick={onClose}>DONE</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#0a1020] border border-[#1a2840] rounded-sm p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg tracking-wider">REGISTER DEVICE</h2>
          <button onClick={onClose} className="text-[#475569] hover:text-[#94a3b8] font-mono text-xs">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', label: 'DEVICE NAME', placeholder: 'e.g. Campus Corridor C' },
            { id: 'location', label: 'LOCATION DESCRIPTION', placeholder: 'e.g. Building 3 – Floor 2' },
          ].map(field => (
            <div key={field.id}>
              <label className="text-[9px] font-mono text-[#475569] tracking-widest uppercase block mb-1">
                {field.label}
              </label>
              <input
                required
                className="w-full bg-[#050810] border border-[#1a2840] text-xs font-mono text-[#e2e8f0] px-3 py-2 rounded-sm focus:border-[#00d4f7]/40 outline-none transition-colors placeholder-[#1a2840]"
                placeholder={field.placeholder}
                value={form[field.id as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [field.id]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="text-[9px] font-mono text-[#475569] tracking-widest uppercase block mb-1">DEVICE TYPE</label>
            <select
              className="w-full bg-[#050810] border border-[#1a2840] text-xs font-mono text-[#e2e8f0] px-3 py-2 rounded-sm focus:border-[#00d4f7]/40 outline-none"
              value={form.type}
              onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="camera">Camera (RGB)</option>
              <option value="thermal">Camera (Thermal)</option>
              <option value="mobile">Mobile Device</option>
              <option value="sensor">Sensor Node</option>
            </select>
          </div>
          <div className="p-3 bg-[#050810] border border-[#1a2840] text-[9px] font-mono text-[#475569] leading-relaxed">
            Camera access requires user permission. AEGIS analyzes authorized feeds for emergency indicators only.
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1 justify-center">REGISTER</Button>
            <Button type="button" variant="secondary" onClick={onClose}>CANCEL</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Devices() {
  const { state } = useAegis();
  const [selected, setSelected] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [filter, setFilter] = useState<'all' | 'online' | 'streaming' | 'offline'>('all');

  const filtered = state.devices.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'online') return d.status !== 'offline';
    if (filter === 'streaming') return d.isStreaming;
    if (filter === 'offline') return d.status === 'offline';
    return true;
  });

  const selectedDevice = state.devices.find(d => d.id === selected);

  const stats = {
    total: state.devices.length,
    online: state.devices.filter(d => d.status !== 'offline').length,
    streaming: state.devices.filter(d => d.isStreaming).length,
    offline: state.devices.filter(d => d.status === 'offline').length,
    emergency: state.devices.filter(d => d.status === 'emergency').length,
  };

  return (
    <div className="p-4 space-y-4">
      {showRegister && <RegisterDeviceModal onClose={() => setShowRegister(false)} />}

      <SectionHeader
        title="DEVICES"
        sub="AEGIS / DEVICE MANAGEMENT"
        actions={
          <Button variant="primary" onClick={() => setShowRegister(true)}>
            + REGISTER DEVICE
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'TOTAL', value: stats.total, color: 'text-[#e2e8f0]' },
          { label: 'ONLINE', value: stats.online, color: 'text-[#00d4f7]' },
          { label: 'STREAMING', value: stats.streaming, color: 'text-[#10b981]' },
          { label: 'OFFLINE', value: stats.offline, color: 'text-[#475569]' },
          { label: 'EMERGENCY', value: stats.emergency, color: 'text-[#f43f5e]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 border border-[#1a2840] bg-[#0a1020]">
            <p className="text-[9px] font-mono text-[#475569] tracking-widest">{label}</p>
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(['all', 'online', 'streaming', 'offline'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase border rounded-sm transition-all ${
              filter === f
                ? 'border-[#00d4f7]/40 text-[#00d4f7] bg-[#00d4f7]/8'
                : 'border-[#1a2840] text-[#475569] hover:text-[#94a3b8]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Device detail */}
      {selectedDevice && (
        <DeviceDetail device={selectedDevice} onClose={() => setSelected(null)} />
      )}

      {/* Table */}
      <div className="border border-[#1a2840] bg-[#0a1020] rounded-sm overflow-hidden overflow-x-auto">
        <table className="ops-table">
          <thead>
            <tr>
              <th>DEVICE ID</th>
              <th>NAME</th>
              <th>STATUS</th>
              <th>STREAM</th>
              <th>LOCATION</th>
              <th>LAST SEEN</th>
              <th>EVENT</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <DeviceRow
                key={d.id}
                device={d}
                onSelect={() => setSelected(selected === d.id ? null : d.id)}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center font-mono text-[10px] text-[#475569]">
            NO DEVICES MATCHING FILTER
          </div>
        )}
      </div>
    </div>
  );
}
