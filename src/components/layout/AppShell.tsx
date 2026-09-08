import React, { useState } from 'react';
import { useAegis } from '../../store/AegisContext';
import type { AppPage } from '../../types';

const NAV_ITEMS: { id: AppPage; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '⬡' },
  { id: 'monitor', label: 'Live Monitor', icon: '◉' },
  { id: 'devices', label: 'Devices', icon: '⊞' },
  { id: 'emergencies', label: 'Emergencies', icon: '⚠' },
  { id: 'map', label: 'Map', icon: '◎' },
  { id: 'responders', label: 'Responders', icon: '◈' },
  { id: 'analytics', label: 'Analytics', icon: '∿' },
  { id: 'admin', label: 'Admin', icon: '⊛' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, navigate, setMode, dismissNotification, setPresentationMode } = useAegis();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeEvents = state.events.filter(e => e.status !== 'RESOLVED');
  const hasEmergency = state.fallState === 'EMERGENCY_CONFIRMED' || activeEvents.some(e => e.status === 'CONFIRMED' || e.status === 'RESPONDER_ALERTED');

  return (
    <div className={`flex h-full overflow-hidden ${hasEmergency ? 'emergency-active' : ''}`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#0a1020] border-r border-[#1a2840] flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${state.presentationMode ? 'lg:hidden' : 'lg:translate-x-0 lg:static lg:flex'}`}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#1a2840]">
          <button onClick={() => navigate('landing')} className="block w-full text-left">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${hasEmergency ? 'bg-[#f43f5e] animate-pulse' : 'bg-[#00d4f7] animate-pulse'}`} />
              <span className="font-display font-bold text-xl tracking-[0.2em] text-[#e2e8f0]">AEGIS</span>
            </div>
            <p className="text-[9px] font-mono text-[#475569] tracking-[0.15em] mt-0.5 pl-4">AI GUARDIAN SYSTEM</p>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-4 py-3 border-b border-[#1a2840]">
          <div className="flex rounded-sm overflow-hidden border border-[#1a2840]">
            <button
              onClick={() => setMode('live')}
              className={`flex-1 py-1.5 text-[9px] font-mono tracking-widest uppercase transition-all ${
                state.mode === 'live'
                  ? 'bg-[#00d4f7]/15 text-[#00d4f7]'
                  : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
            >
              ● LIVE
            </button>
            <button
              onClick={() => setMode('demo')}
              className={`flex-1 py-1.5 text-[9px] font-mono tracking-widest uppercase transition-all ${
                state.mode === 'demo'
                  ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                  : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
            >
              ◆ DEMO
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map(item => {
            const isActive = state.page === item.id;
            const hasAlert = item.id === 'emergencies' && activeEvents.length > 0;
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all group
                  ${isActive
                    ? 'bg-[#00d4f7]/10 border-r-2 border-[#00d4f7] text-[#00d4f7]'
                    : 'text-[#475569] hover:text-[#94a3b8] hover:bg-white/3'
                  }`}
              >
                <span className="text-[11px] w-4">{item.icon}</span>
                <span className="text-[11px] font-mono tracking-widest uppercase">{item.label}</span>
                {hasAlert && (
                  <span className="ml-auto text-[9px] font-mono bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/30 px-1.5 py-0.5 rounded-sm">
                    {activeEvents.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="px-4 py-3 border-t border-[#1a2840]">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#475569] tracking-widest">DEVICES</span>
              <span className="text-[9px] font-mono text-[#00d4f7]">{state.devices.filter(d => d.status !== 'offline').length}/{state.devices.length} ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#475569] tracking-widest">INCIDENTS</span>
              <span className={`text-[9px] font-mono ${activeEvents.length > 0 ? 'text-[#f43f5e]' : 'text-[#10b981]'}`}>
                {activeEvents.length > 0 ? `${activeEvents.length} ACTIVE` : 'ALL CLEAR'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-11 flex items-center justify-between px-4 border-b border-[#1a2840] bg-[#0a1020]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-[#475569] hover:text-[#94a3b8]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            {/* Breadcrumb */}
            <span className="text-[10px] font-mono text-[#475569] tracking-widest uppercase">
              AEGIS / {state.page.toUpperCase()}
            </span>
            {state.mode === 'demo' && (
              <>
                <span className="text-[9px] font-mono bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 px-2 py-0.5 rounded-sm tracking-widest">
                  DEMO MODE
                </span>
                <button
                  onClick={() => setPresentationMode(!state.presentationMode)}
                  className={`px-2 py-0.5 text-[9px] font-mono border rounded-sm transition-all flex items-center gap-1 ${
                    state.presentationMode
                      ? 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]'
                      : 'border-[#1a2840] text-[#64748b] hover:text-[#94a3b8] hover:border-[#475569]'
                  }`}
                  title="Toggle Full-Screen Presentation Mode"
                >
                  <span>⛶</span>
                  <span>{state.presentationMode ? 'EXIT PRESENTATION' : 'PRESENTATION'}</span>
                </button>
              </>
            )}
          </div>

          {/* Status strip */}
          <div className="flex items-center gap-4">
            {hasEmergency && (
              <div className="flex items-center gap-1.5 text-[#f43f5e] animate-pulse">
                <span className="text-[9px] font-mono tracking-widest">⚠ EMERGENCY ACTIVE</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[9px] font-mono text-[#64748b]">
                {new Date().toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
          </div>
        </header>

        {/* Notification Stack */}
        {state.notifications.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
            {state.notifications.slice(0, 3).map(n => (
              <div
                key={n.id}
                className={`animate-slide-in-right flex items-start gap-3 p-3 rounded-sm border pointer-events-auto
                  ${n.type === 'emergency' ? 'bg-[#f43f5e]/10 border-[#f43f5e]/30' :
                    n.type === 'warning' ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30' :
                    'bg-[#0a1020] border-[#1a2840]'}`}
              >
                <p className="text-xs font-mono text-[#e2e8f0] flex-1 leading-relaxed">{n.message}</p>
                <button
                  onClick={() => dismissNotification(n.id)}
                  className="text-[#475569] hover:text-[#94a3b8] text-xs mt-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
