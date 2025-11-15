# Paddle 付款整合說明

本文檔說明如何在應用程式中使用 Paddle 服務進行訂閱付款。

## 功能概述

當用戶在訂閱頁面選擇付費方案時，系統會自動打開 Paddle 的付款視窗，讓用戶完成付款流程。

## 設置步驟

### 1. 安裝依賴

首先需要安裝 Paddle SDK：

```bash
npm install @paddle/paddle-js
```

### 2. 配置環境變數

在您的 `.env` 文件中添加以下環境變數：

```env
# Paddle 配置
VITE_PADDLE_CLIENT_TOKEN=your_paddle_client_token_here
VITE_PADDLE_ENVIRONMENT=sandbox  # 或 'production'
```

**獲取 Paddle Client Token：**
1. 登入 [Paddle Dashboard](https://vendors.paddle.com/)
2. 前往 **Developer Tools** > **Authentication**
3. 複製 **Client-side token**（用於前端）
4. 將 token 設置到環境變數中

### 3. 後端 API 設置

後端需要實現以下 API 端點來創建 Paddle 結帳會話：

**POST /v1/subscriptions/checkout**

請求體：
```json
{
  "planId": "basic",
  "billingCycle": "monthly"
}
```

響應格式（選擇其一）：

**選項 1：返回 Paddle Price ID**
```json
{
  "priceId": "pri_xxxxx",
  "productId": "pro_xxxxx"
}
```

**選項 2：返回 Paddle Checkout URL**
```json
{
  "checkoutUrl": "https://checkout.paddle.com/..."
}
```

## 使用流程

### 用戶選擇訂閱方案

1. 用戶在訂閱頁面選擇一個付費方案（Basic 或 Advance）
2. 點擊「升級」或「訂閱」按鈕
3. 系統會調用後端 API 創建結帳會話
4. 根據後端返回的數據，打開 Paddle 付款視窗

### 付款完成後

1. Paddle 會觸發 `checkout.completed` 事件
2. 系統自動更新用戶的訂閱方案
3. 顯示付款成功訊息
4. 刷新訂閱信息和使用情況

## 代碼結構

### Paddle 工具類

位置：`src/utils/paddle.js`

主要功能：
- `initPaddle()` - 初始化 Paddle SDK
- `openSubscriptionCheckout()` - 打開訂閱付款視窗
- `setupPaddleListeners()` - 設置事件監聽器
- `destroyPaddle()` - 清理 Paddle 實例

### 訂閱頁面

位置：`src/views/Subscription.vue`

主要功能：
- 在組件掛載時初始化 Paddle
- 處理方案變更，打開付款視窗
- 監聽付款成功/失敗事件
- 處理付款完成後的訂閱更新

## 測試

### 沙盒環境測試

1. 在 Paddle Dashboard 中創建測試產品和價格
2. 設置 `VITE_PADDLE_ENVIRONMENT=sandbox`
3. 使用 Paddle 提供的測試卡號進行測試：
   - 卡號：4242 4242 4242 4242
   - 到期日：任何未來的日期
   - CVV：任何 3 位數字

### 生產環境

1. 在 Paddle Dashboard 中創建實際產品和價格
2. 設置 `VITE_PADDLE_ENVIRONMENT=production`
3. 使用真實的 Client Token

## 事件處理

### checkout.completed

當付款成功完成時觸發：

```javascript
{
  customData: {
    planId: 'basic',
    billingCycle: 'monthly'
  },
  // ... 其他 Paddle 返回的數據
}
```

### checkout.closed

當用戶關閉付款視窗時觸發（未完成付款）

### checkout.error

當付款過程中發生錯誤時觸發

## 注意事項

1. **安全性**：Client Token 僅用於前端，不應包含敏感信息
2. **Webhook**：建議在後端設置 Paddle Webhook 來處理付款確認
3. **錯誤處理**：確保妥善處理付款失敗的情況
4. **用戶體驗**：付款視窗關閉時應清除載入狀態

## 故障排除

### Paddle 無法初始化

- 檢查 `VITE_PADDLE_CLIENT_TOKEN` 是否正確設置
- 確認環境變數已正確載入（需要重啟開發伺服器）

### 付款視窗無法打開

- 檢查後端是否返回有效的 `priceId` 或 `checkoutUrl`
- 查看瀏覽器控制台是否有錯誤訊息
- 確認 Paddle SDK 已正確初始化

### 付款成功但訂閱未更新

- 檢查後端 Webhook 是否正確處理 Paddle 事件
- 確認 `checkout.completed` 事件是否正確觸發
- 查看後端日誌確認訂閱更新 API 是否被調用

## 相關文檔

- [Paddle 官方文檔](https://developer.paddle.com/)
- [Paddle JavaScript SDK](https://developer.paddle.com/paddlejs/overview)
- [Paddle Checkout 指南](https://developer.paddle.com/concepts/checkout/overview)

