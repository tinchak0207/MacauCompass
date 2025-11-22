import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp } from 'lucide-react';

interface NewsItem {
  id: string;
  text: string;
  type: 'policy' | 'economic' | 'market';
  timestamp: Date;
}

const NewsTicker: React.FC = () => {
  const [newsItems] = useState<NewsItem[]>([
    {
      id: '1',
      text: '經科局推出「中小企無息貸款」計劃，最高額度100萬澳門元',
      type: 'policy',
      timestamp: new Date()
    },
    {
      id: '2',
      text: '2024年首三季新成立公司數量同比增長12.5%',
      type: 'market',
      timestamp: new Date()
    },
    {
      id: '3',
      text: '政府放寬旅遊區商業牌照申請，營運時間可延長至凌晨2時',
      type: 'policy',
      timestamp: new Date()
    },
    {
      id: '4',
      text: '澳門GDP連續三季度正增長，經濟復甦趨勢明顯',
      type: 'economic',
      timestamp: new Date()
    },
    {
      id: '5',
      text: '橫琴粵澳深度合作區提供稅收優惠，吸引澳門企業北上發展',
      type: 'policy',
      timestamp: new Date()
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [newsItems.length]);

  const getTypeColor = (type: NewsItem['type']) => {
    switch (type) {
      case 'policy':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'economic':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'market':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeLabel = (type: NewsItem['type']) => {
    switch (type) {
      case 'policy':
        return '政策';
      case 'economic':
        return '經濟';
      case 'market':
        return '市場';
      default:
        return '資訊';
    }
  };

  const currentNews = newsItems[currentIndex];

  return (
    <GlassCard className="p-4 overflow-hidden">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Newspaper className="text-indigo-400 w-5 h-5" />
          <span className="text-sm font-medium text-gray-300">政策快訊</span>
        </div>
        
        <div className="h-4 w-px bg-gray-600"></div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center space-x-3 transition-transform duration-500 ease-in-out">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getTypeColor(currentNews.type)}`}>
              {getTypeLabel(currentNews.type)}
            </span>
            <span className="text-sm text-gray-300 truncate">
              {currentNews.text}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          {newsItems.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                idx === currentIndex ? 'bg-indigo-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default NewsTicker;