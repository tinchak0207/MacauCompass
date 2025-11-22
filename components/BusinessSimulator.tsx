import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import MacauMap from './MacauMap';
import TacticalAI from './TacticalAI';
import { 
  SimulationParams, 
  SimulationResult, 
  DistrictData, 
  RiskAssessment 
} from '../types';
import { 
  MapPin, 
  Users, 
  Home, 
  Wrench, 
  Calculator, 
  AlertTriangle, 
  TrendingUp,
  Zap,
  Loader2
} from 'lucide-react';
import { streamBusinessAdvice } from '../services/geminiService';

const districts: DistrictData[] = [
  { id: 'nape', name: 'NAPE', nameZh: '皇朝區 (NAPE)', rentPerSqFt: 25, avgSalary: 22000, coordinates: { x: 260, y: 220 } },
  { id: 'norte', name: 'Norte', nameZh: '北區 (黑沙環)', rentPerSqFt: 12, avgSalary: 15000, coordinates: { x: 270, y: 120 } },
  { id: 'taipa', name: 'Taipa', nameZh: '氹仔市中心', rentPerSqFt: 20, avgSalary: 19000, coordinates: { x: 460, y: 365 } },
  { id: 'coloane', name: 'Coloane', nameZh: '路環市區', rentPerSqFt: 15, avgSalary: 16500, coordinates: { x: 615, y: 435 } },
  { id: 'centro', name: 'Centro', nameZh: '中區 (新馬路)', rentPerSqFt: 35, avgSalary: 18000, coordinates: { x: 130, y: 250 } },
];

const BusinessSimulator: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    district: 'nape',
    shopSize: 300,
    employeeCount: 2,
    renovationBudget: 50000,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedDistrict = districts.find(d => d.id === params.district);

  useEffect(() => {
    calculateSimulation();
  }, [params]);

  const calculateSimulation = () => {
    const district = districts.find(d => d.id === params.district);
    if (!district) return;

    const monthlyRent = params.shopSize * district.rentPerSqFt;
    const monthlyPayroll = params.employeeCount * district.avgSalary;
    const monthlyFixedCosts = monthlyRent + monthlyPayroll;
    const totalInitialInvestment = params.renovationBudget + (monthlyRent * 3) + (monthlyPayroll * 2);
    const burnRate = monthlyFixedCosts;

    setResult({
      monthlyRent,
      monthlyPayroll,
      monthlyFixedCosts,
      totalInitialInvestment,
      burnRate,
    });
  };

  const analyzeRisk = async () => {
    if (!result || !selectedDistrict) return;

    setIsAnalyzing(true);
    try {
      const prompt = `作為澳門商業風險評估專家，請分析以下創業模擬數據並提供詳細的風險評估：

**地區**: ${selectedDistrict.nameZh}
**店鋪面積**: ${params.shopSize} 平方呎
**員工人數**: ${params.employeeCount} 人
**裝修預算**: MOP ${params.renovationBudget.toLocaleString()}

**計算結果**:
- 月租金: MOP ${result.monthlyRent.toLocaleString()}
- 月薪資: MOP ${result.monthlyPayroll.toLocaleString()}
- 月固定成本: MOP ${result.monthlyFixedCosts.toLocaleString()}
- 總初期投資: MOP ${result.totalInitialInvestment.toLocaleString()}
- 燒錢速度: MOP ${result.burnRate.toLocaleString()}/月

請以JSON格式回應，包含以下結構：
{
  "overall": "LOW|MEDIUM|HIGH|CRITICAL",
  "factors": {
    "rentBurden": { "level": "低|中|高", "description": "租金負擔分析" },
    "scalability": { "level": "低|中|高", "description": "擴展潛力分析" },
    "cashFlow": { "level": "健康|緊張|危險", "description": "現金流分析" }
  },
  "recommendations": ["建議1", "建議2", "建議3"],
  "monthlySurvival": 數字 (假設沒有收入的情況下，資金可維持月份)
}

請基於澳門當前的市場環境、租金水平、人力成本和經濟情況進行實際評估。`;

      const stream = await streamBusinessAdvice(prompt, []);
      let responseText = '';
      
      for await (const chunk of stream.stream) {
        const text = chunk.text();
        responseText += text;
      }

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const assessment = JSON.parse(jsonMatch[0]);
          setRiskAssessment(assessment);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback assessment
        setRiskAssessment({
          overall: 'MEDIUM',
          factors: {
            rentBurden: { level: '中', description: '租金成本在合理範圍內' },
            scalability: { level: '中', description: '具備基本擴展條件' },
            cashFlow: { level: '健康', description: '現金流狀況良好' }
          },
          recommendations: ['建議準備6個月營運資金', '考慮階段性擴展', '密切監控成本變化'],
          monthlySurvival: Math.round(params.renovationBudget / result.burnRate)
        });
      }
    } catch (error) {
      console.error('Risk analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
      case '低':
      case '健康':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'medium':
      case '中':
      case '緊張':
        return 'text-amber-400 bg-amber-500/10';
      case 'high':
      case '高':
      case '危險':
        return 'text-red-400 bg-red-500/10';
      case 'critical':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">生意模擬器 v2.0</h2>
        <p className="text-gray-400">模擬您的創業成本，AI 即時評估風險與機遇</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Map Selection */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="text-indigo-400 w-5 h-5" />
              <h3 className="text-lg font-semibold text-white">選擇地區</h3>
            </div>
            <MacauMap
              districts={districts}
              selectedDistrict={params.district}
              onDistrictSelect={(districtId) => setParams({ ...params, district: districtId })}
            />
          </GlassCard>

          {/* Parameter Controls */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">營運參數</h3>
            
            <div className="space-y-6">
              {/* Shop Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Home className="w-4 h-4" />
                    <span>店鋪面積</span>
                  </label>
                  <span className="text-white font-medium">{params.shopSize} 平方呎</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={params.shopSize}
                  onChange={(e) => setParams({ ...params, shopSize: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100呎</span>
                  <span>2000呎</span>
                </div>
              </div>

              {/* Employee Count */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Users className="w-4 h-4" />
                    <span>員工人數</span>
                  </label>
                  <span className="text-white font-medium">{params.employeeCount} 人</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={params.employeeCount}
                  onChange={(e) => setParams({ ...params, employeeCount: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1人</span>
                  <span>20人</span>
                </div>
              </div>

              {/* Renovation Budget */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Wrench className="w-4 h-4" />
                    <span>裝修預算</span>
                  </label>
                  <span className="text-white font-medium">MOP {params.renovationBudget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="10000"
                  value={params.renovationBudget}
                  onChange={(e) => setParams({ ...params, renovationBudget: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1萬</span>
                  <span>50萬</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Calculation Results */}
          {result && (
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Calculator className="text-emerald-400 w-5 h-5" />
                <h3 className="text-lg font-semibold text-white">成本計算</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-400">月租金</span>
                  <span className="text-xl font-semibold text-white">
                    MOP {result.monthlyRent.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-400">月薪資</span>
                  <span className="text-xl font-semibold text-white">
                    MOP {result.monthlyPayroll.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-400">月固定成本</span>
                  <span className="text-xl font-semibold text-indigo-400">
                    MOP {result.monthlyFixedCosts.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-400">總初期投資</span>
                  <span className="text-xl font-semibold text-amber-400">
                    MOP {result.totalInitialInvestment.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">燒錢速度</span>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    <span className="text-xl font-semibold text-red-400">
                      MOP {result.burnRate.toLocaleString()}/月
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Tactical AI Analysis */}
          <TacticalAI
            params={params}
            result={result}
            selectedDistrict={selectedDistrict}
          />

          {/* AI Risk Assessment */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-amber-400 w-5 h-5" />
                <h3 className="text-lg font-semibold text-white">AI 風險評估</h3>
              </div>
              <button
                onClick={analyzeRisk}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>分析中...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Analyze Risk</span>
                  </>
                )}
              </button>
            </div>

            {riskAssessment ? (
              <div className="space-y-4">
                {/* Overall Risk */}
                <div className="text-center p-4 rounded-lg bg-slate-800/50">
                  <div className="text-sm text-gray-400 mb-1">整體風險評級</div>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block ${getRiskColor(riskAssessment.overall)}`}>
                    {riskAssessment.overall === 'LOW' ? '低風險' :
                     riskAssessment.overall === 'MEDIUM' ? '中等風險' :
                     riskAssessment.overall === 'HIGH' ? '高風險' : '極高風險'}
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-800/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">租金負擔</span>
                      <span className={`text-xs px-2 py-1 rounded ${getRiskColor(riskAssessment.factors.rentBurden.level)}`}>
                        {riskAssessment.factors.rentBurden.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{riskAssessment.factors.rentBurden.description}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">擴展潛力</span>
                      <span className={`text-xs px-2 py-1 rounded ${getRiskColor(riskAssessment.factors.scalability.level)}`}>
                        {riskAssessment.factors.scalability.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{riskAssessment.factors.scalability.description}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">現金流狀況</span>
                      <span className={`text-xs px-2 py-1 rounded ${getRiskColor(riskAssessment.factors.cashFlow.level)}`}>
                        {riskAssessment.factors.cashFlow.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{riskAssessment.factors.cashFlow.description}</p>
                  </div>
                </div>

                {/* Runway */}
                <div className="text-center p-3 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
                  <div className="text-sm text-gray-400">資金跑道</div>
                  <div className="text-xl font-bold text-indigo-400">
                    {riskAssessment.monthlySurvival} 個月
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">建議措施：</div>
                  {riskAssessment.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-xs text-gray-400 pl-4 border-l-2 border-indigo-500/30">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">點擊 "Analyze Risk" 獲取 AI 風險評估</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #6366f1;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #6366f1;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default BusinessSimulator;