import { CompanyApiResponse, TrademarkData, MarketStats, IndustryData } from '../types';

const COMPANY_API_URL = 'https://dsec.apigateway.data.gov.mo/public/KeyIndicator/NewlyIncorporatedCompanies';
const COMPANY_APP_CODE = '09d43a591fba407fb862412970667de4';
const TRADEMARK_CSV_URL = 'https://api.data.gov.mo/document/download/8ff5d0ef-235c-4847-a4ca-0f9d5b515bb6?token=ZsJvwp4NMUMAsFeXeFoX3nhw0SBhmBYD&isNeedFile=0&lang=TC';

// Mock data generators for fallback
const getMockCompanyData = (): CompanyApiResponse => ({
  values: [
    { periodString: "202408", value: 390 },
    { periodString: "202409", value: 410 },
    { periodString: "202410", value: 428 }
  ]
});

const getMockTrademarkData = (): TrademarkData[] => [
  { month: '1月', applications: 320 },
  { month: '2月', applications: 280 },
  { month: '3月', applications: 350 },
  { month: '4月', applications: 410 },
  { month: '5月', applications: 390 },
  { month: '6月', applications: 450 },
  { month: '7月', applications: 430 },
  { month: '8月', applications: 480 },
];

const getMockIndustryData = (): IndustryData[] => [
  { name: '批發及零售業', newCompanies: 120, growth: 5.2 },
  { name: '建築業', newCompanies: 45, growth: -1.2 },
  { name: '商業服務', newCompanies: 98, growth: 12.5 },
  { name: '運輸及倉儲', newCompanies: 32, growth: 2.1 },
  { name: '資訊科技', newCompanies: 55, growth: 18.4 },
  { name: '酒店及餐飲', newCompanies: 88, growth: 8.7 },
  { name: '不動產業務', newCompanies: 40, growth: 1.5 },
];

export const fetchMarketData = async (): Promise<MarketStats> => {
  let companyData: CompanyApiResponse;
  let trademarkHistory: TrademarkData[] = [];

  // 1. Fetch Newly Incorporated Companies
  try {
    const companyResponse = await fetch(COMPANY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `APPCODE ${COMPANY_APP_CODE}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
    });

    if (companyResponse.ok) {
      companyData = await companyResponse.json();
    } else {
      console.warn('Company API returned non-OK status, using fallback.');
      companyData = getMockCompanyData();
    }
  } catch (error) {
    console.warn('Company API network error (likely CORS), using fallback.', error);
    companyData = getMockCompanyData();
  }

  // 2. Fetch Trademarks
  try {
    const trademarkResponse = await fetch(TRADEMARK_CSV_URL);
    if (trademarkResponse.ok) {
      const csvText = await trademarkResponse.text();
      trademarkHistory = parseTrademarkCSV(csvText);
    } else {
      console.warn('Trademark API returned non-OK status, using fallback.');
      trademarkHistory = getMockTrademarkData();
    }
  } catch (error) {
    console.warn('Trademark API network error, using fallback.', error);
    trademarkHistory = getMockTrademarkData();
  }

  // Normalize Data
  const sortedCompanies = (companyData.values || []).sort((a, b) => b.periodString.localeCompare(a.periodString));
  const currentCompany = sortedCompanies[0] || { value: 0, periodString: 'N/A' };
  const prevCompany = sortedCompanies[1] || { value: 0 };

  const growth = prevCompany.value !== 0
    ? ((currentCompany.value - prevCompany.value) / prevCompany.value) * 100 
    : 0;

  return {
    latestMonthStr: formatPeriod(currentCompany.periodString),
    newCompaniesCurrent: currentCompany.value,
    newCompaniesPrevious: prevCompany.value,
    newCompaniesGrowth: growth,
    trademarkHistory: trademarkHistory.length > 0 ? trademarkHistory.slice(-12) : getMockTrademarkData(),
    industryData: getMockIndustryData(),
    lastUpdated: new Date()
  };
};

// Helper to parse the Macau Open Data CSV format
const parseTrademarkCSV = (csv: string): TrademarkData[] => {
  const lines = csv.trim().split('\n');
  const data: TrademarkData[] = [];
  
  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',').map(p => p.replace(/"/g, ''));
    
    if (parts.length >= 3) {
      const year = parts[0];
      const month = parts[1];
      const qty = parseInt(parts[2], 10);
      
      if (!isNaN(qty)) {
        const shortYear = year.length === 4 ? year.substring(2) : year;
        const monthName = `${parseInt(month)}月`;
        
        data.push({
          month: `${monthName} ${shortYear}`,
          applications: qty
        });
      }
    }
  }
  
  return data;
};

const formatPeriod = (period: string): string => {
  if (!period || period.length !== 6) return period || '---';
  const year = period.substring(0, 4);
  const month = period.substring(4, 6);
  return `${year}年${month}月`;
};
