import React, { useState, useEffect } from 'react';
import { AegisProvider, useAegis } from './store/AegisContext';
import { AppShell } from './components/layout/AppShell';
import { Landing } from './pages/Landing';
import { Overview } from './pages/Overview';
import { LiveMonitor } from './pages/LiveMonitor';
import { Devices } from './pages/Devices';
import { Emergencies } from './pages/Emergencies';
import { MapPage } from './pages/MapPage';
import { Responders } from './pages/Responders';
import { Analytics } from './pages/Analytics';
import { Admin } from './pages/Admin';
import { Settings } from './pages/Settings';
import { ResponderDeviceModal } from './components/demo/ResponderDeviceModal';

function Router() {
  const { state } = useAegis();
  const [isResponderRoute, setIsResponderRoute] = useState(window.location.hash === '#responder');

  useEffect(() => {
    const handleHash = () => setIsResponderRoute(window.location.hash === '#responder');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // If user opens #responder on phone or second tab, show dedicated responder screen
  if (isResponderRoute) {
    return <ResponderDeviceModal isStandalone />;
  }

  if (state.page === 'landing') {
    return <Landing />;
  }

  const pages: Record<string, React.ReactNode> = {
    overview: <Overview />,
    monitor: <LiveMonitor />,
    devices: <Devices />,
    emergencies: <Emergencies />,
    map: <MapPage />,
    responders: <Responders />,
    analytics: <Analytics />,
    admin: <Admin />,
    settings: <Settings />,
  };

  return (
    <AppShell>
      {pages[state.page] ?? <Overview />}
    </AppShell>
  );
}

export default function App() {
  return (
    <AegisProvider>
      <Router />
    </AegisProvider>
  );
}
