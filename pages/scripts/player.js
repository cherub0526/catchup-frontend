// 模擬影片資料
let videoData = {
  title: "範例影片",
  duration: 600, // 10分鐘
  currentTime: 0,
  isPlaying: false,
};

// 時間軸語言狀態
let currentTimelineLanguage = "zh-TW";
let timelineData = [];

// AI 總結資料
const aiSummary = {
  overview:
    "這是一部關於 Web 開發的教學影片，介紹了現代前端框架的核心概念和最佳實踐。影片涵蓋了組件化開發、狀態管理、路由設計等重要主題，適合有一定基礎的開發者學習。",
  keypoints: [
    "介紹了現代前端框架的核心概念",
    "詳細講解了組件化開發的優勢與實踐",
    "深入探討了狀態管理的不同解決方案",
    "展示了實際專案中的最佳實踐案例",
    "提供了性能優化的實用技巧",
  ],
};

// DOM 元素
const backBtn = document.getElementById("back-btn");
const videoTitle = document.getElementById("video-title");
const playerWrapper = document.getElementById("player-wrapper");
const playBtn = document.getElementById("play-btn");
const rewindBtn = document.getElementById("rewind-btn");
const forwardBtn = document.getElementById("forward-btn");
const volumeBtn = document.getElementById("volume-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const progressBar = document.getElementById("progress-bar");
const progressFilled = document.getElementById("progress-filled");
const timeDisplay = document.getElementById("time-display");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const downloadBtn = document.getElementById("download-btn");
const shareBtn = document.getElementById("share-btn");

// 總結元素
const summaryOverview = document.getElementById("summary-overview");
const summaryKeypoints = document.getElementById("summary-keypoints");
const summaryTimeline = document.getElementById("summary-timeline");
const timelineLanguageSelect = document.getElementById("timeline-language");

// 初始化
function init() {
  // 從 URL 參數獲取影片資訊
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get("title") || "範例影片";

  videoData.title = title;
  videoTitle.textContent = title;

  // 載入 AI 總結
  loadAISummary();

  // 載入時間軸
  loadTimeline(currentTimelineLanguage);

  // 綁定事件
  bindEvents();

  // 模擬影片載入完成
  setTimeout(() => {
    const placeholder = document.querySelector(".player-placeholder");
    if (placeholder) {
      placeholder.innerHTML = `
        <video class="video-player" id="video-element" controls>
          <source src="" type="video/mp4">
          您的瀏覽器不支援影片播放。
        </video>
      `;
    }
  }, 1000);
}

// 綁定事件
function bindEvents() {
  // 返回按鈕
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // 使用 history.back() 或直接導航
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "./index.html";
      }
    });
  }

  // Tab 切換
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // 播放控制
  if (playBtn) playBtn.addEventListener("click", togglePlay);
  if (rewindBtn) rewindBtn.addEventListener("click", () => seek(-10));
  if (forwardBtn) forwardBtn.addEventListener("click", () => seek(10));
  if (volumeBtn) volumeBtn.addEventListener("click", toggleMute);
  if (fullscreenBtn) fullscreenBtn.addEventListener("click", toggleFullscreen);

  // 進度條
  if (progressBar) progressBar.addEventListener("click", handleProgressClick);

  // 聊天
  if (chatForm) chatForm.addEventListener("submit", handleChatSubmit);

  // 下載和分享
  if (downloadBtn) downloadBtn.addEventListener("click", handleDownload);
  if (shareBtn) shareBtn.addEventListener("click", handleShare);

  // 時間軸語言切換
  if (timelineLanguageSelect) {
    timelineLanguageSelect.addEventListener("change", (e) => {
      currentTimelineLanguage = e.target.value;
      loadTimeline(currentTimelineLanguage);
    });
  }

  // 模擬播放進度
  setInterval(updateProgress, 1000);
}

// Tab 切換功能
function switchTab(tabName) {
  // 移除所有按鈕的 active 狀態
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => btn.classList.remove("active"));

  // 移除所有內容的 active 狀態
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => content.classList.remove("active"));

  // 啟動選中的按鈕和內容
  const activeButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  const activeContent = document.getElementById(`${tabName}-tab`);

  if (activeButton) activeButton.classList.add("active");
  if (activeContent) activeContent.classList.add("active");
}

// 載入 AI 總結
function loadAISummary() {
  // 載入摘要
  if (summaryOverview) {
    summaryOverview.textContent = aiSummary.overview;
  }

  // 載入重點
  if (summaryKeypoints) {
    summaryKeypoints.innerHTML = aiSummary.keypoints.map((point) => `<li>${point}</li>`).join("");
  }
}

// 載入時間軸
async function loadTimeline(language) {
  if (!summaryTimeline) return;

  try {
    summaryTimeline.innerHTML = '<p class="summary-text">載入中...</p>';

    const response = await fetch(`./timelines/${language}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load timeline for ${language}`);
    }

    timelineData = await response.json();
    renderTimeline();
  } catch (error) {
    console.error("Error loading timeline:", error);
    summaryTimeline.innerHTML = '<p class="summary-text" style="color: #ef4444;">無法載入時間軸</p>';
  }
}

// 渲染時間軸
function renderTimeline() {
  if (!summaryTimeline || !timelineData.length) return;

  summaryTimeline.innerHTML = timelineData
    .map(
      (item) => `
    <div class="timeline-item">
      <div class="timestamp-link" onclick="seekToTime(${item.time})">
        <span>⏱️</span>
        <span>${formatTime(item.time)}</span>
        <span> - ${item.label}</span>
      </div>
      <p class="timeline-description">${item.description}</p>
    </div>
  `
    )
    .join("");
}

// 播放/暫停
function togglePlay() {
  videoData.isPlaying = !videoData.isPlaying;
  playBtn.textContent = videoData.isPlaying ? "⏸️" : "▶️";
}

// 跳轉
function seek(seconds) {
  videoData.currentTime = Math.max(0, Math.min(videoData.duration, videoData.currentTime + seconds));
  updateProgress();
}

// 跳轉到指定時間
function seekToTime(seconds) {
  videoData.currentTime = seconds;
  updateProgress();
  showNotification(`已跳轉至 ${formatTime(seconds)}`);
}

// 靜音切換
function toggleMute() {
  volumeBtn.textContent = volumeBtn.textContent === "🔊" ? "🔇" : "🔊";
}

// 全螢幕切換
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    playerWrapper.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// 進度條點擊
function handleProgressClick(e) {
  const rect = progressBar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  videoData.currentTime = percent * videoData.duration;
  updateProgress();
}

// 更新進度
function updateProgress() {
  if (videoData.isPlaying) {
    videoData.currentTime = Math.min(videoData.currentTime + 1, videoData.duration);
  }

  const percent = (videoData.currentTime / videoData.duration) * 100;
  progressFilled.style.width = `${percent}%`;
  timeDisplay.textContent = `${formatTime(videoData.currentTime)} / ${formatTime(videoData.duration)}`;
}

// 處理聊天提交
async function handleChatSubmit(e) {
  e.preventDefault();

  const message = chatInput.value.trim();
  if (!message) return;

  // 顯示使用者訊息
  addMessage(message, "user");

  // 清空輸入框
  chatInput.value = "";

  // 禁用發送按鈕
  sendBtn.disabled = true;
  sendBtn.textContent = "思考中...";

  // 模擬 AI 回應
  setTimeout(() => {
    const response = generateAIResponse(message);
    addMessage(response, "ai");

    // 恢復發送按鈕
    sendBtn.disabled = false;
    sendBtn.textContent = "發送";
  }, 1500);
}

// 新增訊息
function addMessage(text, type) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = type === "user" ? "👤" : "🤖";

  const content = document.createElement("div");
  content.className = "message-content";
  content.innerHTML = text;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 生成 AI 回應
function generateAIResponse(question) {
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
}

// 下載
function handleDownload() {
  showNotification("下載功能開發中...");
}

// 分享
function handleShare() {
  showNotification("分享連結已複製到剪貼簿");
}

// 顯示通知
function showNotification(message) {
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
}

// 格式化時間
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// 動畫樣式
const style = document.createElement("style");
style.textContent = `
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
`;
document.head.appendChild(style);

// 讓函數在全局可用
window.seekToTime = seekToTime;

// 頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", init);
