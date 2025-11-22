import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Users, Home, X, Info } from 'lucide-react';
import { SimulationParams, SimulationResult, DistrictData } from '../types';

interface TacticalAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  icon: React.ReactNode;
  actionable?: boolean;
}

interface TacticalAIProps {
  params: SimulationParams;
  result: SimulationResult | null;
  selectedDistrict: DistrictData | null;
}

const TacticalAI: React.FC<TacticalAIProps> = ({ params, result, selectedDistrict }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    if (!result || !selectedDistrict) return [];

    const newAlerts: TacticalAlert[] = [];

    // Rent burden analysis
    const rentToRevenueRatio = (result.monthlyRent / 50000) * 100; // Assuming 50K monthly revenue
    if (rentToRevenueRatio > 25) {
      newAlerts.push({
        id: 'rent-burden-high',
        type: 'danger',
        title: '租金負擔過高',
        message: `租金佔預期收入 ${rentToRevenueRatio.toFixed(1)}%，已超過餐飲業安全線 (25%)。建議重新談判或縮小面積。`,
        icon: <DollarSign className="w-4 h-4" />,
        actionable: true
      });
    } else if (rentToRevenueRatio > 20) {
      newAlerts.push({
        id: 'rent-burden-medium',
        type: 'warning',
        title: '租金負擔偏高',
        message: `租金佔預期收入 ${rentToRevenueRatio.toFixed(1)}%，接近警戒線。建議密切監控營業額。`,
        icon: <DollarSign className="w-4 h-4" />
      });
    }

    // Staff efficiency analysis
    const revenuePerStaff = 50000 / params.employeeCount; // Assuming 50K monthly revenue
    if (revenuePerStaff < 15000) {
      newAlerts.push({
        id: 'staff-efficiency',
        type: 'warning',
        title: '人力成本偏高',
        message: `員工月薪資總額 MOP ${result.monthlyPayroll.toLocaleString()}，人均產出 MOP ${revenuePerStaff.toLocaleString()}。考慮優化排班或提升效率。`,
        icon: <Users className="w-4 h-4" />,
        actionable: true
      });
    }

    // Investment analysis
    const investmentMonths = params.renovationBudget / result.burnRate;
    if (investmentMonths < 6) {
      newAlerts.push({
        id: 'investment-risk',
        type: 'danger',
        title: '回本期過長',
        message: `預計回本期 ${investmentMonths.toFixed(1)} 個月，資金壓力較大。建議增加初期營運資金或降低固定成本。`,
        icon: <TrendingUp className="w-4 h-4" />,
        actionable: true
      });
    }

    // Location-specific insights
    if (selectedDistrict.id === 'nape' && params.shopSize < 500) {
      newAlerts.push({
        id: 'location-mismatch',
        type: 'info',
        title: '地段與規模不匹配',
        message: '皇朝區適合較大型店鋪，考慮增加面積或選擇其他地區以發揮地段優勢。',
        icon: <Home className="w-4 h-4" />,
        actionable: true
      });
    }

    if (selectedDistrict.id === 'coloane' && params.employeeCount > 5) {
      newAlerts.push({
        id: 'staffing-oversized',
        type: 'warning',
        title: '員工配置過多',
        message: '路環地區人流相對較少，建議精簡人手或採用彈性排班。',
        icon: <Users className="w-4 h-4" />,
        actionable: true
      });
    }

    // Renovation budget analysis
    const renovationPerSqFt = params.renovationBudget / params.shopSize;
    if (renovationPerSqFt > 500) {
      newAlerts.push({
        id: 'renovation-overbudget',
        type: 'warning',
        title: '裝修預算偏高',
        message: `每平方呎裝修成本 MOP ${renovationPerSqFt.toFixed(0)}，高於行業平均水平。考慮分階段裝修或尋求性價比更高的方案。`,
        icon: <DollarSign className="w-4 h-4" />
      });
    }

    // Positive indicators
    if (result.monthlyFixedCosts < 30000) {
      newAlerts.push({
        id: 'burn-rate-good',
        type: 'success',
        title: '營運成本健康',
        message: `月固定成本 MOP ${result.monthlyFixedCosts.toLocaleString()}，在可控範圍內，有較好的盈利空間。`,
        icon: <TrendingUp className="w-4 h-4" />
      });
    }

    return newAlerts;
  }, [params, result, selectedDistrict]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertStyles = (type: TacticalAlert['type']) => {
    switch (type) {
      case 'danger':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-4">
        <div className="flex items-center space-x-3 text-gray-400">
          <Info className="w-5 h-5" />
          <span className="text-sm">AI 分析中，未發現明顯風險</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 mb-2">
        <AlertTriangle className="text-amber-400 w-5 h-5" />
        <h3 className="text-lg font-semibold text-white">戰術 AI 分析</h3>
        <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded-full">
          {activeAlerts.length} 項建議
        </span>
      </div>

      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`relative p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 ${getAlertStyles(alert.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {alert.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-white">{alert.title}</h4>
                {alert.actionable && (
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10">可執行</span>
                )}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{alert.message}</p>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      ))}

      {/* AI Summary */}
      <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-indigo-400 text-sm">
          <Info className="w-4 h-4" />
          <span>AI 綜合建議</span>
        </div>
        <p className="text-xs text-gray-300 mt-2 leading-relaxed">
          基於當前參數，建議優先關注 {activeAlerts.filter(a => a.type === 'danger' || a.type === 'warning').length} 項風險因素。
          {selectedDistrict?.nameZh && ` 在${selectedDistrict.nameZh}創業具有`}
          {selectedDistrict?.id === 'nape' && '高人流優勢，但需控制租金成本。'}
          {selectedDistrict?.id === 'norte' && '成本效益高，適合初創企業。'}
          {selectedDistrict?.id === 'taipa' && '平衡性良好，目標客群明確。'}
          {selectedDistrict?.id === 'coloane' && '特色定位機會，錯位競爭潛力大。'}
          {selectedDistrict?.id === 'centro' && '黃金地段，需高營業額支撐。'}
        </p>
      </div>
    </div>
  );
};

export default TacticalAI;
