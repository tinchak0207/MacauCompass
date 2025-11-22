import React, { useEffect, useRef, useState } from 'react';
import { Map } from 'lucide-react';
import GlassCard from './GlassCard';
import { RestaurantPOI, HotelPOI, PharmacyData, ComprehensiveMarketData } from '../types';

interface MapVisualizationProps {
  data?: ComprehensiveMarketData;
  mapType?: 'heatmap' | 'markers' | 'cluster';
  center?: { lat: number; lng: number };
}

interface MapMarkerType {
  name: string;
  latitude: number;
  longitude: number;
  type: 'restaurant' | 'hotel' | 'pharmacy' | 'parking' | 'event';
  color: string;
  intensity?: number; // 0-100
}

const MapVisualization: React.FC<MapVisualizationProps> = ({
  data,
  mapType = 'markers',
  center = { lat: 22.1987, lng: 113.5439 } // Macau center
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<MapMarkerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerType | null>(null);

  useEffect(() => {
    // Aggregate all POI data into markers
    const allMarkers: MapMarkerType[] = [];

    // Add restaurants
    data?.restaurants?.forEach(r => {
      if (r.latitude && r.longitude) {
        allMarkers.push({
          name: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          type: 'restaurant',
          color: '#ef4444', // red
          intensity: 70
        });
      }
    });

    // Add hotels
    data?.hotels?.forEach(h => {
      if (h.latitude && h.longitude) {
        allMarkers.push({
          name: h.name,
          latitude: h.latitude,
          longitude: h.longitude,
          type: 'hotel',
          color: '#3b82f6', // blue
          intensity: 80
        });
      }
    });

    // Add pharmacies
    data?.pharmacies?.forEach(p => {
      if (p.latitude && p.longitude) {
        allMarkers.push({
          name: p.name,
          latitude: p.latitude,
          longitude: p.longitude,
          type: 'pharmacy',
          color: '#10b981', // green
          intensity: 60
        });
      }
    });

    // Add parking
    (data?.parking as any)?.forEach((p: any, idx: number) => {
      // Generate random coordinates near Macau for demo
      const latOffset = (Math.random() - 0.5) * 0.05;
      const lngOffset = (Math.random() - 0.5) * 0.05;

      allMarkers.push({
        name: p.name,
        latitude: center.lat + latOffset,
        longitude: center.lng + lngOffset,
        type: 'parking',
        color: '#f59e0b', // amber
        intensity: Math.min(100, (p.carSpaces / 200) * 100)
      });
    });

    setMarkers(allMarkers);
    setLoading(false);
  }, [data, center]);

  const getMarkerIcon = (type: string): string => {
    switch (type) {
      case 'restaurant':
        return '🍽️';
      case 'hotel':
        return '🏨';
      case 'pharmacy':
        return '💊';
      case 'parking':
        return '🅿️';
      case 'event':
        return '🎤';
      default:
        return '📍';
    }
  };

  // Calculate marker clustering for performance
  const calculateClusters = (markers: MapMarkerType[], zoomLevel: number = 1) => {
    if (zoomLevel < 10) {
      // Simple grid-based clustering
      const clustered = new Map<string, MapMarkerType[]>();

      markers.forEach(marker => {
        const gridSize = 0.05; // ~5km in Macau
        const gridX = Math.floor(marker.latitude / gridSize);
        const gridY = Math.floor(marker.longitude / gridSize);
        const key = `${gridX},${gridY}`;

        if (!clustered.has(key)) {
          clustered.set(key, []);
        }
        const clusterArray = clustered.get(key);
        if (clusterArray) {
          clusterArray.push(marker);
        }
      });

      return Array.from(clustered.values()).map((cluster: MapMarkerType[]) => ({
        count: (cluster as any).length,
        lat: (cluster as any).reduce((sum: number, m: any) => sum + m.latitude, 0) / (cluster as any).length,
        lng: (cluster as any).reduce((sum: number, m: any) => sum + m.longitude, 0) / (cluster as any).length,
        type: (cluster as any)[0].type
      }));
    }

    return null;
  };

  const StatisticsPanel = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
      <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
        <div className="text-red-400">🍽️ 餐廳</div>
        <div className="text-xl font-bold text-white">{data?.restaurants?.length || 0}</div>
      </div>
      <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
        <div className="text-blue-400">🏨 酒店</div>
        <div className="text-xl font-bold text-white">{data?.hotels?.length || 0}</div>
      </div>
      <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
        <div className="text-green-400">💊 藥房</div>
        <div className="text-xl font-bold text-white">{data?.pharmacies?.length || 0}</div>
      </div>
      <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20">
        <div className="text-amber-400">🅿️ 停車</div>
        <div className="text-xl font-bold text-white">{data?.parking?.length || 0}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">澳門商業位置分布圖</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            正在加載地圖數據...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Map Container - Simulated */}
            <div
              ref={mapContainer}
              className="relative w-full h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-white/10 overflow-hidden"
            >
              {/* SVG Canvas for markers visualization */}
              <svg className="w-full h-full" viewBox={`${center.lng - 0.1} ${center.lat - 0.1} 0.2 0.2`}>
                {/* Grid background */}
                <defs>
                  <pattern id="grid" width="0.01" height="0.01" patternUnits="userSpaceOnUse">
                    <path d="M 0.01 0 L 0 0 0 0.01" fill="none" stroke="#ffffff" strokeWidth="0.0005" opacity="0.05" />
                  </pattern>
                </defs>
                <rect width="0.2" height="0.2" fill="url(#grid)" />

                {/* Markers */}
                {markers.map((marker, idx) => (
                  <g
                    key={idx}
                    onClick={() => setSelectedMarker(marker)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Halo effect */}
                    <circle
                      cx={marker.longitude}
                      cy={marker.latitude}
                      r="0.003"
                      fill={marker.color}
                      opacity="0.2"
                    />
                    {/* Main marker */}
                    <circle
                      cx={marker.longitude}
                      cy={marker.latitude}
                      r="0.002"
                      fill={marker.color}
                      stroke="white"
                      strokeWidth="0.0002"
                    />
                  </g>
                ))}

                {/* Center point */}
                <circle
                  cx={center.lng}
                  cy={center.lat}
                  r="0.001"
                  fill="white"
                  opacity="0.5"
                />
              </svg>

              {/* Legend */}
              <div className="absolute top-4 left-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-gray-300">餐廳</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-300">酒店</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-gray-300">藥房</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-gray-300">停車場</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <StatisticsPanel />

            {/* Selected Marker Info */}
            {selectedMarker && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">{getMarkerIcon(selectedMarker.type)}</div>
                <div className="text-white font-semibold mb-1">{selectedMarker.name}</div>
                <div className="text-xs text-gray-400">
                  座標: {selectedMarker.latitude.toFixed(4)}, {selectedMarker.longitude.toFixed(4)}
                </div>
                {selectedMarker.intensity && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-400 mb-1">熱度</div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${selectedMarker.intensity}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Map Type Selector */}
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30">
                📍 標記
              </button>
              <button className="px-3 py-1 text-xs rounded bg-white/10 border border-white/10 text-gray-400 hover:bg-white/20">
                🔥 熱力圖
              </button>
              <button className="px-3 py-1 text-xs rounded bg-white/10 border border-white/10 text-gray-400 hover:bg-white/20">
                🎯 聚類
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default MapVisualization;
