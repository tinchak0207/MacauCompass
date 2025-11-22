import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCcw, TrendingUp, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import MarketHeatmapMonitor from './MarketHeatmapMonitor';
import LocationScoringTool from './LocationScoringTool';
import { ComprehensiveMarketData } from '../types';
import { fetchComprehensiveMarketData } from '../services/comprehensiveDataService';

const ComprehensiveMarketDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<ComprehensiveMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'locations'>('overview');

  useEffect(() => {
    loadComprehensiveData();
  }, []);

  const loadComprehensiveData = async () => {
    console.log('📊 [ComprehensiveDashboard] 開始加載綜合市場數據...');
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchComprehensiveMarketData();
      setMarketData(data);
      console.log('✅ [ComprehensiveDashboard] 數據加載成功');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '未知錯誤';
      setError(errorMsg);
      console.error('❌ [ComprehensiveDashboard] 加載失敗:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !marketData) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-gray-400 font-light">正在加載綜合市場數據...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">市場洞察儀表板</h1>
          <p className="text-gray-400 text-sm">基於澳門政府 20 個數據源的實時商業決策平台</p>
        </div>
        <button
          onClick={loadComprehensiveData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-lg text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新數據
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <GlassCard className="p-4 border-l-2 border-red-500">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-red-300 font-semibold text-sm mb-1">加載錯誤</h3>
              <p className="text-red-200 text-xs">{error}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'overview' as const, label: '📊 市場概覽', icon: '📊' },
          { id: 'heatmap' as const, label: '🔥 熱度監控', icon: '🔥' },
          { id: 'locations' as const, label: '📍 選址評分', icon: '📍' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {marketData && (
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-4">
                  <div className="text-3xl font-bold text-emerald-300 mb-1">
                    {marketData.gdp?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400">GDP 數據週期</div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-3xl font-bold text-blue-300 mb-1">
                    {marketData.restaurants?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400">已登記餐廳</div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-3xl font-bold text-purple-300 mb-1">
                    {marketData.hotels?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400">已登記酒店</div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-3xl font-bold text-amber-300 mb-1">
                    {marketData.population?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400">人口統計分區</div>
                </GlassCard>
              </div>

              {/* Key Indicators Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">🏥 關鍵服務設施</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">藥房數量</span>
                      <span className="text-white font-semibold">{marketData.pharmacies?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">公交站點</span>
                      <span className="text-white font-semibold">{marketData.busRoutes?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">WiFi 熱點</span>
                      <span className="text-white font-semibold">{marketData.wifiLocations?.length || 0}</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">🎯 商業機遇</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">新增公司 (季度)</span>
                      <span className="text-white font-semibold">{marketData.newCompanies?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">房產交易</span>
                      <span className="text-white font-semibold">{marketData.propertyTransactions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">會展活動</span>
                      <span className="text-white font-semibold">{marketData.miceEvents?.length || 0}</span>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Real-time Indicators */}
              <GlassCard className="p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  實時指標
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-white/5 rounded">
                    <div className="text-gray-400">當前天氣</div>
                    <div className="text-lg font-semibold text-white mt-1">
                      {marketData.weather?.temperature || '---'}°C
                    </div>
                    <div className="text-xs text-gray-500">{marketData.weather?.condition || ''}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <div className="text-gray-400">可用停車位</div>
                    <div className="text-lg font-semibold text-white mt-1">
                      {(marketData.parking?.reduce((sum, p) => sum + p.carSpaces, 0) || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">跨場所合計</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <div className="text-gray-400">口岸狀態</div>
                    <div className="text-lg font-semibold text-white mt-1">
                      {marketData.borderCrossings?.length || 0} 口岸
                    </div>
                    <div className="text-xs text-gray-500">實時監控中</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Heatmap Tab */}
          {activeTab === 'heatmap' && (
            <MarketHeatmapMonitor data={marketData} />
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <LocationScoringTool data={marketData} />
          )}
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center">
        最後更新: {marketData?.lastUpdated?.toLocaleString('zh-TW') || '加載中...'}
      </div>
    </div>
  );
};

export default ComprehensiveMarketDashboard;
