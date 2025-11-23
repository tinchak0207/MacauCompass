import { ComprehensiveMarketData } from '../types';
import * as macroService from './macroeconomicService';
import * as realtimeService from './realtimeDataService';
import * as poiService from './poiDataService';
import * as insightService from './marketInsightService';

// Cache management
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // milliseconds
}

const cache = new Map<string, CacheEntry>();

const getCachedData = (key: string): any | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
};

const setCachedData = (key: string, data: any, ttlSeconds: number = 3600) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds * 1000
  });
};

// TTL configuration for different data types
const TTL_CONFIG = {
  MACRO: 86400,       // 24 hours
  REALTIME: 300,      // 5 minutes
  POI: 604800,        // 7 days
  INSIGHTS: 3600,     // 1 hour
  WEATHER: 1800,      // 30 minutes
  PARKING: 900        // 15 minutes
};

export const fetchComprehensiveMarketData = async (): Promise<ComprehensiveMarketData> => {
  console.log('\n🔍 [ComprehensiveService] ========== 開始獲取綜合市場數據 ==========');
  console.log('⏰ [ComprehensiveService] 請求時間:', new Date().toLocaleString('zh-TW'));

  const result: ComprehensiveMarketData = {
    lastUpdated: new Date()
  };

  try {
    // Group 1: Macroeconomic Data (DSEC APIs) - 24 hour cache
    console.log('\n📊 [ComprehensiveService] 獲取宏觀經濟數據...');
    
    result.gdp = getCachedData('gdp') || await macroService.fetchGDP();
    if (result.gdp) setCachedData('gdp', result.gdp, TTL_CONFIG.MACRO);

    result.retailSales = getCachedData('retail') || await macroService.fetchRetailSales();
    if (result.retailSales) setCachedData('retail', result.retailSales, TTL_CONFIG.MACRO);

    result.visitorArrivals = getCachedData('visitors') || await macroService.fetchVisitorArrivals();
    if (result.visitorArrivals) setCachedData('visitors', result.visitorArrivals, TTL_CONFIG.MACRO);

    result.hotelOccupancy = getCachedData('hotel') || await macroService.fetchHotelOccupancy();
    if (result.hotelOccupancy) setCachedData('hotel', result.hotelOccupancy, TTL_CONFIG.MACRO);

    result.unemployment = getCachedData('unemployment') || await macroService.fetchUnemployment();
    if (result.unemployment) setCachedData('unemployment', result.unemployment, TTL_CONFIG.MACRO);

    result.nonResidentWorkers = getCachedData('workers') || await macroService.fetchNonResidentWorkers();
    if (result.nonResidentWorkers) setCachedData('workers', result.nonResidentWorkers, TTL_CONFIG.MACRO);

  } catch (error) {
    console.error('❌ [ComprehensiveService] 宏觀數據獲取失敗:', error);
  }

  try {
    // Group 2: Real-time Data (UUID APIs) - 5-30 minute cache
    console.log('\n⚡ [ComprehensiveService] 獲取實時數據...');
    
    result.parking = getCachedData('parking') || await realtimeService.fetchParkingSpaces();
    if (result.parking) setCachedData('parking', result.parking, TTL_CONFIG.PARKING);

    result.weather = getCachedData('weather') || await realtimeService.fetchWeather();
    if (result.weather) setCachedData('weather', result.weather, TTL_CONFIG.WEATHER);

    result.borderCrossings = getCachedData('borders') || await realtimeService.fetchBorderCrossing();
    if (result.borderCrossings) setCachedData('borders', result.borderCrossings, TTL_CONFIG.REALTIME);

    result.flightArrivals = getCachedData('flights') || await realtimeService.fetchFlightArrivals();
    if (result.flightArrivals) setCachedData('flights', result.flightArrivals, TTL_CONFIG.REALTIME);

  } catch (error) {
    console.error('❌ [ComprehensiveService] 實時數據獲取失敗:', error);
  }

  try {
    // Group 3: POI Data (UUID APIs) - 7 day cache
    console.log('\n📍 [ComprehensiveService] 獲取位置信息...');
    
    result.restaurants = getCachedData('restaurants') || await poiService.fetchRestaurants();
    if (result.restaurants) setCachedData('restaurants', result.restaurants, TTL_CONFIG.POI);

    result.hotels = getCachedData('hotels') || await poiService.fetchHotels();
    if (result.hotels) setCachedData('hotels', result.hotels, TTL_CONFIG.POI);

    result.travelAgencies = getCachedData('agencies') || await poiService.fetchTravelAgencies();
    if (result.travelAgencies) setCachedData('agencies', result.travelAgencies, TTL_CONFIG.POI);

    result.miceEvents = getCachedData('events') || await poiService.fetchMICEEvents();
    if (result.miceEvents) setCachedData('events', result.miceEvents, TTL_CONFIG.POI);

    result.busRoutes = getCachedData('buses') || await poiService.fetchBusRoutes();
    if (result.busRoutes) setCachedData('buses', result.busRoutes, TTL_CONFIG.POI);

    result.pharmacies = getCachedData('pharmacies') || await poiService.fetchPharmacies();
    if (result.pharmacies) setCachedData('pharmacies', result.pharmacies, TTL_CONFIG.POI);

  } catch (error) {
    console.error('❌ [ComprehensiveService] 位置信息獲取失敗:', error);
  }

  try {
    // Group 4: Market Insights (UUID APIs) - 1 hour cache
    console.log('\n🔬 [ComprehensiveService] 獲取市場洞察...');
    
    result.population = getCachedData('population') || await insightService.fetchPopulationData();
    if (result.population) setCachedData('population', result.population, TTL_CONFIG.INSIGHTS);

    result.propertyTransactions = getCachedData('property') || await insightService.fetchPropertyTransactions();
    if (result.propertyTransactions) setCachedData('property', result.propertyTransactions, TTL_CONFIG.INSIGHTS);

    result.newCompanies = getCachedData('companies') || await insightService.fetchNewCompanies();
    if (result.newCompanies) setCachedData('companies', result.newCompanies, TTL_CONFIG.INSIGHTS);

    result.wifiLocations = getCachedData('wifi') || await insightService.fetchWiFiLocations();
    if (result.wifiLocations) setCachedData('wifi', result.wifiLocations, TTL_CONFIG.INSIGHTS);

  } catch (error) {
    console.error('❌ [ComprehensiveService] 市場洞察獲取失敗:', error);
  }

  console.log('\n✅ [ComprehensiveService] ========== 綜合數據獲取完成 ==========');
  console.log('📦 [ComprehensiveService] 數據摘要:');
  console.log('  - GDP 數據點:', result.gdp?.length || 0);
  console.log('  - 餐廳數量:', result.restaurants?.length || 0);
  console.log('  - 酒店數量:', result.hotels?.length || 0);
  console.log('  - 人口分區:', result.population?.length || 0);
  console.log('  - 停車場:', result.parking?.length || 0);
  console.log('  - WiFi 熱點:', result.wifiLocations?.length || 0);
  console.log('⏰ [ComprehensiveService] 完成時間:', new Date().toLocaleString('zh-TW'));
  
  return result;
};

export const clearCache = () => {
  console.log('🗑️  [ComprehensiveService] 清除所有緩存');
  cache.clear();
};

export const getCacheStats = () => {
  const stats: Record<string, { size: number; ttl: number }> = {};
  
  cache.forEach((entry, key) => {
    const remaining = Math.max(0, entry.ttl - (Date.now() - entry.timestamp));
    stats[key] = {
      size: JSON.stringify(entry.data).length,
      ttl: remaining
    };
  });
  
  return stats;
};
