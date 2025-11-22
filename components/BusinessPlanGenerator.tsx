import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { generateBusinessPlan } from '../services/geminiService';
import type { BusinessPlan, BusinessPlanParams } from '../types';
import {
  FileSignature,
  Loader2,
  Download,
  Copy,
  Check,
  Brain,
  DollarSign,
  MapPin,
  Award,
} from 'lucide-react';

const districtOptions = [
  '皇朝區 (NAPE)',
  '氹仔市中心',
  '中區 (新馬路)',
  '北區 (黑沙環)',
  '路氹金光大道',
];

const industryOptions = [
  '咖啡店',
  '餐酒館',
  '精品零售',
  '健身工作室',
  '文創教室',
  '寵物服務',
];

const formatCurrency = (value: number) =>
  `MOP ${value.toLocaleString('zh-Hant', { maximumFractionDigits: 0 })}`;

const BusinessPlanGenerator: React.FC = () => {
  const [params, setParams] = useState<BusinessPlanParams>({
    district: districtOptions[0],
    businessType: industryOptions[0],
    budget: 500000,
  });
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateBusinessPlan(params);
      setPlan(result);
    } catch (error) {
      console.error('Plan generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleDownload = () => {
    if (!plan) return;
    const blob = new Blob([plan.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.title || 'business-plan'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold text-white mb-2">
          一鍵商業計劃書
        </h2>
        <p className="text-gray-400">
          選擇地區、業態與預算，Gemini 即時生成可提交銀行或夥伴的計劃書
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <GlassCard className="p-6 space-y-6 lg:col-span-1">
          <div>
            <label className="text-sm text-gray-400 mb-3 block">營運地區</label>
            <div className="grid grid-cols-1 gap-2">
              {districtOptions.map((district) => (
                <button
                  key={district}
                  onClick={() => setParams((prev) => ({ ...prev, district }))}
                  className={`
                    px-4 py-3 rounded-xl border text-left transition-all
                    ${
                      params.district === district
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  {district}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-3 block">業務類型</label>
            <div className="grid grid-cols-2 gap-2">
              {industryOptions.map((industry) => (
                <button
                  key={industry}
                  onClick={() => setParams((prev) => ({ ...prev, businessType: industry }))}
                  className={`
                    px-4 py-3 rounded-xl border text-center text-sm transition-all
                    ${
                      params.businessType === industry
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-3 block">預算 (MOP)</label>
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">啟動預算</span>
                <span className="text-lg text-white font-semibold">
                  {params.budget.toLocaleString('zh-Hant')}
                </span>
              </div>
              <input
                type="range"
                min={150000}
                max={1200000}
                step={50000}
                value={params.budget}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, budget: Number(e.target.value) }))
                }
                className="w-full h-2 rounded-lg appearance-none bg-white/10"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>15萬</span>
                <span>120萬</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <FileSignature className="w-5 h-5" />
                生成計劃書
              </>
            )}
          </button>
        </GlassCard>

        {/* Preview */}
        <div className="lg:col-span-2">
          <GlassCard className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">
                  Draft Preview
                </p>
                <h3 className="text-xl font-semibold text-white">
                  {plan?.title || '預覽區'}
                </h3>
              </div>
              {plan && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-100 flex items-center gap-2 hover:bg-white/10"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" /> 已複製
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> 複製 Markdown
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-sm text-white flex items-center gap-2 hover:bg-indigo-500"
                  >
                    <Download className="w-4 h-4" /> 下載
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-8 min-h-[600px] overflow-y-auto">
              {plan ? (
                <PlanDocument plan={plan} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                  <Brain className="w-12 h-12 text-gray-300" />
                  <p>選擇參數後即可生成可直接提交的商業計劃書</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

const PlanDocument: React.FC<{ plan: BusinessPlan }> = ({ plan }) => {
  return (
    <div className="space-y-6 text-gray-800">
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-[0.3em] mb-2">
          MACAU COMPASS | BOARD EDITION
        </div>
        <h1 className="text-3xl font-serif font-semibold text-gray-900">
          {plan.title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Generated by Gemini + DSEDT playbook</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4" /> 執行摘要
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">{plan.summary}</p>
      </section>

      <section className="grid grid-cols-2 gap-4">
        {Object.entries(plan.swot).map(([key, values]) => (
          <div key={key} className="border border-gray-200 rounded-2xl p-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
              {key === 'strengths' && 'Strengths'}
              {key === 'weaknesses' && 'Weaknesses'}
              {key === 'opportunities' && 'Opportunities'}
              {key === 'threats' && 'Threats'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {(values as string[]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-2xl p-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> 財務預測
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>初始投資</span>
              <strong>{formatCurrency(plan.financialProjection.initialInvestment)}</strong>
            </div>
            <div className="flex justify-between">
              <span>預估月收入</span>
              <strong>{formatCurrency(plan.financialProjection.monthlyRevenue)}</strong>
            </div>
            <div className="flex justify-between">
              <span>預估月支出</span>
              <strong>{formatCurrency(plan.financialProjection.monthlyExpenses)}</strong>
            </div>
            <div className="flex justify-between">
              <span>預計回本（月）</span>
              <strong>{plan.financialProjection.breakEvenMonths} 個月</strong>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" /> 合規清單
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {plan.compliance.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-500">▢</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default BusinessPlanGenerator;
