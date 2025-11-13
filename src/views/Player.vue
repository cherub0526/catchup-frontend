<template>
  <div class="player-container">
    <!-- 頂部導航欄 -->
    <header class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <font-awesome-icon icon="arrow-left" />
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
      <div class="left-section" :style="{ width: leftSectionWidth + 'px' }">
        <!-- 播放器區域 -->
        <div class="player-wrapper" ref="playerWrapperRef" :style="{ height: playerHeight + 'px' }">
          <!-- Plyr 播放器容器 -->
          <div class="plyr-container">
            <div
              v-if="videoData.type === 'youtube' && videoData.videoId"
              id="player"
              data-plyr-provider="youtube"
              :data-plyr-embed-id="videoData.videoId"></div>
            <video v-else id="player" playsinline controls>
              <source v-if="videoData.url" :src="videoData.url" type="video/mp4" />
              <track kind="captions" label="繁體中文" srclang="zh-TW" default />
            </video>
          </div>

          <!-- 載入狀態覆蓋層 -->
          <div v-if="isLoadingMedia" class="player-placeholder overlay">
            <div class="player-placeholder-icon">⏳</div>
            <div class="player-placeholder-text">正在載入媒體資料...</div>
          </div>
          <div v-else-if="mediaLoadError" class="player-placeholder overlay">
            <div class="player-placeholder-icon">❌</div>
            <div class="player-placeholder-text">{{ mediaLoadError }}</div>
          </div>
          <div v-else-if="!videoLoaded" class="player-placeholder overlay">
            <div class="player-placeholder-icon">🎬</div>
            <div class="player-placeholder-text">正在載入影片...</div>
          </div>
        </div>

        <!-- 垂直拖動條 (播放器與聊天區域之間) -->
        <div
          class="resizer resizer-horizontal"
          @mousedown="startVerticalResize"
          @touchstart="startVerticalResize"></div>

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
            <div
              v-for="(msg, index) in chatMessages"
              :key="index"
              :class="['message', msg.role === 'user' ? 'user' : 'ai']">
              <div class="message-avatar">{{ msg.role === "user" ? "👤" : "🤖" }}</div>
              <div class="message-content markdown-content" v-html="msg.content"></div>
            </div>

            <!-- 等待回應的泡泡 -->
            <div v-if="isThinking" class="message ai">
              <div class="message-avatar">🤖</div>
              <div class="message-content thinking-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
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

      <!-- 水平拖動條 (左側區域與右側區域之間) -->
      <div
        class="resizer resizer-vertical"
        @mousedown="startHorizontalResize"
        @touchstart="startHorizontalResize"></div>

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

            <!-- 載入狀態 -->
            <div v-if="isLoadingSummary" class="summary-content">
              <div class="summary-text" style="text-align: center; color: #9ca3af">
                <div style="font-size: 32px; margin-bottom: 10px">⏳</div>
                <div>載入 AI 總結中...</div>
              </div>
            </div>

            <!-- 錯誤狀態 -->
            <div v-else-if="summaryLoadError" class="summary-content">
              <div class="summary-text" style="text-align: center; color: #ef4444">
                <div style="font-size: 32px; margin-bottom: 10px">❌</div>
                <div>{{ summaryLoadError }}</div>
              </div>
            </div>

            <!-- 總結內容 -->
            <div v-else class="summary-content">
              <!-- 摘要 -->
              <div class="summary-section">
                <h4><span class="summary-section-icon">📝</span>內容摘要</h4>
                <div class="summary-text markdown-content" v-html="summaryHtml"></div>
              </div>

              <!-- 重點 -->
              <div class="summary-section" v-if="aiSummary.keypoints && aiSummary.keypoints.length > 0">
                <h4><span class="summary-section-icon">⭐</span>重點整理</h4>
                <ul class="summary-list">
                  <li v-for="(point, index) in aiSummary.keypoints" :key="index">{{ point }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 時間軸內容 -->
          <div v-show="activeTab === 'timeline'" class="tab-content timeline-tab active">
            <div class="timeline-header-bar fixed-header">
              <button :class="['follow-toggle-btn', { active: autoFollowTimeline }]" @click="handleFollowToggle">
                <span class="follow-icon">{{ autoFollowTimeline ? "📍" : "📌" }}</span>
                <span>{{ autoFollowTimeline ? "跟隨中" : "跟隨" }}</span>
              </button>
              <div class="timeline-selector-wrapper">
                <select
                  v-if="captionsList.length > 0"
                  class="caption-selector"
                  v-model="selectedCaption"
                  @change="handleCaptionChange">
                  <option v-for="caption in captionsList" :key="caption.id" :value="caption">
                    {{ caption.locale || caption.name || caption.language || `字幕 ${caption.id}` }}
                  </option>
                </select>
                <div v-else class="no-captions-hint">
                  <span>📝</span>
                  <span>暫無字幕</span>
                </div>
              </div>
            </div>
            <div class="timeline-content scrollable">
              <div v-if="timelineLoading" class="summary-text">載入中...</div>
              <div v-else-if="timelineError" class="summary-text" style="color: #ef4444">
                {{ timelineError }}
              </div>
              <div v-else-if="timelineData.length === 0" class="summary-text" style="color: #9ca3af">尚無字幕內容</div>
              <div v-else>
                <div
                  v-for="(item, index) in timelineData"
                  :key="index"
                  :class="['timeline-item', { active: activeTimelineIndex === index }]">
                  <div class="timestamp-link" @click="seekToTime(item.time)">
                    <span>⏱️</span>
                    <span>{{ formatTime(item.time) }}</span>
                    <span>{{ item.label }}</span>
                  </div>
                  <p v-if="item.description" class="timeline-description">{{ item.description }}</p>
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
import { usePlansStore } from "@/stores/plans";
import api from "@/api";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { marked } from "marked";

const route = useRoute();
const router = useRouter();
const plansStore = usePlansStore();

// 配置 marked 選項
marked.setOptions({
  breaks: true, // 支援換行
  gfm: true, // 使用 GitHub Flavored Markdown
});

// Refs
const playerWrapperRef = ref(null);
const chatMessagesRef = ref(null);

// Plyr Player
let player = null;
let playerCheckInterval = null;

// 可調整大小的區塊
const playerHeight = ref(0);
const leftSectionWidth = ref(0);
const isResizing = ref(false);
const resizeType = ref(null); // 'vertical' 或 'horizontal'

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

// 字幕相關
const captionsList = ref([]);
const selectedCaption = ref(null);
const captionsContent = ref([]);
const activeTimelineIndex = ref(-1);
const autoFollowTimeline = ref(true); // 預設啟用時間軸跟隨

// AI 總結資料
const aiSummary = ref({
  overview: "載入中...",
  keypoints: [],
});

const isLoadingSummary = ref(false);
const summaryLoadError = ref(null);

// Computed
const progressPercent = computed(() => {
  return (currentTime.value / duration.value) * 100;
});

// 將 markdown 格式的總結內容轉換為 HTML
const summaryHtml = computed(() => {
  if (
    !aiSummary.value.overview ||
    aiSummary.value.overview === "載入中..." ||
    aiSummary.value.overview === "暫無 AI 總結"
  ) {
    return aiSummary.value.overview;
  }

  try {
    return marked.parse(aiSummary.value.overview);
  } catch (error) {
    console.error("解析 markdown 失敗:", error);
    return aiSummary.value.overview;
  }
});

// 初始化
onMounted(async () => {
  // 初始化可調整區塊的大小
  initializeResizableSections();

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
    videoData.value.type = videoId ? "youtube" : "video";

    // 載入時間軸
    loadTimeline();

    // 初始化 Plyr 播放器
    if (videoId || url) {
      await nextTick();
      initPlyrPlayer();
    }
  }

  // 更新使用情況
  await plansStore.updateUsage();
});

onBeforeUnmount(() => {
  // 清理播放器
  if (player) {
    player.destroy();
  }
  if (playerCheckInterval) {
    clearInterval(playerCheckInterval);
  }
  // 清理拖動事件監聽器
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("touchmove", handleResize);
  document.removeEventListener("touchend", stopResize);
  window.removeEventListener("resize", handleWindowResize);
});

// 從 API 獲取媒體詳細資料
const fetchMediaDetails = async (mediaId) => {
  isLoadingMedia.value = true;
  mediaLoadError.value = null;

  try {
    const response = await api.media.getMediaById(mediaId);

    if (response?.id) {
      const media = response;

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

          // 獲取字幕
          await fetchCaptions();

          // 獲取 AI 總結
          await fetchAISummary();

          // 初始化 Plyr 播放器
          await nextTick();
          initPlyrPlayer();
        } else {
          mediaLoadError.value = "無法從 URL 中提取 YouTube 影片 ID";
          showNotification("無法載入影片：缺少有效的 YouTube URL");
        }
      } else {
        // 其他類型的媒體
        // 獲取字幕
        await fetchCaptions();

        // 獲取 AI 總結
        await fetchAISummary();

        await nextTick();
        initPlyrPlayer();
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

// 獲取 AI 總結
const fetchAISummary = async () => {
  if (!videoData.value.mediaId) {
    console.log("無 mediaId，跳過獲取 AI 總結");
    return;
  }

  isLoadingSummary.value = true;
  summaryLoadError.value = null;

  try {
    const response = await api.media.getSummaries(videoData.value.mediaId);

    if (response) {
      // 處理返回的總結數據
      // 假設返回的結構為: {id, locale, text: {short_summary, long_summary: {content, key_points, keywords}}}

      if (response.text?.long_summary) {
        const longSummary = response.text.long_summary;

        // 更新內容摘要 - 顯示 long_summary.content
        aiSummary.value.overview = longSummary.content || "暫無總結內容";

        // 更新重點整理 - 顯示 long_summary.key_points
        aiSummary.value.keypoints = Array.isArray(longSummary.key_points) ? longSummary.key_points : [];

        console.log("AI 總結載入成功");
      } else if (response.text?.short_summary) {
        // 如果沒有 long_summary，使用 short_summary 作為備選
        aiSummary.value.overview = response.text.short_summary;
        aiSummary.value.keypoints = [];
      } else {
        summaryLoadError.value = "總結數據格式不正確";
        aiSummary.value.overview = "總結數據格式不正確";
      }
    }
  } catch (error) {
    console.error("獲取 AI 總結失敗:", error);
    summaryLoadError.value = error.message || "無法載入 AI 總結";
    aiSummary.value.overview = "暫無 AI 總結";
    aiSummary.value.keypoints = [];
    // 不顯示錯誤通知，因為沒有總結是正常的情況
  } finally {
    isLoadingSummary.value = false;
  }
};

// 初始化 Plyr 播放器
const initPlyrPlayer = () => {
  try {
    console.log("初始化 Plyr 播放器");

    // 檢查 DOM 元素是否存在
    const playerElement = document.getElementById("player");
    if (!playerElement) {
      console.error("Player element not found");
      showNotification("無法載入影片：播放器元素不存在");
      return;
    }

    // 如果已經有播放器實例，先銷毀
    if (player) {
      player.destroy();
    }

    // Plyr 配置選項
    const options = {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
      settings: ["quality", "speed"],
      youtube: {
        noCookie: false,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
      },
      ratio: "16:9",
      autoplay: false,
    };

    // 創建 Plyr 實例
    player = new Plyr("#player", options);

    // 綁定事件
    player.on("ready", () => {
      console.log("Plyr 播放器就緒");
      videoLoaded.value = true;
      duration.value = player.duration || 0;
      showNotification("影片載入完成");
    });

    player.on("play", () => {
      isPlaying.value = true;
    });

    player.on("pause", () => {
      isPlaying.value = false;
    });

    player.on("ended", () => {
      isPlaying.value = false;
      showNotification("影片播放完畢");
    });

    player.on("timeupdate", () => {
      currentTime.value = player.currentTime || 0;
      duration.value = player.duration || 0;
      updateActiveTimeline(currentTime.value);
    });

    player.on("error", (event) => {
      console.error("Plyr 播放器錯誤:", event);
      mediaLoadError.value = "播放器發生錯誤";
      showNotification("播放器發生錯誤，請稍後再試");
    });

    console.log("Plyr 播放器已創建:", player);
  } catch (error) {
    console.error("初始化 Plyr 播放器失敗:", error);
    mediaLoadError.value = "初始化播放器失敗";
    showNotification("初始化播放器失敗，請重新整理頁面");
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
  if (!player) return;

  if (isPlaying.value) {
    player.pause();
  } else {
    player.play();
  }
};

const seek = (seconds) => {
  if (!player) return;

  const newTime = Math.max(0, Math.min(duration.value, currentTime.value + seconds));
  player.currentTime = newTime;
};

const seekToTime = (seconds) => {
  if (!player) return;

  player.currentTime = seconds;
  // // 確保聲音開啟
  // if (player.muted) {
  //   player.muted = false;
  //   isMuted.value = false;
  // }
  // 自動播放
  if (!player.playing) {
    player.play();
  }
  showNotification(`已跳轉至 ${formatTime(seconds)}`);
};

const toggleMute = () => {
  if (!player) return;

  player.muted = !player.muted;
  isMuted.value = player.muted;
};

const toggleFullscreen = () => {
  if (player) {
    player.fullscreen.toggle();
  }
};

const handleProgressClick = (e) => {
  if (!player) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = percent * duration.value;
  player.currentTime = newTime;
};

const handleDownload = () => {
  showNotification("下載功能開發中...");
};

const handleShare = () => {
  showNotification("分享連結已複製到剪貼簿");
};

// 將 markdown 轉換為 HTML
const convertMarkdownToHtml = (markdown) => {
  try {
    return marked.parse(markdown);
  } catch (error) {
    console.error("轉換 markdown 失敗:", error);
    return markdown; // 如果轉換失敗，返回原始文字
  }
};

// 聊天功能
const handleChatSubmit = async () => {
  const message = chatInput.value.trim();
  if (!message || isThinking.value) return;

  // 檢查是否有 mediaId
  if (!videoData.value.mediaId) {
    showNotification("無法使用聊天功能：缺少媒體 ID");
    return;
  }

  // 添加使用者訊息
  const userMessage = {
    role: "user",
    content: message,
  };
  chatMessages.value.push(userMessage);

  // 清空輸入框並設置等待狀態
  chatInput.value = "";
  isThinking.value = true;

  // 滾動到底部（顯示使用者訊息）
  await nextTick();
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }

  // 再次滾動以顯示等待泡泡
  await nextTick();
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }

  try {
    // 準備發送給 API 的訊息陣列（包含歷史對話）
    // 注意：發送原始 content（可能是 markdown），而不是已轉換的 HTML
    const messagesToSend = chatMessages.value.map((msg) => ({
      role: msg.role,
      content: msg.rawContent || msg.content, // 優先使用原始內容
    }));

    // 呼叫 API
    const response = await api.media.chat(videoData.value.mediaId, messagesToSend);

    // 添加 AI 回應
    if (response && response.role === "assistant" && response.content) {
      chatMessages.value.push({
        role: "assistant",
        content: convertMarkdownToHtml(response.content), // 轉換 markdown 為 HTML
        rawContent: response.content, // 保存原始內容用於後續發送
      });
    } else {
      // 如果回應格式不正確，顯示錯誤訊息
      chatMessages.value.push({
        role: "assistant",
        content: "抱歉，我無法理解這個回應。請稍後再試。",
        rawContent: "抱歉，我無法理解這個回應。請稍後再試。",
      });
    }
  } catch (error) {
    console.error("聊天 API 請求失敗:", error);

    // 添加錯誤訊息
    chatMessages.value.push({
      role: "assistant",
      content: "抱歉，發生錯誤。請稍後再試。",
      rawContent: "抱歉，發生錯誤。請稍後再試。",
    });

    showNotification("聊天請求失敗，請稍後再試");
  } finally {
    isThinking.value = false;

    // 滾動到底部（顯示 AI 回應）
    await nextTick();
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  }
};

// 獲取字幕列表
const fetchCaptions = async () => {
  if (!videoData.value.mediaId) {
    console.log("無 mediaId，跳過獲取字幕");
    return;
  }

  try {
    const response = await api.media.getCaptions(videoData.value.mediaId);

    // 處理直接回傳陣列的情況
    if (Array.isArray(response)) {
      captionsList.value = response;
    }
    // 處理包含 data 屬性的情況
    else if (response?.data && Array.isArray(response.data)) {
      captionsList.value = response.data;
    }

    // 如果有字幕，預設選擇第一個
    if (captionsList.value.length > 0) {
      const firstCaption = captionsList.value[0];
      selectedCaption.value = firstCaption;
      await fetchCaptionContent(firstCaption.id);
    }
  } catch (error) {
    console.error("獲取字幕列表失敗:", error);
    // 不顯示錯誤通知，因為沒有字幕是正常的情況
  }
};

// 獲取字幕內容
const fetchCaptionContent = async (captionId) => {
  if (!videoData.value.mediaId || !captionId) {
    return;
  }

  timelineLoading.value = true;
  timelineError.value = "";

  try {
    const response = await api.media.getCaptionById(videoData.value.mediaId, captionId);

    if (response) {
      // 將字幕內容轉換為時間軸格式
      captionsContent.value = response;

      // 處理包含 segments 的結構 {id, locale, segments: [{start, end, text}]}
      if (response.segments && Array.isArray(response.segments)) {
        timelineData.value = response.segments.map((segment) => ({
          time: segment.start || 0,
          label: segment.text || "",
          description: "",
        }));
        showNotification("字幕載入成功");
      }
      // 如果是舊的 data 包裝格式
      else if (response?.data?.segments && Array.isArray(response.data.segments)) {
        timelineData.value = response.data.segments.map((segment) => ({
          time: segment.start || 0,
          label: segment.text || "",
          description: "",
        }));
        showNotification("字幕載入成功");
      }
      // 如果是簡單的陣列格式
      else if (Array.isArray(response.data)) {
        timelineData.value = response.data.map((item) => ({
          time: item.start || item.time || 0,
          label: item.text || item.content || "",
          description: item.description || "",
        }));
        showNotification("字幕載入成功");
      }
      // 如果是包含 content 的物件格式（字幕文件內容）
      else if (response.data?.content) {
        parseSubtitles(response.data.content);
        showNotification("字幕載入成功");
      } else {
        timelineError.value = "不支援的字幕格式";
      }
    }
  } catch (error) {
    console.error("獲取字幕內容失敗:", error);
    timelineError.value = "無法載入字幕內容";
  } finally {
    timelineLoading.value = false;
  }
};

// 解析字幕格式（支援 VTT、SRT 等格式）
const parseSubtitles = (content) => {
  try {
    // 簡單的字幕解析，可以根據實際格式調整
    const lines = content.split("\n");
    const subtitles = [];
    let currentSubtitle = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 檢測時間碼格式 (VTT/SRT)
      const timeMatch = trimmedLine.match(
        /(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/
      );

      if (timeMatch) {
        const startTime =
          Number.parseInt(timeMatch[1]) * 3600 + Number.parseInt(timeMatch[2]) * 60 + Number.parseInt(timeMatch[3]);

        currentSubtitle = {
          time: startTime,
          label: "",
          description: "",
        };
      } else if (trimmedLine && currentSubtitle && !trimmedLine.match(/^\d+$/)) {
        // 字幕文字
        if (currentSubtitle.label === "") {
          currentSubtitle.label = trimmedLine;
        } else {
          currentSubtitle.description += (currentSubtitle.description ? " " : "") + trimmedLine;
        }
      } else if (trimmedLine === "" && currentSubtitle) {
        // 空行表示一個字幕結束
        subtitles.push(currentSubtitle);
        currentSubtitle = null;
      }
    }

    if (currentSubtitle) {
      subtitles.push(currentSubtitle);
    }

    timelineData.value = subtitles;
  } catch (error) {
    console.error("解析字幕失敗:", error);
    timelineError.value = "解析字幕格式失敗";
  }
};

// 處理字幕選擇變化
const handleCaptionChange = async () => {
  if (selectedCaption.value && selectedCaption.value.id) {
    activeTimelineIndex.value = -1; // 重置活動索引
    await fetchCaptionContent(selectedCaption.value.id);
  }
};

// 處理跟隨開關切換
const handleFollowToggle = () => {
  autoFollowTimeline.value = !autoFollowTimeline.value;

  if (autoFollowTimeline.value) {
    // 開啟跟隨時，立即更新到當前播放位置
    if (player && currentTime.value > 0) {
      updateActiveTimeline(currentTime.value);
    }
  } else {
    // 關閉跟隨時，清除高亮狀態
    activeTimelineIndex.value = -1;
  }
};

// 更新活動的時間軸項目
const updateActiveTimeline = (time) => {
  // 如果未啟用自動跟隨，則不更新
  if (!autoFollowTimeline.value) {
    return;
  }

  if (!timelineData.value || timelineData.value.length === 0) {
    activeTimelineIndex.value = -1;
    return;
  }

  // 找到當前時間對應的時間軸項目
  let newActiveIndex = -1;
  for (let i = timelineData.value.length - 1; i >= 0; i--) {
    if (time >= timelineData.value[i].time) {
      newActiveIndex = i;
      break;
    }
  }

  // 如果活動項目改變，滾動到可視範圍內
  if (newActiveIndex !== activeTimelineIndex.value && newActiveIndex >= 0) {
    activeTimelineIndex.value = newActiveIndex;

    // 使用 nextTick 確保 DOM 已更新
    nextTick(() => {
      const activeElement = document.querySelector(".timeline-item.active");
      const scrollContainer = document.querySelector(".timeline-content.scrollable");

      if (activeElement && scrollContainer) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });
  }
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

// 可調整大小功能
const initializeResizableSections = () => {
  nextTick(() => {
    // 獲取視窗尺寸
    const mainContent = document.querySelector(".main-content");
    if (!mainContent) return;

    const contentHeight = mainContent.clientHeight;
    const contentWidth = mainContent.clientWidth;

    // 設置初始高度 (播放器佔 60%，聊天佔 40%)
    playerHeight.value = Math.floor(contentHeight * 0.6);

    // 設置初始寬度 (左側佔 70%，右側佔 30%)
    leftSectionWidth.value = Math.floor(contentWidth * 0.7);

    // 監聽視窗大小變化
    window.addEventListener("resize", handleWindowResize);
  });
};

const handleWindowResize = () => {
  const mainContent = document.querySelector(".main-content");
  if (!mainContent) return;

  const contentHeight = mainContent.clientHeight;
  const contentWidth = mainContent.clientWidth;

  // 確保尺寸在合理範圍內
  if (playerHeight.value > contentHeight - 200) {
    playerHeight.value = contentHeight - 200;
  }
  if (leftSectionWidth.value > contentWidth - 300) {
    leftSectionWidth.value = contentWidth - 300;
  }
};

// 開始垂直調整大小 (播放器與聊天區域)
const startVerticalResize = (e) => {
  e.preventDefault();
  isResizing.value = true;
  resizeType.value = "vertical";

  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
  document.addEventListener("touchmove", handleResize);
  document.addEventListener("touchend", stopResize);

  // 添加 body 樣式防止文字選取
  document.body.style.userSelect = "none";
  document.body.style.cursor = "ns-resize";
};

// 開始水平調整大小 (左右區域)
const startHorizontalResize = (e) => {
  e.preventDefault();
  isResizing.value = true;
  resizeType.value = "horizontal";

  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
  document.addEventListener("touchmove", handleResize);
  document.addEventListener("touchend", stopResize);

  // 添加 body 樣式防止文字選取
  document.body.style.userSelect = "none";
  document.body.style.cursor = "ew-resize";
};

// 處理調整大小
const handleResize = (e) => {
  if (!isResizing.value) return;

  const mainContent = document.querySelector(".main-content");
  if (!mainContent) return;

  if (resizeType.value === "vertical") {
    // 垂直調整 (播放器與聊天區域)
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const header = document.querySelector(".header");
    const headerHeight = header ? header.clientHeight : 60;
    const newHeight = clientY - headerHeight;
    const contentHeight = mainContent.clientHeight;

    // 限制最小和最大高度
    const minHeight = 200;
    const maxHeight = contentHeight - 200;

    if (newHeight >= minHeight && newHeight <= maxHeight) {
      playerHeight.value = newHeight;
    }
  } else if (resizeType.value === "horizontal") {
    // 水平調整 (左右區域)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const contentWidth = mainContent.clientWidth;

    // 限制最小和最大寬度
    const minWidth = 400;
    const maxWidth = contentWidth - 300;

    if (clientX >= minWidth && clientX <= maxWidth) {
      leftSectionWidth.value = clientX;
    }
  }
};

// 停止調整大小
const stopResize = () => {
  isResizing.value = false;
  resizeType.value = null;

  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("touchmove", handleResize);
  document.removeEventListener("touchend", stopResize);

  // 恢復 body 樣式
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* 拖動條 */
.resizer {
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
  z-index: 100;
  position: relative;
}

.resizer:hover {
  background: rgba(102, 126, 234, 0.3);
}

.resizer:active {
  background: rgba(102, 126, 234, 0.6);
}

/* 水平拖動條 (播放器與聊天區域之間) */
.resizer-horizontal {
  height: 4px;
  cursor: ns-resize;
  flex-shrink: 0;
}

.resizer-horizontal::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  transition: all 0.2s ease;
}

.resizer-horizontal:hover::before {
  width: 60px;
  height: 4px;
  background: rgba(102, 126, 234, 0.8);
}

/* 垂直拖動條 (左右區域之間) */
.resizer-vertical {
  width: 4px;
  cursor: ew-resize;
  flex-shrink: 0;
}

.resizer-vertical::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  transition: all 0.2s ease;
}

.resizer-vertical:hover::before {
  width: 4px;
  height: 60px;
  background: rgba(102, 126, 234, 0.8);
}

/* 播放器區域 */
.player-wrapper {
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.plyr-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plyr-container :deep(.plyr) {
  width: 100%;
  height: 100%;
}

.plyr-container :deep(.plyr__video-wrapper) {
  background: #000;
}

.player-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #666;
}

.player-placeholder.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 10;
}

.player-placeholder-icon {
  font-size: 80px;
  opacity: 0.5;
}

.player-placeholder-text {
  font-size: 16px;
  color: #999;
}

/* 聊天區域 */
.chat-wrapper {
  flex: 1;
  background: #1a1d24;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow: hidden;
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

/* 聊天訊息中的 markdown 樣式 */
.message-content.markdown-content :deep(p) {
  margin-bottom: 8px;
}

.message-content.markdown-content :deep(p):last-child {
  margin-bottom: 0;
}

.message-content.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  color: #a5b4ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  font-size: 13px;
}

.message-content.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  margin: 8px 0;
  overflow-x: auto;
}

.message-content.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #d1d5db;
}

.message-content.markdown-content :deep(strong) {
  font-weight: 600;
  color: #fff;
}

.message-content.markdown-content :deep(em) {
  font-style: italic;
}

.message-content.markdown-content :deep(ul),
.message-content.markdown-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-content.markdown-content :deep(li) {
  margin-bottom: 4px;
}

.message-content.markdown-content :deep(a) {
  color: #8b9bff;
  text-decoration: underline;
  transition: color 0.2s;
}

.message-content.markdown-content :deep(a:hover) {
  color: #a5b4ff;
}

.message-content.markdown-content :deep(blockquote) {
  border-left: 3px solid rgba(255, 255, 255, 0.3);
  padding-left: 12px;
  margin: 8px 0;
  font-style: italic;
  opacity: 0.9;
}

.message-content.markdown-content :deep(h1),
.message-content.markdown-content :deep(h2),
.message-content.markdown-content :deep(h3),
.message-content.markdown-content :deep(h4),
.message-content.markdown-content :deep(h5),
.message-content.markdown-content :deep(h6) {
  font-weight: 600;
  margin-top: 12px;
  margin-bottom: 8px;
  color: #fff;
}

.message-content.markdown-content :deep(h1) {
  font-size: 18px;
}

.message-content.markdown-content :deep(h2) {
  font-size: 16px;
}

.message-content.markdown-content :deep(h3) {
  font-size: 15px;
}

.message-content.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 12px 0;
}

/* 使用者訊息中的 markdown 樣式（顏色調整）*/
.message.user .message-content.markdown-content :deep(code) {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.message.user .message-content.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.message.user .message-content.markdown-content :deep(a) {
  color: #fff;
  font-weight: 600;
}

.message.user .message-content.markdown-content :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.5);
}

/* 等待泡泡樣式 */
.thinking-bubble {
  background: rgba(255, 255, 255, 0.08);
  padding: 16px 20px;
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 6px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite;
  opacity: 0.6;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
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

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.02);
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
  flex: 1;
  background: #1a1d24;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 300px;
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

/* 時間軸 Tab 特殊布局 */
.timeline-tab {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
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
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px 15px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 12px;
  background: #1a1d24;
  z-index: 10;
}

.timeline-header-bar.fixed-header {
  position: sticky;
  top: 0;
  flex-shrink: 0;
}

/* 跟隨按鈕 */
.follow-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #9ca3af;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;
}

.follow-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.4);
  color: #d1d5db;
  transform: translateY(-1px);
}

.follow-toggle-btn.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-color: rgba(102, 126, 234, 0.6);
  color: #8b9bff;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.follow-toggle-btn.active:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-color: rgba(102, 126, 234, 0.8);
  color: #a5b4ff;
}

.follow-icon {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.timeline-selector-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.timeline-content {
  flex: 1;
}

.timeline-content.scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 20px 25px;
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

/* Markdown 內容樣式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  color: #fff;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.markdown-content :deep(h1) {
  font-size: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.3);
  padding-bottom: 8px;
}

.markdown-content :deep(h2) {
  font-size: 18px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  padding-bottom: 6px;
}

.markdown-content :deep(h3) {
  font-size: 16px;
  color: #8b9bff;
}

.markdown-content :deep(h4) {
  font-size: 15px;
}

.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-size: 14px;
}

.markdown-content :deep(h1):first-child,
.markdown-content :deep(h2):first-child,
.markdown-content :deep(h3):first-child {
  margin-top: 0;
}

.markdown-content :deep(p) {
  margin-bottom: 12px;
  line-height: 1.7;
}

.markdown-content :deep(p):last-child {
  margin-bottom: 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.markdown-content :deep(li) {
  margin-bottom: 8px;
  line-height: 1.6;
}

.markdown-content :deep(strong) {
  color: #fff;
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
  color: #a5b4ff;
}

.markdown-content :deep(code) {
  background: rgba(102, 126, 234, 0.15);
  color: #8b9bff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  font-size: 13px;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #d1d5db;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid rgba(102, 126, 234, 0.5);
  padding-left: 16px;
  margin: 12px 0;
  color: #9ca3af;
  font-style: italic;
}

.markdown-content :deep(a) {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.markdown-content :deep(a:hover) {
  color: #8b9bff;
  text-decoration: underline;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 20px 0;
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

/* 字幕選擇器 */
.caption-selector {
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
  min-width: 150px;
}

.caption-selector:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(102, 126, 234, 0.5);
}

.caption-selector:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.caption-selector option {
  background: #1a1d24;
  color: #fff;
  padding: 8px;
}

/* 無字幕提示 */
.no-captions-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
}

/* 時間軸語言選擇器（備用，目前已被字幕選擇器取代）*/
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
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.timeline-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

/* 活動的時間軸項目 */
.timeline-item.active .timestamp-link {
  background: rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
}

.timeline-item.active .timestamp-link span:nth-child(2) {
  color: #8b9bff;
  font-weight: 700;
}

.timeline-item.active .timestamp-link span:nth-child(3) {
  color: #fff;
  font-weight: 600;
}

.timestamp-link {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  color: #d1d5db;
  margin-bottom: 6px;
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
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .left-section {
    width: 100% !important;
  }

  .right-section {
    display: none;
  }

  .resizer-vertical {
    display: none;
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
