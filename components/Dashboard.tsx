import React, { useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import SocialPulseTicker from './SocialPulseTicker';
import IndustryChart from './charts/IndustryChart';
import TrademarkChart from './charts/TrademarkChart';
import { TrendingUp, Users, Building2, ArrowUpRight, ArrowDownRight, RefreshCcw, Loader2, Activity } from 'lucide-react';
import { fetchMarketData } from '../services/dataService';
import { MarketStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketData();
      setStats(data);
      setError(false);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Helpers for rendering
  const formatNumber = (num: number) => num.toLocaleString();
  const renderGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'} text-sm font-medium px-2 py-1 rounded`}>
        {isPositive ? '+' : ''}{growth.toFixed(1)}% 
        {isPositive ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
      </span>
    );
  };

  if (loading && !stats) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-gray-400 font-light">正在連接澳門數據開放平台 (Open Data)...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Social Pulse Ticker */}
      <SocialPulseTicker />

      <div className="flex flex-col md:flex-row justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white mb-1">商業戰情室 v2.0</h2>
          <p className="text-gray-400 text-sm">
            最新統計數據週期： {stats?.latestMonthStr || '當前週期'}
          </p>
        </div>
        <div className="text-right hidden md:block">
          <button 
            onClick={loadData}
            className="flex items-center gap-2 text-emerald-400 text-xs font-mono hover:text-emerald-300 transition-colors opacity-70 hover:opacity-100"
          >
            {loading ? <Loader2 className="animate-spin w-3 h-3" /> : <RefreshCcw className="w-3 h-3" />}
            數據來源: DSEC / DSEDT
          </button>
        </div>
      </div>

      {/* KPI Cards - More Compact */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Real Data: New Companies */}
        <GlassCard className="p-4" enableTilt hoverEffect>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Building2 className="text-emerald-400 w-5 h-5" />
            </div>
            {stats && renderGrowth(stats.newCompaniesGrowth)}
          </div>
          <div className="text-3xl font-bold text-white mb-1 font-serif">
            {stats ? formatNumber(stats.newCompaniesCurrent) : '---'}
          </div>
          <div className="text-xs text-gray-400">新成立公司 (月同比)</div>
        </GlassCard>

        {/* Static Data: Earnings */}
        <GlassCard className="p-4" enableTilt hoverEffect>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Users className="text-indigo-400 w-5 h-5" />
            </div>
            <span className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded">
              +2.1% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1 font-serif">18.5K</div>
          <div className="text-xs text-gray-400">月收入中位數 (MOP)</div>
        </GlassCard>

        {/* Static Data: Interest Rate */}
        <GlassCard className="p-4" enableTilt hoverEffect>
          <div className="flex justify-between items-start mb-3">
             <div className="p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="text-amber-400 w-5 h-5" />
            </div>
             <span className="flex items-center text-red-400 text-xs font-medium bg-red-500/10 px-2 py-1 rounded">
              -0.8% <ArrowDownRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1 font-serif">3.25%</div>
          <div className="text-xs text-gray-400">中小企最優惠利率</div>
        </GlassCard>

        {/* New: Business Activity Index */}
        <GlassCard className="p-4" enableTilt hoverEffect>
          <div className="flex justify-between items-start mb-3">
             <div className="p-2 bg-purple-500/10 rounded-lg">
              <Activity className="text-purple-400 w-5 h-5" />
            </div>
             <span className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded">
              +5.2% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1 font-serif">78.3</div>
          <div className="text-xs text-gray-400">商業活動指數</div>
        </GlassCard>
      </div>

      {/* Charts Row - Taller for more data density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
        <GlassCard className="p-5 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/5 pb-2">行業分佈熱力圖</h3>
            <div className="flex-1 min-h-0">
              <IndustryChart data={stats?.industryData} />
            </div>
          </GlassCard>

        <GlassCard className="p-5 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/5 pb-2">商標註冊申請趨勢</h3>
          <div className="flex-1 min-h-0">
            <TrademarkChart data={stats?.trademarkHistory} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;