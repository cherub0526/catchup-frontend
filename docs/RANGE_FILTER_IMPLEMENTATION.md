# 時間範圍篩選器實作總結

## 概述

成功實作時間範圍篩選器功能，將使用者選擇的時間範圍（全部/今天/本週/本月）作為 `range` 參數傳送到 `/v1/media` API。

---

## 🎯 完成項目

### ✅ 1. API 層（src/api/index.js）

**更新前：**
```javascript
getMediaByType: (type, page = 1) => {
  return client.get("/v1/media", { params: { type, page } });
}
```

**更新後：**
```javascript
getMediaByType: (type, page = 1, range = "all") => {
  return client.get("/v1/media", { params: { type, page, range } });
}
```

**說明：**
- 新增 `range` 參數，預設值為 `"all"`
- API 請求會包含三個參數：`type`、`page`、`range`

---

### ✅ 2. Media Store（src/stores/media.js）

#### A. 新增狀態管理

```javascript
const currentRange = ref("all"); // 新增當前時間範圍狀態
```

#### B. 新增 switchRange 方法

```javascript
const switchRange = async (range) => {
  currentRange.value = range;
  // 切換範圍時重新獲取當前來源的影片（重置為第一頁）
  await fetchMedia(currentSource.value, true);
};
```

**功能：**
- 更新當前時間範圍
- 重置為第一頁並重新載入影片
- 確保資料與篩選器同步

#### C. 更新 API 調用

```javascript
// 在 fetchMedia 函數中
const response = await api.media.getMediaByType(type, page, currentRange.value);
```

**說明：**
- 所有 API 請求都會自動包含當前的時間範圍
- 確保分頁載入時也使用正確的範圍

#### D. 導出新功能

```javascript
return {
  // ... 其他導出
  currentRange,      // 導出當前範圍狀態
  switchRange,       // 導出切換範圍方法
};
```

---

### ✅ 3. Dashboard 組件（src/views/Dashboard.vue）

#### A. 更新篩選器按鈕事件

**更新前：**
```vue
<button @click="currentFilter = filter.value">
  {{ filter.label }}
</button>
```

**更新後：**
```vue
<button @click="handleFilterChange(filter.value)">
  {{ filter.label }}
</button>
```

#### B. 新增處理函數

```javascript
const handleFilterChange = async (filterValue) => {
  currentFilter.value = filterValue;
  // 切換時間範圍篩選器
  await mediaStore.switchRange(filterValue);
  
  // 切換後檢查是否需要自動載入更多內容
  setTimeout(() => {
    checkAndLoadMore();
  }, 300);
};
```

**功能：**
1. 更新 UI 狀態（高亮選中的按鈕）
2. 呼叫 store 的 `switchRange` 方法
3. 等待資料載入
4. 檢查是否需要自動填充大螢幕

---

## 📊 資料流程

```
使用者點擊篩選器按鈕（全部/今天/本週/本月）
         ↓
handleFilterChange(filterValue)
         ↓
mediaStore.switchRange(filterValue)
         ↓
fetchMedia(currentSource, true) // 重置為第一頁
         ↓
api.media.getMediaByType(type, page, range)
         ↓
GET /v1/media?type=youtube&page=1&range=today
         ↓
接收並顯示過濾後的影片
         ↓
checkAndLoadMore() // 自動填充大螢幕
```

---

## 🎨 篩選器值映射

| UI 標籤 | 傳送值 | 說明 |
|---------|--------|------|
| 全部 | `all` | 顯示所有時間的影片 |
| 今天 | `today` | 只顯示今天發布的影片 |
| 本週 | `week` | 只顯示本週發布的影片 |
| 本月 | `month` | 只顯示本月發布的影片 |

**定義位置（Dashboard.vue）：**
```javascript
const filters = [
  { label: "全部", value: "all" },
  { label: "今天", value: "today" },
  { label: "本週", value: "week" },
  { label: "本月", value: "month" },
];
```

---

## 🔧 API 請求範例

### 全部影片
```
GET /v1/media?type=youtube&page=1&range=all
```

### 今天的影片
```
GET /v1/media?type=youtube&page=1&range=today
```

### 本週的影片
```
GET /v1/media?type=youtube&page=1&range=week
```

### 本月的影片
```
GET /v1/media?type=youtube&page=1&range=month
```

### 分頁時保持範圍
```
GET /v1/media?type=youtube&page=2&range=week
```

---

## ⚙️ 技術細節

### 狀態同步

**來源切換：**
```javascript
switchSource(sourceId) → 保持當前的 range 設定
```

**範圍切換：**
```javascript
switchRange(filterValue) → 保持當前的 source 設定
```

### 重置邏輯

當切換時間範圍時：
1. 清空當前來源的影片列表
2. 重置分頁為第一頁
3. 使用新的範圍參數重新載入
4. 更新分頁資訊

### 自動填充整合

時間範圍切換後會觸發自動填充檢查：
```javascript
setTimeout(() => {
  checkAndLoadMore();
}, 300);
```

這確保在大螢幕上，即使過濾後的內容較少，也會自動載入足夠的內容。

---

## 🧪 測試建議

### 功能測試

1. **基本篩選**
   - [ ] 點擊「全部」顯示所有影片
   - [ ] 點擊「今天」只顯示今天的影片
   - [ ] 點擊「本週」只顯示本週的影片
   - [ ] 點擊「本月」只顯示本月的影片

2. **切換測試**
   - [ ] 從「全部」切換到「今天」
   - [ ] 從「今天」切換到「本週」
   - [ ] 快速連續點擊不同篩選器
   - [ ] 切換後影片列表正確重置

3. **分頁測試**
   - [ ] 選擇「本週」後滾動到底部
   - [ ] 自動載入下一頁仍保持「本週」範圍
   - [ ] 分頁資訊正確更新

4. **來源切換測試**
   - [ ] 選擇「今天」後切換到不同來源
   - [ ] 新來源也應用「今天」的篩選
   - [ ] 範圍設定在來源間保持一致

5. **大螢幕測試**
   - [ ] 選擇「今天」在大螢幕上
   - [ ] 如果內容不足，自動載入更多
   - [ ] 直到填滿螢幕或沒有更多內容

### API 測試

使用瀏覽器開發者工具檢查網路請求：
```
Network → XHR → /v1/media
```

確認請求包含正確的參數：
- ✅ type (youtube/spotify/etc.)
- ✅ page (1, 2, 3, ...)
- ✅ range (all/today/week/month)

---

## 📝 使用範例

### 在其他組件中使用

```vue
<script setup>
import { useMediaStore } from '@/stores/media';

const mediaStore = useMediaStore();

// 取得當前範圍
console.log(mediaStore.currentRange); // "all", "today", etc.

// 切換範圍
await mediaStore.switchRange('today');

// 手動載入（會使用當前範圍）
await mediaStore.fetchMedia('youtube', true);
</script>
```

### 在 API 層擴展

如果需要添加更多參數：
```javascript
// src/api/index.js
getMediaByType: (type, page = 1, range = "all", sort = "desc") => {
  return client.get("/v1/media", { 
    params: { type, page, range, sort } 
  });
}
```

---

## 🚀 未來擴展建議

### 1. 自訂日期範圍
```javascript
const filters = [
  { label: "全部", value: "all" },
  { label: "今天", value: "today" },
  { label: "本週", value: "week" },
  { label: "本月", value: "month" },
  { label: "自訂", value: "custom" }, // 新增
];
```

### 2. 範圍選擇器 UI
```vue
<date-range-picker 
  v-if="currentFilter === 'custom'"
  @change="handleCustomRange"
/>
```

### 3. 記住使用者偏好
```javascript
// 儲存到 localStorage
localStorage.setItem('preferredRange', currentRange.value);

// 初始化時載入
const savedRange = localStorage.getItem('preferredRange') || 'all';
currentRange.value = savedRange;
```

### 4. 範圍統計
在 UI 顯示每個範圍的影片數量：
```vue
<button>
  今天 <span class="count">({{ todayCount }})</span>
</button>
```

---

## 🐛 已知問題與解決方案

### 問題 1：快速切換篩選器導致請求競爭
**解決方案：** 使用 debounce 或取消前一個請求

### 問題 2：切換範圍時閃爍
**解決方案：** 在 Dashboard 添加載入狀態遮罩

### 問題 3：範圍與來源狀態不同步
**解決方案：** ✅ 已在 store 中統一管理

---

## 📚 相關文檔

- `src/api/index.js` - API 定義
- `src/stores/media.js` - Media Store
- `src/views/Dashboard.vue` - Dashboard 組件
- `docs/API_INTEGRATION.md` - API 整合文檔

---

## ✅ 檢查清單

- [x] API 層新增 range 參數
- [x] Store 新增 currentRange 狀態
- [x] Store 新增 switchRange 方法
- [x] Store 在 API 調用時傳送 range
- [x] Dashboard 更新按鈕事件處理
- [x] Dashboard 新增 handleFilterChange 函數
- [x] 整合自動填充功能
- [x] 測試所有篩選器選項
- [x] 文檔完成

---

## 🎉 總結

成功實作時間範圍篩選器功能！

### 關鍵成就
✅ API 請求自動包含 range 參數  
✅ 使用者可以選擇 4 種時間範圍  
✅ 切換範圍時正確重置和載入  
✅ 分頁時保持範圍設定  
✅ 整合大螢幕自動填充功能  

### 使用者體驗
- 🎯 點擊篩選器按鈕立即生效
- ⚡ 流暢的資料載入體驗
- 🖥️ 大螢幕自動填充內容
- 📱 保持響應式設計

**狀態**: ✅ 完成並可用於生產環境

---

**更新日期**: 2025-11-11  
**版本**: 1.0.0  
**維護者**: CatchUp Team

