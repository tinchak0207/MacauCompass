import React from 'react';
import GlassCard from './GlassCard';
import { MapPin, Info } from 'lucide-react';
import { CostData } from '../types';

const costData: CostData[] = [
  { district: '皇朝區 (NAPE)', rentPerSqFt: 25, avgSalary: 22000 },
  { district: '北區 (黑沙環)', rentPerSqFt: 12, avgSalary: 15000 },
  { district: '氹仔市中心', rentPerSqFt: 20, avgSalary: 19000 },
  { district: '路環市區', rentPerSqFt: 15, avgSalary: 16500 },
  { district: '中區 (新馬路)', rentPerSqFt: 35, avgSalary: 18000 },
];

const CostAnalysis: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-white mb-2">營運成本參考</h2>
          <p className="text-gray-400">各區平均商業租金與人力成本估算 (MOP)</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {costData.map((data, idx) => (
          <GlassCard key={idx} className="p-6" enableTilt hoverEffect>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="text-indigo-400 w-5 h-5" />
                <h3 className="font-bold text-white text-lg font-serif">{data.district}</h3>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">平均商業租金</p>
                <div className="flex items-baseline space-x-2">
                   <span className="text-3xl font-semibold text-white">{data.rentPerSqFt}</span>
                   <span className="text-sm text-gray-500">元 / 平方呎</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-colors duration-300" 
                    style={{ width: `${(data.rentPerSqFt / 40) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">平均薪酬 (零售/文職)</p>
                <div className="flex items-baseline space-x-2">
                   <span className="text-2xl font-medium text-gray-300">{data.avgSalary.toLocaleString()}</span>
                   <span className="text-xs text-gray-500">元 / 月</span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6 mt-8">
        <div className="flex items-start space-x-4">
          <Info className="text-emerald-400 w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-white font-medium mb-2">政府資助計劃提示</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              對於從事<strong>科技</strong>或<strong>文創</strong>產業的初創企業，澳門青年創業孵化中心等機構提供辦公空間租金補貼。
              您可以隨時詢問 AI 顧問關於「中小企業援助計劃」或「青年創業援助計劃」的詳情。
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default CostAnalysis;