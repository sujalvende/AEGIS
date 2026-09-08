import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type {
  AppPage, AppMode, Device, EmergencyEvent, Responder,
  FallState, EmergencyType, SeverityLevel, EmergencyStatus,
  AegisSettings, GeoLocation, DemoScenarioId, DemoStep, DemoPhase, EvidenceSignal,
} from '../types';
import { DEMO_DEVICES, DEMO_RESPONDERS, DEMO_SCENARIOS, DEMO_LOCATION_MAP } from '../demo/data';

interface AegisState {
  page: AppPage;
  mode: AppMode;
  devices: Device[];
  events: EmergencyEvent[];
  responders: Responder[];
  fallState: FallState;
  activeEventId: string | null;
  activeDeviceId: string | null;
  location: GeoLocation | null;
  settings: AegisSettings;
  demoRunning: boolean;
  demoScenarioId: DemoScenarioId | null;
  demoElapsed: number;
  demoTimeline: { time: number; label: string }[];
  notifications: { id: string; message: string; type: 'info' | 'warning' | 'emergency'; timestamp: Date }[];
  animalDetected: boolean;
  fireDetected: boolean;
  thermalHotspot: boolean;
  poseConfidence: number;
  fallConfidence: number;
  motionlessDuration: number;
  verifyCountdown: number;
  multiObjectMode: boolean;
  // New demo experience fields
  demoPhase: DemoPhase;
  evidenceStack: EvidenceSignal[];
  webcamMode: boolean;
  presentationMode: boolean;
  motionVelocity: number; // 0–1 signal for movement graph
}

type AegisAction =
  | { type: 'SET_PAGE'; page: AppPage }
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'SET_FALL_STATE'; state: FallState }
  | { type: 'SET_ACTIVE_DEVICE'; id: string | null }
  | { type: 'SET_LOCATION'; location: GeoLocation }
  | { type: 'CREATE_EMERGENCY'; event: EmergencyEvent }
  | { type: 'UPDATE_EMERGENCY'; id: string; updates: Partial<EmergencyEvent> }
  | { type: 'UPDATE_DEVICE'; id: string; updates: Partial<Device> }
  | { type: 'UPDATE_RESPONDER'; id: string; updates: Partial<Responder> }
  | { type: 'ADD_NOTIFICATION'; notification: AegisState['notifications'][0] }
  | { type: 'DISMISS_NOTIFICATION'; id: string }
  | { type: 'SET_DEMO_RUNNING'; running: boolean; scenarioId?: DemoScenarioId }
  | { type: 'SET_DEMO_ELAPSED'; elapsed: number }
  | { type: 'ADD_DEMO_TIMELINE'; entry: { time: number; label: string } }
  | { type: 'SET_DETECTION'; poseConfidence: number; fallConfidence: number; motionlessDuration: number }
  | { type: 'SET_VERIFY_COUNTDOWN'; countdown: number }
  | { type: 'SET_ANIMAL_DETECTED'; value: boolean }
  | { type: 'SET_FIRE_DETECTED'; value: boolean }
  | { type: 'SET_THERMAL_HOTSPOT'; value: boolean }
  | { type: 'SET_MULTI_OBJECT'; value: boolean }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AegisSettings> }
  | { type: 'SET_DEMO_PHASE'; phase: DemoPhase }
  | { type: 'ADD_EVIDENCE'; signal: EvidenceSignal }
  | { type: 'SET_WEBCAM_MODE'; value: boolean }
  | { type: 'SET_PRESENTATION_MODE'; value: boolean }
  | { type: 'SET_MOTION_VELOCITY'; value: number }
  | { type: 'RESET_DEMO' };

const DEFAULT_SETTINGS: AegisSettings = {
  fallVerificationSeconds: 10,
  motionlessThresholdSeconds: 3,
  poseConfidenceThreshold: 0.7,
  demoThermalMode: true,
  notificationsEnabled: true,
  cameraId: '',
  retentionDays: 30,
  autoResetDemo: false,
};

function reducer(state: AegisState, action: AegisAction): AegisState {
  switch (action.type) {
    case 'SET_PAGE': return { ...state, page: action.page };
    case 'SET_MODE': return { ...state, mode: action.mode };
    case 'SET_FALL_STATE': return { ...state, fallState: action.state };
    case 'SET_ACTIVE_DEVICE': return { ...state, activeDeviceId: action.id };
    case 'SET_LOCATION': return { ...state, location: action.location };
    case 'CREATE_EMERGENCY':
      return { ...state, events: [action.event, ...state.events], activeEventId: action.event.id };
    case 'UPDATE_EMERGENCY':
      return {
        ...state,
        events: state.events.map(e =>
          e.id === action.id ? { ...e, ...action.updates, updatedAt: new Date() } : e
        ),
      };
    case 'UPDATE_DEVICE':
      return { ...state, devices: state.devices.map(d => d.id === action.id ? { ...d, ...action.updates } : d) };
    case 'UPDATE_RESPONDER':
      return { ...state, responders: state.responders.map(r => r.id === action.id ? { ...r, ...action.updates } : r) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications].slice(0, 10) };
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.id) };
    case 'SET_DEMO_RUNNING':
      return {
        ...state,
        demoRunning: action.running,
        demoScenarioId: action.scenarioId ?? state.demoScenarioId,
        demoElapsed: action.running ? 0 : state.demoElapsed,
        demoTimeline: action.running ? [] : state.demoTimeline,
      };
    case 'SET_DEMO_ELAPSED': return { ...state, demoElapsed: action.elapsed };
    case 'ADD_DEMO_TIMELINE':
      return { ...state, demoTimeline: [...state.demoTimeline, action.entry] };
    case 'SET_DETECTION':
      return { ...state, poseConfidence: action.poseConfidence, fallConfidence: action.fallConfidence, motionlessDuration: action.motionlessDuration };
    case 'SET_VERIFY_COUNTDOWN': return { ...state, verifyCountdown: action.countdown };
    case 'SET_ANIMAL_DETECTED': return { ...state, animalDetected: action.value };
    case 'SET_FIRE_DETECTED': return { ...state, fireDetected: action.value };
    case 'SET_THERMAL_HOTSPOT': return { ...state, thermalHotspot: action.value };
    case 'SET_MULTI_OBJECT': return { ...state, multiObjectMode: action.value };
    case 'UPDATE_SETTINGS': return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'SET_DEMO_PHASE': return { ...state, demoPhase: action.phase };
    case 'ADD_EVIDENCE':
      // Avoid duplicates
      if (state.evidenceStack.find(e => e.id === action.signal.id)) return state;
      return { ...state, evidenceStack: [...state.evidenceStack, action.signal] };
    case 'SET_WEBCAM_MODE': return { ...state, webcamMode: action.value };
    case 'SET_PRESENTATION_MODE': return { ...state, presentationMode: action.value };
    case 'SET_MOTION_VELOCITY': return { ...state, motionVelocity: action.value };
    case 'RESET_DEMO':
      return {
        ...state,
        fallState: 'NORMAL',
        activeEventId: null,
        demoRunning: false,
        demoElapsed: 0,
        demoTimeline: [],
        demoScenarioId: null,
        poseConfidence: 0,
        fallConfidence: 0,
        motionlessDuration: 0,
        verifyCountdown: 0,
        animalDetected: false,
        fireDetected: false,
        thermalHotspot: false,
        multiObjectMode: false,
        notifications: [],
        demoPhase: 'selector',
        evidenceStack: [],
        motionVelocity: 0,
        devices: DEMO_DEVICES.map(d => ({ ...d, status: d.status === 'emergency' ? 'online' : d.status, currentEventId: undefined })),
        responders: DEMO_RESPONDERS.map(r => ({ ...r, status: 'available', assignedEventId: undefined })),
      };
    default: return state;
  }
}

const initialState: AegisState = {
  page: 'landing',
  mode: 'demo',
  devices: DEMO_DEVICES,
  events: [],
  responders: DEMO_RESPONDERS,
  fallState: 'NORMAL',
  activeEventId: null,
  activeDeviceId: null,
  location: null,
  settings: DEFAULT_SETTINGS,
  demoRunning: false,
  demoScenarioId: null,
  demoElapsed: 0,
  demoTimeline: [],
  notifications: [],
  animalDetected: false,
  fireDetected: false,
  thermalHotspot: false,
  poseConfidence: 0,
  fallConfidence: 0,
  motionlessDuration: 0,
  verifyCountdown: 0,
  multiObjectMode: false,
  demoPhase: 'selector',
  evidenceStack: [],
  webcamMode: false,
  presentationMode: false,
  motionVelocity: 0,
};

interface AegisContextType {
  state: AegisState;
  navigate: (page: AppPage) => void;
  setMode: (mode: AppMode) => void;
  startDemo: (scenarioId: DemoScenarioId) => void;
  resetDemo: () => void;
  acceptResponder: (eventId: string, responderId: string) => void;
  resolveEvent: (eventId: string) => void;
  updateSettings: (s: Partial<AegisSettings>) => void;
  dismissNotification: (id: string) => void;
  triggerFallDetection: () => void;
  triggerFire: () => void;
  triggerAnimalDistress: () => void;
  setWebcamMode: (value: boolean) => void;
  setPresentationMode: (value: boolean) => void;
}

const AegisContext = createContext<AegisContextType | null>(null);

let eventCounter = 1;

export function AegisProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fallStateRef = useRef(state.fallState);
  fallStateRef.current = state.fallState;

  const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoStartRef = useRef<number>(0);
  const executedStepsRef = useRef<Set<number>>(new Set());
  const verifyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const motionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const navigate = useCallback((page: AppPage) => dispatch({ type: 'SET_PAGE', page }), []);
  const setMode = useCallback((mode: AppMode) => dispatch({ type: 'SET_MODE', mode }), []);
  const updateSettings = useCallback((s: Partial<AegisSettings>) => dispatch({ type: 'UPDATE_SETTINGS', settings: s }), []);
  const dismissNotification = useCallback((id: string) => dispatch({ type: 'DISMISS_NOTIFICATION', id }), []);
  const setWebcamMode = useCallback((value: boolean) => dispatch({ type: 'SET_WEBCAM_MODE', value }), []);
  const setPresentationMode = useCallback((value: boolean) => dispatch({ type: 'SET_PRESENTATION_MODE', value }), []);

  const addNotification = useCallback((message: string, type: 'info' | 'warning' | 'emergency') => {
    const id = `notif-${Date.now()}`;
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id, message, type, timestamp: new Date() } });
    if (type !== 'info') {
      setTimeout(() => dispatch({ type: 'DISMISS_NOTIFICATION', id }), 12000);
    }
  }, []);

  const createEmergency = useCallback((
    emergencyType: EmergencyType,
    severity: SeverityLevel,
    deviceId: string,
    isDemo: boolean,
    extraData?: Record<string, unknown>
  ) => {
    const id = `AEGIS-EVT-${String(eventCounter++).padStart(4, '0')}`;
    const loc = DEMO_LOCATION_MAP[deviceId] ?? { lat: 0, lon: 0, label: 'Unknown' };
    const now = new Date();
    const event: EmergencyEvent = {
      id,
      type: emergencyType,
      severity,
      sourceDeviceId: deviceId,
      location: loc,
      status: 'CONFIRMED',
      createdAt: now,
      updatedAt: now,
      isDemo,
      timeline: [
        { stage: 'DETECTED', label: 'Event Detected', timestamp: new Date(now.getTime() - 12000) },
        { stage: 'VERIFIED', label: 'Verified Motionless', timestamp: new Date(now.getTime() - 8000) },
        { stage: 'ASSESSED', label: 'Severity Assessed', timestamp: new Date(now.getTime() - 4000) },
        { stage: 'LOCATED', label: 'Location Identified', timestamp: new Date(now.getTime() - 2000) },
        { stage: 'ALERTED', label: 'Responder Alert Sent', timestamp: now },
      ],
      detectionData: extraData as EmergencyEvent['detectionData'],
    };
    dispatch({ type: 'CREATE_EMERGENCY', event });
    dispatch({ type: 'UPDATE_DEVICE', id: deviceId, updates: { status: 'emergency', currentEventId: id } });
    addNotification(`🚨 EMERGENCY: ${emergencyType.replace('_', ' ')} — ${loc.label}`, 'emergency');
    return id;
  }, [addNotification]);

  const alertResponder = useCallback((eventId: string, responderId: string) => {
    dispatch({ type: 'UPDATE_EMERGENCY', id: eventId, updates: { status: 'RESPONDER_ALERTED', assignedResponderId: responderId } });
    const responder = DEMO_RESPONDERS.find(r => r.id === responderId);
    if (responder) {
      addNotification(`📍 Responder ${responder.name} alerted — ${responder.distance}m away`, 'warning');
    }
    dispatch({ type: 'SET_DEMO_PHASE', phase: 'alerted' });
  }, [addNotification]);

  const acceptResponder = useCallback((eventId: string, responderId: string) => {
    const now = new Date();
    dispatch({
      type: 'UPDATE_EMERGENCY',
      id: eventId,
      updates: {
        status: 'RESPONDER_ACCEPTED',
        timeline: [
          ...(state.events.find(e => e.id === eventId)?.timeline ?? []),
          { stage: 'RESPONDER_ACCEPTED', label: 'Responder Accepted', timestamp: now },
          { stage: 'EN_ROUTE', label: 'Responder En Route', timestamp: new Date(now.getTime() + 1000) },
        ],
      },
    });
    dispatch({ type: 'UPDATE_RESPONDER', id: responderId, updates: { status: 'en_route', assignedEventId: eventId } });
    dispatch({ type: 'SET_DEMO_PHASE', phase: 'accepted' });
    addNotification(`✅ Responder en route to emergency`, 'info');
    // Transition to EN_ROUTE after 2s
    setTimeout(() => {
      dispatch({ type: 'UPDATE_EMERGENCY', id: eventId, updates: { status: 'EN_ROUTE' } });
      dispatch({ type: 'SET_DEMO_PHASE', phase: 'enroute' });
    }, 2000);
  }, [state.events, addNotification]);

  const resolveEvent = useCallback((eventId: string) => {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;
    const now = new Date();
    dispatch({
      type: 'UPDATE_EMERGENCY',
      id: eventId,
      updates: {
        status: 'RESOLVED',
        timeline: [
          ...(event.timeline ?? []),
          { stage: 'RESOLVED', label: 'Incident Resolved', timestamp: now },
        ],
      },
    });
    dispatch({ type: 'UPDATE_DEVICE', id: event.sourceDeviceId, updates: { status: 'streaming', currentEventId: undefined } });
    if (event.assignedResponderId) {
      dispatch({ type: 'UPDATE_RESPONDER', id: event.assignedResponderId, updates: { status: 'available', assignedEventId: undefined } });
    }
    dispatch({ type: 'SET_FALL_STATE', state: 'RECOVERED' });
    addNotification(`✅ Emergency ${eventId} resolved`, 'info');
  }, [state.events, addNotification]);

  const startVerifyCountdown = useCallback((seconds: number, onConfirm: () => void, onRecover: () => void) => {
    if (verifyTimerRef.current) clearInterval(verifyTimerRef.current);
    let remaining = seconds;
    dispatch({ type: 'SET_VERIFY_COUNTDOWN', countdown: remaining });
    verifyTimerRef.current = setInterval(() => {
      remaining -= 1;
      dispatch({ type: 'SET_VERIFY_COUNTDOWN', countdown: remaining });
      if (remaining <= 0) {
        clearInterval(verifyTimerRef.current!);
        onConfirm();
      }
    }, 1000);
    return () => {
      if (verifyTimerRef.current) clearInterval(verifyTimerRef.current);
      onRecover();
    };
  }, []);

  const triggerFallDetection = useCallback(() => {
    dispatch({ type: 'SET_FALL_STATE', state: 'POSSIBLE_FALL' });
    dispatch({ type: 'SET_DETECTION', poseConfidence: 0.94, fallConfidence: 0.87, motionlessDuration: 0 });
    dispatch({ type: 'SET_DEMO_PHASE', phase: 'fall' });
    dispatch({ type: 'SET_MOTION_VELOCITY', value: 0.95 });
    addNotification('⚠️ Possible fall detected — verifying...', 'warning');
    setTimeout(() => {
      dispatch({ type: 'SET_FALL_STATE', state: 'VERIFYING' });
      dispatch({ type: 'SET_DEMO_PHASE', phase: 'verifying' });
      dispatch({ type: 'SET_MOTION_VELOCITY', value: 0.1 });
      startVerifyCountdown(
        10,
        () => {
          dispatch({ type: 'SET_FALL_STATE', state: 'EMERGENCY_CONFIRMED' });
          dispatch({ type: 'SET_DEMO_PHASE', phase: 'confirmed' });
          // Build evidence stack
          const evidence = [
            { id: 'person', label: 'PERSON DETECTED', confirmed: true, timestamp: new Date() },
            { id: 'fall', label: 'FALL MOTION', confirmed: true, timestamp: new Date() },
            { id: 'no_recovery', label: 'NO RECOVERY', confirmed: true, timestamp: new Date() },
            { id: 'immobile', label: 'PERSISTENT IMMOBILITY', confirmed: true, timestamp: new Date() },
            { id: 'thermal', label: 'THERMAL CONTEXT', confirmed: true, timestamp: new Date() },
            { id: 'location', label: 'LOCATION AVAILABLE', confirmed: true, timestamp: new Date() },
          ];
          evidence.forEach((sig, i) => {
            setTimeout(() => dispatch({ type: 'ADD_EVIDENCE', signal: sig }), i * 300);
          });
          const eid = createEmergency('PERSON_FALL', 'HIGH', state.activeDeviceId ?? 'AEGIS-CAM-001', state.mode === 'demo', { poseConfidence: 0.94, fallConfidence: 0.92, motionlessDuration: 10 });
          setTimeout(() => {
            alertResponder(eid, 'RESP-SEC-01');
            dispatch({ type: 'SET_DEMO_PHASE', phase: 'alerted' });
          }, 2000);
        },
        () => {
          dispatch({ type: 'SET_FALL_STATE', state: 'RECOVERED' });
          dispatch({ type: 'SET_DEMO_PHASE', phase: 'monitoring' });
          addNotification('✅ Person recovered — monitoring resumed', 'info');
        }
      );
    }, 500);
  }, [state.activeDeviceId, state.mode, addNotification, createEmergency, alertResponder, startVerifyCountdown]);

  const triggerFire = useCallback(() => {
    dispatch({ type: 'SET_FIRE_DETECTED', value: true });
    dispatch({ type: 'SET_THERMAL_HOTSPOT', value: true });
    addNotification('🔥 Fire/smoke detected — CRITICAL', 'emergency');
    const eid = createEmergency('FIRE', 'CRITICAL', state.activeDeviceId ?? 'AEGIS-CAM-003', state.mode === 'demo', { fireConfidence: 0.91, thermalHotspot: true });
    setTimeout(() => alertResponder(eid, 'RESP-FIRE-01'), 2000);
  }, [state.activeDeviceId, state.mode, addNotification, createEmergency, alertResponder]);

  const triggerAnimalDistress = useCallback(() => {
    dispatch({ type: 'SET_ANIMAL_DETECTED', value: true });
    addNotification('🐾 Animal distress detected', 'warning');
    const eid = createEmergency('ANIMAL_DISTRESS', 'MEDIUM', state.activeDeviceId ?? 'AEGIS-CAM-006', state.mode === 'demo');
    setTimeout(() => alertResponder(eid, 'RESP-ANIMAL-01'), 2000);
  }, [state.activeDeviceId, state.mode, addNotification, createEmergency, alertResponder]);

  const executeStep = useCallback((step: DemoStep, elapsed: number) => {
    dispatch({ type: 'ADD_DEMO_TIMELINE', entry: { time: elapsed, label: step.label } });
    const p = step.payload ?? {};
    switch (step.action) {
      case 'SET_STATE':
        if (p.fallState) dispatch({ type: 'SET_FALL_STATE', state: p.fallState as FallState });
        if (p.deviceId) dispatch({ type: 'SET_ACTIVE_DEVICE', id: p.deviceId as string });
        if (p.fallState === 'NORMAL') {
          dispatch({ type: 'SET_DEMO_PHASE', phase: 'monitoring' });
          dispatch({ type: 'SET_MOTION_VELOCITY', value: 0.15 });
        }
        if (p.fallState === 'PERSON_DETECTED') {
          dispatch({ type: 'SET_DETECTION', poseConfidence: 0.93, fallConfidence: 0.1, motionlessDuration: 0 });
          dispatch({ type: 'SET_DEMO_PHASE', phase: 'monitoring' });
          dispatch({ type: 'SET_MOTION_VELOCITY', value: 0.25 });
          dispatch({ type: 'ADD_EVIDENCE', signal: { id: 'person', label: 'PERSON DETECTED', confirmed: true, timestamp: new Date() } });
        }
        if (p.fallState === 'MOVING') {
          dispatch({ type: 'SET_DETECTION', poseConfidence: 0.96, fallConfidence: 0.18, motionlessDuration: 0 });
          dispatch({ type: 'SET_DEMO_PHASE', phase: 'movement' });
          dispatch({ type: 'SET_MOTION_VELOCITY', value: 0.65 });
        }
        if (p.fallState === 'POSSIBLE_FALL') {
          dispatch({ type: 'SET_DETECTION', poseConfidence: 0.94, fallConfidence: 0.87, motionlessDuration: 0 });
          dispatch({ type: 'SET_DEMO_PHASE', phase: 'fall' });
          dispatch({ type: 'SET_MOTION_VELOCITY', value: 0.98 });
          addNotification('⚠️ Possible fall detected — verifying...', 'warning');
          dispatch({ type: 'ADD_EVIDENCE', signal: { id: 'fall', label: 'FALL MOTION', confirmed: true, timestamp: new Date() } });
        }
        if (p.fallState === 'VERIFYING') {
          dispatch({ type: 'SET_VERIFY_COUNTDOWN', countdown: 10 });
          dispatch({ type: 'SET_DEMO_PHASE', phase: 'verifying' });
          dispatch({ type: 'SET_MOTION_VELOCITY', value: 0.08 });
          dispatch({ type: 'ADD_EVIDENCE', signal: { id: 'no_recovery', label: 'NO RECOVERY', confirmed: true, timestamp: new Date() } });
        }
        break;
      case 'CONFIRM_EMERGENCY': {
        dispatch({ type: 'SET_FALL_STATE', state: 'EMERGENCY_CONFIRMED' });
        dispatch({ type: 'SET_DEMO_PHASE', phase: 'confirmed' });
        // Build evidence stack with delay for dramatic effect
        const evidence = [
          { id: 'immobile', label: 'PERSISTENT IMMOBILITY', confirmed: true, timestamp: new Date() },
          { id: 'thermal', label: 'THERMAL CONTEXT', confirmed: true, timestamp: new Date() },
          { id: 'location', label: 'LOCATION AVAILABLE', confirmed: true, timestamp: new Date() },
        ];
        evidence.forEach((sig, i) => {
          setTimeout(() => dispatch({ type: 'ADD_EVIDENCE', signal: sig }), i * 400);
        });
        const eid = createEmergency(
          (p.type as EmergencyType) ?? 'PERSON_FALL',
          (p.severity as SeverityLevel) ?? 'HIGH',
          (p.deviceId as string) ?? 'AEGIS-CAM-001',
          true,
          { poseConfidence: 0.94, fallConfidence: 0.92, motionlessDuration: 12 }
        );
        (window as unknown as Record<string, unknown>).__aegisPendingEventId = eid;
        break;
      }
      case 'ALERT_RESPONDER': {
        const eid = (window as unknown as Record<string, unknown>).__aegisPendingEventId as string | undefined;
        if (eid) alertResponder(eid, p.responderId as string);
        dispatch({ type: 'SET_DEMO_PHASE', phase: 'alerted' });
        break;
      }
      case 'FIRE_DETECTED':
        dispatch({ type: 'SET_FIRE_DETECTED', value: true });
        addNotification('🔥 RGB Fire/smoke signal detected', 'warning');
        break;
      case 'THERMAL_HOTSPOT':
        dispatch({ type: 'SET_THERMAL_HOTSPOT', value: true });
        addNotification('🌡️ Thermal hotspot detected', 'warning');
        break;
      case 'ANIMAL_DETECTED':
        dispatch({ type: 'SET_ANIMAL_DETECTED', value: true });
        dispatch({ type: 'ADD_EVIDENCE', signal: { id: 'animal', label: 'ANIMAL DETECTED', confirmed: true, timestamp: new Date() } });
        addNotification('🐾 Animal detected — monitoring', 'info');
        break;
      case 'ANIMAL_IMMOBILE':
        dispatch({ type: 'ADD_EVIDENCE', signal: { id: 'animal_immobile', label: 'PERSISTENT IMMOBILITY', confirmed: true, timestamp: new Date() } });
        addNotification('⚠️ Animal persistent immobility', 'warning');
        break;
      case 'MULTI_OBJECT':
        dispatch({ type: 'SET_MULTI_OBJECT', value: true });
        break;
      case 'MULTI_CAMERA_STATUS':
        dispatch({ type: 'SET_MULTI_OBJECT', value: true });
        break;
    }
  }, [state.demoScenarioId, addNotification, createEmergency, alertResponder]);

  const startDemo = useCallback((scenarioId: DemoScenarioId) => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    if (motionTimerRef.current) clearInterval(motionTimerRef.current);
    dispatch({ type: 'RESET_DEMO' });
    executedStepsRef.current = new Set();
    (window as unknown as Record<string, unknown>).__aegisPendingEventId = undefined;
    dispatch({ type: 'SET_DEMO_RUNNING', running: true, scenarioId });
    dispatch({ type: 'SET_DEMO_PHASE', phase: 'monitoring' });

    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    demoStartRef.current = Date.now();
    dispatch({ type: 'SET_ACTIVE_DEVICE', id: scenario.steps[0]?.payload?.deviceId as string ?? 'AEGIS-CAM-001' });

    demoTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - demoStartRef.current;
      dispatch({ type: 'SET_DEMO_ELAPSED', elapsed });

      if (fallStateRef.current === 'VERIFYING') {
        const verifyStep = scenario.steps.find(s => s.payload?.fallState === 'VERIFYING');
        const verifyStart = verifyStep?.time ?? 0;
        const countdownVal = Math.max(0, 10 - Math.floor((elapsed - verifyStart) / 1000));
        dispatch({ type: 'SET_VERIFY_COUNTDOWN', countdown: countdownVal });
      }

      for (const step of scenario.steps) {
        if (!executedStepsRef.current.has(step.time) && elapsed >= step.time) {
          executedStepsRef.current.add(step.time);
          executeStep(step, elapsed);
        }
      }

      if (elapsed >= scenario.duration) {
        clearInterval(demoTimerRef.current!);
        dispatch({ type: 'SET_DEMO_RUNNING', running: false });
      }
    }, 200);
  }, [executeStep]);

  const resetDemo = useCallback(() => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    if (verifyTimerRef.current) clearInterval(verifyTimerRef.current);
    if (motionTimerRef.current) clearInterval(motionTimerRef.current);
    (window as unknown as Record<string, unknown>).__aegisPendingEventId = undefined;
    dispatch({ type: 'RESET_DEMO' });
  }, []);

  useEffect(() => () => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    if (verifyTimerRef.current) clearInterval(verifyTimerRef.current);
    if (motionTimerRef.current) clearInterval(motionTimerRef.current);
  }, []);

  return (
    <AegisContext.Provider value={{
      state, navigate, setMode, startDemo, resetDemo,
      acceptResponder, resolveEvent, updateSettings,
      dismissNotification, triggerFallDetection, triggerFire, triggerAnimalDistress,
      setWebcamMode, setPresentationMode,
    }}>
      {children}
    </AegisContext.Provider>
  );
}

export function useAegis() {
  const ctx = useContext(AegisContext);
  if (!ctx) throw new Error('useAegis must be inside AegisProvider');
  return ctx;
}
