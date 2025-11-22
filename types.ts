export enum NavView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  INDUSTRY = 'INDUSTRY',
  COMMERCIAL_RADAR = 'COMMERCIAL_RADAR',
  TRADEMARKS = 'TRADEMARKS',
  BOARDROOM = 'BOARDROOM',
  BUSINESS_PLAN = 'BUSINESS_PLAN'
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

// Commercial Radar Types
export interface CompetitorPlace {
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  vicinity?: string;
  types?: string[];
  mapsUri?: string;
}

export interface RadarParams {
  district: string;
  businessType: string;
}

export interface RadarMetrics {
  competitorCount: number;
  avgRating?: number;
  densityScore?: number;
}

export interface RadarAnalysis {
  competitors: CompetitorPlace[];
  saturationLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  insights: string;
  recommendations: string[];
  metrics: RadarMetrics;
  updatedAt: string;
}

// Business Plan Types
export interface BusinessPlanParams {
  district: string;
  businessType: string;
  budget: number;
}

export interface BusinessPlan {
  title: string;
  summary: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  financialProjection: {
    initialInvestment: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    breakEvenMonths: number;
  };
  compliance: string[];
  markdown: string;
}