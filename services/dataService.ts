import { CompanyApiResponse, TrademarkData, MarketStats, IndustryData, DataQualityFlag, DataStatus } from '../types';

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
  let companyDataStatus: DataStatus = 'FALLBACK';
  let trademarkDataStatus: DataStatus = 'FALLBACK';
  const industryDataStatus: DataStatus = 'PLACEHOLDER';

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
      const rawData = await companyResponse.json();
      console.log('✅ [Company API] 成功獲取數據!');
      
      // Handle nested structure from API - sometimes values are under .value property
      if (rawData.value && Array.isArray(rawData.value.values)) {
        companyData = {
          values: rawData.value.values,
          title: rawData.value.title,
          unit: rawData.value.unit
        };
      } else if (Array.isArray(rawData.values)) {
        companyData = rawData;
      } else {
        console.warn('⚠️ [Company API] 響應結構異常，無法識別values數據');
        companyData = { values: [] };
      }
      
      console.log('📦 [Company API] 原始響應數據:', JSON.stringify(rawData, null, 2).substring(0, 500));
      console.log('📈 [Company API] 數據點數量:', companyData.values?.length || 0);
      
      if (companyData.values && companyData.values.length > 0) {
        console.log('📊 [Company API] 最新數據點:', companyData.values[0]);
        companyDataStatus = 'REALTIME';
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
      const responseText = await trademarkResponse.text();
      console.log('✅ [Trademark API] 成功獲取數據!');
      console.log('📄 [Trademark API] 數據大小:', responseText.length, '字符');
      console.log('📝 [Trademark API] 前 500 字符:', responseText.substring(0, 500));

      // Check if response is JSON (metadata) instead of CSV
      let csvText = responseText;
      if (responseText.trim().startsWith('{')) {
        console.warn('⚠️ [Trademark API] 收到 JSON 格式而非 CSV，嘗試解析元數據...');
        try {
          const jsonData = JSON.parse(responseText);
          // Try to extract CSV content if it's in a specific field
          if (jsonData.data) {
            csvText = jsonData.data;
            console.log('✅ [Trademark API] 從 JSON 中提取 CSV 數據');
          } else {
            console.warn('⚠️ [Trademark API] 無法從 JSON 元數據中提取 CSV');
          }
        } catch (e) {
          console.warn('⚠️ [Trademark API] JSON 解析失敗');
        }
      }

      trademarkHistory = parseTrademarkCSV(csvText);
      
      console.log('✨ [Trademark API] CSV 解析完成!');
      console.log('📊 [Trademark API] 解析出的數據點數量:', trademarkHistory.length);
      
      if (trademarkHistory.length > 0) {
        console.log('📈 [Trademark API] 最早數據點:', trademarkHistory[0]);
        console.log('📈 [Trademark API] 最新數據點:', trademarkHistory[trademarkHistory.length - 1]);
      }

      if (trademarkHistory.length >= 3) {
        trademarkDataStatus = 'REALTIME';
      } else {
        console.warn('⚠️ [Trademark API] 數據點少於3筆，將視為備援數據');
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

  const hasValidTrademarkHistory = trademarkHistory.length >= 3;
  const finalTrademarkData = hasValidTrademarkHistory ? trademarkHistory.slice(-12) : getMockTrademarkData();

  if (!hasValidTrademarkHistory) {
    console.warn('⚠️ [DataService] 商標數據不足，已切換至備援樣本');
    trademarkDataStatus = 'FALLBACK';
  }

  console.log('🏷️  [DataService] 最終商標數據數量:', finalTrademarkData.length);
  console.log('📊 [DataService] 最終商標數據 (最後3筆):', finalTrademarkData.slice(-3));

  // Data Quality Tracking
  const dataQuality: DataQualityFlag[] = [
    {
      id: 'new_companies',
      label: '新成立公司',
      status: companyDataStatus,
      description: '來自澳門統計暨普查局 (DSEC)',
      sourceHint: 'https://dsec.apigateway.data.gov.mo'
    },
    {
      id: 'trademarks',
      label: '商標註冊申請',
      status: trademarkDataStatus,
      description: '來自澳門經濟及科技發展局 (DSEDT)',
      sourceHint: 'https://api.data.gov.mo/document/download'
    },
    {
      id: 'industry_data',
      label: '行業分佈',
      status: industryDataStatus,
      description: '需從 DSEC 行業統計 API 獲取',
      sourceHint: '建議查找 data.gov.mo "按行業統計的企業及機構" 數據集'
    },
    {
      id: 'median_income',
      label: '月收入中位數',
      status: 'PLACEHOLDER',
      description: '需從 DSEC 就業調查 API 獲取',
      sourceHint: '建議查找 data.gov.mo "工資及薪金統計" 數據集'
    },
    {
      id: 'interest_rate',
      label: '中小企最優惠利率',
      status: 'PLACEHOLDER',
      description: '需從澳門金融管理局 (AMCM) API 獲取',
      sourceHint: '建議查找 data.gov.mo "銀行利率" 或 "物業按揭貸款" 數據集'
    },
    {
      id: 'business_activity_index',
      label: '商業活動指數',
      status: 'PLACEHOLDER',
      description: '需從 DSEC 經濟活動指數 API 獲取',
      sourceHint: '建議查找 data.gov.mo "經濟活動指數" 或 "PMI" 數據集'
    }
  ];

  const finalStats = {
    latestMonthStr: formatPeriod(currentCompany.periodString),
    newCompaniesCurrent: currentCompany.value,
    newCompaniesPrevious: prevCompany.value,
    newCompaniesGrowth: growth,
    trademarkHistory: finalTrademarkData,
    industryData: getMockIndustryData(),
    lastUpdated: new Date(),
    dataQuality
  };

  console.log('\n✅ [DataService] ========== 數據獲取完成 ==========');
  console.log('📦 [DataService] 最終統計數據:', {
    ...finalStats,
    trademarkHistory: `${finalStats.trademarkHistory.length} 個數據點`,
    industryData: `${finalStats.industryData.length} 個行業`,
    dataQuality: `${finalStats.dataQuality.length} 個數據源`,
  });
  console.log('📊 [DataService] 數據質量報告:');
  dataQuality.forEach(dq => {
    const statusIcon = dq.status === 'REALTIME' ? '✅' : dq.status === 'FALLBACK' ? '⚠️' : '❌';
    console.log(`  ${statusIcon} [${dq.status}] ${dq.label}: ${dq.description}`);
  });
  console.log('⏰ [DataService] 完成時間:', new Date().toLocaleString('zh-TW'));
  console.log('═══════════════════════════════════════════════════\n');

  return finalStats;
};

// Helper to parse the Macau Open Data CSV format
const parseTrademarkCSV = (csv: string): TrademarkData[] => {
  console.log('🔧 [CSV Parser] 開始解析商標 CSV 數據...');
  
  if (!csv || typeof csv !== 'string') {
    console.warn('⚠️ [CSV Parser] CSV 數據無效或不是字符串');
    return [];
  }
  
  const lines = csv.trim().split('\n');
  console.log('📄 [CSV Parser] 總行數:', lines.length);
  
  if (lines.length > 0) {
    console.log('📋 [CSV Parser] 標頭行:', lines[0].substring(0, 100));
  }
  
  const data: TrademarkData[] = [];
  let skippedLines = 0;
  let parsedLines = 0;
  
  // Skip header (index 0) and process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      skippedLines++;
      continue;
    }
    
    // Split by comma and clean up
    const parts = line.split(',').map(p => p.trim().replace(/^"/, '').replace(/"$/, ''));
    
    if (i <= 3) {
      console.log(`📝 [CSV Parser] 第 ${i} 行原始數據:`, line.substring(0, 100));
      console.log(`📝 [CSV Parser] 第 ${i} 行解析結果:`, parts);
    }
    
    // Expect format: year, month, quantity (with optional additional columns)
    if (parts.length >= 3) {
      const year = parts[0].trim();
      const month = parts[1].trim();
      const qty = parseInt(parts[2].trim(), 10);
      
      // Validate that we have numeric year and valid month
      if (!isNaN(qty) && year && month && !isNaN(parseInt(year, 10)) && !isNaN(parseInt(month, 10))) {
        const shortYear = year.length === 4 ? year.substring(2) : year;
        const monthNum = parseInt(month, 10);
        const monthName = `${monthNum}月`;
        
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
        console.warn(`⚠️ [CSV Parser] 第 ${i} 行數據驗證失敗 - Year: ${year}, Month: ${month}, Qty: ${qty}`);
        skippedLines++;
      }
    } else {
      if (i <= 3) {
        console.warn(`⚠️ [CSV Parser] 第 ${i} 行欄位不足 (需要>=3, 實際=${parts.length}):`, parts.join('|'));
      }
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
