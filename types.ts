export enum NavView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  INDUSTRY = 'INDUSTRY',
  BUSINESS_SIMULATOR = 'BUSINESS_SIMULATOR',
  TRADEMARKS = 'TRADEMARKS',
  AI_ADVISOR = 'AI_ADVISOR',
  SITE_INSPECTOR = 'SITE_INSPECTOR',
  MARKET_INSIGHTS = 'MARKET_INSIGHTS'
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

// Group 1: Macroeconomic Data (DSEC APIs)
export interface GDPData {
  year: number;
  quarter: number;
  value: number; // Million MOP
  changeRate?: number; // %
}

export interface RetailSalesData {
  period: string;
  category: string; // 鐘錶/超市 etc
  value: number; // Sales amount
}

export interface VisitorArrivalsData {
  yearMonth: string;
  value: number; // Number of people
  yoyChange?: number; // % change YoY
}

export interface HotelOccupancyData {
  yearMonth: string;
  rate: number; // % occupancy
  starRating?: string; // 星級分類
}

export interface UnemploymentData {
  period: string;
  rate: number; // %
  laborForce?: number; // Total labor force
}

export interface NonResidentWorkersData {
  industry: string;
  countryOfOrigin: string;
  count: number;
}

// Group 2: Real-time Data (UUID APIs)
export interface ParkingSpaceData {
  name: string;
  carSpaces: number;
  motorbikeSpaces: number;
  updateTime: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  updateTime: string;
}

export interface BorderCrossingData {
  gateName: string;
  status: 'Normal' | 'Busy' | 'Congested';
  updateTime: string;
}

export interface FlightArrivalData {
  flightNo: string;
  origin: string;
  status: 'On Time' | 'Delayed' | 'Cancelled';
  scheduledTime: string;
}

// Group 3: POI Data (Venue/Location UUID APIs)
export interface RestaurantPOI {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string; // Restaurant category
}

export interface HotelPOI {
  name: string;
  starClass?: string;
  totalRooms?: number;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface TravelAgencyData {
  name: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface MICEEventData {
  eventName: string;
  venue: string;
  dateStart: string;
  dateEnd: string;
  organizer: string;
}

export interface BusRouteData {
  routeName: string;
  busStopCode: string;
  busStopName: string;
  latitude?: number;
  longitude?: number;
}

export interface PharmacyData {
  name: string;
  address: string;
  district: string;
  phone: string;
  latitude?: number;
  longitude?: number;
}

// Group 4: Market Insights (UUID APIs)
export interface PopulationData {
  districtName: string;
  populationTotal: number;
  density: number; // per km²
}

export interface PropertyTransactionData {
  year: number;
  month: number;
  district: string;
  avgPriceSqm: number; // MOP per sqm
}

export interface NewCompanyData {
  yearQuarter: string;
  registeredCapital: number;
  industryCode: string;
}

export interface WiFiLocationData {
  locationName: string;
  latitude: number;
  longitude: number;
}

// Comprehensive market data structure
export interface ComprehensiveMarketData {
  // Macro indicators
  gdp?: GDPData[];
  retailSales?: RetailSalesData[];
  visitorArrivals?: VisitorArrivalsData[];
  hotelOccupancy?: HotelOccupancyData[];
  unemployment?: UnemploymentData[];
  nonResidentWorkers?: NonResidentWorkersData[];
  
  // Real-time data
  parking?: ParkingSpaceData[];
  weather?: WeatherData;
  borderCrossings?: BorderCrossingData[];
  flightArrivals?: FlightArrivalData[];
  
  // POI data
  restaurants?: RestaurantPOI[];
  hotels?: HotelPOI[];
  travelAgencies?: TravelAgencyData[];
  miceEvents?: MICEEventData[];
  busRoutes?: BusRouteData[];
  pharmacies?: PharmacyData[];
  
  // Market insights
  population?: PopulationData[];
  propertyTransactions?: PropertyTransactionData[];
  newCompanies?: NewCompanyData[];
  wifiLocations?: WiFiLocationData[];
  
  lastUpdated: Date;
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