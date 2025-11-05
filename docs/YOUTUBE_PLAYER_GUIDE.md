# YouTube 播放器使用指南

## 🎬 功能說明

Player.vue 現在使用 YouTube iframe API 來播放真實的 YouTube 影片。

## 📝 主要功能

### 1. 自動載入 YouTube API
- 首次載入時自動引入 YouTube iframe API
- 支援 API 重複載入檢測

### 2. 支援多種 YouTube URL 格式
播放器可以自動識別以下格式的 URL：

```javascript
// 標準網址
https://www.youtube.com/watch?v=dQw4w9WgXcQ

// 短網址
https://youtu.be/dQw4w9WgXcQ

// 嵌入網址
https://www.youtube.com/embed/dQw4w9WgXcQ

// 直接提供影片 ID
dQw4w9WgXcQ
```

### 3. 完整的播放控制
- ▶️ 播放/暫停
- ⏪ 快退 10 秒
- ⏩ 快進 10 秒
- 🔊/🔇 靜音/取消靜音
- ⛶ 全螢幕切換
- 進度條點擊跳轉
- AI 聊天中的時間戳記跳轉

### 4. 即時狀態同步
- 即時更新播放進度（每 100ms）
- 自動同步播放/暫停狀態
- 顯示影片總長度和當前時間

## 🚀 使用方式

### 從 Dashboard 跳轉

在 Dashboard.vue 中點擊影片卡片時，需要在 `url` 參數中傳遞 YouTube URL：

```javascript
const openVideo = (video) => {
  router.push({
    name: 'Player',
    query: {
      title: video.title,
      source: currentSource.value,
      url: 'https://www.youtube.com/watch?v=VIDEO_ID', // YouTube URL
    },
  })
}
```

### 測試範例

```javascript
// 測試影片 1 - Rick Astley
router.push({
  name: 'Player',
  query: {
    title: 'Never Gonna Give You Up',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
})

// 測試影片 2 - 使用短網址
router.push({
  name: 'Player',
  query: {
    title: '範例影片',
    source: 'youtube',
    url: 'https://youtu.be/dQw4w9WgXcQ',
  },
})

// 測試影片 3 - 直接使用影片 ID
router.push({
  name: 'Player',
  query: {
    title: '範例影片',
    source: 'youtube',
    url: 'dQw4w9WgXcQ',
  },
})
```

## 🔧 技術實現

### YouTube iframe API 整合

```javascript
// 1. 載入 API
const loadYouTubeAPI = () => {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
  
  window.onYouTubeIframeAPIReady = () => {
    initYouTubePlayer();
  };
}

// 2. 初始化播放器
const initYouTubePlayer = () => {
  youtubePlayer = new window.YT.Player("youtube-player", {
    videoId: videoData.value.videoId,
    playerVars: {
      autoplay: 0,
      controls: 0, // 隱藏預設控制條
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// 3. 控制播放
const togglePlay = () => {
  if (isPlaying.value) {
    youtubePlayer.pauseVideo();
  } else {
    youtubePlayer.playVideo();
  }
}
```

### URL 解析

```javascript
const extractYouTubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return "";
}
```

## 📊 播放器配置

### 當前配置

```javascript
playerVars: {
  autoplay: 0,          // 不自動播放
  controls: 0,          // 隱藏 YouTube 原生控制條
  modestbranding: 1,    // 隱藏 YouTube Logo
  rel: 0,               // 不顯示相關影片
  showinfo: 0,          // 不顯示影片資訊
  fs: 1,                // 允許全螢幕
  cc_load_policy: 0,    // 不顯示字幕
  iv_load_policy: 3,    // 不顯示註解
}
```

### 可選配置

如需修改，可在 `initYouTubePlayer` 函數中調整：

```javascript
playerVars: {
  autoplay: 1,          // 自動播放
  controls: 1,          // 顯示 YouTube 控制條
  cc_load_policy: 1,    // 顯示字幕
  // ... 更多選項
}
```

## 🎯 狀態管理

### 播放器狀態

```javascript
// YouTube PlayerState 常數
YT.PlayerState.UNSTARTED   // -1
YT.PlayerState.ENDED       // 0
YT.PlayerState.PLAYING     // 1
YT.PlayerState.PAUSED      // 2
YT.PlayerState.BUFFERING   // 3
YT.PlayerState.CUED        // 5
```

### 事件監聽

```javascript
events: {
  onReady: onPlayerReady,           // 播放器就緒
  onStateChange: onPlayerStateChange, // 狀態變化
  onError: onPlayerError,           // 錯誤處理（可選）
}
```

## 🔄 生命週期管理

### 初始化
```javascript
onMounted(() => {
  loadYouTubeAPI();  // 載入 API
})
```

### 清理
```javascript
onBeforeUnmount(() => {
  if (youtubePlayer) {
    youtubePlayer.destroy();  // 銷毀播放器
  }
  if (playerCheckInterval) {
    clearInterval(playerCheckInterval);  // 清理定時器
  }
})
```

## ⚠️ 注意事項

### 1. 網路連線
- 需要穩定的網路連線來載入 YouTube API
- 首次載入可能需要 1-2 秒

### 2. CORS 限制
- YouTube iframe API 會處理 CORS 問題
- 不需要額外設定

### 3. Electron 環境
確保 Electron 主進程允許載入外部腳本：

```javascript
// electron/main.js
webPreferences: {
  nodeIntegration: true,
  contextIsolation: false,
  // 允許載入外部資源
}
```

### 4. 內容安全政策 (CSP)
如果使用 CSP，需要允許 YouTube 域名：

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://www.youtube.com; 
               frame-src https://www.youtube.com;">
```

## 🐛 疑難排解

### 問題 1：影片無法載入

**解決方案：**
1. 檢查網路連線
2. 驗證影片 ID 是否正確
3. 確認影片是否可嵌入（有些影片禁止嵌入）
4. 查看瀏覽器 Console 錯誤訊息

```javascript
// 添加錯誤處理
events: {
  onReady: onPlayerReady,
  onStateChange: onPlayerStateChange,
  onError: (event) => {
    console.error("YouTube Player Error:", event.data);
    showNotification("影片載入失敗，請確認影片 URL 是否正確");
  },
}
```

### 問題 2：控制條不顯示

**解決方案：**
檢查 CSS，確保 `.player-controls` 的 z-index 足夠高：

```css
.player-controls {
  position: absolute;
  z-index: 1000;  /* 確保在 iframe 之上 */
}
```

### 問題 3：進度不更新

**解決方案：**
確認定時器正在運行：

```javascript
console.log("Player check interval:", playerCheckInterval);
console.log("Current time:", youtubePlayer.getCurrentTime());
```

## 📚 相關資源

- [YouTube iframe API 文檔](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Player 參數說明](https://developers.google.com/youtube/player_parameters)
- [YouTube 嵌入影片指南](https://support.google.com/youtube/answer/171780)

## 🎨 自訂樣式

### 調整播放器大小

```css
.player-wrapper {
  /* 16:9 比例 */
  aspect-ratio: 16 / 9;
  max-height: 80vh;
}
```

### 自訂控制條樣式

```css
.player-controls {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  padding: 30px;
}

.control-btn {
  font-size: 24px;
  transition: transform 0.2s;
}

.control-btn:hover {
  transform: scale(1.2);
}
```

## ✅ 功能清單

- [x] YouTube iframe API 整合
- [x] 自動影片 ID 提取
- [x] 播放/暫停控制
- [x] 進度條顯示和控制
- [x] 快進/快退功能
- [x] 靜音控制
- [x] 全螢幕支援
- [x] 時間戳記跳轉
- [x] 即時狀態同步
- [x] 播放器清理

## 🔮 未來改進

- [ ] 支援播放速度調整
- [ ] 支援字幕顯示
- [ ] 支援畫質選擇
- [ ] 支援播放清單
- [ ] 支援迷你播放器
- [ ] 支援畫中畫模式

## 💡 提示

如需測試，可以使用這些熱門 YouTube 影片 ID：
- `dQw4w9WgXcQ` - Rick Astley - Never Gonna Give You Up
- `9bZkp7q19f0` - PSY - Gangnam Style
- `kJQP7kiw5Fk` - Luis Fonsi - Despacito

現在您的 Video Assistant 可以播放真實的 YouTube 影片了！🎉

