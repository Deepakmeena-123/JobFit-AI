export interface User {
  userId: number;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  userId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

export enum AnalysisType {
  GITHUB = 'GITHUB',
  LINKEDIN = 'LINKEDIN',
  RESUME = 'RESUME',
}

export interface MicroCategory {
  id: number;
  categoryName: string;
  categoryScore: number;
  categoryDescription: string;
}

export interface Analysis {
  id: number;
  analysisType: AnalysisType;
  overallScore: number;
  analysisText: string;
  suggestions: string;
  createdAt: string;
  microCategories: MicroCategory[];
}

export interface ChatMessage {
  id: number;
  message: string;
  response: string;
  messageType?: string;
  createdAt: string;
}

export interface ChatRequest {
  message: string;
  messageType?: string;
}

// JD Matcher Types
export interface JDMatchCategory {
  id: number;
  categoryName: string;
  categoryScore: number;
  categoryDescription: string;
}

export interface JDMatchResponse {
  id: number;
  jobTitle?: string;
  companyName?: string;
  overallMatchScore: number;
  matchAnalysis: string;
  missingSkills?: string;
  missingKeywords?: string;
  suggestions: string;
  createdAt: string;
  matchCategories: JDMatchCategory[];
}

export interface User {
  userId: number;
  email: string;
  fullName: string;
  experience?: string;
  designation?: string;
  currentCompany?: string;
}