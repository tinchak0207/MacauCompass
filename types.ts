export enum NavView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  INDUSTRY = 'INDUSTRY',
  COSTS = 'COSTS',
  TRADEMARKS = 'TRADEMARKS',
  AI_ADVISOR = 'AI_ADVISOR'
}

export interface IndustryData {
  name: string;
  newCompanies: number;
  growth: number;
}

export interface CostData {
  district: string;
  rentPerSqFt: number;
  avgSalary: number;
}

export interface TrademarkData {
  month: string;
  applications: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

// API Response Types
export interface CompanyApiValue {
  periodString: string; // Format "YYYYMM"
  value: number;
}

export interface CompanyApiResponse {
  values: CompanyApiValue[];
  title?: string;
  unit?: string;
}

export interface MarketStats {
  latestMonthStr: string;
  newCompaniesCurrent: number;
  newCompaniesPrevious: number;
  newCompaniesGrowth: number;
  trademarkHistory: TrademarkData[];
  lastUpdated: Date;
}