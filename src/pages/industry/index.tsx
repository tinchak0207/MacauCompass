import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchMarketData } from '../../services/dataService'
import './index.scss'

const IndustryPage: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const marketData = await fetchMarketData()
      setData(marketData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView scrollY className="page-container">
      <View className="page-content">
        <View className="page-header">
          <Text className="page-title">行業深度分析</Text>
        </View>

        {loading ? (
          <View className="placeholder-section">
            <Text>正在加載數據...</Text>
          </View>
        ) : (
          <View className="content-section">
            <View className="info-card">
              <Text className="card-title">澳門商業市場分析</Text>
              <Text className="card-text">
                本月新成立公司: {data?.newCompaniesCurrent || 0}
              </Text>
              <Text className="card-text">
                環比增長: {data?.newCompaniesGrowth?.toFixed(1) || 0}%
              </Text>
            </View>

            <Button className="back-button" onClick={() => Taro.navigateBack()}>
              返回
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default IndustryPage
