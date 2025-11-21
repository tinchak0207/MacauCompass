import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrademarkData } from '../../types';

interface TrademarkChartProps {
  data?: TrademarkData[];
}

const defaultData: TrademarkData[] = [
  { month: 'Jan', applications: 0 },
  { month: 'Feb', applications: 0 },
];

const TrademarkChart: React.FC<TrademarkChartProps> = ({ data = defaultData }) => {
  const displayData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={displayData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af" 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            interval="preserveStartEnd"
          />
          <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <Tooltip
             contentStyle={{ 
              backgroundColor: 'rgba(20, 20, 25, 0.9)', 
              borderColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              color: '#fff' 
            }}
            formatter={(value: number) => [value, '申請件數']}
          />
          <Area 
            type="monotone" 
            dataKey="applications" 
            name="申請量"
            stroke="#f59e0b" 
            fillOpacity={1} 
            fill="url(#colorApps)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrademarkChart;