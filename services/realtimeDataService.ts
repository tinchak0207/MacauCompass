import {
  ParkingSpaceData,
  WeatherData,
  BorderCrossingData,
  FlightArrivalData
} from '../types';

// Real-time data endpoints (Group 2 - UUID/File APIs)
const APIs = {
  PARKING: 'https://api.data.gov.mo/document/download/ea50a770-cc35-47cc-a3ba-7f60092d4bc4',
  WEATHER: 'https://api.data.gov.mo/document/download/a56e346b-5314-4157-965c-360df113065a',
  BORDER_CROSSING: 'https://api.data.gov.mo/document/download/5ea99479-9409-4721-a2c2-67c30454505b',
  FLIGHTS: 'https://api.data.gov.mo/document/download/9441616d-9345-408e-8f63-d1a847204391'
};

// Helper to fetch UUID APIs (no authentication header needed)
const fetchUUIDData = async (url: string, format: string = 'json'): Promise<any> => {
  try {
    const queryString = `?lang=TC&format=${format}`;
    
    const response = await fetch(url + queryString);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/plain') || contentType?.includes('text/csv')) {
      const text = await response.text();
      // Try to parse as JSON if possible
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } else {
      return await response.json();
    }
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    return null;
  }
};

export const fetchParkingSpaces = async (): Promise<ParkingSpaceData[] | null> => {
  console.log('🅿️  [RealtimeService] Fetching parking spaces...');
  
  try {
    const data = await fetchUUIDData(APIs.PARKING);

    if (!data) return null;

    // Handle both array and object responses
    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      name: item.Name || item.name || 'Unknown',
      carSpaces: parseInt(item.Car_CNT || item.car_spaces || '0'),
      motorbikeSpaces: parseInt(item.Moto_CNT || item.motorbike_spaces || '0'),
      updateTime: item.Time || item.update_time || new Date().toISOString()
    }));
  } catch (error) {
    console.error('❌ Parking fetch failed:', error);
    return null;
  }
};

export const fetchWeather = async (): Promise<WeatherData | null> => {
  console.log('🌤️  [RealtimeService] Fetching weather data...');
  
  try {
    const data = await fetchUUIDData(APIs.WEATHER);

    if (!data) return null;

    // Handle both single object and array responses
    const weatherData = Array.isArray(data) ? data[0] : data;

    return {
      temperature: parseFloat(weatherData.temperature || weatherData.temp || '20'),
      humidity: parseFloat(weatherData.humidity || weatherData.humid || '70'),
      condition: weatherData.weatherCondition || weatherData.condition || 'Unknown',
      updateTime: weatherData.update_time || new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Weather fetch failed:', error);
    return null;
  }
};

export const fetchBorderCrossing = async (): Promise<BorderCrossingData[] | null> => {
  console.log('🚗 [RealtimeService] Fetching border crossing data...');
  
  try {
    const data = await fetchUUIDData(APIs.BORDER_CROSSING);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      gateName: item.border_gate || item.gate_name || 'Unknown',
      status: normalizeStatus(item.status),
      updateTime: item.update_time || new Date().toISOString()
    }));
  } catch (error) {
    console.error('❌ Border crossing fetch failed:', error);
    return null;
  }
};

export const fetchFlightArrivals = async (): Promise<FlightArrivalData[] | null> => {
  console.log('✈️  [RealtimeService] Fetching flight arrival data...');
  
  try {
    const data = await fetchUUIDData(APIs.FLIGHTS);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.slice(0, 10).map((item: any) => ({
      flightNo: item.flight_no || item.flightNo || 'Unknown',
      origin: item.origin || item.from || 'Unknown',
      status: normalizeFlightStatus(item.status),
      scheduledTime: item.sta || item.scheduled_time || ''
    }));
  } catch (error) {
    console.error('❌ Flight arrivals fetch failed:', error);
    return null;
  }
};

function normalizeStatus(status: string): 'Normal' | 'Busy' | 'Congested' {
  const lower = (status || '').toLowerCase();
  if (lower.includes('congested') || lower.includes('擁擠')) return 'Congested';
  if (lower.includes('busy') || lower.includes('繁忙')) return 'Busy';
  return 'Normal';
}

function normalizeFlightStatus(status: string): 'On Time' | 'Delayed' | 'Cancelled' {
  const lower = (status || '').toLowerCase();
  if (lower.includes('cancelled') || lower.includes('取消')) return 'Cancelled';
  if (lower.includes('delayed') || lower.includes('延誤')) return 'Delayed';
  return 'On Time';
}
