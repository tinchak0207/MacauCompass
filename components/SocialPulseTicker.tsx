import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Flame, AlertCircle } from 'lucide-react';

interface SocialTrendItem {
  id: string;
  keyword: string;
  change: number; // percentage change
  volume: string; // search volume indicator
  trend: 'rising' | 'falling' | 'stable';
  emoji: string;
  insight?: string; // AI-generated insight
}

const SocialPulseTicker: React.FC = () => {
  const [trendItems] = useState<SocialTrendItem[]>([
    {
      id: '1',
      keyword: '葡式咖啡',
      change: 120,
      volume: 'High',
      trend: 'rising',
      emoji: '☕',
      insight: '遊客尋找精品咖啡體驗，建議增加特色單品'
    },
    {
      id: '2',
      keyword: '豬扒包',
      change: -5,
      volume: 'Medium',
      trend: 'falling',
      emoji: '🥖',
      insight: '傳統小吃熱度下降，需創新包裝或推聯名款'
    },
    {
      id: '3',
      keyword: '牛雜',
      change: 85,
      volume: 'High',
      trend: 'rising',
      emoji: '🍲',
    },
    {
      id: '4',
      keyword: '葡撻',
      change: -15,
      volume: 'Medium',
      trend: 'falling',
      emoji: '🥧',
      insight: '市場飽和，建議開發口味創新或健康版本'
    },
    {
      id: '5',
      keyword: '隱世小店',
      change: 200,
      volume: 'Trending',
      trend: 'rising',
      emoji: '🔍',
      insight: '年輕遊客偏愛獨特體驗，小店概念受追捧'
    },
    {
      id: '6',
      keyword: '手作飲品',
      change: 150,
      volume: 'High',
      trend: 'rising',
      emoji: '🧋',
    },
    {
      id: '7',
      keyword: '打卡景點',
      change: 95,
      volume: 'High',
      trend: 'rising',
      emoji: '📸',
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayItems, setDisplayItems] = useState<SocialTrendItem[]>([]);

  useEffect(() => {
    // Show 3 items at a time in the ticker
    const updateDisplay = () => {
      const items = [];
      for (let i = 0; i < 3; i++) {
        const index = (currentIndex + i) % trendItems.length;
        items.push(trendItems[index]);
      }
      setDisplayItems(items);
    };

    updateDisplay();
  }, [currentIndex, trendItems]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [trendItems.length]);

  const getTrendColor = (trend: SocialTrendItem['trend']) => {
    switch (trend) {
      case 'rising':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'falling':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getVolumeColor = (volume: string) => {
    switch (volume.toLowerCase()) {
      case 'trending':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const renderTrendIcon = (item: SocialTrendItem) => {
    if (item.trend === 'rising') {
      return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    } else if (item.trend === 'falling') {
      return <TrendingDown className="w-3 h-3 text-red-400" />;
    }
    return <div className="w-3 h-3" />;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-4 overflow-hidden">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Flame className="text-orange-400 w-5 h-5" />
          <span className="text-sm font-medium text-gray-300">社交脈搏</span>
        </div>
        
        <div className="h-4 w-px bg-gray-600"></div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center space-x-6 transition-transform duration-500 ease-in-out">
            {displayItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center space-x-3 flex-shrink-0">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white">{item.keyword}</span>
                  <div className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded border ${getTrendColor(item.trend)}`}>
                    {renderTrendIcon(item)}
                    <span>{item.change > 0 ? '+' : ''}{item.change}%</span>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded border ${getVolumeColor(item.volume)}`}>
                    {item.volume}
                  </div>
                </div>
                {item.insight && (
                  <div className="flex items-center space-x-1 text-xs text-amber-400">
                    <AlertCircle className="w-3 h-3" />
                    <span className="hidden md:inline">{item.insight}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          {trendItems.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                idx >= currentIndex && idx < currentIndex + 3 ? 'bg-orange-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* AI Insight Banner */}
      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center space-x-2 text-xs text-amber-400">
          <Flame className="w-3 h-3" />
          <span>💡 趨勢洞察：遊客正在尋找"隱世小店"和"手作體驗"，建議考慮小而精的商業模式</span>
        </div>
      </div>
    </div>
  );
};

export default SocialPulseTicker;
