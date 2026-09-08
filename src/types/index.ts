export type AppPage =
  | 'landing'
  | 'overview'
  | 'monitor'
  | 'devices'
  | 'emergencies'
  | 'map'
  | 'responders'
  | 'analytics'
  | 'admin'
  | 'settings';

export type AppMode = 'live' | 'demo';

export type DeviceStatus = 'online' | 'offline' | 'streaming' | 'emergency' | 'idle';
export type DeviceType = 'camera' | 'thermal' | 'sensor' | 'mobile';

export interface DeviceLocation {
  lat: number;
  lon: number;
  label: string;
  accuracy?: number;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  location: DeviceLocation;
  status: DeviceStatus;
  isStreaming: boolean;
  lastSeen: Date;
  currentEventId?: string;
  fps?: number;
  resolution?: string;
  hasThermal?: boolean;
}

export type FallState =
  | 'NORMAL'
  | 'PERSON_DETECTED'
  | 'MOVING'
  | 'POSSIBLE_FALL'
  | 'VERIFYING'
  | 'EMERGENCY_CONFIRMED'
  | 'RECOVERED';

export type EmergencyType = 'PERSON_FALL' | 'FIRE' | 'ANIMAL_DISTRESS' | 'SMOKE' | 'THERMAL_ANOMALY';
export type SeverityLevel = 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EmergencyStatus =
  | 'DETECTING'
  | 'VERIFYING'
  | 'CONFIRMED'
  | 'RESPONDER_ALERTED'
  | 'RESPONDER_ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'RESOLVED';

export interface TimelineEntry {
  stage: string;
  label: string;
  timestamp: Date;
}

export interface EmergencyEvent {
  id: string;
  type: EmergencyType;
  severity: SeverityLevel;
  sourceDeviceId: string;
  location: DeviceLocation;
  status: EmergencyStatus;
  assignedResponderId?: string;
  createdAt: Date;
  updatedAt: Date;
  timeline: TimelineEntry[];
  isDemo: boolean;
  detectionData?: {
    poseConfidence?: number;
    fallConfidence?: number;
    motionlessDuration?: number;
    fireConfidence?: number;
    thermalHotspot?: boolean;
  };
}

export type ResponderType = 'security' | 'medical' | 'fire' | 'animal_rescue';
export type ResponderStatus = 'available' | 'en_route' | 'arrived' | 'offline';

export interface Responder {
  id: string;
  name: string;
  type: ResponderType;
  location: DeviceLocation;
  status: ResponderStatus;
  distance?: number;
  assignedEventId?: string;
}

export interface DetectionOverlay {
  bbox: { x: number; y: number; w: number; h: number };
  label: string;
  confidence: number;
  status: 'MONITORED' | 'NORMAL' | 'INVESTIGATING' | 'WARNING' | 'EMERGENCY';
  posePoints?: { x: number; y: number }[];
  skeleton?: [number, number][];
  motionVector?: { dx: number; dy: number };
}

export type DemoScenarioId =
  | 'human_fall'
  | 'remote_fall'
  | 'fire_thermal'
  | 'animal_distress'
  | 'campus_incident'
  | 'multi_camera';

export type DemoPhase =
  | 'selector'
  | 'monitoring'
  | 'movement'
  | 'fall'
  | 'verifying'
  | 'confirmed'
  | 'located'
  | 'alerted'
  | 'accepted'
  | 'enroute';

export interface EvidenceSignal {
  id: string;
  label: string;
  confirmed: boolean;
  timestamp?: Date;
}

export interface DemoStep {
  time: number;
  action: string;
  payload?: Record<string, unknown>;
  label: string;
}

export interface DemoScenario {
  id: DemoScenarioId;
  name: string;
  description: string;
  category?: string;
  recommended?: boolean;
  duration: number;
  steps: DemoStep[];
}

export interface AegisSettings {
  fallVerificationSeconds: number;
  motionlessThresholdSeconds: number;
  poseConfidenceThreshold: number;
  demoThermalMode: boolean;
  notificationsEnabled: boolean;
  cameraId: string;
  retentionDays: number;
  autoResetDemo: boolean;
}

export interface GeoLocation {
  lat: number;
  lon: number;
  accuracy: number;
  timestamp: number;
  source: 'gps' | 'demo' | 'manual' | 'unavailable';
}

export interface AnalyticsData {
  incidentsToday: number;
  incidentsByType: Record<EmergencyType, number>;
  deviceUptime: Record<string, number>;
  avgResponseTime: number;
  resolvedCount: number;
  activeCount: number;
}
