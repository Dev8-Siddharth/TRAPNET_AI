export enum ManipulationTactic {
  URGENCY = 'Urgency Pressure',
  FEAR = 'Fear Amplification',
  AUTHORITY = 'Authority Impersonation',
  SCARCITY = 'Scarcity Framing',
  EMOTIONAL = 'Emotional Hijacking',
  FINANCIAL = 'Financial Intimidation',
  SOCIAL_ENG = 'Social Engineering',
  TRUST = 'Trust Exploitation',
  OVERLOAD = 'Cognitive Overload',
  PERSONALIZATION = 'False Personalization'
}

export type EvidenceType = 'text' | 'image' | 'url' | 'audio' | 'document';

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  name: string;
  content: string; // text string, URL, or base64 data
  mimeType?: string;
  previewUrl?: string;
  timestamp: string;
}

export type EntityType = 
  | 'person' 
  | 'organization' 
  | 'phone' 
  | 'email' 
  | 'url' 
  | 'domain' 
  | 'payment_id' 
  | 'bank_account' 
  | 'date' 
  | 'amount' 
  | 'location' 
  | 'scam_term';

export interface ExtractedEntity {
  id: string;
  type: EntityType;
  value: string;
  role: string;
  confidence: number;
  isSuspicious?: boolean;
}

export type TimelineStatus = 'CONFIRMED' | 'INFERRED' | 'UNKNOWN';

export interface TimelineStep {
  id: string;
  timestamp: string;
  stage: string;
  description: string;
  sourceEvidenceName?: string;
  status: TimelineStatus;
}

export interface ConnectedEntityNode {
  id: string;
  label: string;
  type: EntityType | 'campaign' | 'incident';
  riskScore: number;
  incidentCount: number;
  connectedNodes: string[];
  confidence: number;
  note: string;
}

export interface MLFeature {
  featureName: string;
  weight: number;
  detectedValue: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface AttackStageItem {
  stage: string;
  status: 'completed' | 'active' | 'upcoming';
  description: string;
}

export interface RecommendedActions {
  immediate: string[];
  accountProtection: string[];
  evidencePreservation: string[];
  reporting: string[];
}

export interface InvestigationRecord {
  id: string;
  title: string;
  timestamp: string;
  fraud_type: string;
  risk_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence: number;
  victim_description: string;
  evidences: EvidenceItem[];
  entities: ExtractedEntity[];
  why_risky: string[];
  timeline: TimelineStep[];
  attack_stages: AttackStageItem[];
  connected_entities: ConnectedEntityNode[];
  recommended_actions: RecommendedActions;
  ml_features: MLFeature[];
  campaign_name?: string;
  isDemoCase?: boolean;
}

export interface Citation {
  title: string;
  source: string;
  url?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  citations?: Citation[];
}

export interface Campaign {
  id: string;
  name: string;
  fraudType: string;
  relatedIncidentsCount: number;
  domainsCount: number;
  phonesCount: number;
  emailsCount: number;
  upiCount: number;
  riskLevel: 'Critical' | 'High' | 'Moderate';
  status: 'Active' | 'Under Investigation' | 'Mitigated';
  description: string;
  entities: string[];
}

// Backward compatibility types for legacy reports
export interface AnalysisResult {
  tactic: ManipulationTactic | string;
  riskLevel: 'Low' | 'Medium' | 'Moderate' | 'High' | 'Critical';
  whatsHappening: string;
  whyItWorks: string;
  whyThisCaseIsRisky: string;
  cognitiveBiases: string[];
  linguisticMarkers: string[];
  realAuthorityComparison: string;
  deescalationScript: string;
  safeNextSteps: string[];
  confidence: number;
}

export interface ReportItem {
  id: string;
  timestamp: string;
  content: string;
  type: 'text' | 'voice';
  analysis: AnalysisResult;
}
