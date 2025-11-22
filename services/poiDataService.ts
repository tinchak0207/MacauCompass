import {
  RestaurantPOI,
  HotelPOI,
  TravelAgencyData,
  MICEEventData,
  BusRouteData,
  PharmacyData
} from '../types';

// POI endpoints (Group 3 - UUID/File APIs)
const APIs = {
  RESTAURANTS: 'https://api.data.gov.mo/document/download/2e811062-338c-4422-9127-e371f92d3698',
  HOTELS: 'https://api.data.gov.mo/document/download/8735a77d-371b-46b4-b454-53744255b022',
  TRAVEL_AGENCIES: 'https://api.data.gov.mo/document/download/0e5d7495-f252-4852-a525-4106b82c6543',
  MICE_EVENTS: 'https://api.data.gov.mo/document/download/18282406-2073-4224-9741-22169176150a',
  BUS_ROUTES: 'https://api.data.gov.mo/document/download/8f015910-6124-4214-a52a-8f33102570d2',
  PHARMACIES: 'https://api.data.gov.mo/document/download/2b41806f-b2a3-4555-9816-47c287239922'
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
    console.error(`Error fetching POI data from ${url}:`, error);
    return null;
  }
};

export const fetchRestaurants = async (): Promise<RestaurantPOI[] | null> => {
  console.log('🍽️  [POIService] Fetching restaurants...');
  
  try {
    const data = await fetchUUIDData(APIs.RESTAURANTS);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      name: item.title || item.name || 'Unknown',
      address: item.address || '',
      latitude: parseFloat(item.latitude || item.lat || '0'),
      longitude: parseFloat(item.longitude || item.lng || '0'),
      type: item.type || item.category || 'Restaurant'
    })).filter(r => r.latitude !== 0 && r.longitude !== 0);
  } catch (error) {
    console.error('❌ Restaurants fetch failed:', error);
    return null;
  }
};

export const fetchHotels = async (): Promise<HotelPOI[] | null> => {
  console.log('🏨 [POIService] Fetching hotels...');
  
  try {
    const data = await fetchUUIDData(APIs.HOTELS);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      name: item.name_cn || item.name || 'Unknown',
      starClass: item.star_class || item.stars,
      totalRooms: item.total_rooms ? parseInt(item.total_rooms) : undefined,
      address: item.address || '',
      latitude: item.latitude ? parseFloat(item.latitude) : undefined,
      longitude: item.longitude ? parseFloat(item.longitude) : undefined
    }));
  } catch (error) {
    console.error('❌ Hotels fetch failed:', error);
    return null;
  }
};

export const fetchTravelAgencies = async (): Promise<TravelAgencyData[] | null> => {
  console.log('✈️  [POIService] Fetching travel agencies...');
  
  try {
    const data = await fetchUUIDData(APIs.TRAVEL_AGENCIES);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      name: item.agency_name || item.name || 'Unknown',
      phone: item.tel || item.phone || '',
      address: item.address || '',
      latitude: item.latitude ? parseFloat(item.latitude) : undefined,
      longitude: item.longitude ? parseFloat(item.longitude) : undefined
    }));
  } catch (error) {
    console.error('❌ Travel agencies fetch failed:', error);
    return null;
  }
};

export const fetchMICEEvents = async (): Promise<MICEEventData[] | null> => {
  console.log('🎤 [POIService] Fetching MICE events...');
  
  try {
    const data = await fetchUUIDData(APIs.MICE_EVENTS);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      eventName: item.event_name || item.name || 'Unknown',
      venue: item.venue || item.location || '',
      dateStart: item.date_start || item.start_date || '',
      dateEnd: item.date_end || item.end_date || '',
      organizer: item.organizer || item.organization || ''
    }));
  } catch (error) {
    console.error('❌ MICE events fetch failed:', error);
    return null;
  }
};

export const fetchBusRoutes = async (): Promise<BusRouteData[] | null> => {
  console.log('🚌 [POIService] Fetching bus routes...');
  
  try {
    const data = await fetchUUIDData(APIs.BUS_ROUTES);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      routeName: item.routeName || item.route_name || 'Unknown',
      busStopCode: item.busStopCode || item.stop_code || '',
      busStopName: item.busStopName || item.stop_name || '',
      latitude: item.latitude ? parseFloat(item.latitude) : undefined,
      longitude: item.longitude ? parseFloat(item.longitude) : undefined
    }));
  } catch (error) {
    console.error('❌ Bus routes fetch failed:', error);
    return null;
  }
};

export const fetchPharmacies = async (): Promise<PharmacyData[] | null> => {
  console.log('💊 [POIService] Fetching pharmacies...');
  
  try {
    const data = await fetchUUIDData(APIs.PHARMACIES);

    if (!data) return null;

    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((item: any) => ({
      name: item.name || 'Unknown',
      address: item.address || '',
      district: item.district || '',
      phone: item.telephone || item.phone || '',
      latitude: item.latitude ? parseFloat(item.latitude) : undefined,
      longitude: item.longitude ? parseFloat(item.longitude) : undefined
    }));
  } catch (error) {
    console.error('❌ Pharmacies fetch failed:', error);
    return null;
  }
};
