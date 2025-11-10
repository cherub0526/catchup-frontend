# 認證初始化功能說明

## 功能概述

應用程式現在會在每次啟動時自動檢查 localStorage 中是否存有認證 token，如果存在則會自動驗證 token 的有效性並獲取使用者資料。

## 實現細節

### 1. API 端點

在 `src/api/index.js` 中新增了 `getCurrentUser` 方法：

```javascript
user: {
  getCurrentUser: () => {
    return client.get("/v1/users");
  },
  // ... 其他方法
}
```

### 2. Auth Store 初始化方法

在 `src/stores/auth.js` 中新增了 `initAuth` 方法：

- **功能**：檢查 localStorage 中的 token 並驗證其有效性
- **流程**：
  1. 檢查是否已經初始化（避免重複執行）
  2. 從 localStorage 讀取 token
  3. 如果 token 存在，發送請求到 `/v1/users` 獲取使用者資料
  4. 成功時：將使用者資料儲存到 store，設置認證狀態為 true
  5. 失敗時：清除 localStorage 中的 token 和 store 中的資料

### 3. 應用啟動時執行

在 `src/App.vue` 的 `onMounted` 生命週期中調用：

```javascript
onMounted(async () => {
  await authStore.initAuth();
});
```

## 在其他頁面使用使用者資料

任何頁面都可以通過 auth store 訪問使用者資料：

```javascript
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// 訪問使用者資料
console.log(authStore.user); // 完整的使用者物件
console.log(authStore.isAuthenticated); // 認證狀態
console.log(authStore.token); // 當前 token
```

### 範例：Dashboard 頁面

在 `src/views/Dashboard.vue` 中展示如何使用使用者資料：

```javascript
// 獲取使用者名稱
const userName = computed(() => {
  if (authStore.user) {
    return authStore.user.name || authStore.user.email || authStore.user.account || '使用者'
  }
  return '使用者'
})

// 獲取使用者名稱首字母
const userInitial = computed(() => {
  const name = userName.value
  return name.charAt(0).toUpperCase()
})
```

## 使用者資料結構

從 `/v1/users` API 返回的使用者資料可能包含以下欄位（具體取決於後端實現）：

```javascript
{
  id: Number,           // 使用者 ID
  name: String,         // 使用者名稱
  email: String,        // 電子郵件
  account: String,      // 帳號
  // ... 其他欄位
}
```

## 錯誤處理

當 token 無效或 API 請求失敗時：

1. 控制台會輸出錯誤訊息
2. localStorage 中的 token 會被清除
3. store 中的使用者資料和認證狀態會被重置
4. 路由守衛會自動將使用者重定向到登入頁面

## 注意事項

1. **首次登入**：使用者首次登入後，token 會被儲存到 localStorage
2. **自動驗證**：每次應用啟動時都會自動驗證 token 的有效性
3. **路由保護**：所有需要認證的路由都會受到路由守衛的保護
4. **登出操作**：登出時會清除所有認證相關資料

## 自動跳轉功能

當應用啟動時，如果檢測到使用者已登入（token 有效），系統會自動跳轉到 dashboard 頁面。

### 實現方式

在 `src/App.vue` 中：

```javascript
onMounted(async () => {
  await authStore.initAuth();
  
  // 如果已經登入且當前在登入頁面或根路徑，則跳轉到 dashboard
  if (authStore.isAuthenticated) {
    if (route.path === '/login' || route.path === '/') {
      router.replace('/dashboard');
    }
  }
});
```

### 路由守衛優化

路由守衛會等待認證初始化完成：

- 如果還未初始化，先讓路由通過，由 App.vue 處理跳轉
- 初始化完成後，正常執行路由守衛邏輯：
  - 未認證使用者訪問受保護頁面 → 重定向到登入頁
  - 已認證使用者訪問登入頁 → 重定向到 dashboard

## 流程圖

```
應用啟動
    ↓
App.vue onMounted
    ↓
authStore.initAuth()
    ↓
檢查 localStorage token
    ↓
   存在？
    ├─ 是 → 發送 GET /v1/users
    │        ↓
    │       成功？
    │        ├─ 是 → 儲存使用者資料，設置 isAuthenticated = true
    │        │        ↓
    │        │       在登入頁？
    │        │        ├─ 是 → 跳轉到 /dashboard
    │        │        └─ 否 → 保持當前頁面
    │        └─ 否 → 清除 token 和使用者資料
    └─ 否 → 完成初始化
```

## 相關檔案

- `src/api/index.js` - API 配置和端點定義
- `src/stores/auth.js` - 認證狀態管理
- `src/App.vue` - 應用入口，執行初始化
- `src/router/index.js` - 路由配置和守衛
- `src/views/Dashboard.vue` - 使用者資料使用範例

