const { ipcRenderer } = require("electron");

// 資料儲存
let currentSource = "youtube";
let subscriptionsData = {
  youtube: [],
  spotify: [],
  firstory: [],
  podcast: [],
  soundcloud: [],
  vimeo: [],
};

// 模擬影片資料
let videosData = {
  youtube: [],
  spotify: [],
  firstory: [],
  podcast: [],
  soundcloud: [],
  vimeo: [],
};

// 影音來源設定
const sourceConfig = {
  youtube: {
    name: "YouTube",
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    iconLarge:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    color: "#ff0000",
    subtitle: "管理您的 YouTube 訂閱頻道",
    emptyIcon: "📺",
    contentType: "影片",
  },
  spotify: {
    name: "Spotify",
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    iconLarge:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    color: "#1db954",
    subtitle: "管理您的 Spotify 訂閱清單",
    emptyIcon: "🎵",
    contentType: "音樂",
  },
  firstory: {
    name: "Firstory",
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
    iconLarge:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
    color: "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
    subtitle: "管理您的 Firstory 訂閱節目",
    emptyIcon: "🎙️",
    contentType: "節目",
  },
  podcast: {
    name: "Apple Podcasts",
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/><path d="M15 16.5A5.48 5.48 0 0 1 12 18a5.48 5.48 0 0 1-3-1.5V21h6z"/></svg>',
    iconLarge:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/><path d="M15 16.5A5.48 5.48 0 0 1 12 18a5.48 5.48 0 0 1-3-1.5V21h6z"/></svg>',
    color: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
    subtitle: "管理您的 Apple Podcasts 訂閱",
    emptyIcon: "🎧",
    contentType: "播客",
  },
  soundcloud: {
    name: "SoundCloud",
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.051 0-.09.04-.099.099L0 14.479l.176 1.373c0 .058.048.099.099.099.05 0 .09-.04.099-.099l.215-1.373-.215-1.326c-.009-.059-.05-.1-.099-.1zm1.83-.576c-.05 0-.1.046-.107.097l-.255 2.929.255 2.843c.007.055.057.1.107.1.057 0 .099-.045.107-.1l.282-2.843-.282-2.929c-.008-.051-.05-.097-.107-.097zm.94-.156c-.06 0-.106.046-.106.098l-.231 3.085.231 2.99c0 .051.046.099.106.099.059 0 .105-.048.105-.1l.256-2.989-.256-3.085c0-.052-.046-.098-.105-.098zm.938-.168c-.065 0-.106.052-.106.106l-.213 3.253.213 3.045c0 .057.041.106.106.106.062 0 .107-.049.107-.106l.238-3.045-.238-3.253c0-.054-.045-.106-.107-.106zm.955-.165c-.07 0-.12.052-.12.116l-.193 3.418.193 3.22c0 .065.05.116.12.116.07 0 .12-.051.12-.116l.22-3.22-.22-3.418c0-.064-.05-.116-.12-.116zm.954-.165c-.074 0-.125.053-.125.12l-.176 3.583.176 3.198c0 .068.051.12.125.12.073 0 .125-.052.125-.12l.194-3.198-.194-3.583c0-.067-.052-.12-.125-.12zm.964-.156c-.078 0-.135.053-.135.125l-.157 3.739.157 3.182c0 .071.057.125.135.125.078 0 .139-.054.139-.125l.174-3.182-.174-3.739c0-.072-.061-.125-.139-.125zm.955-.165c-.086 0-.145.056-.145.128l-.139 3.904.139 3.164c0 .075.059.128.145.128.084 0 .143-.053.143-.128l.155-3.164-.155-3.904c0-.072-.059-.128-.143-.128zm1.006-.135c-.09 0-.153.057-.153.134l-.12 4.039.12 3.096c0 .077.063.135.153.135.087 0 .151-.058.151-.135l.133-3.096-.133-4.039c0-.077-.064-.134-.151-.134zm.99-.155c-.094 0-.16.061-.16.14l-.108 4.194.108 3.072c0 .08.066.14.16.14.094 0 .161-.06.161-.14l.117-3.072-.117-4.194c0-.079-.067-.14-.161-.14z"/><path d="M23.498 13.291c-.196 0-.387.019-.568.054a5.449 5.449 0 0 0-5.282-4.14c-.095 0-.168.072-.168.166v8.385c0 .088.065.162.158.167h5.845A2.502 2.502 0 0 0 24 15.791a2.502 2.502 0 0 0-2.502-2.5"/></svg>',
    iconLarge:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.051 0-.09.04-.099.099L0 14.479l.176 1.373c0 .058.048.099.099.099.05 0 .09-.04.099-.099l.215-1.373-.215-1.326c-.009-.059-.05-.1-.099-.1zm1.83-.576c-.05 0-.1.046-.107.097l-.255 2.929.255 2.843c.007.055.057.1.107.1.057 0 .099-.045.107-.1l.282-2.843-.282-2.929c-.008-.051-.05-.097-.107-.097zm.94-.156c-.06 0-.106.046-.106.098l-.231 3.085.231 2.99c0 .051.046.099.106.099.059 0 .105-.048.105-.1l.256-2.989-.256-3.085c0-.052-.046-.098-.105-.098zm.938-.168c-.065 0-.106.052-.106.106l-.213 3.253.213 3.045c0 .057.041.106.106.106.062 0 .107-.049.107-.106l.238-3.045-.238-3.253c0-.054-.045-.106-.107-.106zm.955-.165c-.07 0-.12.052-.12.116l-.193 3.418.193 3.22c0 .065.05.116.12.116.07 0 .12-.051.12-.116l.22-3.22-.22-3.418c0-.064-.05-.116-.12-.116zm.954-.165c-.074 0-.125.053-.125.12l-.176 3.583.176 3.198c0 .068.051.12.125.12.073 0 .125-.052.125-.12l.194-3.198-.194-3.583c0-.067-.052-.12-.125-.12zm.964-.156c-.078 0-.135.053-.135.125l-.157 3.739.157 3.182c0 .071.057.125.135.125.078 0 .139-.054.139-.125l.174-3.182-.174-3.739c0-.072-.061-.125-.139-.125zm.955-.165c-.086 0-.145.056-.145.128l-.139 3.904.139 3.164c0 .075.059.128.145.128.084 0 .143-.053.143-.128l.155-3.164-.155-3.904c0-.072-.059-.128-.143-.128zm1.006-.135c-.09 0-.153.057-.153.134l-.12 4.039.12 3.096c0 .077.063.135.153.135.087 0 .151-.058.151-.135l.133-3.096-.133-4.039c0-.077-.064-.134-.151-.134zm.99-.155c-.094 0-.16.061-.16.14l-.108 4.194.108 3.072c0 .08.066.14.16.14.094 0 .161-.06.161-.14l.117-3.072-.117-4.194c0-.079-.067-.14-.161-.14z"/><path d="M23.498 13.291c-.196 0-.387.019-.568.054a5.449 5.449 0 0 0-5.282-4.14c-.095 0-.168.072-.168.166v8.385c0 .088.065.162.158.167h5.845A2.502 2.502 0 0 0 24 15.791a2.502 2.502 0 0 0-2.502-2.5"/></svg>',
    color: "#ff5500",
    subtitle: "管理您的 SoundCloud 訂閱",
    emptyIcon: "🔊",
    contentType: "音訊",
  },
  vimeo: {
    name: "Vimeo",
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/></svg>',
    iconLarge:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/></svg>',
    color: "#1ab7ea",
    subtitle: "管理您的 Vimeo 訂閱頻道",
    emptyIcon: "🎥",
    contentType: "影片",
  },
};

// DOM 元素
const sourceItems = document.querySelectorAll(".source-item");
const contentIcon = document.getElementById("content-icon");
const contentTitle = document.getElementById("content-title");
const contentSubtitle = document.getElementById("content-subtitle");
const manageBtn = document.getElementById("manage-btn");
const manageModal = document.getElementById("manage-modal");
const closeModal = document.getElementById("close-modal");
const subscriptionForm = document.getElementById("subscription-form");
const subscriptionsList = document.getElementById("subscriptions-list");
const videosGrid = document.getElementById("videos-grid");
const emptyState = document.getElementById("empty-state");
const addSubscriptionBtnEmpty = document.getElementById("add-subscription-btn-empty");
const modalSourceName = document.getElementById("modal-source-name");
const cancelAddBtn = document.getElementById("cancel-add");
const logoutBtn = document.getElementById("logout-btn");
const filterBtns = document.querySelectorAll(".filter-btn");

// 初始化
function init() {
  // 從 localStorage 載入資料
  loadData();

  // 更新界面
  updateSourceCounts();
  renderContent();

  // 綁定事件
  bindEvents();
}

// 綁定事件
function bindEvents() {
  // 影音來源切換
  sourceItems.forEach((item) => {
    item.addEventListener("click", () => {
      const source = item.dataset.source;
      switchSource(source);
    });
  });

  // 管理訂閱按鈕
  manageBtn.addEventListener("click", openManageModal);
  addSubscriptionBtnEmpty.addEventListener("click", openManageModal);

  // 關閉模態視窗
  closeModal.addEventListener("click", closeManageModal);
  cancelAddBtn.addEventListener("click", () => {
    subscriptionForm.reset();
  });

  // 點擊模態視窗外部關閉
  manageModal.addEventListener("click", (e) => {
    if (e.target === manageModal) {
      closeManageModal();
    }
  });

  // 新增訂閱表單提交
  subscriptionForm.addEventListener("submit", handleAddSubscription);

  // 登出按鈕
  logoutBtn.addEventListener("click", handleLogout);

  // 過濾按鈕
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      // 這裡可以加入過濾邏輯
      renderVideos();
    });
  });
}

// 切換影音來源
function switchSource(source) {
  currentSource = source;

  // 更新側邊欄選中狀態
  sourceItems.forEach((item) => {
    if (item.dataset.source === source) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // 更新內容區域
  renderContent();
}

// 渲染內容區域
function renderContent() {
  const config = sourceConfig[currentSource];

  // 更新標題區域
  contentIcon.innerHTML = config.iconLarge;
  contentIcon.style.background = config.color;
  contentTitle.textContent = config.name;
  contentSubtitle.textContent = config.subtitle;

  // 更新模態視窗標題
  modalSourceName.textContent = config.name;

  // 渲染影片/內容
  renderVideos();

  // 更新空狀態圖示
  const emptyIcon = document.querySelector(".empty-icon");
  if (emptyIcon) {
    emptyIcon.textContent = config.emptyIcon;
  }
}

// 渲染影片/內容
function renderVideos() {
  const subscriptions = subscriptionsData[currentSource];
  const videos = videosData[currentSource];

  if (subscriptions.length === 0) {
    // 顯示空狀態
    emptyState.style.display = "block";
    videosGrid.style.display = "none";
  } else if (videos.length === 0) {
    // 有訂閱但無內容
    emptyState.style.display = "block";
    videosGrid.style.display = "none";
    const emptyStateH3 = emptyState.querySelector("h3");
    const emptyStateP = emptyState.querySelector("p");
    emptyStateH3.textContent = "暫無新內容";
    emptyStateP.textContent = "您訂閱的頻道尚未有新的內容發佈";
  } else {
    // 顯示內容
    emptyState.style.display = "none";
    videosGrid.style.display = "grid";
    renderVideoCards(videos);
  }
}

// 渲染影片卡片
function renderVideoCards(videos) {
  const config = sourceConfig[currentSource];

  videosGrid.innerHTML = videos
    .map(
      (video) => `
    <div class="video-card" onclick="openVideo('${video.url}')">
      <div class="video-thumbnail" style="background: ${config.color}">
        ${config.iconLarge}
        ${video.duration ? `<span class="video-duration">${video.duration}</span>` : ""}
      </div>
      <div class="video-info">
        <div class="video-title">${video.title}</div>
        <div class="channel-info">
          <div class="channel-avatar">${video.channel.charAt(0).toUpperCase()}</div>
          <div class="channel-name">${video.channel}</div>
        </div>
        <div class="video-meta">
          <span>${video.views || "0"} 次觀看</span>
          <span>${video.date}</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// 開啟管理訂閱模態視窗
function openManageModal() {
  manageModal.classList.add("show");
  renderSubscriptionsList();
}

// 關閉管理訂閱模態視窗
function closeManageModal() {
  manageModal.classList.remove("show");
  subscriptionForm.reset();
}

// 渲染訂閱列表
function renderSubscriptionsList() {
  const subscriptions = subscriptionsData[currentSource];

  if (subscriptions.length === 0) {
    subscriptionsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px">尚無訂閱</p>';
  } else {
    subscriptionsList.innerHTML = subscriptions
      .map(
        (sub, index) => `
      <div class="subscription-item">
        <div class="subscription-avatar">${sub.name.charAt(0).toUpperCase()}</div>
        <div class="subscription-info">
          <div class="subscription-name">${sub.name}</div>
          <div class="subscription-url">${sub.url}</div>
        </div>
        <button class="delete-subscription-btn" onclick="deleteSubscription(${index})">
          刪除
        </button>
      </div>
    `
      )
      .join("");
  }
}

// 新增訂閱
function handleAddSubscription(e) {
  e.preventDefault();

  const name = document.getElementById("channel-name").value.trim();
  const url = document.getElementById("channel-url").value.trim();

  if (!name || !url) {
    alert("請填寫所有欄位");
    return;
  }

  // 檢查是否已存在
  const exists = subscriptionsData[currentSource].some((sub) => sub.url === url);
  if (exists) {
    alert("此頻道已在訂閱列表中");
    return;
  }

  // 新增訂閱
  subscriptionsData[currentSource].push({
    name,
    url,
    dateAdded: new Date().toISOString(),
  });

  // 生成一些模擬影片資料
  generateMockVideos(name);

  // 儲存資料
  saveData();

  // 更新界面
  updateSourceCounts();
  renderSubscriptionsList();
  renderContent();

  // 清空表單
  subscriptionForm.reset();

  // 顯示成功訊息
  showNotification("訂閱新增成功！");
}

// 刪除訂閱
function deleteSubscription(index) {
  const subscription = subscriptionsData[currentSource][index];

  if (confirm(`確定要取消訂閱「${subscription.name}」嗎？`)) {
    // 刪除訂閱
    subscriptionsData[currentSource].splice(index, 1);

    // 刪除相關影片
    videosData[currentSource] = videosData[currentSource].filter((video) => video.channel !== subscription.name);

    // 儲存資料
    saveData();

    // 更新界面
    updateSourceCounts();
    renderSubscriptionsList();
    renderContent();

    // 顯示成功訊息
    showNotification("已取消訂閱");
  }
}

// 生成模擬影片資料
function generateMockVideos(channelName) {
  const config = sourceConfig[currentSource];
  const titles = [
    `${channelName} 的最新${config.contentType}`,
    `精彩內容：${channelName}`,
    `${channelName} 精選集`,
    `不容錯過的${config.contentType}`,
    `${channelName} 熱門${config.contentType}`,
  ];

  const count = Math.floor(Math.random() * 3) + 2; // 2-4 個影片

  for (let i = 0; i < count; i++) {
    videosData[currentSource].push({
      title: titles[Math.floor(Math.random() * titles.length)],
      channel: channelName,
      url: "#",
      duration: `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      views: `${Math.floor(Math.random() * 10000) + 1000}`,
      date: getRandomDate(),
    });
  }
}

// 獲取隨機日期
function getRandomDate() {
  const dates = ["1 小時前", "3 小時前", "今天", "昨天", "2 天前", "1 週前"];
  return dates[Math.floor(Math.random() * dates.length)];
}

// 更新影音來源計數
function updateSourceCounts() {
  sourceItems.forEach((item) => {
    const source = item.dataset.source;
    const count = subscriptionsData[source].length;
    const videoCount = videosData[source].length;

    const countElement = item.querySelector(".source-count");
    const badge = item.querySelector(".source-badge");

    countElement.textContent = `${count} 個訂閱`;
    badge.textContent = videoCount;
  });
}

// 開啟影片
function openVideo(url) {
  console.log("開啟影片:", url);
  // 這裡可以整合實際的影片播放功能
  alert("影片功能開發中...");
}

// 顯示通知
function showNotification(message) {
  // 簡單的通知實作（可以使用更好的通知庫）
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 30px;
    background: #667eea;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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

// 儲存資料到 localStorage
function saveData() {
  localStorage.setItem("subscriptionsData", JSON.stringify(subscriptionsData));
  localStorage.setItem("videosData", JSON.stringify(videosData));
}

// 從 localStorage 載入資料
function loadData() {
  const savedSubscriptions = localStorage.getItem("subscriptionsData");
  const savedVideos = localStorage.getItem("videosData");

  if (savedSubscriptions) {
    subscriptionsData = JSON.parse(savedSubscriptions);
  }

  if (savedVideos) {
    videosData = JSON.parse(savedVideos);
  }
}

// 登出
function handleLogout() {
  if (confirm("確定要登出嗎？")) {
    // 清除資料（可選）
    // localStorage.clear();

    // 關閉當前視窗
    window.close();
  }
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

// 頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", init);

// 讓函數在全局可用（用於 onclick）
window.openVideo = openVideo;
window.deleteSubscription = deleteSubscription;
