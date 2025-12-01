import React from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const LandingPage: React.FC = () => {
  const handleEnter = () => {
    Taro.navigateTo({
      url: '/pages/dashboard/index'
    })
  }

  return (
    <ScrollView scrollY className="landing-container">
      <View className="hero-section">
        <View className="hero-content">
          <Text className="hero-title">澳門商業指南針</Text>
          <Text className="hero-subtitle">您的創業導航系統</Text>
          <Text className="hero-description">
            專業的商業分析、即時市場數據、AI智能建議
          </Text>
        </View>

        <View className="features">
          <View className="feature-card">
            <Text className="feature-icon">📊</Text>
            <Text className="feature-title">實時商業指標</Text>
            <Text className="feature-desc">澳門最新公司成立數據和商標申請趨勢</Text>
          </View>

          <View className="feature-card">
            <Text className="feature-icon">🏪</Text>
            <Text className="feature-title">店鋪視覺審計</Text>
            <Text className="feature-desc">AI驅動的現場檢查和可見性分析</Text>
          </View>

          <View className="feature-card">
            <Text className="feature-icon">💡</Text>
            <Text className="feature-title">AI策略顧問</Text>
            <Text className="feature-desc">澳門商業專家的即時政策和指導</Text>
          </View>

          <View className="feature-card">
            <Text className="feature-icon">🎯</Text>
            <Text className="feature-title">業務模擬器</Text>
            <Text className="feature-desc">成本分析和財務風險評估工具</Text>
          </View>
        </View>

        <Button className="enter-button" onClick={handleEnter}>
          進入控制台
        </Button>
      </View>
    </ScrollView>
  )
}

export default LandingPage
