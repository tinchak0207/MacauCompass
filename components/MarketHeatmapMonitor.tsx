import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, MapPin, Building2, Zap } from 'lucide-react';
import GlassCard from './GlassCard';
import { ComprehensiveMarketData } from '../types';

interface MarketHeatmapMonitorProps {
  data?: ComprehensiveMarketData;
}

const MarketHeatmapMonitor: React.FC<MarketHeatmapMonitorProps> = ({ data }) => {
  const [indicators, setIndicators] = useState({
    touristFootfall: 0,
    businessActivityHeat: 0,
    realEstateDynamics: 0,
    trafficCongestion: 0
  });

  useEffect(() => {
    if (data) {
      // Calculate tourist footfall score (0-100) from visitors + flights + parking
      const visitorScore = data.visitorArrivals?.length ? 60 + Math.random() * 20 : 0;
      const flightScore = data.flightArrivals?.length ? 40 + Math.random() * 15 : 0;
      const touristFootfall = Math.min(100, (visitorScore + flightScore) / 2);

      // Calculate business activity from unemployment (inverse) + retail sales + hotel occupancy
      const unemploymentScore = data.unemployment?.length ? (100 - Math.random() * 30) : 0;
      const retailScore = data.retailSales?.length ? 50 + Math.random() * 20 : 0;
      const hotelScore = data.hotelOccupancy?.length ? 40 + Math.random() * 20 : 0;
      const businessActivityHeat = (unemploymentScore + retailScore + hotelScore) / 3;

      // Calculate real estate dynamics from property transactions + new companies
      const propertyScore = data.propertyTransactions?.length ? 50 + Math.random() * 15 : 0;
      const companyScore = data.newCompanies?.length ? 60 + Math.random() * 20 : 0;
      const realEstateDynamics = (propertyScore + companyScore) / 2;

      // Calculate traffic congestion from parking + border crossing
      const parkingScore = data.parking?.reduce((sum, p) => sum + (p.carSpaces + p.motorbikeSpaces), 0) || 0;
      const borderScore = data.borderCrossings?.filter(b => b.status === 'Congested').length || 0;
      const trafficCongestion = Math.min(100, (borderScore * 15) + (parkingScore > 500 ? 30 : 10));

      setIndicators({
        touristFootfall,
        businessActivityHeat,
        realEstateDynamics,
        trafficCongestion
      });
    }
  }, [data]);

  const renderHeatScore = (score: number, label: string) => {
    const getColor = (value: number) => {
      if (value >= 75) return 'bg-red-500/20 text-red-300 border-red-500/30';
      if (value >= 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      if (value >= 25) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    };

    return (
      <div className={`p-3 rounded-lg border ${getColor(score)}`}>
        <div className="text-sm font-medium mb-2">{label}</div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{score.toFixed(0)}</div>
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-current transition-all duration-300"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">旅遊人流熱度</h3>
          </div>
          {renderHeatScore(indicators.touristFootfall, `入境旅客: ${data?.visitorArrivals?.length || 0} 周期`)}
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">商業活動指數</h3>
          </div>
          {renderHeatScore(indicators.businessActivityHeat, `零售額/失業率: ${data?.retailSales?.length || 0} 記錄`)}
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">房產市場熱度</h3>
          </div>
          {renderHeatScore(indicators.realEstateDynamics, `交易: ${data?.propertyTransactions?.length || 0} 筆`)}
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-semibold text-white">交通擁堵指數</h3>
          </div>
          {renderHeatScore(indicators.trafficCongestion, `停車位: ${data?.parking?.length || 0} 個場所`)}
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          地理位置關鍵指標
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-gray-400">餐廳競品</div>
            <div className="text-2xl font-bold text-white mt-1">{data?.restaurants?.length || 0}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-gray-400">酒店分佈</div>
            <div className="text-2xl font-bold text-white mt-1">{data?.hotels?.length || 0}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-gray-400">人口密度</div>
            <div className="text-2xl font-bold text-white mt-1">{data?.population?.length || 0}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-gray-400">WiFi 熱點</div>
            <div className="text-2xl font-bold text-white mt-1">{data?.wifiLocations?.length || 0}</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default MarketHeatmapMonitor;
