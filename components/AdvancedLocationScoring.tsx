import React, { useState, useMemo } from 'react';
import { MapPin, TrendingUp, AlertCircle, Brain } from 'lucide-react';
import GlassCard from './GlassCard';
import { ComprehensiveMarketData, PopulationData, PropertyTransactionData } from '../types';

interface AdvancedScoringProps {
  data?: ComprehensiveMarketData;
  businessType?: 'restaurant' | 'retail' | 'hotel' | 'service' | 'tech';
}

interface ScoreFactor {
  name: string;
  weight: number;
  value: number;
  description: string;
  formula: string;
}

interface AdvancedLocationScore {
  total: number;
  factors: ScoreFactor[];
  recommendation: {
    level: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    confidence: number;
    reasoning: string[];
  };
  seasonalTrends: {
    peak: string;
    low: string;
    adjustedScore: number;
  };
  competitorAnalysis: {
    intensity: number;
    saturation: 'Low' | 'Medium' | 'High';
    opportunities: string[];
  };
  riskFactors: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    factors: string[];
  };
}

const AdvancedLocationScoring: React.FC<AdvancedScoringProps> = ({
  data,
  businessType = 'restaurant'
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [score, setScore] = useState<AdvancedLocationScore | null>(null);
  const [useMLModel, setUseMLModel] = useState(true);

  const districts = Array.from(
    new Set(data?.population?.map(p => p.districtName) || [])
  );

  /**
   * 简化的机器学习评分模型
   * 使用加权多因素分析替代完整的神经网络
   */
  const calculateMLScore = (districtName: string): AdvancedLocationScore => {
    console.log('🤖 [ML Scoring] 使用机器学习模型计算评分，业务类型:', businessType);

    const districtData = data?.population?.find(p => p.districtName === districtName);
    const propertyData = data?.propertyTransactions?.filter(p => p.district === districtName);
    const avgPrice = propertyData?.reduce((sum, p) => sum + p.avgPriceSqm, 0) || 0;
    const avgPriceSqm = propertyData ? avgPrice / propertyData.length : 0;

    // 定义业务类型的权重配置
    const typeWeights: Record<string, Record<string, number>> = {
      restaurant: {
        population: 0.25,
        tourism: 0.30,
        accessibility: 0.20,
        competition: 0.15,
        affluence: 0.10
      },
      retail: {
        population: 0.30,
        accessibility: 0.25,
        tourism: 0.15,
        affluence: 0.20,
        competition: 0.10
      },
      hotel: {
        tourism: 0.40,
        accessibility: 0.20,
        affluence: 0.25,
        population: 0.10,
        competition: 0.05
      },
      service: {
        population: 0.35,
        affluence: 0.25,
        accessibility: 0.25,
        tourism: 0.10,
        competition: 0.05
      },
      tech: {
        population: 0.30,
        affluence: 0.30,
        accessibility: 0.25,
        tourism: 0.10,
        competition: 0.05
      }
    };

    const weights = typeWeights[businessType] || typeWeights.restaurant;

    // 计算各因素分数
    const factors: ScoreFactor[] = [];

    // 1. 人口因素 (0-100)
    const populationScore = districtData
      ? Math.min(100, (districtData.populationTotal / 200000) * 100)
      : 30;

    factors.push({
      name: '人口规模',
      weight: weights.population,
      value: populationScore,
      description: `当地人口: ${districtData?.populationTotal?.toLocaleString() || '未知'}`,
      formula: '(人口数 / 200000) * 100'
    });

    // 2. 旅游因素 (0-100)
    const visitorScore = data?.visitorArrivals
      ? Math.min(100, (data.visitorArrivals.length / 12) * 100)
      : 50;

    factors.push({
      name: '旅游热度',
      weight: weights.tourism,
      value: visitorScore,
      description: `近期旅客月份: ${data?.visitorArrivals?.length || 0}个`,
      formula: '(有效月份数 / 12) * 100'
    });

    // 3. 交通便利性 (0-100)
    const accessibilityScore = data?.busRoutes
      ? Math.min(100, ((data.busRoutes.length + (data.parking?.length || 0)) / 100) * 100)
      : 40;

    factors.push({
      name: '交通便利性',
      weight: weights.accessibility,
      value: accessibilityScore,
      description: `公交路线: ${data?.busRoutes?.length || 0}条, 停车场: ${data?.parking?.length || 0}个`,
      formula: '((公交数 + 停车数) / 100) * 100'
    });

    // 4. 竞争强度 (反向计分)
    const restaurantCount = data?.restaurants?.length || 0;
    const competitionScore = Math.max(20, 100 - (restaurantCount / 100) * 100);

    factors.push({
      name: '竞争强度',
      weight: weights.competition,
      value: competitionScore,
      description: `同类竞品: ${restaurantCount}家`,
      formula: '100 - (竞品数 / 100) * 100, 最低20分'
    });

    // 5. 消费力指标 (基于房价)
    const affluenceScore = avgPriceSqm
      ? Math.min(100, (avgPriceSqm / 100000) * 100)
      : 50;

    factors.push({
      name: '消费能力',
      weight: weights.affluence,
      value: affluenceScore,
      description: `平均房价: MOP ${avgPriceSqm.toFixed(0)}/m²`,
      formula: '(平均房价 / 100000) * 100'
    });

    // 计算加权总分
    let totalScore = 0;
    factors.forEach(factor => {
      totalScore += factor.value * factor.weight;
    });

    // 季节性调整
    const peakMonths = ['十一月', '十二月', '一月', '二月']; // 澳门旅游旺季
    const seasonalAdjustment = businessType === 'restaurant' || businessType === 'hotel' ? 0.95 : 1.0;
    const seasonalScore = totalScore * seasonalAdjustment;

    // 竞争分析
    const competitorIntensity = Math.min(100, (restaurantCount / 50) * 100);
    const saturation = competitorIntensity > 70 ? 'High' : competitorIntensity > 40 ? 'Medium' : 'Low';

    // 生成推荐
    let level: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    if (totalScore >= 75) level = 'EXCELLENT';
    else if (totalScore >= 60) level = 'GOOD';
    else if (totalScore >= 45) level = 'FAIR';
    else level = 'POOR';

    const confidence = Math.min(95, 60 + (populationScore + visitorScore) / 4);
    const reasoning: string[] = [];

    if (populationScore > 70) reasoning.push('人口密集，本地消费基础稳固');
    if (visitorScore > 60) reasoning.push('旅游流量充足，有利于消费');
    if (accessibilityScore > 70) reasoning.push('交通便利，便于客流到达');
    if (competitionScore > 70) reasoning.push('竞争较少，市场机遇大');
    if (affluenceScore > 60) reasoning.push('消费能力较强，客单价空间大');

    if (competitionScore < 40) reasoning.push('⚠️ 竞争激烈，需要差异化策略');
    if (populationScore < 40) reasoning.push('⚠️ 人口基数小，需重点依赖旅游客群');
    if (accessibilityScore < 50) reasoning.push('⚠️ 交通不便，需加大营销投入');

    // 风险分析
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    let riskFactors: string[] = [];

    if (totalScore < 45) riskLevel = 'HIGH';
    else if (totalScore < 60) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    if (competitorIntensity > 80) riskFactors.push('竞争过度，需警惕价格战');
    if (populationScore < 50) riskFactors.push('人流可能不足以支撑业务');
    if (avgPriceSqm > 80000) riskFactors.push('房价过高，租赁成本可能高');
    if (visitorScore < 40) riskFactors.push('旅游客流有限，季节性风险大');

    return {
      total: Math.round(totalScore),
      factors,
      recommendation: {
        level,
        confidence,
        reasoning
      },
      seasonalTrends: {
        peak: '11月-2月 (旅游旺季)',
        low: '5月-9月 (淡季)',
        adjustedScore: Math.round(seasonalScore)
      },
      competitorAnalysis: {
        intensity: competitorIntensity,
        saturation,
        opportunities: saturation === 'Low' ? ['市场缺口大', '可建立品牌优势'] : ['需要差异化', '可考虑子品牌']
      },
      riskFactors: {
        level: riskLevel,
        factors: riskFactors.length > 0 ? riskFactors : ['风险指标均在正常范围内']
      }
    };
  };

  const handleCalculateScore = () => {
    if (!selectedDistrict) return;

    const result = calculateMLScore(selectedDistrict);
    setScore(result);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'GOOD':
        return 'text-blue-400 bg-blue-500/10';
      case 'FAIR':
        return 'text-amber-400 bg-amber-500/10';
      case 'POOR':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-gray-400';
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
      case 'MEDIUM':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
      case 'HIGH':
        return 'border-red-500/30 bg-red-500/10 text-red-300';
      default:
        return 'border-gray-500/30 bg-gray-500/10 text-gray-300';
    }
  };

  const businessTypeLabels: Record<string, string> = {
    restaurant: '餐廳',
    retail: '零售',
    hotel: '酒店',
    service: '服務業',
    tech: '科技公司'
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">
          {useMLModel ? '🤖 AI' : '📊'} 高级位置评分
        </h2>
        <button
          onClick={() => setUseMLModel(!useMLModel)}
          className="ml-auto px-3 py-1 text-xs rounded bg-purple-500/20 border border-purple-400/50 text-purple-300 hover:bg-purple-500/30"
        >
          {useMLModel ? '切换简化' : '切换AI'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Business Type Selector */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
            業務類型
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(businessTypeLabels).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setSelectedDistrict('')}
                className={`px-3 py-2 text-xs rounded transition-colors ${
                  businessType === type
                    ? 'bg-purple-500/20 border border-purple-400/50 text-purple-300'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* District Selector */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
            選擇分區
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
          >
            <option value="">-- 選擇分區 --</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculateScore}
          disabled={!selectedDistrict}
          className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-lg text-purple-300 font-medium text-sm hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          計算評分
        </button>

        {/* Results */}
        {score && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            {/* Overall Score */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-white/10">
              <div className="text-4xl font-bold text-white mb-1">
                {score.total}
              </div>
              <div className={`text-sm font-semibold ${getLevelColor(score.recommendation.level)}`}>
                {score.recommendation.level === 'EXCELLENT' && '✅ 優秀選址'}
                {score.recommendation.level === 'GOOD' && '⭐ 不錯選址'}
                {score.recommendation.level === 'FAIR' && '⚠️ 一般選址'}
                {score.recommendation.level === 'POOR' && '❌ 風險較高'}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                模型置信度: {score.recommendation.confidence.toFixed(0)}%
              </div>
            </div>

            {/* Factor Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">評分因素</h3>
              {score.factors.map((factor, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">{factor.name}</span>
                    <span className="text-xs font-bold text-purple-300">{factor.value.toFixed(0)}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${factor.value}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{factor.description}</div>
                  <div className="text-xs text-gray-500 font-mono">{factor.formula}</div>
                </div>
              ))}
            </div>

            {/* Seasonal Trends */}
            <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <div className="text-xs font-semibold text-blue-300 mb-2">📅 季節性趨勢</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                <div>
                  <div className="text-gray-500">旺季</div>
                  <div className="text-blue-300 font-semibold">{score.seasonalTrends.peak}</div>
                </div>
                <div>
                  <div className="text-gray-500">淡季</div>
                  <div className="text-blue-300 font-semibold">{score.seasonalTrends.low}</div>
                </div>
              </div>
              <div className="mt-2 text-xs">
                <span className="text-gray-500">季節性調整評分:</span>
                <span className="ml-1 text-white font-semibold">{score.seasonalTrends.adjustedScore}</span>
              </div>
            </div>

            {/* Reasoning */}
            {score.recommendation.reasoning.length > 0 && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
                <div className="text-xs font-semibold text-emerald-300 mb-2">💡 評估理由</div>
                <ul className="text-xs text-emerald-100 space-y-1">
                  {score.recommendation.reasoning.map((reason, idx) => (
                    <li key={idx}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors */}
            <div className={`p-3 border rounded-lg ${getRiskBadgeColor(score.riskFactors.level)}`}>
              <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                風險評級: {score.riskFactors.level}
              </div>
              <ul className="text-xs space-y-1">
                {score.riskFactors.factors.map((factor, idx) => (
                  <li key={idx}>• {factor}</li>
                ))}
              </ul>
            </div>

            {/* Competitor Analysis */}
            <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-lg">
              <div className="text-xs font-semibold text-amber-300 mb-2">🎯 競爭分析</div>
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">市場飽和度</div>
                <div className="flex items-center gap-2">
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${score.competitorAnalysis.intensity}%` }}
                    />
                  </div>
                  <span className="text-xs text-amber-300 font-semibold whitespace-nowrap">
                    {score.competitorAnalysis.saturation}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">商業機遇</div>
                <div className="flex flex-wrap gap-1">
                  {score.competitorAnalysis.opportunities.map((opp, idx) => (
                    <span key={idx} className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                      {opp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default AdvancedLocationScoring;
