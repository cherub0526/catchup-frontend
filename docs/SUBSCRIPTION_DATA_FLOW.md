# 訂閱方案數據流說明

## 數據結構定義

### API 返回數據結構

#### GET /v1/subscriptions/usage
```json
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

#### GET /v1/subscriptions
```json
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

### 數據字段說明

| 字段 | 類型 | 說明 | 範例 |
|------|------|------|------|
| `plan.channels` | Number | 方案限制的頻道數量上限 | 3 |
| `plan.media` | Number | 方案限制的影音數量上限 | 50 |
| `usage.channels` | Number | 目前訂閱的頻道數量 | 1 |
| `usage.media` | Number | 目前的影片數量 | 10 |

## Store 數據管理

### plans.js Store

```javascript
// 狀態
const currentPlan = ref(null);  // 當前訂閱方案對象
const usage = ref({
  channels: 0,  // 目前訂閱的頻道數量
  media: 0      // 目前的影片數量
});

// 計算屬性
const currentLimits = computed(() => {
  if (!currentPlan.value) {
    return SUBSCRIPTION_PLANS.FREE.limits;
  }
  return currentPlan.value.limits;  // { channels: 3, media: 50 }
});

const isChannelLimitReached = computed(() => {
  return usage.value.channels >= currentLimits.value.channels;
});

const isMediaLimitReached = computed(() => {
  return usage.value.media >= currentLimits.value.media;
});
```

### 數據更新流程

#### 1. 初始化流程
```
用戶登入
  ↓
auth.initAuth()
  ↓
plansStore.initialize()
  ↓
fetchCurrentSubscription()
  ↓
API: GET /v1/subscriptions
  ↓
更新 currentPlan 和 usage
```

#### 2. 使用情況更新流程
```
觸發操作（切換頁面、新增訂閱等）
  ↓
plansStore.updateUsage()
  ↓
API: GET /v1/subscriptions/usage
  ↓
更新 usage 和 currentPlan.limits
```

## 組件中的使用

### Dashboard.vue

```javascript
// 引入
import { usePlansStore } from '@/stores/plans';
const plansStore = usePlansStore();

// 獲取數據
const { 
  currentPlan,      // 當前方案對象
  usage,            // 使用情況 { channels: 1, media: 10 }
  currentLimits,    // 當前限制 { channels: 3, media: 50 }
  isChannelLimitReached,  // 是否達到頻道上限
  isMediaLimitReached     // 是否達到影音上限
} = storeToRefs(plansStore);

// 顯示使用情況
<span>{{ usage.channels }} / {{ currentLimits.channels }}</span>
<span>{{ usage.media }} / {{ currentLimits.media }}</span>
```

### Subscription.vue

```javascript
// 顯示當前使用情況
<div class="usage-item">
  <span class="usage-label">訂閱頻道</span>
  <span class="usage-value">
    {{ usage.channels }} / {{ currentLimits.channels }}
  </span>
  <div class="usage-bar">
    <div 
      class="usage-progress" 
      :style="{ width: `${(usage.channels / currentLimits.channels) * 100}%` }"
      :class="{ 'limit-reached': isChannelLimitReached }"
    ></div>
  </div>
</div>

<div class="usage-item">
  <span class="usage-label">影音數量</span>
  <span class="usage-value">
    {{ usage.media }} / {{ currentLimits.media }}
  </span>
  <div class="usage-bar">
    <div 
      class="usage-progress" 
      :style="{ width: `${(usage.media / currentLimits.media) * 100}%` }"
      :class="{ 'limit-reached': isMediaLimitReached }"
    ></div>
  </div>
</div>

// 顯示方案限制
<div class="plan-card">
  <span>最多 {{ plan.limits.channels }} 個訂閱頻道</span>
  <span>最多 {{ plan.limits.media }} 隻影音</span>
</div>
```

## 觸發 updateUsage 的時機

系統會在以下時機自動調用 `updateUsage()` 更新使用情況：

1. **頁面載入**
   - Dashboard.vue `onMounted`
   - Subscription.vue `onMounted`
   - Player.vue `onMounted`

2. **用戶操作**
   - 切換影音來源（`switchSource`）
   - 新增訂閱頻道（`addSubscription`）
   - 刪除訂閱頻道（`deleteSubscription`）
   - 更新訂閱方案（`updateSubscription`）
   - 取消訂閱方案（`cancelSubscription`）

## 數據一致性保證

### 前端驗證
在執行操作前檢查限制：

```javascript
const addSubscription = async (subscription) => {
  // 檢查是否達到頻道上限
  if (!plansStore.canAddChannel()) {
    throw new Error("已達到訂閱頻道上限，請升級方案");
  }
  
  // 執行新增操作
  await api.rss.addSubscription(subscription);
  
  // 更新使用情況
  await plansStore.updateUsage();
};
```

### 後端驗證
後端 API 也應該驗證限制，確保數據一致性。

## 錯誤處理

### API 失敗時的降級處理

```javascript
try {
  await plansStore.updateUsage();
} catch (err) {
  console.error("更新使用情況失敗:", err);
  // 使用本地緩存的數據繼續運行
  // 不阻塞用戶操作
}
```

### 默認方案
當無法獲取訂閱信息時，使用免費方案：

```javascript
if (!currentPlan.value) {
  currentPlan.value = SUBSCRIPTION_PLANS.FREE;
}
```

## 測試場景

### 場景 1: 達到頻道上限
```
當前方案: Basic (3 個頻道)
使用情況: channels = 3
操作: 嘗試新增第 4 個頻道
預期: 顯示錯誤訊息，提示升級方案
```

### 場景 2: 達到影音上限
```
當前方案: Basic (50 隻影音)
使用情況: media = 50
操作: 嘗試新增影音
預期: 顯示錯誤訊息，提示升級方案
```

### 場景 3: 升級方案
```
操作前: Free (1 頻道, 3 影音)
操作: 升級到 Basic
操作後: Basic (3 頻道, 50 影音)
預期: 限制更新，可以新增更多頻道和影音
```

## 注意事項

1. **數據同步**: 每次重要操作後都應調用 `updateUsage()` 確保數據同步
2. **錯誤處理**: API 失敗時應該有合理的降級策略
3. **用戶體驗**: 在檢查限制時提供清晰的錯誤提示
4. **性能優化**: 避免過度頻繁地調用 API
5. **緩存策略**: 考慮實現合理的緩存機制減少 API 調用

