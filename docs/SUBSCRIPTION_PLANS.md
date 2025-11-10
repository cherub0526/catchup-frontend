# 訂閱方案功能說明

## 概述

本系統新增了訂閱方案管理功能，提供三種不同等級的方案，滿足不同用戶的需求。

## 方案詳情

### 1. Free 方案（免費）
- **價格**: $0/月
- **頻道限制**: 最多 1 個訂閱頻道
- **影音限制**: 最多 3 隻影音
- **功能**:
  - 基本播放功能

### 2. Basic 方案
- **價格**: 
  - 月付: $5/月
  - 年付: $48/年（省 20%，相當於 $4/月）
- **頻道限制**: 最多 3 個訂閱頻道
- **影音限制**: 最多 50 隻影音
- **功能**:
  - 最多 3 個訂閱頻道
  - 最多 50 隻影音
  - 高畫質播放
  - 離線下載

### 3. Advance 方案（進階）
- **價格**: 
  - 月付: $10/月
  - 年付: $96/年（省 20%，相當於 $8/月）
- **頻道限制**: 最多 10 個訂閱頻道
- **影音限制**: 最多 100 隻影音
- **功能**:
  - 最多 10 個訂閱頻道
  - 最多 100 隻影音
  - 高畫質播放
  - 離線下載
  - 優先客服支援
  - 進階分析功能

## 計費週期

### 月付方案
- 按月收費
- 可隨時取消

### 年付方案
- 一次性支付一年費用
- 享受 20% 折扣（相當於 12 個月費用打 8 折）
- 年費計算公式: 月費 × 12 × 0.8

## 功能整合

### 1. 訂閱限制檢查
系統會在以下操作時自動檢查方案限制：
- 新增訂閱頻道時
- 添加影音時

當達到限制時：
- 顯示警告訊息
- 阻止超出限制的操作
- 引導用戶升級方案

### 2. 使用情況追蹤
系統會即時追蹤：
- 當前訂閱頻道數量
- 當前影音數量
- 與方案限制的對比
- 使用百分比

### 3. UI 組件

#### SubscriptionStatus 組件
- 顯示在 Dashboard 側邊欄
- 顯示當前方案徽章
- 顯示使用情況進度條
- 提供快速訪問「管理方案」連結

#### SubscriptionLimitWarning 組件
- 當接近或達到限制時顯示
- 可關閉的警告訊息
- 提供升級方案按鈕

## API 端點

### 獲取當前訂閱
```javascript
GET /v1/subscriptions

// 返回格式
{
  "data": {
    "planId": "basic",
    "billingCycle": "monthly",
    "plan": {
      "channels": 3,
      "media": 50
    },
    "usage": {
      "channels": 1,
      "media": 10
    }
  }
}
```

**說明：**
- `plan.channels`: 方案限制的頻道數量上限
- `plan.media`: 方案限制的影音數量上限
- `usage.channels`: 目前訂閱的頻道數量
- `usage.media`: 目前的影片數量

### 更新訂閱方案
```javascript
POST /v1/subscriptions
{
  "planId": "basic",
  "billingCycle": "monthly" | "yearly"
}
```

### 取消訂閱
```javascript
DELETE /v1/subscriptions
```

### 獲取使用情況
```javascript
GET /v1/subscriptions/usage

// 返回格式
{
  "plan": {
    "channels": 3,
    "media": 50
  },
  "usage": {
    "channels": 1,
    "media": 10
  }
}
```

**說明：**
- `plan`: 當前方案的限制
- `usage`: 目前的使用情況

### 獲取所有方案
```javascript
GET /v1/subscriptions/plans
```

### 創建支付會話（Stripe 集成）
```javascript
POST /v1/subscriptions/checkout
{
  "planId": "basic",
  "billingCycle": "monthly"
}
```

## Store 結構

### Plans Store (`src/stores/plans.js`)
管理訂閱方案的核心邏輯：
- 方案定義和配置
- 當前方案狀態
- 使用情況統計
- 限制檢查方法

### 主要方法
- `fetchCurrentSubscription()` - 獲取當前訂閱信息
- `updateSubscription(planId, cycle)` - 更新訂閱方案
- `cancelSubscription()` - 取消訂閱
- `updateUsage()` - 更新使用情況
- `canAddChannel()` - 檢查是否可以添加頻道
- `canAddVideo()` - 檢查是否可以添加影音

## 路由

### 訂閱方案頁面
- 路徑: `/subscription`
- 組件: `src/views/Subscription.vue`
- 需要認證

## 使用流程

### 1. 用戶登入後
- 系統自動初始化訂閱方案信息
- 加載當前方案和使用情況
- 顯示在 Dashboard

### 2. 查看方案
- 點擊 Header 的「訂閱方案」按鈕
- 或點擊側邊欄的「管理方案」連結
- 進入訂閱方案頁面

### 3. 選擇方案
- 選擇計費週期（月付/年付）
- 查看各方案對比
- 點擊「升級」或「降級」按鈕

### 4. 達到限制
- 系統自動檢測並顯示警告
- 無法執行超出限制的操作
- 引導用戶升級方案

## 技術實現

### 前端整合
1. **Pinia Store**: 狀態管理
2. **Vue Router**: 路由配置
3. **組件化**: 可重用的 UI 組件
4. **即時檢查**: 操作前的限制驗證

### 後端需求
後端需要實現以下 API：
- 訂閱管理
- 使用情況追蹤
- 支付集成（可選）
- 方案升降級邏輯

## 未來擴展

可以考慮的功能擴展：
1. 支付網關集成（Stripe, PayPal 等）
2. 發票和收據生成
3. 訂閱歷史記錄
4. 自動續訂提醒
5. 家庭/團隊方案
6. 優惠券和促銷碼
7. 推薦獎勵計劃

## 注意事項

1. **限制檢查**: 前端和後端都應該實施限制檢查
2. **優雅降級**: 取消訂閱時應妥善處理現有數據
3. **用戶體驗**: 清晰告知用戶限制和升級好處
4. **測試**: 充分測試各種邊界情況

## 相關文件

- `src/stores/plans.js` - 訂閱方案 Store
- `src/views/Subscription.vue` - 訂閱方案頁面
- `src/components/SubscriptionStatus.vue` - 狀態顯示組件
- `src/components/SubscriptionLimitWarning.vue` - 限制警告組件
- `src/api/index.js` - API 定義

