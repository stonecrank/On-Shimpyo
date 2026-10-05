export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type CounselorId = 'warm_mentor' | 'rights_advocate' | 'burnout_coach' | 'bamboo_forest';

export interface CounselorPersona {
  id: CounselorId;
  name: string;
  roleTitle: string;
  avatar: string;
  badge: string;
  description: string;
  welcomeMessage: string;
  accentColor: string;
}

export type TeacherLevel = '초등학교' | '중학교' | '고등학교' | '유치원/어린이집' | '특수학교' | '기타 교원';

export interface RefinedDraft {
  title: string;
  message: string;
  rationale: string;
}

export interface RefineReplyResult {
  summary: string;
  recommendedDrafts: RefinedDraft[];
  teacherSelfCareTip: string;
}

export interface PrescriptionData {
  prescriptionTitle: string;
  counselorLetter: string;
  quote: string;
  quoteAuthor: string;
  recommendedTea: {
    name: string;
    benefit: string;
  };
  threeMinuteMission: string;
  affirmation: string;
}

export interface CounselingRecord {
  id: string;
  counselorId: CounselorId;
  counselorName: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  weather: string;
  teacherNote?: string;
  messages: ChatMessage[];
}

export interface SavedPrescriptionItem {
  id: string;
  createdAt: number;
  title: string;
  struggle: string;
  data: PrescriptionData;
}

export interface SavedIncidentLog {
  id: string;
  createdAt: number;
  situationType: string;
  situationTitle: string;
  originalSituation: string;
  selectedDraft: string;
  rationale: string;
  teacherMemo?: string;
}

export interface TeacherStats {
  totalSessions: number;
  totalMessages: number;
  totalPrescriptions: number;
  totalIncidentLogs: number;
  weatherDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  counselorDistribution: Record<string, number>;
}

export type StressDomainType = '민원' | '업무' | '수업' | '관계' | '소진';

export interface StressDomainScore {
  domain: StressDomainType;
  label: string;
  icon: string;
  score: number; // 0-100
  percentage: number; // 0-100 relative weight
  count: number; // number of conversation turns / records
  statusLevel: '안정' | '주의' | '경계' | '위험';
  primaryTriggers: string[];
  copingRecommendation: string;
}

export interface StressAnalyticsReport {
  analyzedAt: number;
  dominantDomain: StressDomainType;
  overallBurnoutRisk: '안정' | '주의' | '경계' | '위험';
  burnoutScore: number; // 0-100
  domainScores: StressDomainScore[];
  aiComprehensiveDiagnosis: string;
  stressRootCauses: string[];
  personalizedCounselingDirectives: string[];
  weeklyProtectionAction: string;
  stressTrend: {
    period: string;
    complaintScore: number;
    workloadScore: number;
    classroomScore: number;
  }[];
}


