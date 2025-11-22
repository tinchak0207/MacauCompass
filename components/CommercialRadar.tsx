import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from './GlassCard';
import {
  MapPin,
  TrendingUp,
  Search,
  ExternalLink,
  AlertTriangle,
  Star,
  Users,
  Loader2,
  Radar as RadarIcon,
} from 'lucide-react';
import { fetchCommercialRadar } from '../services/geminiService';
import type { RadarAnalysis, CompetitorPlace } from '../types';

const districts = [
  { id: 'nape', name: '皇朝區 (NAPE)' },
  { id: 'taipa', name: '氹仔市中心' },
  { id: 'centro', name: '中區 (新馬路)' },
  { id: 'norte', name: '北區 (黑沙環)' },
  { id: 'coloane', name: '路環市區' },
];

const businessTypes = [
  { id: 'cafe', label: '咖啡店', icon: '☕' },
  { id: 'restaurant', label: '餐廳', icon: '🍽️' },
  { id: 'retail', label: '零售店', icon: '🛍️' },
  { id: 'beauty', label: '美容美髮', icon: '💇' },
  { id: 'education', label: '教育培訓', icon: '📚' },
  { id: 'fitness', label: '健身中心', icon: '🏋️' },
];

const CommercialRadar: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('nape');
  const [selectedType, setSelectedType] = useState('cafe');
  const [analysis, setAnalysis] = useState<RadarAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const district = districts.find((d) => d.id === selectedDistrict)?.name || '皇朝區';
      const businessType = businessTypes.find((t) => t.id === selectedType)?.label || '咖啡店';

      const result = await fetchCommercialRadar({
        district,
        businessType,
      });

      setAnalysis(result);
    } catch (error) {
      console.error('Radar scan failed:', error);
      setError('無法連接 Google Maps Grounding，已切換至備援資料。');
    } finally {
      setIsLoading(false);
    }
  };

  const getSaturationColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSaturationLabel = (level: string) => {
    switch (level) {
      case 'LOW':
        return '低飽和';
      case 'MEDIUM':
        return '中等';
      case 'HIGH':
        return '高飽和';
      case 'CRITICAL':
        return '極度飽和';
      default:
        return '未知';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">
          商業實地雷達
        </h2>
        <p className="text-gray-400">
          基於 Google Maps 真實數據，分析競爭對手與市場飽和度
        </p>
      </div>

      {/* Control Panel */}
      <GlassCard className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              選擇地區
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {districts.map((district) => (
                <button
                  key={district.id}
                  onClick={() => setSelectedDistrict(district.id)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${
                      selectedDistrict === district.id
                        ? 'bg-indigo-600 text-white border border-indigo-500'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  {district.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              業務類型
            </label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`
                    px-4 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1
                    ${
                      selectedType === type.id
                        ? 'bg-emerald-600 text-white border border-emerald-500'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                掃描中...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                開始雷達掃描
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-200 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {analysis && (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="p-5" enableTilt>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">競爭對手數量</span>
                <RadarIcon className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-white font-serif">
                {analysis.metrics.competitorCount}
              </div>
            </GlassCard>

            <GlassCard className="p-5" enableTilt>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">平均評分</span>
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white font-serif">
                {analysis.metrics.avgRating?.toFixed(1) || 'N/A'}
              </div>
            </GlassCard>

            <GlassCard className="p-5" enableTilt>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">市場飽和度</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div
                className={`text-lg font-bold px-3 py-1 rounded-lg border inline-block ${getSaturationColor(
                  analysis.saturationLevel
                )}`}
              >
                {getSaturationLabel(analysis.saturationLevel)}
              </div>
            </GlassCard>
          </div>

          {/* AI Insights */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">AI 市場洞察</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{analysis.insights}</p>

            {analysis.recommendations.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-400">建議措施：</h4>
                {analysis.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-300 pl-4 border-l-2 border-indigo-500/30 py-1"
                  >
                    • {rec}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Competitors List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              真實競爭對手 ({analysis.competitors.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.competitors.map((competitor, idx) => (
                <CompetitorCard key={idx} competitor={competitor} />
              ))}
            </div>
          </div>
        </>
      )}

      {!analysis && !isLoading && (
        <GlassCard className="p-12 text-center">
          <RadarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">
            選擇地區與業務類型，點擊「開始雷達掃描」查看真實市場數據
          </p>
        </GlassCard>
      )}
    </div>
  );
};

const CompetitorCard: React.FC<{ competitor: CompetitorPlace }> = ({
  competitor,
}) => {
  return (
    <GlassCard className="p-4 hover:border-white/20" hoverEffect>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-white text-sm flex-1 leading-tight">
          {competitor.name}
        </h4>
        {competitor.mapsUri && (
          <a
            href={competitor.mapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 ml-2"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {competitor.vicinity && (
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {competitor.vicinity}
        </p>
      )}

      <div className="flex items-center justify-between">
        {competitor.rating && (
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{competitor.rating}</span>
          </div>
        )}

        {competitor.userRatingsTotal && (
          <div className="flex items-center gap-1 text-gray-500">
            <Users className="w-3 h-3" />
            <span className="text-xs">{competitor.userRatingsTotal} 評論</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default CommercialRadar;
