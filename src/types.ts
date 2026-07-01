export type UserRole = 'citizen' | 'responder' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
}

export type DisasterType = 'flood' | 'cyclone' | 'earthquake' | 'wildfire' | 'landslide' | 'heatwave' | 'other';
export type DisasterSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DisasterStatus = 'reported' | 'reviewing' | 'dispatched' | 'resolved';

export interface LocationInfo {
  lat: number;
  lng: number;
  address: string;
}

export interface AIAssessment {
  damageAssessment: string;
  hazardsIdentified: string[];
  recommendedResponse: string;
  confidenceScore: number;
}

export interface DisasterReport {
  id: string;
  title: string;
  description: string;
  type: DisasterType;
  severity: DisasterSeverity;
  location: LocationInfo;
  status: DisasterStatus;
  reportedBy: string;
  reportedAt: string;
  imageUrl?: string; // base64 string
  aiAssessment?: AIAssessment | null;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger';
  area: string;
  createdAt: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface RiskFactors {
  temperature: number;
  humidity: number;
  windSpeed: number;
  seismicActivity: number; // 0-10
  vegetationDryness: number; // 0-100
  historicalIncidentsCount: number;
}

export interface RiskPrediction {
  region: string;
  riskLevel: 'low' | 'medium' | 'high';
  disasterType: DisasterType;
  confidenceScore: number;
  environmentalFactors: string[];
  recommendations: string[];
  lastUpdated: string;
}

export interface ResourceAllocation {
  id: string;
  reportId: string;
  responderTeam: string;
  personnelCount: number;
  vehiclesAllocated: string[];
  equipmentSent: string[];
  status: 'deploying' | 'on-scene' | 'returning' | 'completed';
  allocatedAt: string;
}
