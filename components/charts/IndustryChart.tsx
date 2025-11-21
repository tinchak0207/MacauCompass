import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IndustryData } from '../../types';

// Translated data for display
const data: IndustryData[] = [
  { name: '批發及零售業', newCompanies: 120, growth: 5.2 },
  { name: '建築業', newCompanies: 45, growth: -1.2 },
  { name: '商業服務', newCompanies: 98, growth: 12.5 },
  { name: '運輸及倉儲', newCompanies: 32, growth: 2.1 },
  { name: '資訊科技', newCompanies: 55, growth: 18.4 },
  { name: '酒店及餐飲', newCompanies: 88, growth: 8.7 },
  { name: '不動產業務', newCompanies: 40, growth: 1.5 },
];

const IndustryChart: React.FC = () => {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
          <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
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
            formatter={(value: number) => [value, '新註冊數量']}
          />
          <Bar dataKey="newCompanies" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.growth > 10 ? '#10b981' : '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IndustryChart;