import React, { useState } from 'react'
import { View, Text, ScrollView, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const SimulatorPage: React.FC = () => {
  const [shopSize, setShopSize] = useState('1000')
  const [employees, setEmployees] = useState('5')
  const [budget, setBudget] = useState('50000')

  const handleCalculate = () => {
    const size = parseFloat(shopSize) || 1000
    const emps = parseInt(employees) || 1
    const bud = parseFloat(budget) || 0

    const monthlyRent = (size / 100) * 150
    const monthlyPayroll = emps * 15000
    const monthlyFixed = monthlyRent + monthlyPayroll + 5000

    Taro.showToast({
      title: `月度成本: ${(monthlyFixed / 1000).toFixed(1)}k`,
      duration: 2000
    })
  }

  return (
    <ScrollView scrollY className="page-container">
      <View className="page-content">
        <View className="page-header">
          <Text className="page-title">業務模擬器</Text>
        </View>

        <View className="form-section">
          <View className="form-group">
            <Text className="label">店鋪面積 (平方呎)</Text>
            <Input
              className="input-field"
              type="number"
              placeholder="1000"
              value={shopSize}
              onInput={(e) => setShopSize(e.detail.value)}
            />
          </View>

          <View className="form-group">
            <Text className="label">員工數量</Text>
            <Input
              className="input-field"
              type="number"
              placeholder="5"
              value={employees}
              onInput={(e) => setEmployees(e.detail.value)}
            />
          </View>

          <View className="form-group">
            <Text className="label">裝修預算 (澳門元)</Text>
            <Input
              className="input-field"
              type="number"
              placeholder="50000"
              value={budget}
              onInput={(e) => setBudget(e.detail.value)}
            />
          </View>

          <Button className="calculate-button" onClick={handleCalculate}>
            計算成本
          </Button>
        </View>

        <View className="info-box">
          <Text className="info-title">成本估算</Text>
          <Text className="info-text">
            根據澳門數據開放平台提供的租金和工資數據進行計算
          </Text>
        </View>

        <Button className="back-button" onClick={() => Taro.navigateBack()}>
          返回
        </Button>
      </View>
    </ScrollView>
  )
}

export default SimulatorPage
