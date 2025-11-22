import React, { useState } from 'react';
import { DistrictData } from '../types';
import { Layers, DollarSign, Users } from 'lucide-react';

interface MacauMapProps {
  districts: DistrictData[];
  selectedDistrict: string;
  onDistrictSelect: (districtId: string) => void;
}

type HeatmapView = 'none' | 'rent' | 'footTraffic';

const MacauMap: React.FC<MacauMapProps> = ({ districts, selectedDistrict, onDistrictSelect }) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [heatmapView, setHeatmapView] = useState<HeatmapView>('none');

  const getDistrictById = (id: string) => districts.find(d => d.id === id);

  // Mock foot traffic data (scaled 1-10)
  const footTrafficData: Record<string, number> = {
    'nape': 9,
    'centro': 8,
    'norte': 6,
    'taipa': 7,
    'coloane': 3,
  };

  // Normalize rent values for heatmap (min: 12, max: 35)
  const getRentIntensity = (rent: number) => {
    const min = 12;
    const max = 35;
    return ((rent - min) / (max - min)) * 100;
  };

  // Get heat color based on intensity (0-100)
  const getHeatColor = (intensity: number, type: 'rent' | 'footTraffic') => {
    if (type === 'rent') {
      // Red gradient for rent (higher = more expensive = red)
      if (intensity > 75) return '#dc2626'; // red-600
      if (intensity > 50) return '#ea580c'; // orange-600
      if (intensity > 25) return '#f59e0b'; // amber-500
      return '#65a30d'; // lime-600
    } else {
      // Blue gradient for foot traffic (higher = more traffic = blue)
      if (intensity > 75) return '#1e40af'; // blue-800
      if (intensity > 50) return '#2563eb'; // blue-600
      if (intensity > 25) return '#3b82f6'; // blue-500
      return '#93c5fd'; // blue-300
    }
  };

  const getDistrictColor = (districtId: string) => {
    if (selectedDistrict === districtId) return '#6366f1';
    if (hoveredDistrict === districtId) return '#4f46e5';
    
    if (heatmapView === 'none') return '#1e293b';
    
    const district = getDistrictById(districtId);
    if (!district) return '#1e293b';
    
    if (heatmapView === 'rent') {
      const intensity = getRentIntensity(district.rentPerSqFt);
      return getHeatColor(intensity, 'rent');
    }
    
    if (heatmapView === 'footTraffic') {
      const intensity = (footTrafficData[districtId] || 0) * 10; // Convert to percentage
      return getHeatColor(intensity, 'footTraffic');
    }
    
    return '#1e293b';
  };

  return (
    <div className="relative w-full h-full bg-slate-900/50 rounded-xl border border-white/10 p-4">
      {/* Abstract Macau Map Representation */}
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full"
        style={{ maxHeight: '500px' }}
      >
        {/* Macau Peninsula */}
        <g id="macau-peninsula">
          {/* Nape (皇朝區) */}
          <rect
            x="200"
            y="180"
            width="120"
            height="80"
            rx="8"
            fill={getDistrictColor('nape')}
            stroke="#64748b"
            strokeWidth="2"
            className="cursor-pointer transition-all duration-200 hover:stroke-indigo-400"
            onClick={() => onDistrictSelect('nape')}
            onMouseEnter={() => setHoveredDistrict('nape')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />
          <text
            x="260"
            y="225"
            textAnchor="middle"
            className="fill-white text-sm font-medium pointer-events-none"
          >
            皇朝區
          </text>

          {/* Centro (中區) */}
          <rect
            x="80"
            y="200"
            width="100"
            height="100"
            rx="8"
            fill={getDistrictColor('centro')}
            stroke="#64748b"
            strokeWidth="2"
            className="cursor-pointer transition-all duration-200 hover:stroke-indigo-400"
            onClick={() => onDistrictSelect('centro')}
            onMouseEnter={() => setHoveredDistrict('centro')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />
          <text
            x="130"
            y="255"
            textAnchor="middle"
            className="fill-white text-sm font-medium pointer-events-none"
          >
            中區
          </text>

          {/* Norte (北區) */}
          <rect
            x="200"
            y="80"
            width="140"
            height="80"
            rx="8"
            fill={getDistrictColor('norte')}
            stroke="#64748b"
            strokeWidth="2"
            className="cursor-pointer transition-all duration-200 hover:stroke-indigo-400"
            onClick={() => onDistrictSelect('norte')}
            onMouseEnter={() => setHoveredDistrict('norte')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />
          <text
            x="270"
            y="125"
            textAnchor="middle"
            className="fill-white text-sm font-medium pointer-events-none"
          >
            北區
          </text>
        </g>

        {/* Taipa */}
        <g id="taipa">
          {/* Taipa Center */}
          <rect
            x="400"
            y="320"
            width="120"
            height="90"
            rx="8"
            fill={getDistrictColor('taipa')}
            stroke="#64748b"
            strokeWidth="2"
            className="cursor-pointer transition-all duration-200 hover:stroke-indigo-400"
            onClick={() => onDistrictSelect('taipa')}
            onMouseEnter={() => setHoveredDistrict('taipa')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />
          <text
            x="460"
            y="370"
            textAnchor="middle"
            className="fill-white text-sm font-medium pointer-events-none"
          >
            氹仔中心
          </text>
        </g>

        {/* Coloane */}
        <g id="coloane">
          {/* Coloane */}
          <rect
            x="560"
            y="400"
            width="110"
            height="70"
            rx="8"
            fill={getDistrictColor('coloane')}
            stroke="#64748b"
            strokeWidth="2"
            className="cursor-pointer transition-all duration-200 hover:stroke-indigo-400"
            onClick={() => onDistrictSelect('coloane')}
            onMouseEnter={() => setHoveredDistrict('coloane')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />
          <text
            x="615"
            y="440"
            textAnchor="middle"
            className="fill-white text-sm font-medium pointer-events-none"
          >
            路環市區
          </text>
        </g>

        {/* Connection Lines */}
        <line x1="320" y1="220" x2="400" y2="365" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="520" y1="365" x2="560" y2="435" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" />
      </svg>

      {/* Heatmap Controls */}
      <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="flex items-center space-x-2 mb-2">
          <Layers className="text-indigo-400 w-4 h-4" />
          <span className="text-white font-medium text-sm">熱力圖視圖</span>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => setHeatmapView('none')}
            className={`w-full px-3 py-2 text-xs font-medium rounded transition-colors ${
              heatmapView === 'none' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            標準視圖
          </button>
          <button
            onClick={() => setHeatmapView('rent')}
            className={`w-full px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-center space-x-1 ${
              heatmapView === 'rent' 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <DollarSign className="w-3 h-3" />
            <span>租金壓力</span>
          </button>
          <button
            onClick={() => setHeatmapView('footTraffic')}
            className={`w-full px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-center space-x-1 ${
              heatmapView === 'footTraffic' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>人流密度</span>
          </button>
        </div>
      </div>

      {/* Hover Info */}
      {hoveredDistrict && (
        <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 border border-white/20 min-w-[200px]">
          <div className="text-white font-medium mb-2">
            {getDistrictById(hoveredDistrict)?.nameZh}
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>租金: MOP {getDistrictById(hoveredDistrict)?.rentPerSqFt}/呎²</div>
            <div>薪金: MOP {getDistrictById(hoveredDistrict)?.avgSalary?.toLocaleString()}/月</div>
            {heatmapView === 'rent' && (
              <div className="text-red-400">
                租金壓力: {getRentIntensity(getDistrictById(hoveredDistrict)?.rentPerSqFt || 0).toFixed(0)}%
              </div>
            )}
            {heatmapView === 'footTraffic' && (
              <div className="text-blue-400">
                人流指數: {footTrafficData[hoveredDistrict] || 0}/10
              </div>
            )}
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      {heatmapView !== 'none' && (
        <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="text-white font-medium text-sm mb-2">
            {heatmapView === 'rent' ? '租金壓力圖例' : '人流密度圖例'}
          </div>
          <div className="space-y-1">
            {heatmapView === 'rent' ? (
              <>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-lime-600 rounded"></div>
                  <span className="text-gray-300">低 (MOP 12-20)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                  <span className="text-gray-300">中 (MOP 20-28)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-orange-600 rounded"></div>
                  <span className="text-gray-300">高 (MOP 28-32)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-red-600 rounded"></div>
                  <span className="text-gray-300">極高 (MOP 32-35)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-blue-300 rounded"></div>
                  <span className="text-gray-300">低人流 (1-3)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-300">中人流 (4-6)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-gray-300">高人流 (7-8)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-blue-800 rounded"></div>
                  <span className="text-gray-300">極高人流 (9-10)</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Standard Legend */}
      {heatmapView === 'none' && (
        <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-slate-700 rounded"></div>
            <span>可選擇</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
            <span>已選擇</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MacauMap;