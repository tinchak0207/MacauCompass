# 澳門政府開放數據 API 集成指南

## 概述

本項目成功集成了澳門政府提供的 **20 個關鍵數據 API**，創建了一個完整的商業決策支持平台。

---

## 架構設計

### 服務層結構

```
services/
├── dataService.ts (原有：新公司、商標、收入、利率、通脹)
├── macroeconomicService.ts (新增：宏觀經濟數據 - DSEC APIs)
├── realtimeDataService.ts (新增：實時數據 - UUID APIs)
├── poiDataService.ts (新增：地點信息 - UUID APIs)
├── marketInsightService.ts (新增：市場洞察 - UUID APIs)
└── comprehensiveDataService.ts (新增：統一聚合層)
```

### 緩存策略

| 數據類型 | 緩存時長 | 原因 |
|---------|--------|------|
| 宏觀經濟 | 24小時 | 數據不變，只在月/季更新 |
| 實時數據 | 5-30分鐘 | 停車位、天氣等頻繁變化 |
| POI數據 | 7天 | 商業場所相對穩定 |
| 市場洞察 | 1小時 | 房產、新公司等週期性數據 |

---

## API 集成明細

### 第一組：宏觀經濟與消費力分析 (DSEC API Gateway)

#### 1. 本地生產總值 (GDP)
```
文件: services/macroeconomicService.ts
函數: fetchGDP()
URL: https://dsec.apigateway.data.gov.mo/public/KeyIndicator/GDP
方法: POST + APPCODE
參數: lang=TC, from_year=2019, to_year=2024
返回: GDPData[] { year, quarter, value (百萬MOP), changeRate }
應用: 判斷市場總體規模與增長潛力
```

#### 2. 零售業銷售額
```
文件: services/macroeconomicService.ts
函數: fetchRetailSales()
URL: https://dsec.apigateway.data.gov.mo/public/KeyIndicator/RetailSalesValue
方法: POST + APPCODE
參數: lang=TC, from_year=2020, to_year=2024
返回: RetailSalesData[] { period, category (行業), value }
應用: 按行業分析銷售趨勢，定位目標市場
```

#### 3. 入境旅客總數
```
文件: services/macroeconomicService.ts
函數: fetchVisitorArrivals()
URL: https://dsec.apigateway.data.gov.mo/public/KeyIndicator/VisitorArrivals
方法: POST + APPCODE
參數: lang=TC, granularity=monthly, from_date=202301
返回: VisitorArrivalsData[] { yearMonth, value, yoyChange }
應用: 判斷旅遊高低峰，預測消費潮汐
```

#### 4. 酒店入住率
```
文件: services/macroeconomicService.ts
函數: fetchHotelOccupancy()
URL: https://dsec.apigateway.data.gov.mo/public/KeyIndicator/HotelOccupancyRate
方法: POST + APPCODE
參數: lang=TC, from_year=2023
返回: HotelOccupancyData[] { yearMonth, rate (%), starRating }
應用: 反映商旅消費水平，指導服務業定價
```

#### 5. 失業率
```
文件: services/macroeconomicService.ts
函數: fetchUnemployment()
URL: https://dsec.apigateway.data.gov.mo/public/KeyIndicator/UnemploymentRate
方法: POST + APPCODE
參數: lang=TC
返回: UnemploymentData[] { period, rate (%), laborForce }
應用: 反向推導招工難度與薪資成本
```

#### 6. 外地僱員人數
```
文件: services/macroeconomicService.ts
函數: fetchNonResidentWorkers()
URL: https://dsec.apigateway.data.gov.mo/public/KeyIndicator/NonResidentWorkers
方法: POST + APPCODE
參數: lang=TC
返回: NonResidentWorkersData[] { industry, countryOfOrigin, count }
應用: 分析特定行業的人力資源結構
```

### 第二組：實時流量與城市動態 (UUID/File APIs - 無需認證)

#### 7. 停車場實時車位
```
文件: services/realtimeDataService.ts
函數: fetchParkingSpaces()
URL: https://api.data.gov.mo/document/download/ea50a770-cc35-47cc-a3ba-7f60092d4bc4
方法: GET (無認證)
參數: lang=TC, format=json
返回: ParkingSpaceData[] { name, carSpaces, motorbikeSpaces, updateTime }
應用: 實時人流熱度指標，用於位置評分
```

#### 8. 實時天氣報告
```
文件: services/realtimeDataService.ts
函數: fetchWeather()
URL: https://api.data.gov.mo/document/download/a56e346b-5314-4157-965c-360df113065a
方法: GET (無認證)
參數: lang=TC, format=json
返回: WeatherData { temperature, humidity, condition, updateTime }
應用: 分析天氣對零售/外賣需求的影響
```

#### 9. 口岸實時通關人流
```
文件: services/realtimeDataService.ts
函數: fetchBorderCrossing()
URL: https://api.data.gov.mo/document/download/5ea99479-9409-4721-a2c2-67c30454505b
方法: GET (無認證)
參數: format=json
返回: BorderCrossingData[] { gateName, status (Normal/Busy/Congested), updateTime }
應用: 識別旅遊高峰期，預測外地客到達
```

#### 10. 航班實時抵達
```
文件: services/realtimeDataService.ts
函數: fetchFlightArrivals()
URL: https://api.data.gov.mo/document/download/9441616d-9345-408e-8f63-d1a847204391
方法: GET (無認證)
參數: lang=TC, format=json
返回: FlightArrivalData[] { flightNo, origin, status, scheduledTime }
應用: 預判高端遊客到達波峰，調整運營節奏
```

### 第三組：商業選址與競品地圖 (UUID/File APIs - 無需認證)

#### 11. 已登記餐廳及飲食場所
```
文件: services/poiDataService.ts
函數: fetchRestaurants()
URL: https://api.data.gov.mo/document/download/2e811062-338c-4422-9127-e371f92d3698
方法: GET (無認證)
參數: lang=TC, format=json
返回: RestaurantPOI[] { name, address, latitude, longitude, type }
應用: 繪製競品分佈圖，評估選址競爭強度
```

#### 12. 已登記酒店及公寓
```
文件: services/poiDataService.ts
函數: fetchHotels()
URL: https://api.data.gov.mo/document/download/8735a77d-371b-46b4-b454-53744255b022
方法: GET (無認證)
參數: lang=TC, format=json
返回: HotelPOI[] { name, starClass, totalRooms, address, latitude, longitude }
應用: 判斷地區星級酒店聚集度，評估商旅消費力
```

#### 13. 旅行社資料
```
文件: services/poiDataService.ts
函數: fetchTravelAgencies()
URL: https://api.data.gov.mo/document/download/0e5d7495-f252-4852-a525-4106b82c6543
方法: GET (無認證)
參數: lang=TC, format=json
返回: TravelAgencyData[] { name, phone, address, latitude, longitude }
應用: B2B 合作拓展名單，識別潛在渠道
```

#### 14. 會展活動資料
```
文件: services/poiDataService.ts
函數: fetchMICEEvents()
URL: https://api.data.gov.mo/document/download/18282406-2073-4224-9741-22169176150a
方法: GET (無認證)
參數: lang=TC, format=json
返回: MICEEventData[] { eventName, venue, dateStart, dateEnd, organizer }
應用: 提前規劃活動服務，捕捉時間窗口機遇
```

#### 15. 巴士路線及站點
```
文件: services/poiDataService.ts
函數: fetchBusRoutes()
URL: https://api.data.gov.mo/document/download/8f015910-6124-4214-a52a-8f33102570d2
方法: GET (無認證)
參數: lang=TC, format=json
返回: BusRouteData[] { routeName, busStopCode, busStopName, latitude, longitude }
應用: 結合地理位置計算交通便利指數
```

#### 16. 藥房清單
```
文件: services/poiDataService.ts
函數: fetchPharmacies()
URL: https://api.data.gov.mo/document/download/2b41806f-b2a3-4555-9816-47c287239922
方法: GET (無認證)
參數: lang=TC, format=json
返回: PharmacyData[] { name, address, district, phone, latitude, longitude }
應用: 零售選址高價值參考點（藥房通常選址極佳）
```

### 第四組：深度市場洞察 (UUID/File APIs - 無需認證)

#### 17. 人口統計分區
```
文件: services/marketInsightService.ts
函數: fetchPopulationData()
URL: https://api.data.gov.mo/document/download/7a674216-9621-4516-8689-141496267012
方法: GET (無認證)
參數: lang=TC, format=json
返回: PopulationData[] { districtName, populationTotal, density }
應用: 消費能力評估，區域市場規模判斷
```

#### 18. 住宅樓宇交易統計
```
文件: services/marketInsightService.ts
函數: fetchPropertyTransactions()
URL: https://api.data.gov.mo/document/download/4b772131-3624-4722-8708-255114955264
方法: GET (無認證)
參數: lang=TC, format=json
返回: PropertyTransactionData[] { year, month, district, avgPriceSqm }
應用: 房價趨勢分析，租金成本代理變量
```

#### 19. 新成立公司統計
```
文件: services/marketInsightService.ts
函數: fetchNewCompanies()
URL: https://api.data.gov.mo/document/download/53a49466-2461-4820-96d1-410495007532
方法: GET (無認證)
參數: lang=TC, format=json
返回: NewCompanyData[] { yearQuarter, registeredCapital, industryCode }
應用: 創業生態活躍度指標，識別熱門賽道
```

#### 20. WiFi Go 服務地點
```
文件: services/marketInsightService.ts
函數: fetchWiFiLocations()
URL: https://api.data.gov.mo/document/download/1d253e98-2793-42ba-842e-472774541116
方法: GET (無認證)
參數: lang=TC, format=json
返回: WiFiLocationData[] { locationName, latitude, longitude }
應用: 遊客聚集點的隱性指標，識別熱點區域
```

---

## 前端集成

### 新增組件

```
components/
├── ComprehensiveMarketDashboard.tsx (主儀表板)
├── MarketHeatmapMonitor.tsx (市場熱度監控)
└── LocationScoringTool.tsx (選址評分工具)
```

### 新導航視圖

```typescript
export enum NavView {
  ...
  MARKET_INSIGHTS = 'MARKET_INSIGHTS'
}
```

在 `ConsoleLayout.tsx` 中已添加新導航項：
- **市場洞察儀表板** (BarChart3 圖標)

### 使用示例

```typescript
import { fetchComprehensiveMarketData } from '../services/comprehensiveDataService';

const data = await fetchComprehensiveMarketData();

// 數據結構
{
  gdp: GDPData[],
  retailSales: RetailSalesData[],
  visitorArrivals: VisitorArrivalsData[],
  hotelOccupancy: HotelOccupancyData[],
  unemployment: UnemploymentData[],
  nonResidentWorkers: NonResidentWorkersData[],
  
  parking: ParkingSpaceData[],
  weather: WeatherData,
  borderCrossings: BorderCrossingData[],
  flightArrivals: FlightArrivalData[],
  
  restaurants: RestaurantPOI[],
  hotels: HotelPOI[],
  travelAgencies: TravelAgencyData[],
  miceEvents: MICEEventData[],
  busRoutes: BusRouteData[],
  pharmacies: PharmacyData[],
  
  population: PopulationData[],
  propertyTransactions: PropertyTransactionData[],
  newCompanies: NewCompanyData[],
  wifiLocations: WiFiLocationData[],
  
  lastUpdated: Date
}
```

---

## 關鍵功能說明

### 1. 市場熱度監控

實時計算四個核心指標：
- **旅遊人流熱度**: 基於入境旅客 + 航班數據
- **商業活動指數**: 基於零售額 + 失業率
- **房產市場熱度**: 基於房產交易 + 新公司數
- **交通擁堵指數**: 基於停車位 + 口岸狀態

### 2. 選址評分工具

綜合評分模型（0-100）：
```
總分 = 交通便利性(20) + 人口統計(20) + 競爭強度(20) 
       + 經濟活躍度(20) + 遊客流量(20)
```

評級：
- **70+**: ✅ 優秀選址，強烈推薦
- **50-69**: ⚠️ 不錯選址，需策略運營
- **<50**: ❌ 風險較高，謹慎考慮

### 3. 數據緩存機制

```typescript
// 自動管理不同數據的緩存生命週期
const TTL_CONFIG = {
  MACRO: 86400,      // 24 hours
  REALTIME: 300,     // 5 minutes
  POI: 604800,       // 7 days
  INSIGHTS: 3600,    // 1 hour
  WEATHER: 1800,     // 30 minutes
  PARKING: 900       // 15 minutes
}
```

---

## 錯誤處理與降級

所有 API 調用都包含：
1. **Try-catch 包裝**: 捕獲網絡/解析錯誤
2. **結構驗證**: 檢查 API 響應格式
3. **降級策略**: 失敗時返回 `null`，上層使用 fallback 值
4. **詳細日誌**: 控制台輸出便於調試

---

## 性能優化

1. **並行加載**: 不同数据源同時发送请求
2. **智能缓存**: 減少重複 API 調用
3. **分頁處理**: POI 數據通常包含 1000+ 項，僅取前 N 項展示
4. **增量更新**: 支持針對性刷新特定數據源

---

## 測試建議

```bash
# 1. 檢查 API 連接
curl -X POST \
  https://dsec.apigateway.data.gov.mo/public/KeyIndicator/GDP \
  -H "Authorization: APPCODE 09d43a591fba407fb862412970667de4" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8"

# 2. 檢查 UUID APIs
curl "https://api.data.gov.mo/document/download/ea50a770-cc35-47cc-a3ba-7f60092d4bc4?lang=TC&format=json"
```

---

## 部署檢查清單

- [ ] 所有 API URLs 在生產環境可訪問
- [ ] APPCODE 安全存儲（已集成在源碼，建議將來移至環境變量）
- [ ] 緩存配置符合業務需求
- [ ] 錯誤日誌清晰可辨
- [ ] 移動端響應式設計完美
- [ ] 數據隱私合規性審查

---

## 未來擴展方向

1. **地圖可視化**: 集成高德/Google Maps，動態標記 POI
2. **預測模型**: 使用 AI 預測下季度餐飲業銷售額
3. **警告系統**: 當競品新增或人流異常波動時提醒
4. **匯出功能**: 生成定位分析報告 (PDF/Excel)
5. **實時監控**: WebSocket 推送停車位/天氣即時更新

---

**最後更新**: 2024年
**集成狀態**: ✅ 完成 (20/20 APIs)
**數據更新頻率**: 每 5-24 小時（取決於數據類型）
