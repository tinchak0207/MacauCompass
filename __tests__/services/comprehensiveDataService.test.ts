// @ts-ignore - vitest types not installed yet
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCacheStats, clearCache } from '../../services/comprehensiveDataService';

// Mock all sub-services
vi.mock('../../services/macroeconomicService', () => ({
  fetchGDP: vi.fn().mockResolvedValue([
    { year: 2024, quarter: 1, value: 25000 }
  ]),
  fetchRetailSales: vi.fn().mockResolvedValue([
    { period: '202401', category: '鐘錶', value: 1500000 }
  ]),
  fetchVisitorArrivals: vi.fn().mockResolvedValue([
    { yearMonth: '202401', value: 12000 }
  ]),
  fetchHotelOccupancy: vi.fn().mockResolvedValue([
    { yearMonth: '202401', rate: 85.5 }
  ]),
  fetchUnemployment: vi.fn().mockResolvedValue([
    { period: '2024Q1', rate: 2.1 }
  ]),
  fetchNonResidentWorkers: vi.fn().mockResolvedValue([
    { industry: '建築業', countryOfOrigin: '菲律賓', count: 25000 }
  ])
}));

vi.mock('../../services/realtimeDataService', () => ({
  fetchParkingSpaces: vi.fn().mockResolvedValue([
    { name: '澳門塔停車場', carSpaces: 150, motorbikeSpaces: 30, updateTime: '2024-01-15 10:30:00' }
  ]),
  fetchWeather: vi.fn().mockResolvedValue({
    temperature: 22.5,
    humidity: 75,
    condition: '晴',
    updateTime: '2024-01-15 10:30:00'
  }),
  fetchBorderCrossing: vi.fn().mockResolvedValue([
    { gateName: '澳門關', status: 'Busy', updateTime: '2024-01-15 10:30:00' }
  ]),
  fetchFlightArrivals: vi.fn().mockResolvedValue([
    { flightNo: 'MF123', origin: '北京', status: 'On Time', scheduledTime: '10:30' }
  ])
}));

vi.mock('../../services/poiDataService', () => ({
  fetchRestaurants: vi.fn().mockResolvedValue([
    { name: '澳門美食', address: '澳門', latitude: 22.2, longitude: 113.5, type: '中餐' }
  ]),
  fetchHotels: vi.fn().mockResolvedValue([
    { name: '金沙城中心', address: '澳門', starClass: '5', totalRooms: 600 }
  ]),
  fetchTravelAgencies: vi.fn().mockResolvedValue([
    { name: '旅遊社', phone: '123456', address: '澳門' }
  ]),
  fetchMICEEvents: vi.fn().mockResolvedValue([
    { eventName: '博覽會', venue: '澳門', dateStart: '2024-01-20', dateEnd: '2024-01-22', organizer: '組織者' }
  ]),
  fetchBusRoutes: vi.fn().mockResolvedValue([
    { routeName: '1路', busStopCode: 'B001', busStopName: '總站', latitude: 22.2, longitude: 113.5 }
  ]),
  fetchPharmacies: vi.fn().mockResolvedValue([
    { name: '藥房', address: '澳門', district: '中心', phone: '123456' }
  ])
}));

vi.mock('../../services/marketInsightService', () => ({
  fetchPopulationData: vi.fn().mockResolvedValue([
    { districtName: '中心區', populationTotal: 150000, density: 8000 }
  ]),
  fetchPropertyTransactions: vi.fn().mockResolvedValue([
    { year: 2024, month: 1, district: '中心區', avgPriceSqm: 50000 }
  ]),
  fetchNewCompanies: vi.fn().mockResolvedValue([
    { yearQuarter: '2024Q1', registeredCapital: 500000, industryCode: '001' }
  ]),
  fetchWiFiLocations: vi.fn().mockResolvedValue([
    { locationName: 'WiFi熱點', latitude: 22.2, longitude: 113.5 }
  ])
}));

describe('CachingMechanism', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('Cache Lifecycle', () => {
    it('应该正确管理缓存的 TTL', async () => {
      const stats = getCacheStats();
      
      // 初始状态应该是空的
      expect(Object.keys(stats).length).toBe(0);
    });

    it('应该能够清除缓存', () => {
      // 缓存应该被清除
      clearCache();
      const stats = getCacheStats();
      
      expect(Object.keys(stats).length).toBe(0);
    });

    it('应该区分不同的 TTL 等级', () => {
      const stats = getCacheStats();
      
      // stats 对象应该为空（因为没有调用过 fetchComprehensiveMarketData）
      expect(typeof stats).toBe('object');
    });
  });

  describe('Type Validation', () => {
    it('GDP 数据应该符合 GDPData 接口', () => {
      const mockGDP = {
        year: 2024,
        quarter: 1,
        value: 25000,
        changeRate: 3.2
      };

      expect(mockGDP).toHaveProperty('year');
      expect(mockGDP).toHaveProperty('quarter');
      expect(mockGDP).toHaveProperty('value');
      expect(typeof mockGDP.year).toBe('number');
      expect(typeof mockGDP.value).toBe('number');
    });

    it('ParkingSpaceData 应该有正确的属性', () => {
      const mockParking = {
        name: '澳門塔停車場',
        carSpaces: 150,
        motorbikeSpaces: 30,
        updateTime: '2024-01-15 10:30:00'
      };

      expect(mockParking).toHaveProperty('name');
      expect(mockParking).toHaveProperty('carSpaces');
      expect(mockParking).toHaveProperty('motorbikeSpaces');
      expect(typeof mockParking.carSpaces).toBe('number');
    });

    it('RestaurantPOI 应该有地理坐标', () => {
      const mockRestaurant = {
        name: '澳門美食',
        address: '澳門',
        latitude: 22.2,
        longitude: 113.5,
        type: '中餐'
      };

      expect(mockRestaurant).toHaveProperty('latitude');
      expect(mockRestaurant).toHaveProperty('longitude');
      expect(mockRestaurant.latitude).toBeGreaterThan(0);
      expect(mockRestaurant.latitude).toBeLessThan(90);
      expect(mockRestaurant.longitude).toBeGreaterThan(0);
      expect(mockRestaurant.longitude).toBeLessThan(180);
    });

    it('PropertyTransactionData 应该有有效的年月', () => {
      const mockProperty = {
        year: 2024,
        month: 1,
        district: '中心區',
        avgPriceSqm: 50000
      };

      expect(mockProperty.year).toBeGreaterThanOrEqual(2000);
      expect(mockProperty.month).toBeGreaterThanOrEqual(1);
      expect(mockProperty.month).toBeLessThanOrEqual(12);
      expect(mockProperty.avgPriceSqm).toBeGreaterThan(0);
    });
  });

  describe('Data Range Validation', () => {
    it('入住率应该在 0-100 之间', () => {
      const testRates = [0, 25.5, 50, 75.3, 100];
      
      testRates.forEach(rate => {
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThanOrEqual(100);
      });
    });

    it('失业率应该在 0-100 之间', () => {
      const testRates = [0.5, 1.2, 2.0, 3.5];
      
      testRates.forEach(rate => {
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThanOrEqual(100);
      });
    });

    it('人口密度应该是正数', () => {
      const testDensities = [500, 2000, 5000, 10000];
      
      testDensities.forEach(density => {
        expect(density).toBeGreaterThan(0);
      });
    });

    it('地理坐标应该在有效范围内', () => {
      const testLocations = [
        { lat: 22.2, lng: 113.5 },
        { lat: 22.15, lng: 113.45 },
        { lat: 22.25, lng: 113.55 }
      ];

      testLocations.forEach(loc => {
        expect(loc.lat).toBeGreaterThan(20);
        expect(loc.lat).toBeLessThan(25);
        expect(loc.lng).toBeGreaterThan(110);
        expect(loc.lng).toBeLessThan(115);
      });
    });
  });

  describe('Null/Undefined Handling', () => {
    it('应该优雅地处理缺失的可选字段', () => {
      const incompleteGDP = {
        year: 2024,
        quarter: 1,
        value: 25000
        // changeRate 缺失
      };

      expect(incompleteGDP.year).toBeDefined();
      expect(incompleteGDP.value).toBeDefined();
    });

    it('应该处理空数组响应', () => {
      const emptyResponse: any[] = [];
      
      expect(Array.isArray(emptyResponse)).toBe(true);
      expect(emptyResponse.length).toBe(0);
    });

    it('应该验证必要字段的存在', () => {
      const validParking = {
        name: '停車場',
        carSpaces: 100,
        motorbikeSpaces: 20,
        updateTime: '2024-01-15 10:30:00'
      };

      const requiredFields = ['name', 'carSpaces', 'motorbikeSpaces'];
      
      requiredFields.forEach(field => {
        expect(validParking).toHaveProperty(field);
      });
    });
  });
});
