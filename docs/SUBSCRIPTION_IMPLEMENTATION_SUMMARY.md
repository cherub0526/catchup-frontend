# 訂閱方案實現總結

## 數據結構說明

### API 數據結構

所有訂閱相關的 API 使用統一的數據結構：

```json
{
  "plan": {
    "channels": 3,    // 方案限制的頻道數量上限
    "media": 50       // 方案限制的影音數量上限
  },
  "usage": {
    "channels": 1,    // 目前訂閱的頻道數量
    "media": 10       // 目前的影片數量
  }
}
```

### 前端數據結構

#### Store 狀態 (plans.js)

```javascript
// 當前方案對象
const currentPlan = ref({
  id: 'basic',
  name: 'Basic',
  price: { monthly: 5, yearly: 48 },
  limits: { channels: 3, media: 50 },  // 來自 API 的 plan 數據
  features: [...]
});

// 使用情況（來自 API）
const usage = ref({
  channels: 1,   // 來自 API 的 usage.channels
  media: 10      // 來自 API 的 usage.media
});

// 計算屬性：當前限制
const currentLimits = computed(() => {
  return currentPlan.value.limits;  // { channels: 3, media: 50 }
});
```

## 關鍵實現點

### 1. fetchCurrentSubscription - 獲取訂閱信息

```javascript
const fetchCurrentSubscription = async () => {
  const response = await api.subscription.getCurrentSubscription();
  
  if (response.data) {
    // 設置基本方案
    const planId = response.data.planId || "free";
    currentPlan.value = SUBSCRIPTION_PLANS[planId.toUpperCase()];
    
    // 使用 API 返回的 plan 限制（優先級最高）
    if (response.data.plan) {
      currentPlan.value = {
        ...currentPlan.value,
        limits: response.data.plan  // plan.channels, plan.media
      };
    }
    
    // 使用 API 返回的使用情況
    if (response.data.usage) {
      usage.value = response.data.usage;  // usage.channels, usage.media
    }
  }
};
```

### 2. updateUsage - 更新使用情況

```javascript
const updateUsage = async () => {
  const response = await api.subscription.getUsage();
  
  if (response) {
    // 更新使用情況
    if (response.usage) {
      usage.value = response.usage;  // usage.channels, usage.media
    }
    
    // 更新當前方案的限制
    if (response.plan && currentPlan.value) {
      currentPlan.value.limits = response.plan;  // plan.channels, plan.media
    }
  }
};
```

## 組件使用示例

### Dashboard.vue - 用戶資料區 Popup

```vue
<template>
  <div class="subscription-popup">
    <!-- 訂閱頻道 -->
    <div class="popup-usage-item">
      <div class="popup-stats">
        <span class="popup-current">{{ usage.channels }}</span>
        <span class="popup-separator">/</span>
        <span class="popup-limit">{{ currentLimits.channels }}</span>
      </div>
      <div class="popup-bar">
        <div 
          class="popup-fill"
          :style="{ width: `${(usage.channels / currentLimits.channels) * 100}%` }"
        ></div>
      </div>
    </div>
    
    <!-- 影音數量 -->
    <div class="popup-usage-item">
      <div class="popup-stats">
        <span class="popup-current">{{ usage.media }}</span>
        <span class="popup-separator">/</span>
        <span class="popup-limit">{{ currentLimits.media }}</span>
      </div>
      <div class="popup-bar">
        <div 
          class="popup-fill"
          :style="{ width: `${(usage.media / currentLimits.media) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlansStore } from '@/stores/plans';
import { storeToRefs } from 'pinia';

const plansStore = usePlansStore();
const { usage, currentLimits } = storeToRefs(plansStore);
</script>
```

### Subscription.vue - 訂閱方案頁面

```vue
<template>
  <!-- 當前使用情況 -->
  <div class="current-plan-info">
    <div class="usage-item">
      <span class="usage-label">訂閱頻道</span>
      <span class="usage-value">{{ usage.channels }} / {{ currentLimits.channels }}</span>
      <div class="usage-bar">
        <div 
          class="usage-progress" 
          :style="{ width: `${(usage.channels / currentLimits.channels) * 100}%` }"
        ></div>
      </div>
    </div>
    
    <div class="usage-item">
      <span class="usage-label">影音數量</span>
      <span class="usage-value">{{ usage.media }} / {{ currentLimits.media }}</span>
      <div class="usage-bar">
        <div 
          class="usage-progress" 
          :style="{ width: `${(usage.media / currentLimits.media) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
  
  <!-- 方案列表 -->
  <div class="plan-card" v-for="plan in allPlans" :key="plan.id">
    <div class="plan-limits">
      <span>最多 {{ plan.limits.channels }} 個訂閱頻道</span>
      <span>最多 {{ plan.limits.media }} 隻影音</span>
    </div>
  </div>
</template>
```

### SubscriptionLimitWarning.vue - 限制警告組件

```vue
<template>
  <div v-if="shouldShowWarning" class="limit-warning">
    <div class="warning-text">
      <h4>{{ warningTitle }}</h4>
      <p>{{ warningMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { usePlansStore } from '@/stores/plans';
import { storeToRefs } from 'pinia';

const plansStore = usePlansStore();
const { usage, currentLimits, isChannelLimitReached, isMediaLimitReached } = storeToRefs(plansStore);

const warningMessage = computed(() => {
  const messages = [];
  
  if (isChannelLimitReached.value) {
    messages.push(`頻道訂閱數：${usage.value.channels}/${currentLimits.value.channels}`);
  }
  
  if (isMediaLimitReached.value) {
    messages.push(`影音數量：${usage.value.media}/${currentLimits.value.media}`);
  }
  
  return messages.join(' | ') + '。升級方案以獲得更多容量。';
});
</script>
```

## 數據更新時機

系統會在以下時機自動調用 `updateUsage()` 更新使用情況：

### 頁面載入時
1. ✅ Dashboard.vue - `onMounted`
2. ✅ Subscription.vue - `onMounted`
3. ✅ Player.vue - `onMounted`

### 用戶操作後
4. ✅ 切換影音來源 - `switchSource()`
5. ✅ 新增訂閱頻道 - `addSubscription()`
6. ✅ 刪除訂閱頻道 - `deleteSubscription()`
7. ✅ 更新訂閱方案 - `updateSubscription()`
8. ✅ 取消訂閱方案 - `cancelSubscription()`

## 限制檢查機制

### 前端檢查

```javascript
// subscriptions.js
const addSubscription = async (subscription) => {
  const plansStore = usePlansStore();
  
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

### 計算屬性

```javascript
// plans.js
const isChannelLimitReached = computed(() => {
  return usage.value.channels >= currentLimits.value.channels;
});

const isMediaLimitReached = computed(() => {
  return usage.value.media >= currentLimits.value.media;
});

const canAddChannel = () => {
  return !isChannelLimitReached.value;
};

const canAddMedia = () => {
  return !isMediaLimitReached.value;
};
```

## 方案定義

### SUBSCRIPTION_PLANS 常量

```javascript
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    limits: { channels: 1, media: 3 },
    features: [...]
  },
  BASIC: {
    id: "basic",
    name: "Basic",
    price: { monthly: 5, yearly: 48 },
    limits: { channels: 3, media: 50 },
    features: [...]
  },
  ADVANCE: {
    id: "advance",
    name: "Advance",
    price: { monthly: 10, yearly: 96 },
    limits: { channels: 10, media: 100 },
    features: [...]
  }
};
```

**注意**: 
- `SUBSCRIPTION_PLANS` 中的 `limits` 是預設值
- 實際運行時，`currentPlan.value.limits` 會被 API 返回的 `plan` 數據覆蓋
- 這確保了服務端是唯一的真實數據源

## 數據流向圖

```
API 響應
    ↓
┌─────────────────────────────────┐
│  GET /v1/subscriptions/usage    │
├─────────────────────────────────┤
│  {                              │
│    "plan": {                    │
│      "channels": 3,  ─────────┐ │
│      "media": 50     ─────────┤ │
│    },                         │ │
│    "usage": {                 │ │
│      "channels": 1,  ───────┐ │ │
│      "media": 10     ───────┤ │ │
│    }                        │ │ │
│  }                          │ │ │
└─────────────────────────────┼─┼─┼─┘
                              │ │ │
                              ↓ ↓ ↓
                    ┌─────────────────────┐
                    │  plans.js Store     │
                    ├─────────────────────┤
                    │  currentPlan.limits │←─── plan.channels, plan.media
                    │    { channels: 3,   │
                    │      media: 50 }    │
                    │                     │
                    │  usage              │←─── usage.channels, usage.media
                    │    { channels: 1,   │
                    │      media: 10 }    │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  組件顯示            │
                    ├─────────────────────┤
                    │  {{ usage.channels }}│  顯示: 1
                    │  /                   │
                    │  {{ currentLimits.   │  顯示: 3
                    │     channels }}      │
                    └─────────────────────┘
```

## 完整功能清單

### ✅ 已實現功能

1. **數據獲取**
   - ✅ 從 API 獲取當前訂閱信息
   - ✅ 從 API 獲取使用情況
   - ✅ 自動更新 plan 限制
   - ✅ 自動更新 usage 數據

2. **UI 顯示**
   - ✅ Dashboard popup 顯示使用情況
   - ✅ Subscription 頁面顯示使用情況
   - ✅ 進度條顯示使用百分比
   - ✅ 限制警告組件

3. **限制檢查**
   - ✅ 前端限制檢查
   - ✅ 達到限制時顯示警告
   - ✅ 阻止超出限制的操作

4. **自動更新**
   - ✅ 頁面載入時更新
   - ✅ 操作完成後更新
   - ✅ 切換來源時更新

### 📝 後端需求

後端需要實現以下 API，返回正確的數據結構：

1. `GET /v1/subscriptions` - 返回包含 plan 和 usage 的訂閱信息
2. `GET /v1/subscriptions/usage` - 返回 plan 和 usage 數據
3. `POST /v1/subscriptions` - 更新訂閱方案
4. `DELETE /v1/subscriptions` - 取消訂閱

## 測試檢查清單

- [ ] 登入後正確顯示當前方案和使用情況
- [ ] hover 使用者名稱顯示 popup 和正確數據
- [ ] 訂閱方案頁面顯示正確的使用情況和限制
- [ ] 新增訂閱頻道後使用情況更新
- [ ] 達到頻道上限時顯示警告且無法新增
- [ ] 達到影音上限時顯示警告
- [ ] 升級方案後限制正確更新
- [ ] 切換影音來源後使用情況更新
- [ ] 進度條正確顯示使用百分比
- [ ] 進度條在接近/達到限制時改變顏色

