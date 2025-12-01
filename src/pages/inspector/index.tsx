import React, { useState } from 'react'
import { View, Text, ScrollView, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { analyzeShopfrontImage } from '../../services/geminiService'
import { SiteAuditResult } from '../../types'
import './index.scss'

const InspectorPage: React.FC = () => {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<SiteAuditResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setImage(res.tempFilePaths[0])
        setResult(null)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAnalyze = async () => {
    if (!image) {
      Taro.showToast({
        title: '請先選擇圖片',
        duration: 2000,
        icon: 'error'
      })
      return
    }

    setLoading(true)
    try {
      const base64 = await getImageBase64(image)
      const auditResult = await analyzeShopfrontImage(base64)
      setResult(auditResult)
    } catch (error) {
      console.error(error)
      Taro.showToast({
        title: '分析失敗',
        duration: 2000,
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getImageBase64 = (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fs = (Taro as any).getFileSystemManager?.()
      if (fs) {
        fs.readFile({
          filePath,
          encoding: 'base64',
          success: (res: any) => resolve(res.data),
          fail: reject
        })
      } else {
        reject(new Error('FileSystemManager not available'))
      }
    })
  }

  return (
    <ScrollView scrollY className="page-container">
      <View className="page-content">
        <View className="page-header">
          <Text className="page-title">店鋪視覺審計</Text>
          <Text className="page-subtitle">使用AI分析店鋪狀況</Text>
        </View>

        <View className="image-section">
          {image ? (
            <Image src={image} className="preview-image" />
          ) : (
            <View className="image-placeholder">
              <Text className="placeholder-text">未選擇圖片</Text>
            </View>
          )}
        </View>

        <Button className="choose-button" onClick={handleChooseImage}>
          選擇圖片
        </Button>

        <Button
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={!image || loading}
        >
          {loading ? '正在分析...' : '開始分析'}
        </Button>

        {result && (
          <View className="result-section">
            <View className="result-card">
              <Text className="result-title">可見性得分</Text>
              <Text className="result-value">{result.visibilityScore}/100</Text>
              <Text className="result-detail">{result.visibilityAnalysis}</Text>
            </View>

            <View className="result-card">
              <Text className="result-title">整體評級</Text>
              <Text className={`result-rating ${result.overallRating.toLowerCase()}`}>
                {result.overallRating}
              </Text>
            </View>

            <View className="result-card">
              <Text className="result-title">適合行業</Text>
              {result.industryFit.suitable.map((industry, idx) => (
                <Text key={idx} className="result-item">
                  ✓ {industry}
                </Text>
              ))}
            </View>

            {result.conditionAssessment.issues.length > 0 && (
              <View className="result-card warning">
                <Text className="result-title">潛在問題</Text>
                {result.conditionAssessment.issues.map((issue, idx) => (
                  <Text key={idx} className="result-item">
                    ⚠ {issue}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <Button className="back-button" onClick={() => Taro.navigateBack()}>
          返回
        </Button>
      </View>
    </ScrollView>
  )
}

export default InspectorPage
