import React, { useState } from 'react';
import { MapPin, TrendingUp, Users, Zap, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import { ComprehensiveMarketData, PopulationData, PropertyTransactionData } from '../types';

interface LocationScoringToolProps {
  data?: ComprehensiveMarketData;
}

interface LocationScore {
  total: number;
  accessibility: number;
  demographics: number;
  competition: number;
  economicVitality: number;
  touristTraffic: number;
  recommendation: string;
  riskFactors: string[];
}

const LocationScoringTool: React.FC<LocationScoringToolProps> = ({ data }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Central');
  const [score, setScore] = useState<LocationScore | null>(null);

  const calculateScore = () => {
    console.log('📍 [LocationScoring] 計算選址評分...');

    // Accessibility score (0-20): Based on bus routes, parking, WiFi
    const accessibilityScore =
      Math.min(20, ((data?.busRoutes?.length || 0) / 50) * 10 + ((data?.parking?.length || 0) / 20) * 10);

    // Demographics score (0-20): Based on population density
    const selectedPopulation = data?.population?.find(p =>
      p.districtName.includes(selectedDistrict)
    );
    const demographicsScore = selectedPopulation
      ? Math.min(20, (selectedPopulation.density / 2000) * 20)
      : 10;

    // Competition score (0-20): Lower is better - count restaurants in area
    const competitionScore = Math.max(5, 20 - ((data?.restaurants?.length || 0) / 50) * 15);

    // Economic vitality score (0-20): Based on new companies + property transactions
    const economicScore = Math.min(20,
      ((data?.newCompanies?.length || 0) / 50) * 10 +
      ((data?.propertyTransactions?.length || 0) / 30) * 10
    );

    // Tourist traffic score (0-20): Based on visitor arrivals + hotel occupancy
    const touristScore = Math.min(20,
      ((data?.visitorArrivals?.length || 0) / 12) * 10 +
      ((data?.hotelOccupancy?.length || 0) / 12) * 10
    );

    const totalScore = (
      accessibilityScore +
      demographicsScore +
      competitionScore +
      economicScore +
      touristScore
    );

    // Generate risk factors
    const riskFactors: string[] = [];
    if (competitionScore > 15) riskFactors.push('該區競品較多,需要差異化定位');
    if (demographicsScore < 8) riskFactors.push('人口密度較低,消費力待評估');
    if (accessibilityScore < 10) riskFactors.push('交通便利性一般,需提升配送效率');
    if (economicScore < 10) riskFactors.push('區域創業活躍度偏低');
    if (touristScore < 10) riskFactors.push('遊客流量不足,需關注本地客群');

    const recommendation = totalScore >= 70
      ? '✅ 優秀選址,強烈推薦'
      : totalScore >= 50
        ? '⚠️ 不錯的選址,需要針對性運營策略'
        : '❌ 風險較高,建議謹慎考慮';

    setScore({
      total: totalScore,
      accessibility: accessibilityScore,
      demographics: demographicsScore,
      competition: competitionScore,
      economicVitality: economicScore,
      touristTraffic: touristScore,
      recommendation,
      riskFactors
    });
  };

  const districts = Array.from(
    new Set(data?.population?.map(p => p.districtName) || [])
  );

  const renderScoreBar = (label: string, value: number, max: number = 20) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <span className="text-xs font-bold text-white">{value.toFixed(1)}/{max}</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-400" />
        新店鋪位置評分工具
      </h2>

      <div className="space-y-4">
        {/* District Selector */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
            選擇分區
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400"
          >
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateScore}
          className="w-full px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-lg text-emerald-300 font-medium text-sm hover:bg-emerald-500/30 transition-colors"
        >
          計算評分
        </button>

        {/* Results */}
        {score && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            {/* Overall Score */}
            <div className="text-center p-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">
                {score.total.toFixed(0)}/100
              </div>
              <div className={`text-sm font-semibold ${
                score.total >= 70 ? 'text-emerald-300' :
                score.total >= 50 ? 'text-amber-300' :
                'text-red-300'
              }`}>
                {score.recommendation}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">評分詳解</h3>
              {renderScoreBar('交通便利性', score.accessibility)}
              {renderScoreBar('人口統計', score.demographics)}
              {renderScoreBar('競爭強度', score.competition)}
              {renderScoreBar('經濟活躍度', score.economicVitality)}
              {renderScoreBar('遊客流量', score.touristTraffic)}
            </div>

            {/* Risk Factors */}
            {score.riskFactors.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-amber-300 mb-2">風險因素</h4>
                    <ul className="text-xs text-amber-100 space-y-1">
                      {score.riskFactors.map((factor, i) => (
                        <li key={i}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default LocationScoringTool;
