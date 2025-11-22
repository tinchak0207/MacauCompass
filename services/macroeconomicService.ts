import {
  GDPData,
  RetailSalesData,
  VisitorArrivalsData,
  HotelOccupancyData,
  UnemploymentData,
  NonResidentWorkersData
} from '../types';

const APPCODE = '09d43a591fba407fb862412970667de4';

// API endpoints for macroeconomic data (Group 1)
const APIs = {
  GDP: 'https://dsec.apigateway.data.gov.mo/public/KeyIndicator/GDP',
  RETAIL_SALES: 'https://dsec.apigateway.data.gov.mo/public/KeyIndicator/RetailSalesValue',
  VISITOR_ARRIVALS: 'https://dsec.apigateway.data.gov.mo/public/KeyIndicator/VisitorArrivals',
  HOTEL_OCCUPANCY: 'https://dsec.apigateway.data.gov.mo/public/KeyIndicator/HotelOccupancyRate',
  UNEMPLOYMENT: 'https://dsec.apigateway.data.gov.mo/public/KeyIndicator/UnemploymentRate',
  NON_RESIDENT_WORKERS: 'https://dsec.apigateway.data.gov.mo/public/KeyIndicator/NonResidentWorkers'
};

// Helper to make DSEC API calls
const fetchDSECData = async (url: string, params?: Record<string, string>): Promise<any> => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  
  try {
    const response = await fetch(url + queryString, {
      method: 'POST',
      headers: {
        'Authorization': `APPCODE ${APPCODE}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Handle nested JSON structure from DSEC APIs
    if (data.data && typeof data.data === 'string') {
      return JSON.parse(data.data).value;
    } else if (data.value) {
      return data.value;
    }
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    return null;
  }
};

export const fetchGDP = async (): Promise<GDPData[] | null> => {
  console.log('📊 [MacroService] Fetching GDP data...');
  
  try {
    const data = await fetchDSECData(APIs.GDP, {
      lang: 'TC',
      from_year: '2019',
      to_year: '2024'
    });

    if (!data?.values) return null;

    return data.values.map((item: any) => ({
      year: parseInt(item.periodString?.substring(0, 4) || '0'),
      quarter: parseInt(item.periodString?.substring(4) || '0'),
      value: parseFloat(item.value),
      changeRate: item.change_rate ? parseFloat(item.change_rate) : undefined
    }));
  } catch (error) {
    console.error('❌ GDP fetch failed:', error);
    return null;
  }
};

export const fetchRetailSales = async (): Promise<RetailSalesData[] | null> => {
  console.log('🛍️  [MacroService] Fetching retail sales data...');
  
  try {
    const data = await fetchDSECData(APIs.RETAIL_SALES, {
      lang: 'TC',
      from_year: '2020',
      to_year: '2024'
    });

    if (!data?.values) return null;

    return data.values.map((item: any) => ({
      period: item.period || item.periodString,
      category: item.indicator || 'Unknown',
      value: parseFloat(item.value)
    }));
  } catch (error) {
    console.error('❌ Retail sales fetch failed:', error);
    return null;
  }
};

export const fetchVisitorArrivals = async (): Promise<VisitorArrivalsData[] | null> => {
  console.log('✈️  [MacroService] Fetching visitor arrivals data...');
  
  try {
    const data = await fetchDSECData(APIs.VISITOR_ARRIVALS, {
      lang: 'TC',
      granularity: 'monthly',
      from_date: '202301'
    });

    if (!data?.values) return null;

    return data.values.slice(-12).map((item: any) => ({
      yearMonth: item.year_month || item.periodString,
      value: parseInt(item.value),
      yoyChange: item.same_period_last_year_change ? parseFloat(item.same_period_last_year_change) : undefined
    }));
  } catch (error) {
    console.error('❌ Visitor arrivals fetch failed:', error);
    return null;
  }
};

export const fetchHotelOccupancy = async (): Promise<HotelOccupancyData[] | null> => {
  console.log('🏨 [MacroService] Fetching hotel occupancy data...');
  
  try {
    const data = await fetchDSECData(APIs.HOTEL_OCCUPANCY, {
      lang: 'TC',
      from_year: '2023'
    });

    if (!data?.values) return null;

    return data.values.slice(-12).map((item: any) => ({
      yearMonth: item.year_month || item.periodString,
      rate: parseFloat(item.occupancy_rate || item.value),
      starRating: item.star_rating
    }));
  } catch (error) {
    console.error('❌ Hotel occupancy fetch failed:', error);
    return null;
  }
};

export const fetchUnemployment = async (): Promise<UnemploymentData[] | null> => {
  console.log('📈 [MacroService] Fetching unemployment data...');
  
  try {
    const data = await fetchDSECData(APIs.UNEMPLOYMENT, {
      lang: 'TC'
    });

    if (!data?.values) return null;

    return data.values.slice(-8).map((item: any) => ({
      period: item.period || item.periodString,
      rate: parseFloat(item.rate || item.value),
      laborForce: item.labor_force ? parseInt(item.labor_force) : undefined
    }));
  } catch (error) {
    console.error('❌ Unemployment fetch failed:', error);
    return null;
  }
};

export const fetchNonResidentWorkers = async (): Promise<NonResidentWorkersData[] | null> => {
  console.log('👥 [MacroService] Fetching non-resident workers data...');
  
  try {
    const data = await fetchDSECData(APIs.NON_RESIDENT_WORKERS, {
      lang: 'TC'
    });

    if (!data?.values) return null;

    return data.values.map((item: any) => ({
      industry: item.industry || 'Unknown',
      countryOfOrigin: item.country_of_origin || item.source,
      count: parseInt(item.count || item.value)
    }));
  } catch (error) {
    console.error('❌ Non-resident workers fetch failed:', error);
    return null;
  }
};
