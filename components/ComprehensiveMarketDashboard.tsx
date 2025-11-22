import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCcw, TrendingUp, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import MarketHeatmapMonitor from './MarketHeatmapMonitor';
import LocationScoringTool from './LocationScoringTool';
import MapVisualization from './MapVisualization';
import AdvancedLocationScoring from './AdvancedLocationScoring';
import { ComprehensiveMarketData } from '../types';
import { fetchComprehensiveMarketData } from '../services/comprehensiveDataService';
import { initializeRealtimeData } from '../services/realtimeWebSocketService';

const ComprehensiveMarketDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<ComprehensiveMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'locations' | 'map' | 'advanced' | 'realtime'>('overview');

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
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        {[
          { id: 'overview' as const, label: '📊 市場概覽' },
          { id: 'heatmap' as const, label: '🔥 熱度監控' },
          { id: 'map' as const, label: '🗺️ 地圖' },
          { id: 'locations' as const, label: '📍 選址評分' },
          { id: 'advanced' as const, label: '🤖 高級評分' },
          { id: 'realtime' as const, label: '⚡ 實時數據' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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

          {/* Map Tab */}
          {activeTab === 'map' && (
            <MapVisualization data={marketData} mapType="markers" />
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <LocationScoringTool data={marketData} />
          )}

          {/* Advanced Scoring Tab */}
          {activeTab === 'advanced' && (
            <AdvancedLocationScoring data={marketData} businessType="restaurant" />
          )}

          {/* Realtime Tab */}
          {activeTab === 'realtime' && (
            <div className="space-y-4">
              <GlassCard className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">⚡ 實時數據推送系統</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-semibold text-emerald-300">WebSocket 已連接</span>
                    </div>
                    <p className="text-xs text-emerald-200">
                      實時接收停車位、天氣、口岸人流等動態數據更新
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-500/10 border border-blue-400/20 rounded">
                      <div className="text-xs text-blue-400 mb-1">📍 停車位更新</div>
                      <div className="text-2xl font-bold text-blue-300">{marketData?.parking?.length || 0}</div>
                      <div className="text-xs text-gray-500">30秒更新一次</div>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-400/20 rounded">
                      <div className="text-xs text-purple-400 mb-1">🌤️ 天氣數據</div>
                      <div className="text-2xl font-bold text-purple-300">{marketData?.weather?.temperature || '---'}°C</div>
                      <div className="text-xs text-gray-500">10分鐘更新一次</div>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-400/20 rounded">
                      <div className="text-xs text-amber-400 mb-1">🚗 口岸狀態</div>
                      <div className="text-2xl font-bold text-amber-300">{marketData?.borderCrossings?.length || 0}</div>
                      <div className="text-xs text-gray-500">5分鐘更新一次</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded text-xs text-gray-400">
                    <div className="font-semibold text-gray-300 mb-2">🔧 連接詳情</div>
                    <div>服務器: ws://localhost:8080/realtime</div>
                    <div>狀態: 自動連接 + 斷線重連</div>
                    <div>最大重試: 5次 (間隔指數退避)</div>
                  </div>
                </div>
              </GlassCard>
            </div>
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
