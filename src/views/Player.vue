<template>
  <div class="player-container">
    <!-- 頂部導航欄 -->
    <header class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z" />
          </svg>
          <span>返回</span>
        </button>
        <h1 class="video-title">{{ videoData.title }}</h1>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="handleDownload">
          <span>⬇️</span>
          <span>下載</span>
        </button>
        <button class="header-btn" @click="handleShare">
          <span>🔗</span>
          <span>分享</span>
        </button>
      </div>
    </header>

    <!-- 主要內容區域 -->
    <div class="main-content">
      <!-- 左側區域 -->
      <div class="left-section">
        <!-- 播放器區域 -->
        <div class="player-wrapper" ref="playerWrapperRef">
          <!-- YouTube iframe 播放器 -->
          <div v-if="isLoadingMedia" class="player-placeholder">
            <div class="player-placeholder-icon">⏳</div>
            <div class="player-placeholder-text">正在載入媒體資料...</div>
          </div>
          <div v-else-if="mediaLoadError" class="player-placeholder">
            <div class="player-placeholder-icon">❌</div>
            <div class="player-placeholder-text">{{ mediaLoadError }}</div>
          </div>
          <div v-else-if="!videoLoaded" class="player-placeholder">
            <div class="player-placeholder-icon">🎬</div>
            <div class="player-placeholder-text">正在載入影片...</div>
          </div>
          <div v-else id="youtube-player" class="youtube-player"></div>

          <!-- 播放控制條 -->
          <div class="player-controls" v-if="videoLoaded">
            <div class="progress-bar" @click="handleProgressClick">
              <div class="progress-filled" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="controls-row">
              <button class="control-btn" @click="togglePlay">{{ isPlaying ? "⏸️" : "▶️" }}</button>
              <button class="control-btn" @click="seek(-10)">⏪</button>
              <button class="control-btn" @click="seek(10)">⏩</button>
              <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
              <div class="spacer"></div>
              <button class="control-btn" @click="toggleMute">{{ isMuted ? "🔇" : "🔊" }}</button>
              <button class="control-btn" @click="toggleFullscreen">⛶</button>
            </div>
          </div>
        </div>

        <!-- 聊天區域 -->
        <div class="chat-wrapper">
          <div class="chat-header">
            <h3>AI 助手</h3>
            <div class="chat-status">
              <span class="status-dot"></span>
              <span>線上</span>
            </div>
          </div>

          <div class="chat-messages" ref="chatMessagesRef">
            <!-- 歡迎訊息 -->
            <div class="message">
              <div class="message-avatar">🤖</div>
              <div class="message-content">您好！我是 AI 助手，我可以回答您關於這部影片的任何問題。請隨時提問！</div>
            </div>

            <!-- 聊天訊息 -->
            <div v-for="(msg, index) in chatMessages" :key="index" :class="['message', msg.type]">
              <div class="message-avatar">{{ msg.type === "user" ? "👤" : "🤖" }}</div>
              <div class="message-content" v-html="msg.content"></div>
            </div>
          </div>

          <div class="chat-input-wrapper">
            <form class="chat-input-form" @submit.prevent="handleChatSubmit">
              <input
                type="text"
                class="chat-input"
                v-model="chatInput"
                placeholder="詢問關於影片的問題..."
                autocomplete="off"
                :disabled="isThinking" />
              <button type="submit" class="send-btn" :disabled="isThinking || !chatInput.trim()">
                {{ isThinking ? "思考中..." : "發送" }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- 右側區域 -->
      <div class="right-section">
        <div class="summary-wrapper">
          <!-- Tab 切換導航 -->
          <div class="tab-navigation">
            <button :class="['tab-btn', { active: activeTab === 'summary' }]" @click="activeTab = 'summary'">
              <span class="tab-icon">✨</span>
              <span>AI 總結</span>
            </button>
            <button :class="['tab-btn', { active: activeTab === 'timeline' }]" @click="activeTab = 'timeline'">
              <span class="tab-icon">⏱️</span>
              <span>時間軸</span>
            </button>
          </div>

          <!-- AI 總結內容 -->
          <div v-show="activeTab === 'summary'" class="tab-content active">
            <div class="tab-header">
              <p>由 AI 自動生成</p>
            </div>
            <div class="summary-content">
              <!-- 摘要 -->
              <div class="summary-section">
                <h4><span class="summary-section-icon">📝</span>內容摘要</h4>
                <p class="summary-text">{{ aiSummary.overview }}</p>
              </div>

              <!-- 重點 -->
              <div class="summary-section">
                <h4><span class="summary-section-icon">⭐</span>重點整理</h4>
                <ul class="summary-list">
                  <li v-for="(point, index) in aiSummary.keypoints" :key="index">{{ point }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 時間軸內容 -->
          <div v-show="activeTab === 'timeline'" class="tab-content active">
            <div class="timeline-header-bar">
              <select class="timeline-language-selector" v-model="timelineLanguage" @change="loadTimeline">
                <option value="zh-TW">繁體中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <div class="timeline-content">
              <div v-if="timelineLoading" class="summary-text">載入中...</div>
              <div v-else-if="timelineError" class="summary-text" style="color: #ef4444">
                {{ timelineError }}
              </div>
              <div v-else>
                <div v-for="(item, index) in timelineData" :key="index" class="timeline-item">
                  <div class="timestamp-link" @click="seekToTime(item.time)">
                    <span>⏱️</span>
                    <span>{{ formatTime(item.time) }}</span>
                    <span> - {{ item.label }}</span>
                  </div>
                  <p class="timeline-description">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api";

const route = useRoute();
const router = useRouter();

// Refs
const playerWrapperRef = ref(null);
const chatMessagesRef = ref(null);

// YouTube Player
let youtubePlayer = null;
let playerCheckInterval = null;

// 影片資料
const videoData = ref({
  title: "載入中...",
  videoId: "",
  url: "",
  duration: 600,
  currentTime: 0,
  isPlaying: false,
  type: "",
  mediaId: null,
});

const videoLoaded = ref(false);
const isPlaying = ref(false);
const isMuted = ref(false);
const currentTime = ref(0);
const duration = ref(600);
const isLoadingMedia = ref(false);
const mediaLoadError = ref(null);

// 聊天相關
const chatInput = ref("");
const chatMessages = ref([]);
const isThinking = ref(false);

// Tab 狀態
const activeTab = ref("summary");

// 時間軸
const timelineLanguage = ref("zh-TW");
const timelineData = ref([]);
const timelineLoading = ref(false);
const timelineError = ref("");

// AI 總結資料
const aiSummary = ref({
  overview:
    "這是一部關於 Web 開發的教學影片，介紹了現代前端框架的核心概念和最佳實踐。影片涵蓋了組件化開發、狀態管理、路由設計等重要主題，適合有一定基礎的開發者學習。",
  keypoints: [
    "介紹了現代前端框架的核心概念",
    "詳細講解了組件化開發的優勢與實踐",
    "深入探討了狀態管理的不同解決方案",
    "展示了實際專案中的最佳實踐案例",
    "提供了性能優化的實用技巧",
  ],
});

// Computed
const progressPercent = computed(() => {
  return (currentTime.value / duration.value) * 100;
});

// 初始化
onMounted(async () => {
  // 從 URL 參數獲取影片資訊
  const mediaId = route.query.mediaId;
  const title = route.query.title || "範例影片";
  const url = route.query.url || "";

  videoData.value.title = title;
  videoData.value.url = url;
  videoData.value.mediaId = mediaId;

  // 如果有 mediaId，從 API 獲取詳細資料
  if (mediaId) {
    await fetchMediaDetails(mediaId);
  } else {
    // 如果沒有 mediaId，使用 URL 參數的資料
    const videoId = extractYouTubeVideoId(url);
    videoData.value.videoId = videoId;

    // 載入時間軸
    loadTimeline();

    // 載入 YouTube iframe API
    if (videoId) {
      loadYouTubeAPI();
    }
  }
});

onBeforeUnmount(() => {
  // 清理播放器
  if (youtubePlayer) {
    youtubePlayer.destroy();
  }
  if (playerCheckInterval) {
    clearInterval(playerCheckInterval);
  }
});

// 從 API 獲取媒體詳細資料
const fetchMediaDetails = async (mediaId) => {
  isLoadingMedia.value = true;
  mediaLoadError.value = null;

  try {
    const response = await api.media.getMediaById(mediaId);

    if (response?.data) {
      const media = response.data;

      // 更新影片資料
      videoData.value.title = media.title || videoData.value.title;
      videoData.value.url = media.url || videoData.value.url;
      videoData.value.type = media.type || media.source || "youtube";

      // 如果是 YouTube 影片，提取影片 ID 並載入播放器
      if (videoData.value.type === "youtube") {
        const videoId = extractYouTubeVideoId(media.url || videoData.value.url);
        videoData.value.videoId = videoId;

        if (videoId) {
          // 載入時間軸
          loadTimeline();

          // 載入 YouTube iframe API
          loadYouTubeAPI();
        } else {
          mediaLoadError.value = "無法從 URL 中提取 YouTube 影片 ID";
          showNotification("無法載入影片：缺少有效的 YouTube URL");
        }
      } else {
        // 其他類型的媒體（未來可以擴展支援）
        showNotification(`暫不支援 ${videoData.value.type} 類型的播放`);
      }
    }
  } catch (error) {
    console.error("獲取媒體詳細資料失敗:", error);
    mediaLoadError.value = error.message || "獲取媒體資料失敗";
    showNotification("無法載入影片資料，請稍後再試");
  } finally {
    isLoadingMedia.value = false;
  }
};

// 載入 YouTube iframe API
const loadYouTubeAPI = () => {
  // 檢查 API 是否已載入
  if (window.YT && window.YT.Player) {
    initYouTubePlayer();
    return;
  }

  // 載入 YouTube iframe API
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // 設定 API 就緒回調
  window.onYouTubeIframeAPIReady = () => {
    initYouTubePlayer();
  };
};

// 初始化 YouTube 播放器
const initYouTubePlayer = () => {
  if (!videoData.value.videoId) {
    console.error("No video ID found");
    showNotification("無法載入影片：缺少影片 ID");
    return;
  }

  youtubePlayer = new window.YT.Player("youtube-player", {
    height: "100%",
    width: "100%",
    videoId: videoData.value.videoId,
    playerVars: {
      autoplay: 0,
      controls: 0, // 隱藏 YouTube 控制條，使用自訂控制條
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      fs: 1,
      cc_load_policy: 0,
      iv_load_policy: 3,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });

  console.log(youtubePlayer);
};

// 播放器就緒
const onPlayerReady = (event) => {
  videoLoaded.value = true;
  duration.value = youtubePlayer.getDuration();

  // 開始更新播放進度
  playerCheckInterval = setInterval(() => {
    if (youtubePlayer && youtubePlayer.getCurrentTime) {
      currentTime.value = youtubePlayer.getCurrentTime();

      // 更新播放狀態
      const state = youtubePlayer.getPlayerState();
      isPlaying.value = state === window.YT.PlayerState.PLAYING;
    }
  }, 100);

  showNotification("影片載入完成");
};

// 播放器狀態變化
const onPlayerStateChange = (event) => {
  const state = event.data;

  if (state === window.YT.PlayerState.PLAYING) {
    isPlaying.value = true;
  } else if (state === window.YT.PlayerState.PAUSED) {
    isPlaying.value = false;
  } else if (state === window.YT.PlayerState.ENDED) {
    isPlaying.value = false;
    showNotification("影片播放完畢");
  }
};

// 從 URL 提取 YouTube 影片 ID
const extractYouTubeVideoId = (url) => {
  if (!url) return "";

  // 支援多種 YouTube URL 格式
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
};

// 方法
const goBack = () => {
  router.back();
};

const togglePlay = () => {
  if (!youtubePlayer) return;

  if (isPlaying.value) {
    youtubePlayer.pauseVideo();
  } else {
    youtubePlayer.playVideo();
  }
};

const seek = (seconds) => {
  if (!youtubePlayer) return;

  const newTime = Math.max(0, Math.min(duration.value, currentTime.value + seconds));
  youtubePlayer.seekTo(newTime, true);
};

const seekToTime = (seconds) => {
  if (!youtubePlayer) return;

  youtubePlayer.seekTo(seconds, true);
  showNotification(`已跳轉至 ${formatTime(seconds)}`);
};

const toggleMute = () => {
  if (!youtubePlayer) return;

  if (isMuted.value) {
    youtubePlayer.unMute();
  } else {
    youtubePlayer.mute();
  }
  isMuted.value = !isMuted.value;
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement && playerWrapperRef.value) {
    playerWrapperRef.value.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const handleProgressClick = (e) => {
  if (!youtubePlayer) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = percent * duration.value;
  youtubePlayer.seekTo(newTime, true);
};

const handleDownload = () => {
  showNotification("下載功能開發中...");
};

const handleShare = () => {
  showNotification("分享連結已複製到剪貼簿");
};

// 聊天功能
const handleChatSubmit = async () => {
  const message = chatInput.value.trim();
  if (!message) return;

  // 添加使用者訊息
  chatMessages.value.push({
    type: "user",
    content: message,
  });

  chatInput.value = "";
  isThinking.value = true;

  // 滾動到底部
  await nextTick();
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }

  // 模擬 AI 回應
  setTimeout(() => {
    const response = generateAIResponse(message);
    chatMessages.value.push({
      type: "ai",
      content: response,
    });

    isThinking.value = false;

    // 滾動到底部
    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
      }
    });
  }, 1500);
};

const generateAIResponse = (question) => {
  const responses = [
    {
      keywords: ["什麼", "介紹", "是什麼"],
      answer:
        '根據影片內容，這部影片主要介紹了現代前端開發的核心概念。<span class="reference-mark" onclick="seekToTime(30)" data-time="30" data-content="前端框架簡介部分詳細說明了為什麼需要使用現代框架，以及它們如何提升開發效率。">1<span class="reference-tooltip"><div class="tooltip-time">⏱️ 00:30</div><div class="tooltip-content">前端框架簡介部分詳細說明了為什麼需要使用現代框架，以及它們如何提升開發效率。</div></span></span>',
    },
    {
      keywords: ["組件", "元件", "component"],
      answer:
        '關於組件化開發，影片中提到了幾個關鍵優勢：可重用性、易維護性和模組化。<span class="reference-mark" onclick="seekToTime(180)" data-time="180" data-content="組件化開發章節展示了如何設計可重用的組件，包括 props 傳遞和事件處理。">1<span class="reference-tooltip"><div class="tooltip-time">⏱️ 03:00</div><div class="tooltip-content">組件化開發章節展示了如何設計可重用的組件，包括 props 傳遞和事件處理。</div></span></span> 您可以在這個時間點看到具體的實作範例。',
    },
    {
      keywords: ["狀態", "state", "管理"],
      answer:
        '狀態管理是影片的重要主題之一。<span class="reference-mark" onclick="seekToTime(360)" data-time="360" data-content="狀態管理部分比較了不同的解決方案，包括 Redux、MobX 和 Context API。">1<span class="reference-tooltip"><div class="tooltip-time">⏱️ 06:00</div><div class="tooltip-content">狀態管理部分比較了不同的解決方案，包括 Redux、MobX 和 Context API。</div></span></span> 影片中詳細比較了各種狀態管理方案的優缺點。',
    },
    {
      keywords: ["性能", "優化", "performance"],
      answer:
        '影片後半段專門討論了性能優化。<span class="reference-mark" onclick="seekToTime(480)" data-time="480" data-content="性能優化章節介紹了 lazy loading、code splitting 和 memoization 等技術。">1<span class="reference-tooltip"><div class="tooltip-time">⏱️ 08:00</div><div class="tooltip-content">性能優化章節介紹了 lazy loading、code splitting 和 memoization 等技術。</div></span></span> 包含了許多實用的優化技巧。',
    },
  ];

  // 尋找匹配的回應
  for (const response of responses) {
    if (response.keywords.some((keyword) => question.includes(keyword))) {
      return response.answer;
    }
  }

  // 預設回應
  return '這是一個很好的問題！根據影片內容，建議您查看以下重點時刻：<span class="reference-mark" onclick="seekToTime(30)" data-time="30" data-content="前端框架簡介">1<span class="reference-tooltip"><div class="tooltip-time">⏱️ 00:30</div><div class="tooltip-content">前端框架簡介</div></span></span> 和 <span class="reference-mark" onclick="seekToTime(180)" data-time="180" data-content="組件化開發">2<span class="reference-tooltip"><div class="tooltip-time">⏱️ 03:00</div><div class="tooltip-content">組件化開發</div></span></span>。如果需要更詳細的資訊，請告訴我您想了解的具體方面。';
};

// 時間軸功能
const loadTimeline = async () => {
  timelineLoading.value = true;
  timelineError.value = "";

  try {
    // const response = await fetch(`/pages/timelines/${timelineLanguage.value}.json`);
    // if (!response.ok) {
    // throw new Error(`Failed to load timeline for ${timelineLanguage.value}`);
    // }
    // timelineData.value = await response.json();
  } catch (error) {
    console.error("Error loading timeline:", error);
    timelineError.value = "無法載入時間軸";
  } finally {
    timelineLoading.value = false;
  }
};

// 工具函數
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const showNotification = (message) => {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 30px;
    background: rgba(102, 126, 234, 0.95);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

// 讓函數在 HTML 中可用（用於參考標記點擊）
window.seekToTime = seekToTime;
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.player-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0f1115;
  color: #fff;
}

/* 頂部導航欄 */
.header {
  background: rgba(15, 17, 21, 0.95);
  backdrop-filter: blur(10px);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.video-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  max-width: 600px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.header-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
}

/* 主要內容區域 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左側區域 */
.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 播放器區域 */
.player-wrapper {
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.youtube-player {
  width: 100%;
  height: 100%;
}

.youtube-player :deep(iframe) {
  width: 100%;
  height: 100%;
}

.player-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #666;
}

.player-placeholder-icon {
  font-size: 80px;
  opacity: 0.5;
}

.player-placeholder-text {
  font-size: 16px;
  color: #999;
}

/* 播放控制條 */
.player-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.player-wrapper:hover .player-controls {
  opacity: 1;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  margin-bottom: 15px;
  position: relative;
}

.progress-filled {
  height: 100%;
  background: #667eea;
  border-radius: 2px;
  transition: width 0.1s ease;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.time-display {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
}

.spacer {
  flex: 1;
}

/* 聊天區域 */
.chat-wrapper {
  height: 350px;
  background: #1a1d24;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #10b981;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 聊天訊息區域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.message-content {
  max-width: 70%;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #e5e7eb;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

/* 參考標記 */
.message-content :deep(.reference-mark) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 4px;
  color: #667eea;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  margin: 0 4px;
  transition: all 0.2s ease;
  position: relative;
  vertical-align: middle;
}

.message-content :deep(.reference-mark:hover) {
  background: rgba(102, 126, 234, 0.5);
  border-color: #667eea;
  transform: scale(1.1);
}

/* 聊天輸入區域 */
.chat-input-wrapper {
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.chat-input-form {
  display: flex;
  gap: 12px;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.chat-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.chat-input::placeholder {
  color: #6b7280;
}

.send-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 右側區域 */
.right-section {
  width: 400px;
  background: #1a1d24;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* AI 總結區域 */
.summary-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Tab 導航 */
.tab-navigation {
  display: flex;
  gap: 8px;
  padding: 20px 20px 0 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn:hover {
  color: #d1d5db;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: #fff;
  border-bottom-color: #667eea;
}

.tab-btn.active .tab-icon {
  transform: scale(1.1);
}

.tab-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

/* Tab 內容 */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 25px;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-header p {
  font-size: 13px;
  color: #9ca3af;
}

.summary-content {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
}

.timeline-header-bar {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 15px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-content {
  flex: 1;
}

.summary-section {
  margin-bottom: 25px;
}

.summary-section:last-child {
  margin-bottom: 0;
}

.summary-section h4 {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-section-icon {
  font-size: 16px;
}

.summary-text {
  font-size: 14px;
  line-height: 1.7;
  color: #d1d5db;
}

.summary-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-list li {
  font-size: 14px;
  color: #d1d5db;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.summary-list li::before {
  content: "•";
  position: absolute;
  left: 6px;
  color: #667eea;
  font-weight: 700;
}

/* 時間軸語言選擇器 */
.timeline-language-selector {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.timeline-language-selector:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(102, 126, 234, 0.5);
}

.timeline-language-selector:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 時間軸項目 */
.timeline-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.timeline-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.timestamp-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  color: #d1d5db;
  margin-bottom: 10px;
  border: 1px solid transparent;
}

.timestamp-link:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateX(6px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.timestamp-link span:first-child {
  font-size: 16px;
  flex-shrink: 0;
}

.timestamp-link span:nth-child(2) {
  color: #667eea;
  font-weight: 600;
  font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  min-width: 50px;
  flex-shrink: 0;
}

.timestamp-link span:nth-child(3) {
  color: #fff;
  font-weight: 500;
  flex: 1;
}

.timeline-description {
  margin-left: 46px;
  font-size: 13px;
  line-height: 1.7;
  color: #9ca3af;
  padding: 0 14px;
}

/* 捲軸樣式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .right-section {
    width: 350px;
  }

  .chat-wrapper {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .right-section {
    display: none;
  }

  .chat-wrapper {
    height: 250px;
  }
}

/* 動畫 */
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}
</style>
