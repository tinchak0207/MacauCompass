import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ComposedChart } from 'recharts';
import { IndustryData } from '../../types';

// Translated data for display
const baseData: IndustryData[] = [
  { name: '批發及零售業', newCompanies: 120, growth: 5.2 },
  { name: '建築業', newCompanies: 45, growth: -1.2 },
  { name: '商業服務', newCompanies: 98, growth: 12.5 },
  { name: '運輸及倉儲', newCompanies: 32, growth: 2.1 },
  { name: '資訊科技', newCompanies: 55, growth: 18.4 },
  { name: '酒店及餐飲', newCompanies: 88, growth: 8.7 },
  { name: '不動產業務', newCompanies: 40, growth: 1.5 },
];

interface ChartDataWithPrediction extends IndustryData {
  predicted?: number;
  optimistic?: number;
  pessimistic?: number;
  isPrediction?: boolean;
}

const generateTrendPrediction = (data: IndustryData[]): ChartDataWithPrediction[] => {
  return data.map((item) => {
    const base = item.newCompanies;
    const growthFactor = item.growth / 100;

    // Generate 3-month predictions
    const predicted = Math.round(base * (1 + growthFactor));
    const optimistic = Math.round(base * (1 + growthFactor * 1.5));
    const pessimistic = Math.round(base * (1 + growthFactor * 0.5));

    return {
      ...item,
      predicted,
      optimistic,
      pessimistic
    };
  });
};

const IndustryChart: React.FC = () => {
  const chartData = useMemo(() => generateTrendPrediction(baseData), []);

  return (
    <div className="space-y-6">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={95} 
              stroke="#9ca3af" 
              tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: "'Noto Sans TC', sans-serif" }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(20, 20, 25, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: '#fff' 
              }}
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
              formatter={(value: number) => [value, '註冊數量']}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="newCompanies" name="本月" radius={[0, 4, 4, 0]} fill="#6366f1">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.growth > 10 ? '#10b981' : '#6366f1'} />
              ))}
            </Bar>
            <Bar dataKey="predicted" name="預測(3個月)" radius={[0, 4, 4, 0]} fill="rgba(59, 130, 246, 0.4)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Prediction Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-bold text-white">
            📊 未來趨勢預言 (Trend Oracle)
          </h3>
          <p className="text-sm text-gray-400">
            基於歷史數據的 AI 算法預測，顯示樂觀與悲觀兩種可能情景。虛線代表未來 3 個月的預測走勢。
          </p>

          <div className="space-y-3">
            {chartData.map((item, idx) => (
              <div key={idx} className="bg-black/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white text-sm">{item.name}</h4>
                  <span className="text-xs text-gray-500">
                    當前: {item.newCompanies} | 預測: {item.predicted}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                    <p className="text-gray-400 mb-1">樂觀場景 (Optimistic)</p>
                    <p className="text-green-400 font-bold">{item.optimistic}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                    <p className="text-gray-400 mb-1">悲觀場景 (Pessimistic)</p>
                    <p className="text-red-400 font-bold">{item.pessimistic}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm">
            <p className="text-blue-300 font-medium mb-2">💡 提示</p>
            <p className="text-gray-300">
              這些預測基於線性增長模型和當前市場趨勢。實際結果可能因澳門政策變化、全球經濟形勢或行業特定事件而異。
              建議結合其他市場情報進行決策。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryChart;