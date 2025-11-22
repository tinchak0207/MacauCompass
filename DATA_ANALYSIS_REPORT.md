# 澳門羅盤 (Macau Compass) - 數據分析與來源報告

> 生成時間: 2024-11-22  
> 目的: 診斷調試數據問題 + 識別所有 Placeholder 數據

---

## 📊 調試數據分析

### TrademarkChart 組件問題診斷

**觀察到的現象:**
```
第一次渲染: 8 個數據點 → ✅ 使用真實數據
第二次渲染: 2 個數據點 → ⚠️ 使用默認數據 (可能數據獲取失敗)
```

**根本原因:**
1. **邏輯判斷缺陷**: 原代碼使用引用比較 `displayData === defaultData` 來判斷是否使用默認數據，但當傳入的數據只有 2 個點時，雖然 `data.length > 0` 為 true，實際上這可能是 API 解析失敗導致的
2. **閾值問題**: 2 個數據點不足以構成有意義的趨勢分析，應該設置最小數據點閾值

**修復方案:**
- ✅ 改進判斷邏輯: 數據點數量 >= 3 才視為有效數據
- ✅ 改進 `defaultData`: 從 2 個空數據點改為 8 個有意義的樣本數據
- ✅ 增強日誌: 記錄具體的失敗原因和傳入數據詳情

**修改的文件:**
- `components/charts/TrademarkChart.tsx` (第 9-40 行)

---

## 🔍 前端數據來源清單

### ✅ 使用真實數據的組件

| 數據項 | 來源 | API Endpoint | 狀態 |
|--------|------|--------------|------|
| **新成立公司數** | 統計暨普查局 (DSEC) | `https://dsec.apigateway.data.gov.mo/public/KeyIndicator/NewlyIncorporatedCompanies` | ✅ REALTIME |
| **商標註冊申請** | 經濟及科技發展局 (DSEDT) | `https://api.data.gov.mo/document/download/8ff5d0ef...` | ✅ REALTIME |

### ❌ 使用 Placeholder 數據的組件

| 數據項 | 當前硬編碼值 | 文件位置 | 需要的真實數據源 |
|--------|--------------|----------|------------------|
| **月收入中位數** | `18.5K MOP` | `Dashboard.tsx:113` | DSEC "工資及薪金統計" 或 "就業調查" |
| **中小企最優惠利率** | `3.25%` | `Dashboard.tsx:127` | 澳門金融管理局 (AMCM) "銀行利率" |
| **商業活動指數** | `78.3` | `Dashboard.tsx:141` | DSEC "經濟活動指數" 或 "PMI" |
| **行業分佈數據** | Mock 7個行業 | `dataService.ts:27-35` | DSEC "按行業統計的企業及機構" |

---

## 🌐 data.gov.mo 真實數據源建議

### 1. 月收入中位數 (Median Income)

**推薦數據集:**
- **名稱**: 就業調查 / 工資及薪金統計
- **提供單位**: 統計暨普查局 (DSEC)
- **更新頻率**: 季度 / 年度
- **API 搜尋關鍵字**: `工資`, `薪金`, `收入`, `就業`

**可能的 API Endpoint:**
```
https://dsec.apigateway.data.gov.mo/public/KeyIndicator/MedianIncome
或
https://dsec.apigateway.data.gov.mo/public/EmploymentSurvey/Wages
```

**實施建議:**
1. 在 data.gov.mo 搜尋 "工資及薪金統計"
2. 查找 JSON 格式的 API（類似 NewlyIncorporatedCompanies）
3. 需要 APPCODE 授權（可能使用相同的 `09d43a591fba407fb862412970667de4`）

---

### 2. 中小企最優惠利率 (SME Prime Rate)

**推薦數據集:**
- **名稱**: 銀行利率 / 物業按揭貸款
- **提供單位**: 澳門金融管理局 (AMCM)
- **更新頻率**: 月度
- **已知相關數據**: sources.md 第 70-113 行提到 "物業按揭貸款" 數據集

**可能的 API Endpoint:**
```
https://api.data.gov.mo/document/download/c9702d30-d796-4666-8645-4614cb25994f?...
```

**實施建議:**
1. 從 sources.md 已有的物業貸款數據集中提取相關利率字段
2. 或查找 AMCM 專門的 "銀行利率" 數據集
3. 格式可能是 CSV 或 XLSX，需解析處理

---

### 3. 商業活動指數 (Business Activity Index)

**推薦數據集:**
- **名稱**: 經濟活動指數 / PMI (Purchasing Managers' Index)
- **提供單位**: 統計暨普查局 (DSEC)
- **更新頻率**: 月度
- **API 搜尋關鍵字**: `經濟活動`, `PMI`, `指數`

**可能的 API Endpoint:**
```
https://dsec.apigateway.data.gov.mo/public/KeyIndicator/EconomicActivityIndex
或
https://dsec.apigateway.data.gov.mo/public/KeyIndicator/PMI
```

**實施建議:**
1. 檢查 DSEC API Gateway 是否提供經濟指標類別
2. PMI 指數通常為 0-100 的範圍，當前 mock 值 78.3 在合理範圍內
3. 可能需要計算多個指標的綜合值

---

### 4. 行業分佈數據 (Industry Distribution)

**推薦數據集:**
- **名稱**: 按行業統計的企業及機構
- **提供單位**: 統計暨普查局 (DSEC)
- **更新頻率**: 季度 / 年度
- **API 搜尋關鍵字**: `行業`, `企業`, `機構`, `統計`

**當前 Mock 數據:**
```typescript
[
  { name: '批發及零售業', newCompanies: 120, growth: 5.2 },
  { name: '建築業', newCompanies: 45, growth: -1.2 },
  { name: '商業服務', newCompanies: 98, growth: 12.5 },
  { name: '運輸及倉儲', newCompanies: 32, growth: 2.1 },
  { name: '資訊科技', newCompanies: 55, growth: 18.4 },
  { name: '酒店及餐飲', newCompanies: 88, growth: 8.7 },
  { name: '不動產業務', newCompanies: 40, growth: 1.5 },
]
```

**實施建議:**
1. 需要組合多個 API 調用:
   - 新成立公司按行業分類 (可能需要過濾 NewlyIncorporatedCompanies API)
   - 行業增長率計算 (需要歷史對比數據)
2. 行業分類應遵循澳門統計暨普查局的標準分類
3. 可能需要自行計算同比增長率

**可能的 API Endpoint:**
```
https://dsec.apigateway.data.gov.mo/public/KeyIndicator/CompaniesByIndustry
或需要從現有 NewlyIncorporatedCompanies API 中篩選
```

---

## 🛠️ 已實施的改進

### 1. TrademarkChart 修復
- ✅ 改進數據驗證邏輯 (最少 3 個數據點)
- ✅ 更新 defaultData 為 8 個月的樣本數據
- ✅ 增強調試日誌

### 2. 數據質量追蹤系統
- ✅ 新增 `DataQualityFlag` 類型定義
- ✅ 在 `MarketStats` 中添加 `dataQuality` 字段
- ✅ 在 `dataService.ts` 中自動追蹤每個數據源的狀態
- ✅ 控制台輸出詳細的數據質量報告

### 3. UI 視覺標記
- ✅ 在 Dashboard 的 Placeholder 數據卡片添加 📊 圖標
- ✅ Hover 時顯示 "使用模擬數據" 提示

### 4. 控制台日誌增強
```typescript
console.log('📊 [DataService] 數據質量報告:');
dataQuality.forEach(dq => {
  const statusIcon = dq.status === 'REALTIME' ? '✅' : 
                     dq.status === 'FALLBACK' ? '⚠️' : '❌';
  console.log(`  ${statusIcon} [${dq.status}] ${dq.label}: ${dq.description}`);
});
```

---

## 📋 下一步建議

### 優先級 1 (高): 完善現有數據源
1. ✅ **TrademarkChart 修復** (已完成)
2. 🔄 **優化 CSV 解析器**: 處理更多邊緣情況
3. 🔄 **添加錯誤重試機制**: API 調用失敗時自動重試

### 優先級 2 (中): 添加新的真實數據源
1. ⏳ **月收入中位數**: 從 DSEC 就業調查 API 獲取
2. ⏳ **中小企利率**: 從 AMCM 物業貸款數據中提取
3. ⏳ **商業活動指數**: 從 DSEC 經濟指標 API 獲取

### 優先級 3 (低): 行業數據深度整合
1. ⏳ **按行業分類的新公司數**: 需要 DSEC 提供細分 API
2. ⏳ **行業增長率計算**: 需要歷史數據對比
3. ⏳ **行業預測模型**: 基於多年數據的 AI 預測

---

## 🔗 有用的資源鏈接

- **澳門政府數據開放平台**: https://data.gov.mo
- **統計暨普查局 API 文檔**: https://dsec.apigateway.data.gov.mo
- **當前使用的 API Keys/Tokens**: 見 `dataService.ts` 第 3-5 行
- **Sources 文檔**: `/home/engine/project/sources.md`

---

## 📝 備註

- 所有 Placeholder 數據已在 Dashboard UI 中標記 📊 圖標
- 數據質量追蹤系統已在控制台日誌中自動輸出
- 建議定期檢查 data.gov.mo 是否有新的數據集上線
- APPCODE `09d43a591fba407fb862412970667de4` 可能適用於多個 DSEC API

---

*本報告由 AI 助手生成，基於代碼庫的實際分析結果*
