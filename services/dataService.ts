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

  console.log('🔍 [DataService] ========== 開始獲取澳門政府開放平台數據 ==========');
  console.log('⏰ [DataService] 請求時間:', new Date().toLocaleString('zh-TW'));

  // 1. Fetch Newly Incorporated Companies
  console.log('\n📊 [Company API] 正在獲取新成立公司數據...');
  console.log('🌐 [Company API] URL:', COMPANY_API_URL);
  console.log('🔑 [Company API] APPCODE:', COMPANY_APP_CODE.substring(0, 8) + '...');
  
  try {
    const companyResponse = await fetch(COMPANY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `APPCODE ${COMPANY_APP_CODE}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
    });

    console.log('📡 [Company API] 響應狀態碼:', companyResponse.status, companyResponse.statusText);
    console.log('📋 [Company API] 響應標頭:', Object.fromEntries(companyResponse.headers.entries()));

    if (companyResponse.ok) {
      companyData = await companyResponse.json();
      console.log('✅ [Company API] 成功獲取數據!');
      console.log('📦 [Company API] 原始響應數據:', JSON.stringify(companyData, null, 2));
      console.log('📈 [Company API] 數據點數量:', companyData.values?.length || 0);
      
      if (companyData.values && companyData.values.length > 0) {
        console.log('📊 [Company API] 最新數據點:', companyData.values[0]);
      }
    } else {
      const errorText = await companyResponse.text();
      console.warn('⚠️ [Company API] 返回非成功狀態碼, 使用備用數據');
      console.warn('❌ [Company API] 錯誤響應內容:', errorText);
      companyData = getMockCompanyData();
      console.log('🔄 [Company API] 已切換到備用數據');
    }
  } catch (error) {
    console.error('❌ [Company API] 網絡錯誤 (可能是 CORS 問題)');
    console.error('🔍 [Company API] 錯誤詳情:', error);
    console.error('📝 [Company API] 錯誤堆疊:', (error as Error).stack);
    companyData = getMockCompanyData();
    console.log('🔄 [Company API] 已切換到備用數據');
  }

  // 2. Fetch Trademarks
  console.log('\n🏷️  [Trademark API] 正在獲取商標申請數據...');
  console.log('🌐 [Trademark API] URL:', TRADEMARK_CSV_URL);
  
  try {
    const trademarkResponse = await fetch(TRADEMARK_CSV_URL);
    
    console.log('📡 [Trademark API] 響應狀態碼:', trademarkResponse.status, trademarkResponse.statusText);
    console.log('📋 [Trademark API] 響應標頭:', Object.fromEntries(trademarkResponse.headers.entries()));
    
    if (trademarkResponse.ok) {
      const csvText = await trademarkResponse.text();
      console.log('✅ [Trademark API] 成功獲取 CSV 數據!');
      console.log('📄 [Trademark API] CSV 文件大小:', csvText.length, '字符');
      console.log('📝 [Trademark API] CSV 前 500 字符:', csvText.substring(0, 500));
      
      trademarkHistory = parseTrademarkCSV(csvText);
      
      console.log('✨ [Trademark API] CSV 解析完成!');
      console.log('📊 [Trademark API] 解析出的數據點數量:', trademarkHistory.length);
      
      if (trademarkHistory.length > 0) {
        console.log('📈 [Trademark API] 最早數據點:', trademarkHistory[0]);
        console.log('📈 [Trademark API] 最新數據點:', trademarkHistory[trademarkHistory.length - 1]);
      }
    } else {
      const errorText = await trademarkResponse.text();
      console.warn('⚠️ [Trademark API] 返回非成功狀態碼, 使用備用數據');
      console.warn('❌ [Trademark API] 錯誤響應內容:', errorText);
      trademarkHistory = getMockTrademarkData();
      console.log('🔄 [Trademark API] 已切換到備用數據');
    }
  } catch (error) {
    console.error('❌ [Trademark API] 網絡錯誤');
    console.error('🔍 [Trademark API] 錯誤詳情:', error);
    console.error('📝 [Trademark API] 錯誤堆疊:', (error as Error).stack);
    trademarkHistory = getMockTrademarkData();
    console.log('🔄 [Trademark API] 已切換到備用數據');
  }

  // Normalize Data
  console.log('\n🔧 [DataService] 開始處理和正規化數據...');
  
  const sortedCompanies = (companyData.values || []).sort((a, b) => b.periodString.localeCompare(a.periodString));
  console.log('📊 [DataService] 排序後的公司數據 (最新3筆):', sortedCompanies.slice(0, 3));
  
  const currentCompany = sortedCompanies[0] || { value: 0, periodString: 'N/A' };
  const prevCompany = sortedCompanies[1] || { value: 0 };

  const growth = prevCompany.value !== 0
    ? ((currentCompany.value - prevCompany.value) / prevCompany.value) * 100 
    : 0;

  console.log('📈 [DataService] 當前月份:', formatPeriod(currentCompany.periodString));
  console.log('📊 [DataService] 當前值:', currentCompany.value);
  console.log('📊 [DataService] 前月值:', prevCompany.value);
  console.log('📈 [DataService] 增長率:', growth.toFixed(2) + '%');

  const finalTrademarkData = trademarkHistory.length > 0 ? trademarkHistory.slice(-12) : getMockTrademarkData();
  console.log('🏷️  [DataService] 最終商標數據數量:', finalTrademarkData.length);
  console.log('📊 [DataService] 最終商標數據 (最後3筆):', finalTrademarkData.slice(-3));

  const finalStats = {
    latestMonthStr: formatPeriod(currentCompany.periodString),
    newCompaniesCurrent: currentCompany.value,
    newCompaniesPrevious: prevCompany.value,
    newCompaniesGrowth: growth,
    trademarkHistory: finalTrademarkData,
    industryData: getMockIndustryData(),
    lastUpdated: new Date()
  };

  console.log('\n✅ [DataService] ========== 數據獲取完成 ==========');
  console.log('📦 [DataService] 最終統計數據:', {
    ...finalStats,
    trademarkHistory: `${finalStats.trademarkHistory.length} 個數據點`,
    industryData: `${finalStats.industryData.length} 個行業`,
  });
  console.log('⏰ [DataService] 完成時間:', new Date().toLocaleString('zh-TW'));
  console.log('═══════════════════════════════════════════════════\n');

  return finalStats;
};

// Helper to parse the Macau Open Data CSV format
const parseTrademarkCSV = (csv: string): TrademarkData[] => {
  console.log('🔧 [CSV Parser] 開始解析商標 CSV 數據...');
  
  const lines = csv.trim().split('\n');
  console.log('📄 [CSV Parser] 總行數:', lines.length);
  
  if (lines.length > 0) {
    console.log('📋 [CSV Parser] 標頭行:', lines[0]);
  }
  
  const data: TrademarkData[] = [];
  let skippedLines = 0;
  let parsedLines = 0;
  
  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      skippedLines++;
      continue;
    }
    
    const parts = line.split(',').map(p => p.replace(/"/g, ''));
    
    if (i <= 3) {
      console.log(`📝 [CSV Parser] 第 ${i} 行原始數據:`, line);
      console.log(`📝 [CSV Parser] 第 ${i} 行解析結果:`, parts);
    }
    
    if (parts.length >= 3) {
      const year = parts[0];
      const month = parts[1];
      const qty = parseInt(parts[2], 10);
      
      if (!isNaN(qty)) {
        const shortYear = year.length === 4 ? year.substring(2) : year;
        const monthName = `${parseInt(month)}月`;
        
        const dataPoint = {
          month: `${monthName} ${shortYear}`,
          applications: qty
        };
        
        data.push(dataPoint);
        parsedLines++;
        
        if (parsedLines <= 3) {
          console.log(`✅ [CSV Parser] 成功解析數據點 ${parsedLines}:`, dataPoint);
        }
      } else {
        console.warn(`⚠️ [CSV Parser] 第 ${i} 行數量解析失敗:`, parts[2]);
        skippedLines++;
      }
    } else {
      console.warn(`⚠️ [CSV Parser] 第 ${i} 行欄位不足 (需要>=3, 實際=${parts.length}):`, parts);
      skippedLines++;
    }
  }
  
  console.log('✨ [CSV Parser] 解析完成!');
  console.log('📊 [CSV Parser] 成功解析:', parsedLines, '行');
  console.log('⚠️ [CSV Parser] 跳過:', skippedLines, '行');
  console.log('📦 [CSV Parser] 總數據點:', data.length);
  
  return data;
};

const formatPeriod = (period: string): string => {
  if (!period || period.length !== 6) return period || '---';
  const year = period.substring(0, 4);
  const month = period.substring(4, 6);
  return `${year}年${month}月`;
};
