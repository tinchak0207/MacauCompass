import {
  PopulationData,
  PropertyTransactionData,
  NewCompanyData,
  WiFiLocationData
} from '../types';

// Market Insights endpoints (Group 4 - UUID/File APIs)
const APIs = {
  POPULATION: 'https://api.data.gov.mo/document/download/7a674216-9621-4516-8689-141496267012',
  PROPERTY_TRANSACTIONS: 'https://api.data.gov.mo/document/download/4b772131-3624-4722-8708-255114955264',
  NEW_COMPANIES: 'https://api.data.gov.mo/document/download/53a49466-2461-4820-96d1-410495007532',
  WIFI_LOCATIONS: 'https://api.data.gov.mo/document/download/1d253e98-2793-42ba-842e-472774541116'
};

// Helper to fetch UUID APIs
const fetchUUIDData = async (url: string): Promise<any> => {
  try {
    const queryString = `?lang=TC&format=json`;
    
    const response = await fetch(url + queryString);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  } catch (error) {
    console.error(`Error fetching market insight data from ${url}:`, error);
    return null;
  }
};

export const fetchPopulationData = async (): Promise<PopulationData[] | null> => {
  console.log('👥 [MarketInsight] Fetching population data...');
  
  try {
    const data = await fetchUUIDData(APIs.POPULATION);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      districtName: item.district_name || item.district || 'Unknown',
      populationTotal: parseInt(item.population_total || item.population || '0'),
      density: parseFloat(item.density || '0')
    }));
  } catch (error) {
    console.error('❌ Population fetch failed:', error);
    return null;
  }
};

export const fetchPropertyTransactions = async (): Promise<PropertyTransactionData[] | null> => {
  console.log('🏠 [MarketInsight] Fetching property transaction data...');
  
  try {
    const data = await fetchUUIDData(APIs.PROPERTY_TRANSACTIONS);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => {
      let year = item.year;
      let month = item.month;
      
      // Handle period strings like "2024-01"
      if (item.period && typeof item.period === 'string') {
        const [y, m] = item.period.split('-');
        year = parseInt(y);
        month = parseInt(m);
      }

      return {
        year: year ? parseInt(year) : new Date().getFullYear(),
        month: month ? parseInt(month) : new Date().getMonth() + 1,
        district: item.district || 'Unknown',
        avgPriceSqm: parseFloat(item.avg_price_sqm || item.avg_price || '0')
      };
    }).filter(p => p.avgPriceSqm > 0);
  } catch (error) {
    console.error('❌ Property transactions fetch failed:', error);
    return null;
  }
};

export const fetchNewCompanies = async (): Promise<NewCompanyData[] | null> => {
  console.log('🚀 [MarketInsight] Fetching new companies data...');
  
  try {
    const data = await fetchUUIDData(APIs.NEW_COMPANIES);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      yearQuarter: item.year_quarter || item.period || 'Unknown',
      registeredCapital: parseInt(item.capital || item.registered_capital || '0'),
      industryCode: item.industry_code || item.industry || 'Unknown'
    }));
  } catch (error) {
    console.error('❌ New companies fetch failed:', error);
    return null;
  }
};

export const fetchWiFiLocations = async (): Promise<WiFiLocationData[] | null> => {
  console.log('📡 [MarketInsight] Fetching WiFi locations...');
  
  try {
    const data = await fetchUUIDData(APIs.WIFI_LOCATIONS);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      locationName: item.location_name || item.name || 'Unknown',
      latitude: parseFloat(item.latitude || item.lat || '0'),
      longitude: parseFloat(item.longitude || item.lng || '0')
    })).filter(w => w.latitude !== 0 && w.longitude !== 0);
  } catch (error) {
    console.error('❌ WiFi locations fetch failed:', error);
    return null;
  }
};
