import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchMarketData } from '../../services/dataService'
import { TrademarkData } from '../../types'
import './index.scss'

const TrademarkPage: React.FC = () => {
  const [trademarks, setTrademarks] = useState<TrademarkData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const marketData = await fetchMarketData()
      setTrademarks(marketData.trademarkHistory || [])
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
          <Text className="page-title">商標申請趨勢</Text>
        </View>

        {loading ? (
          <View className="placeholder-section">
            <Text>正在加載數據...</Text>
          </View>
        ) : (
          <View className="content-section">
            <View className="chart-placeholder">
              <Text className="placeholder-text">商標申請數量趨勢圖</Text>
            </View>

            <View className="data-list">
              {trademarks.map((item, index) => (
                <View key={index} className="data-item">
                  <Text className="item-month">{item.month}</Text>
                  <View className="item-bar-container">
                    <View
                      className="item-bar"
                      style={{
                        width: `${(item.applications / 500) * 100}%`
                      }}
                    ></View>
                  </View>
                  <Text className="item-value">{item.applications}</Text>
                </View>
              ))}
            </View>

            <View className="info-box">
              <Text className="info-title">數據來源</Text>
              <Text className="info-text">澳門數據開放平台 - 商標申請統計</Text>
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

export default TrademarkPage
