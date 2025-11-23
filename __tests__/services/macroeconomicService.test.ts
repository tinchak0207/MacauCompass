// @ts-ignore - vitest types not installed yet
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchGDP,
  fetchRetailSales,
  fetchVisitorArrivals,
  fetchHotelOccupancy,
  fetchUnemployment,
  fetchNonResidentWorkers
} from '../../services/macroeconomicService';

// Mock fetch
global.fetch = vi.fn();

describe('MacroeconomicService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchGDP', () => {
    it('应该返回 GDPData 数组', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { periodString: '202401', value: '25000', change_rate: '3.2' },
              { periodString: '202402', value: '25500', change_rate: '2.0' }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchGDP();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result?.[0]).toHaveProperty('year');
      expect(result?.[0]).toHaveProperty('quarter');
      expect(result?.[0]).toHaveProperty('value');
      expect(typeof result?.[0]?.value).toBe('number');
    });

    it('网络错误时应该返回 null', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchGDP();

      expect(result).toBeNull();
    });

    it('应该正确解析 periodString', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { periodString: '202401', value: '25000' }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchGDP();

      expect(result?.[0]?.year).toBe(2024);
      expect(result?.[0]?.quarter).toBe(1);
    });
  });

  describe('fetchRetailSales', () => {
    it('应该返回 RetailSalesData 数组', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { period: '202401', indicator: '鐘錶', value: '1500000' },
              { period: '202402', indicator: '超市', value: '2000000' }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchRetailSales();

      expect(Array.isArray(result)).toBe(true);
      expect(result?.[0]).toHaveProperty('period');
      expect(result?.[0]).toHaveProperty('category');
      expect(result?.[0]).toHaveProperty('value');
    });

    it('应该正确处理缺失的 indicator 字段', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { period: '202401', value: '1500000' }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchRetailSales();

      expect(result?.[0]?.category).toBe('Unknown');
    });
  });

  describe('fetchVisitorArrivals', () => {
    it('应该返回最新 12 个月的访客数据', async () => {
      const mockValues = Array.from({ length: 24 }, (_, i) => ({
        year_month: `2024${String(i + 1).padStart(2, '0')}`,
        value: String(10000 + i * 100)
      }));

      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: mockValues
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchVisitorArrivals();

      expect(result?.length).toBeLessThanOrEqual(12);
      expect(result?.[0]?.value).toBeGreaterThan(0);
    });

    it('应该正确计算同比变化', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { 
                year_month: '202401', 
                value: '12000',
                same_period_last_year_change: '5.2'
              }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchVisitorArrivals();

      expect(result?.[0]?.yoyChange).toBe(5.2);
    });
  });

  describe('fetchHotelOccupancy', () => {
    it('应该返回酒店入住率数据', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { year_month: '202401', occupancy_rate: '85.5', star_rating: '5' },
              { year_month: '202402', occupancy_rate: '78.2', star_rating: '4' }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchHotelOccupancy();

      expect(Array.isArray(result)).toBe(true);
      expect(result?.[0]?.rate).toBe(85.5);
      expect(result?.[0]?.starRating).toBe('5');
    });

    it('应该验证入住率范围 (0-100)', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { year_month: '202401', occupancy_rate: '85.5' }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchHotelOccupancy();

      expect(result?.[0]?.rate).toBeGreaterThanOrEqual(0);
      expect(result?.[0]?.rate).toBeLessThanOrEqual(100);
    });
  });

  describe('fetchUnemployment', () => {
    it('应该返回失业率数据', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { period: '2024Q1', rate: '2.1', labor_force: '350000' },
              { period: '2024Q2', rate: '2.0', labor_force: '350500' }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchUnemployment();

      expect(Array.isArray(result)).toBe(true);
      expect(result?.[0]).toHaveProperty('rate');
      expect(result?.[0]).toHaveProperty('laborForce');
    });

    it('应该取最新 8 个数据点', async () => {
      const mockValues = Array.from({ length: 20 }, (_, i) => ({
        period: `2024Q${(i % 4) + 1}`,
        rate: String(2.0 + i * 0.05)
      }));

      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: mockValues
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchUnemployment();

      expect(result?.length).toBeLessThanOrEqual(8);
    });
  });

  describe('fetchNonResidentWorkers', () => {
    it('应该返回外地员工数据', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { 
                industry: '建築業', 
                country_of_origin: '菲律賓', 
                count: '25000'
              },
              { 
                industry: '酒店業', 
                country_of_origin: '緬甸', 
                count: '15000'
              }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchNonResidentWorkers();

      expect(Array.isArray(result)).toBe(true);
      expect(result?.[0]?.industry).toBe('建築業');
      expect(result?.[0]?.count).toBe(25000);
    });

    it('应该正确处理缺失字段', async () => {
      const mockResponse = {
        data: JSON.stringify({
          value: {
            values: [
              { count: '10000' }
            ]
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchNonResidentWorkers();

      expect(result?.[0]?.industry).toBe('Unknown');
      expect(result?.[0]?.countryOfOrigin).toBe('Unknown');
    });
  });
});
