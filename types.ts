export enum NavView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  INDUSTRY = 'INDUSTRY',
  BUSINESS_SIMULATOR = 'BUSINESS_SIMULATOR',
  TRADEMARKS = 'TRADEMARKS',
  AI_ADVISOR = 'AI_ADVISOR',
  SITE_INSPECTOR = 'SITE_INSPECTOR'
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

export interface MedianEarningsData {
  value: number; // in MOP
  periodString: string;
  growth?: number;
}

export interface InterestRateData {
  primeLendingRate: number; // percentage
  periodString: string;
  growth?: number;
}

export interface InflationData {
  rate: number; // percentage
  periodString: string;
}

export interface MarketStats {
  latestMonthStr: string;
  newCompaniesCurrent: number;
  newCompaniesPrevious: number;
  newCompaniesGrowth: number;
  trademarkHistory: TrademarkData[];
  industryData: IndustryData[];
  medianEarnings?: MedianEarningsData;
  interestRate?: InterestRateData;
  inflation?: InflationData;
  lastUpdated: Date;
}

export interface SimulationParams {
  district: string;
  shopSize: number; // in square feet
  employeeCount: number;
  renovationBudget: number;
}

export interface SimulationResult {
  monthlyRent: number;
  monthlyPayroll: number;
  monthlyFixedCosts: number;
  totalInitialInvestment: number;
  burnRate: number;
}

export interface DistrictData {
  id: string;
  name: string;
  nameZh: string;
  rentPerSqFt: number;
  avgSalary: number;
  coordinates: { x: number; y: number };
}

export interface RiskAssessment {
  overall: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    rentBurden: { level: string; description: string };
    scalability: { level: string; description: string };
    cashFlow: { level: string; description: string };
  };
  recommendations: string[];
  monthlySurvival: number; // months of runway
}

export interface SiteAuditResult {
  visibilityScore: number; // 0-100
  visibilityAnalysis: string;
  industryFit: {
    suitable: string[];
    unsuitable: string[];
    recommendation: string;
  };
  conditionAssessment: {
    issues: string[];
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    riskFactors: string[];
  };
  overallRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  recommendations: string[];
}