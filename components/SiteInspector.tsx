import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { analyzeShopfrontImage } from '../services/geminiService';
import { SiteAuditResult } from '../types';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';

const SiteInspector: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SiteAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setSelectedImage(base64String);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError(null);

    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      const auditResult = await analyzeShopfrontImage(base64Data, mimeType);
      setResult(auditResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT':
        return 'text-emerald-400';
      case 'GOOD':
        return 'text-blue-400';
      case 'FAIR':
        return 'text-amber-400';
      case 'POOR':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getVisibilityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'HIGH':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-serif font-bold text-white mb-2">
          現場審計官 (Site Inspector)
        </h1>
        <p className="text-gray-400 text-sm">
          上傳店鋪照片，讓 AI 為你提供客觀的現場評估報告。無利益衝突，只有事實。
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <GlassCard className="p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold text-white">上傳店鋪照片</h2>

            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-3">
                <div className="flex justify-center">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Selected storefront"
                      className="max-h-64 max-w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Camera className="w-12 h-12 text-emerald-400/50" />
                      <p className="text-gray-300 text-sm font-medium">
                        點擊或拖拽上傳照片
                      </p>
                      <p className="text-gray-500 text-xs">
                        支持 JPG, PNG 格式
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!selectedImage || analyzing}
                className={`
                  flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                  ${analyzing || !selectedImage
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'}
                `}
              >
                {analyzing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    開始分析
                  </>
                )}
              </button>
              {selectedImage && (
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setResult(null);
                    setError(null);
                  }}
                  className="px-6 py-3 rounded-xl font-medium bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
                >
                  清除
                </button>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Results Section */}
        <div className="space-y-4">
          {error && (
            <GlassCard className="p-6 border-red-500/30 bg-red-500/5">
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-400 mb-1">分析失敗</h3>
                  <p className="text-sm text-gray-300">{error}</p>
                </div>
              </div>
            </GlassCard>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Overall Rating */}
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif font-bold text-white">
                      綜合評級
                    </h3>
                    <span
                      className={`text-2xl font-serif font-bold ${getRatingColor(
                        result.overallRating
                      )}`}
                    >
                      {result.overallRating}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Visibility Score */}
              <GlassCard className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">可見性評分</h4>
                    <span
                      className={`text-3xl font-serif font-bold ${getVisibilityColor(
                        result.visibilityScore
                      )}`}
                    >
                      {result.visibilityScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        result.visibilityScore >= 80
                          ? 'bg-emerald-500'
                          : result.visibilityScore >= 60
                            ? 'bg-blue-500'
                            : result.visibilityScore >= 40
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${result.visibilityScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {result.visibilityAnalysis}
                  </p>
                </div>
              </GlassCard>

              {/* Industry Fit */}
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-white">行業適配度</h4>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">✓ 適合行業</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.industryFit.suitable.map((industry, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm border border-emerald-500/30"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                  {result.industryFit.unsuitable.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">✗ 不適合行業</p>
                      <div className="flex flex-wrap gap-2">
                        {result.industryFit.unsuitable.map((industry, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm border border-red-500/30"
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-300 mt-3 p-3 bg-white/5 rounded-lg">
                    {result.industryFit.recommendation}
                  </p>
                </div>
              </GlassCard>

              {/* Condition Assessment */}
              <GlassCard
                className={`p-6 ${
                  result.conditionAssessment.severity === 'HIGH'
                    ? 'border-red-500/30 bg-red-500/5'
                    : result.conditionAssessment.severity === 'MEDIUM'
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-emerald-500/30 bg-emerald-500/5'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">狀況評估</h4>
                    <span
                      className={`px-3 py-1 rounded-full border text-sm font-medium ${getSeverityColor(
                        result.conditionAssessment.severity
                      )}`}
                    >
                      {result.conditionAssessment.severity === 'LOW'
                        ? '低風險'
                        : result.conditionAssessment.severity === 'MEDIUM'
                          ? '中等風險'
                          : '高風險'}
                    </span>
                  </div>

                  {result.conditionAssessment.issues.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">發現的問題：</p>
                      <ul className="space-y-1">
                        {result.conditionAssessment.issues.map(
                          (issue, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-300 flex gap-2"
                            >
                              <span className="text-red-400">•</span>
                              {issue}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {result.conditionAssessment.riskFactors.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">風險因素：</p>
                      <ul className="space-y-1">
                        {result.conditionAssessment.riskFactors.map(
                          (factor, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-amber-300 flex gap-2"
                            >
                              <span>⚠</span>
                              {factor}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Recommendations */}
              <GlassCard className="p-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-white">建議事項</h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-300 flex gap-3"
                      >
                        <span className="text-emerald-400 font-bold">
                          {idx + 1}.
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteInspector;
