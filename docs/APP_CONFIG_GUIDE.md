# 應用配置管理指南

## 概述

CatchUp 使用統一的配置管理系統，讓您可以在單一位置修改應用名稱、Slogan 和其他全域設定，所有相關的頁面和組件都會自動更新。

## 核心配置文件

### `src/config/app.js`

這是整個專案的核心配置文件，包含所有應用層級的設定：

```javascript
export const APP_CONFIG = {
  // 應用名稱
  name: 'CatchUp',
  
  // 應用 Slogan
  slogan: {
    zh: '輕鬆跟上節奏，不再錯過精彩',
    en: 'Stay caught up, without the catch.'
  },
  
  // 應用描述
  description: '自動化總結訂閱頻道內容的智能助理',
  
  // 版本號
  version: '1.0.0',
  
  // 作者
  author: '',
  
  // 其他配置
  meta: {
    defaultLanguage: 'zh',
    supportedLanguages: ['zh', 'en'],
  }
}
```

## 如何修改應用名稱

### 步驟 1：修改配置文件

編輯 `src/config/app.js`：

```javascript
export const APP_CONFIG = {
  name: '您的新名稱',  // 修改這裡
  slogan: {
    zh: '您的中文 Slogan',  // 修改這裡
    en: 'Your English Slogan'  // 修改這裡
  },
  // ...
}
```

### 步驟 2：更新 package.json（可選但建議）

為了保持一致性，建議同時更新 `package.json`：

```json
{
  "name": "your-app-name",
  "productName": "您的新名稱",
  "description": "您的應用描述"
}
```

### 步驟 3：更新 Electron 主程序（自動同步）

如果您希望 Electron 主程序也使用統一配置，可以考慮將配置導出為 JSON 文件，或直接在 `electron/main.js` 中手動更新：

```javascript
const APP_NAME = '您的新名稱'
const APP_DESCRIPTION = '您的應用描述'
```

### 步驟 4：重新啟動應用程式

```bash
npm start
```

所有變更會立即生效！

## 配置使用位置

### 前端組件

配置已被整合到以下組件中：

#### 1. Login.vue（登入頁面）
- 顯示應用名稱
- 顯示 Slogan
- 自動更新

```vue
<script setup>
import { APP_NAME, APP_SLOGAN } from '@/config/app'

const appName = ref(APP_NAME)
const appSlogan = ref(APP_SLOGAN.zh)
</script>

<template>
  <h1>{{ appName }}</h1>
  <p class="slogan">{{ appSlogan }}</p>
</template>
```

#### 2. Dashboard.vue（主儀表板）
- 標題列顯示應用名稱
- 自動更新

```vue
<script setup>
import { APP_NAME } from '@/config/app'

const appName = ref(APP_NAME)
</script>

<template>
  <h1 class="app-title">{{ appName }}</h1>
</template>
```

### Electron 主程序

在 `electron/main.js` 中配置窗口標題：

```javascript
const APP_NAME = 'CatchUp'

function createWindow() {
  mainWindow = new BrowserWindow({
    title: APP_NAME,
    // ...其他配置
  })
}
```

### package.json

```json
{
  "name": "catchup",
  "productName": "CatchUp",
  "description": "自動化總結訂閱頻道內容的智能助理"
}
```

## 添加新的配置項目

您可以輕鬆擴展配置文件以支援更多設定：

```javascript
export const APP_CONFIG = {
  // 現有配置...
  
  // 新增配置
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
  },
  
  features: {
    enableNotifications: true,
    enableAutoPlay: false,
  },
  
  social: {
    twitter: '@your_handle',
    github: 'your-repo',
  }
}

// 導出新配置
export const APP_THEME = APP_CONFIG.theme
export const APP_FEATURES = APP_CONFIG.features
export const APP_SOCIAL = APP_CONFIG.social
```

然後在組件中使用：

```vue
<script setup>
import { APP_THEME, APP_FEATURES } from '@/config/app'

const theme = ref(APP_THEME)
const features = ref(APP_FEATURES)
</script>
```

## 最佳實踐

### 1. 單一真相來源
- 始終從 `src/config/app.js` 導入配置
- 避免在組件中硬編碼應用名稱或其他全域設定

### 2. 類型安全（TypeScript 用戶）
如果您使用 TypeScript，可以為配置添加類型定義：

```typescript
interface AppConfig {
  name: string
  slogan: {
    zh: string
    en: string
  }
  description: string
  version: string
  author: string
  meta: {
    defaultLanguage: string
    supportedLanguages: string[]
  }
}

export const APP_CONFIG: AppConfig = {
  // ...
}
```

### 3. 環境變數
對於敏感資訊或環境特定的配置，使用環境變數：

```javascript
export const APP_CONFIG = {
  name: 'CatchUp',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  // ...
}
```

### 4. 配置驗證
添加配置驗證以確保必要的值存在：

```javascript
function validateConfig(config) {
  if (!config.name) {
    throw new Error('應用名稱為必填項')
  }
  if (!config.slogan.zh) {
    throw new Error('中文 Slogan 為必填項')
  }
  // ...
}

validateConfig(APP_CONFIG)
```

## 常見問題

### Q: 為什麼修改後沒有立即看到變化？

A: 確保：
1. 已儲存 `src/config/app.js` 文件
2. 已重新啟動開發伺服器（`npm start`）
3. 清除瀏覽器快取（Ctrl/Cmd + Shift + R）

### Q: 可以為不同環境使用不同的配置嗎？

A: 可以！使用環境變數：

```javascript
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'CatchUp',
  // ...
}
```

然後在 `.env` 文件中設定：

```
VITE_APP_NAME=CatchUp Dev
```

### Q: 如何在 Electron 主程序中使用 Vue 配置？

A: 有幾種方法：
1. 在 `electron/main.js` 中手動同步配置（目前方法）
2. 將配置導出為 JSON 文件並在兩處導入
3. 使用 IPC 從渲染進程傳遞配置到主進程

### Q: 生產環境打包時配置會包含在內嗎？

A: 是的，配置會被打包到應用程式中。如果您需要在打包後修改配置，考慮使用外部配置文件。

## 進階使用

### 多語言支援

擴展配置以支援更多語言：

```javascript
export const APP_CONFIG = {
  name: 'CatchUp',
  slogan: {
    'zh-TW': '輕鬆跟上節奏，不再錯過精彩',
    'zh-CN': '轻松跟上节奏，不再错过精彩',
    'en': 'Stay caught up, without the catch.',
    'ja': 'キャッチアップ、見逃さない',
  },
  // ...
}
```

在組件中使用：

```vue
<script setup>
import { APP_SLOGAN } from '@/config/app'
import { ref, computed } from 'vue'

const currentLanguage = ref('zh-TW')
const slogan = computed(() => APP_SLOGAN[currentLanguage.value])
</script>
```

### 動態配置

如果需要從 API 獲取配置：

```javascript
import { ref } from 'vue'

export const dynamicConfig = ref({})

export async function loadDynamicConfig() {
  const response = await fetch('/api/config')
  dynamicConfig.value = await response.json()
}
```

## 總結

CatchUp 的統一配置管理系統讓您能夠：

✅ 在單一位置管理所有全域設定  
✅ 確保整個應用程式的一致性  
✅ 輕鬆更換品牌和主題  
✅ 支援多語言和多環境  
✅ 減少維護成本

只需修改 `src/config/app.js`，整個應用程式就會自動更新！

