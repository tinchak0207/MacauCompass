import React, { useState } from 'react';
import { DistrictData } from '../types';

interface MacauMapProps {
  districts: DistrictData[];
  selectedDistrict: string;
  onDistrictSelect: (districtId: string) => void;
}

const MacauMap: React.FC<MacauMapProps> = ({ districts, selectedDistrict, onDistrictSelect }) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const getDistrictById = (id: string) => districts.find(d => d.id === id);

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
            fill={selectedDistrict === 'nape' ? '#6366f1' : hoveredDistrict === 'nape' ? '#4f46e5' : '#1e293b'}
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
            fill={selectedDistrict === 'centro' ? '#6366f1' : hoveredDistrict === 'centro' ? '#4f46e5' : '#1e293b'}
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
            fill={selectedDistrict === 'norte' ? '#6366f1' : hoveredDistrict === 'norte' ? '#4f46e5' : '#1e293b'}
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
            fill={selectedDistrict === 'taipa' ? '#6366f1' : hoveredDistrict === 'taipa' ? '#4f46e5' : '#1e293b'}
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
            fill={selectedDistrict === 'coloane' ? '#6366f1' : hoveredDistrict === 'coloane' ? '#4f46e5' : '#1e293b'}
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

      {/* Hover Info */}
      {hoveredDistrict && (
        <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 border border-white/20 min-w-[200px]">
          <div className="text-white font-medium mb-2">
            {getDistrictById(hoveredDistrict)?.nameZh}
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>租金: MOP {getDistrictById(hoveredDistrict)?.rentPerSqFt}/呎²</div>
            <div>薪金: MOP {getDistrictById(hoveredDistrict)?.avgSalary?.toLocaleString()}/月</div>
          </div>
        </div>
      )}

      {/* Legend */}
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
    </div>
  );
};

export default MacauMap;