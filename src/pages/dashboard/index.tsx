import React, { useEffect, useState } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchMarketData } from '../../services/dataService'
import { MarketStats } from '../../types'
import './index.scss'

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchMarketData()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => num.toLocaleString()
  const goToPage = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  return (
    <ScrollView scrollY className="dashboard-container">
      <View className="dashboard-content">
        <View className="header-section">
          <Text className="header-title">商業戰情室</Text>
          <Text className="header-subtitle">澳門商業實時指標</Text>
        </View>

        {loading ? (
          <View className="loading-section">
            <Text>正在加載數據...</Text>
          </View>
        ) : (
          <>
            <View className="kpi-grid">
              <View className="kpi-card">
                <Text className="kpi-label">新成立公司</Text>
                <Text className="kpi-value">{stats ? formatNumber(stats.newCompaniesCurrent) : '---'}</Text>
                <Text className="kpi-period">當月數據</Text>
              </View>

              <View className="kpi-card">
                <Text className="kpi-label">環比增長</Text>
                <Text className="kpi-value" style={{ color: stats?.newCompaniesGrowth ?? 0 >= 0 ? '#10b981' : '#ef4444' }}>
                  {stats ? `${stats.newCompaniesGrowth.toFixed(1)}%` : '---'}
                </Text>
                <Text className="kpi-period">月同比</Text>
              </View>

              <View className="kpi-card">
                <Text className="kpi-label">商標申請</Text>
                <Text className="kpi-value">
                  {stats?.trademarkHistory?.[0]?.applications || '---'}
                </Text>
                <Text className="kpi-period">最新月份</Text>
              </View>

              <View className="kpi-card">
                <Text className="kpi-label">更新時間</Text>
                <Text className="kpi-value">{stats?.latestMonthStr || '---'}</Text>
                <Text className="kpi-period">數據週期</Text>
              </View>
            </View>

            <View className="menu-section">
              <View className="menu-title">功能導航</View>

              <Button className="menu-button" onClick={() => goToPage('/pages/industry/index')}>
                📊 行業分析
              </Button>

              <Button className="menu-button" onClick={() => goToPage('/pages/simulator/index')}>
                🎯 業務模擬器
              </Button>

              <Button className="menu-button" onClick={() => goToPage('/pages/trademarks/index')}>
                📈 商標趨勢
              </Button>

              <Button className="menu-button" onClick={() => goToPage('/pages/advisor/index')}>
                💡 AI策略顧問
              </Button>

              <Button className="menu-button" onClick={() => goToPage('/pages/inspector/index')}>
                🏪 店鋪審計
              </Button>
            </View>

            <Button className="refresh-button" onClick={loadData}>
              刷新數據
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  )
}

export default Dashboard
