// @ts-ignore - vitest types not installed yet
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchParkingSpaces,
  fetchWeather,
  fetchBorderCrossing,
  fetchFlightArrivals
} from '../../services/realtimeDataService';

global.fetch = vi.fn();

describe('RealtimeDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchParkingSpaces', () => {
    it('应该返回停车场数据', async () => {
      const mockResponse = [
        { Name: '澳門塔停車場', Car_CNT: 150, Moto_CNT: 30, Time: '2024-01-15 10:30:00' },
        { Name: '南灣停車場', Car_CNT: 45, Moto_CNT: 12, Time: '2024-01-15 10:30:00' }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchParkingSpaces();

      expect(Array.isArray(result)).toBe(true);
      expect(result?.[0]).toHaveProperty('name');
      expect(result?.[0]).toHaveProperty('carSpaces');
      expect(result?.[0]).toHaveProperty('motorbikeSpaces');
    });

    it('应该验证停车位数为非负数', async () => {
      const mockResponse = [
        { Name: '澳門塔停車場', Car_CNT: 150, Moto_CNT: 30, Time: '2024-01-15 10:30:00' }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchParkingSpaces();

      expect(result?.[0]?.carSpaces).toBeGreaterThanOrEqual(0);
      expect(result?.[0]?.motorbikeSpaces).toBeGreaterThanOrEqual(0);
    });

    it('网络错误时应该返回 null', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchParkingSpaces();

      expect(result).toBeNull();
    });
  });

  describe('fetchWeather', () => {
    it('应该返回天气数据对象', async () => {
      const mockResponse = {
        temperature: 22.5,
        humidity: 75,
        weatherCondition: '晴',
        update_time: '2024-01-15 10:30:00'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchWeather();

      expect(result).toBeDefined();
      expect(result?.temperature).toBe(22.5);
      expect(result?.humidity).toBe(75);
      expect(result?.condition).toBe('晴');
    });

    it('应该验证温度和湿度范围', async () => {
      const mockResponse = {
        temperature: 22.5,
        humidity: 75,
        weatherCondition: '晴'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchWeather();

      expect(result?.temperature).toBeGreaterThan(-50);
      expect(result?.temperature).toBeLessThan(50);
      expect(result?.humidity).toBeGreaterThanOrEqual(0);
      expect(result?.humidity).toBeLessThanOrEqual(100);
    });

    it('应该处理数组响应', async () => {
      const mockResponse = [
        {
          temperature: 22.5,
          humidity: 75,
          weatherCondition: '晴'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchWeather();

      expect(result?.temperature).toBe(22.5);
    });
  });

  describe('fetchBorderCrossing', () => {
    it('应该返回口岸状态数据', async () => {
      const mockResponse = [
        { border_gate: '澳門關', status: 'Busy', update_time: '2024-01-15 10:30:00' },
        { border_gate: '珠澳口岸', status: 'Normal', update_time: '2024-01-15 10:30:00' }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchBorderCrossing();

      expect(Array.isArray(result)).toBe(true);
      expect(result?.[0]?.gateName).toBe('澳門關');
      expect(['Normal', 'Busy', 'Congested']).toContain(result?.[0]?.status);
    });

    it('应该规范化状态值', async () => {
      const mockResponse = [
        { border_gate: '澳門關', status: '繁忙', update_time: '2024-01-15 10:30:00' }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchBorderCrossing();

      expect(result?.[0]?.status).toBe('Busy');
    });
  });

  describe('fetchFlightArrivals', () => {
    it('应该返回航班数据', async () => {
      const mockResponse = [
        { 
          flight_no: 'MF123', 
          origin: '北京', 
          status: 'On Time', 
          sta: '10:30'
        },
        { 
          flight_no: 'CZ456', 
          origin: '上海', 
          status: 'Delayed', 
          sta: '11:00'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchFlightArrivals();

      expect(Array.isArray(result)).toBe(true);
      expect(result?.[0]?.flightNo).toBe('MF123');
      expect(result?.[0]?.origin).toBe('北京');
    });

    it('应该限制返回前 10 班航班', async () => {
      const mockResponse = Array.from({ length: 20 }, (_, i) => ({
        flight_no: `MF${100 + i}`,
        origin: '北京',
        status: 'On Time',
        sta: '10:30'
      }));

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchFlightArrivals();

      expect(result?.length).toBeLessThanOrEqual(10);
    });

    it('应该规范化航班状态', async () => {
      const mockResponse = [
        { 
          flight_no: 'MF123', 
          origin: '北京', 
          status: '延誤', 
          sta: '10:30'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchFlightArrivals();

      expect(result?.[0]?.status).toBe('Delayed');
    });
  });
});
