<template>
  <div class="dashboard-container">
    <!-- 頂部導航欄 -->
    <header class="header">
      <div class="header-left">
        <span class="app-logo">🎬</span>
        <h1 class="app-title">Video Assistant</h1>
      </div>
      <div class="header-right">
        <div class="user-profile" @click="openSettings">
          <div class="user-avatar">{{ userInitial }}</div>
          <span class="user-name" id="user-name">{{ userName }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">登出</button>
      </div>
    </header>

    <!-- 主要內容區域 -->
    <div class="main-content">
      <!-- 左側邊欄 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title">影音來源</div>
        </div>
        <ul class="source-list">
          <li
            v-for="source in sources"
            :key="source.id"
            class="source-item"
            :class="{ active: currentSource === source.id }"
            @click="switchSource(source.id)">
            <div class="source-icon" :style="{ background: source.color }">
              <div v-html="source.icon"></div>
            </div>
            <div class="source-info">
              <div class="source-name">{{ source.name }}</div>
              <div class="source-count">{{ subscriptionsData[source.id].length }} 個訂閱</div>
            </div>
            <span class="source-badge">{{ videosData[source.id].length }}</span>
          </li>
        </ul>
      </aside>

      <!-- 內容區域 -->
      <main class="content-area">
        <div class="content-header">
          <div class="content-header-top">
            <div class="content-title-wrapper">
              <div class="content-icon" :style="{ background: currentSourceConfig.color }">
                <div v-html="currentSourceConfig.iconLarge"></div>
              </div>
              <div class="content-title-text">
                <h2>{{ currentSourceConfig.name }}</h2>
                <p>{{ currentSourceConfig.subtitle }}</p>
              </div>
            </div>
            <button class="manage-btn" @click="openManageModal">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white" style="margin-right: 4px">
                <path
                  d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
              <span>管理訂閱</span>
            </button>
          </div>
        </div>

        <div class="subscriptions-container">
          <div class="subscriptions-header">
            <h3>最新影片</h3>
            <div class="filter-group">
              <button
                v-for="filter in filters"
                :key="filter.value"
                class="filter-btn"
                :class="{ active: currentFilter === filter.value }"
                @click="currentFilter = filter.value">
                {{ filter.label }}
              </button>
            </div>
          </div>

          <!-- 影片內容區域 -->
          <div id="videos-container">
            <!-- 空狀態 -->
            <div v-if="currentSubscriptions.length === 0" class="empty-state">
              <div class="empty-icon">{{ currentSourceConfig.emptyIcon }}</div>
              <h3>尚未新增訂閱</h3>
              <p>點擊「管理訂閱」按鈕來新增您的第一個訂閱頻道</p>
              <button class="add-subscription-btn" @click="openManageModal">
                <span>➕</span>
                <span>新增訂閱</span>
              </button>
            </div>

            <!-- 影片網格 -->
            <div v-else-if="currentVideos.length === 0" class="empty-state">
              <div class="empty-icon">{{ currentSourceConfig.emptyIcon }}</div>
              <h3>暫無新內容</h3>
              <p>您訂閱的頻道尚未有新的內容發佈</p>
            </div>

            <div v-else class="videos-grid">
              <div v-for="video in currentVideos" :key="video.url" class="video-card" @click="openVideo(video)">
                <div class="video-thumbnail" :style="{ background: currentSourceConfig.color }">
                  <div v-html="currentSourceConfig.iconLarge"></div>
                  <span v-if="video.duration" class="video-duration">{{ video.duration }}</span>
                </div>
                <div class="video-info">
                  <div class="video-title">{{ video.title }}</div>
                  <div class="channel-info">
                    <div class="channel-avatar">{{ video.channel.charAt(0).toUpperCase() }}</div>
                    <div class="channel-name">{{ video.channel }}</div>
                  </div>
                  <div class="video-meta">
                    <span>{{ video.views || "0" }} 次觀看</span>
                    <span>{{ video.date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 管理訂閱模態視窗 -->
    <div class="modal" :class="{ show: isModalOpen }" @click="closeModalOutside">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            管理訂閱 - <span>{{ currentSourceConfig.name }}</span>
          </h3>
          <button class="close-modal" @click="closeManageModal">✕</button>
        </div>
        <div class="modal-body">
          <!-- 新增訂閱表單 -->
          <form class="subscription-form" @submit.prevent="handleAddSubscription">
            <div class="form-group">
              <label for="channel-name">頻道名稱</label>
              <input
                type="text"
                id="channel-name"
                v-model="subscriptionForm.name"
                placeholder="請輸入頻道名稱"
                required />
            </div>
            <div class="form-group">
              <label for="channel">頻道連結</label>
              <input type="text" id="channel" v-model="subscriptionForm.url" placeholder="請輸入頻道連結" required />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">新增訂閱</button>
              <button type="button" class="btn-secondary" @click="resetForm">取消</button>
            </div>
          </form>

          <!-- 訂閱列表 -->
          <div style="margin-top: 30px">
            <h4 style="margin-bottom: 15px; color: #333; font-size: 16px">目前訂閱</h4>

            <!-- 載入狀態 -->
            <div v-if="subscriptionsStore.isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>正在載入訂閱列表...</p>
            </div>

            <!-- 訂閱列表 -->
            <div v-else class="subscriptions-list">
              <p v-if="currentSubscriptions.length === 0" style="text-align: center; color: #999; padding: 20px">
                尚無訂閱
              </p>
              <div v-for="(sub, index) in currentSubscriptions" :key="index" class="subscription-item">
                <div class="subscription-avatar">{{ sub.title.charAt(0).toUpperCase() }}</div>
                <div class="subscription-info">
                  <div class="subscription-name">{{ sub.title }}</div>
                  <div class="subscription-url">{{ sub.url }}</div>
                </div>
                <button class="delete-subscription-btn" @click="deleteSubscription(index)">刪除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSubscriptionsStore } from "@/stores/subscriptions";
import { storeToRefs } from "pinia";

const router = useRouter();
const authStore = useAuthStore();
const subscriptionsStore = useSubscriptionsStore();

const { currentSource, subscriptionsData, videosData } = storeToRefs(subscriptionsStore);

const isModalOpen = ref(false);
const currentFilter = ref("all");
const subscriptionForm = ref({
  name: "",
  url: "",
});

const filters = [
  { label: "全部", value: "all" },
  { label: "今天", value: "today" },
  { label: "本週", value: "week" },
  { label: "本月", value: "month" },
];

const sources = [
  {
    id: "youtube",
    name: "YouTube",
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    iconLarge:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    color: "#ff0000",
    subtitle: "管理您的 YouTube 訂閱頻道",
    emptyIcon: "📺",
    contentType: "影片",
  },
  // {
  //   id: "spotify",
  //   name: "Spotify",
  //   icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
  //   iconLarge:
  //     '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
  //   color: "#1db954",
  //   subtitle: "管理您的 Spotify 訂閱清單",
  //   emptyIcon: "🎵",
  //   contentType: "音樂",
  // },
  // {
  //   id: "firstory",
  //   name: "Firstory",
  //   icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
  //   iconLarge:
  //     '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
  //   color: "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
  //   subtitle: "管理您的 Firstory 訂閱節目",
  //   emptyIcon: "🎙️",
  //   contentType: "節目",
  // },
  // {
  //   id: "podcast",
  //   name: "Apple Podcasts",
  //   icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/><path d="M15 16.5A5.48 5.48 0 0 1 12 18a5.48 5.48 0 0 1-3-1.5V21h6z"/></svg>',
  //   iconLarge:
  //     '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/><path d="M15 16.5A5.48 5.48 0 0 1 12 18a5.48 5.48 0 0 1-3-1.5V21h6z"/></svg>',
  //   color: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  //   subtitle: "管理您的 Apple Podcasts 訂閱",
  //   emptyIcon: "🎧",
  //   contentType: "播客",
  // },
  // {
  //   id: "soundcloud",
  //   name: "SoundCloud",
  //   icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.051 0-.09.04-.099.099L0 14.479l.176 1.373c0 .058.048.099.099.099.05 0 .09-.04.099-.099l.215-1.373-.215-1.326c-.009-.059-.05-.1-.099-.1zm1.83-.576c-.05 0-.1.046-.107.097l-.255 2.929.255 2.843c.007.055.057.1.107.1.057 0 .099-.045.107-.1l.282-2.843-.282-2.929c-.008-.051-.05-.097-.107-.097zm.94-.156c-.06 0-.106.046-.106.098l-.231 3.085.231 2.99c0 .051.046.099.106.099.059 0 .105-.048.105-.1l.256-2.989-.256-3.085c0-.052-.046-.098-.105-.098zm.938-.168c-.065 0-.106.052-.106.106l-.213 3.253.213 3.045c0 .057.041.106.106.106.062 0 .107-.049.107-.106l.238-3.045-.238-3.253c0-.054-.045-.106-.107-.106zm.955-.165c-.07 0-.12.052-.12.116l-.193 3.418.193 3.22c0 .065.05.116.12.116.07 0 .12-.051.12-.116l.22-3.22-.22-3.418c0-.064-.05-.116-.12-.116zm.954-.165c-.074 0-.125.053-.125.12l-.176 3.583.176 3.198c0 .068.051.12.125.12.073 0 .125-.052.125-.12l.194-3.198-.194-3.583c0-.067-.052-.12-.125-.12zm.964-.156c-.078 0-.135.053-.135.125l-.157 3.739.157 3.182c0 .071.057.125.135.125.078 0 .139-.054.139-.125l.174-3.182-.174-3.739c0-.072-.061-.125-.139-.125zm.955-.165c-.086 0-.145.056-.145.128l-.139 3.904.139 3.164c0 .075.059.128.145.128.084 0 .143-.053.143-.128l.155-3.164-.155-3.904c0-.072-.059-.128-.143-.128zm1.006-.135c-.09 0-.153.057-.153.134l-.12 4.039.12 3.096c0 .077.063.135.153.135.087 0 .151-.058.151-.135l.133-3.096-.133-4.039c0-.077-.064-.134-.151-.134zm.99-.155c-.094 0-.16.061-.16.14l-.108 4.194.108 3.072c0 .08.066.14.16.14.094 0 .161-.06.161-.14l.117-3.072-.117-4.194c0-.079-.067-.14-.161-.14z"/><path d="M23.498 13.291c-.196 0-.387.019-.568.054a5.449 5.449 0 0 0-5.282-4.14c-.095 0-.168.072-.168.166v8.385c0 .088.065.162.158.167h5.845A2.502 2.502 0 0 0 24 15.791a2.502 2.502 0 0 0-2.502-2.5"/></svg>',
  //   iconLarge:
  //     '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.051 0-.09.04-.099.099L0 14.479l.176 1.373c0 .058.048.099.099.099.05 0 .09-.04.099-.099l.215-1.373-.215-1.326c-.009-.059-.05-.1-.099-.1zm1.83-.576c-.05 0-.1.046-.107.097l-.255 2.929.255 2.843c.007.055.057.1.107.1.057 0 .099-.045.107-.1l.282-2.843-.282-2.929c-.008-.051-.05-.097-.107-.097zm.94-.156c-.06 0-.106.046-.106.098l-.231 3.085.231 2.99c0 .051.046.099.106.099.059 0 .105-.048.105-.1l.256-2.989-.256-3.085c0-.052-.046-.098-.105-.098zm.938-.168c-.065 0-.106.052-.106.106l-.213 3.253.213 3.045c0 .057.041.106.106.106.062 0 .107-.049.107-.106l.238-3.045-.238-3.253c0-.054-.045-.106-.107-.106zm.955-.165c-.07 0-.12.052-.12.116l-.193 3.418.193 3.22c0 .065.05.116.12.116.07 0 .12-.051.12-.116l.22-3.22-.22-3.418c0-.064-.05-.116-.12-.116zm.954-.165c-.074 0-.125.053-.125.12l-.176 3.583.176 3.198c0 .068.051.12.125.12.073 0 .125-.052.125-.12l.194-3.198-.194-3.583c0-.067-.052-.12-.125-.12zm.964-.156c-.078 0-.135.053-.135.125l-.157 3.739.157 3.182c0 .071.057.125.135.125.078 0 .139-.054.139-.125l.174-3.182-.174-3.739c0-.072-.061-.125-.139-.125zm.955-.165c-.086 0-.145.056-.145.128l-.139 3.904.139 3.164c0 .075.059.128.145.128.084 0 .143-.053.143-.128l.155-3.164-.155-3.904c0-.072-.059-.128-.143-.128zm1.006-.135c-.09 0-.153.057-.153.134l-.12 4.039.12 3.096c0 .077.063.135.153.135.087 0 .151-.058.151-.135l.133-3.096-.133-4.039c0-.077-.064-.134-.151-.134zm.99-.155c-.094 0-.16.061-.16.14l-.108 4.194.108 3.072c0 .08.066.14.16.14.094 0 .161-.06.161-.14l.117-3.072-.117-4.194c0-.079-.067-.14-.161-.14z"/><path d="M23.498 13.291c-.196 0-.387.019-.568.054a5.449 5.449 0 0 0-5.282-4.14c-.095 0-.168.072-.168.166v8.385c0 .088.065.162.158.167h5.845A2.502 2.502 0 0 0 24 15.791a2.502 2.502 0 0 0-2.502-2.5"/></svg>',
  //   color: "#ff5500",
  //   subtitle: "管理您的 SoundCloud 訂閱",
  //   emptyIcon: "🔊",
  //   contentType: "音訊",
  // },
  // {
  //   id: "vimeo",
  //   name: "Vimeo",
  //   icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/></svg>',
  //   iconLarge:
  //     '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/></svg>',
  //   color: "#1ab7ea",
  //   subtitle: "管理您的 Vimeo 訂閱頻道",
  //   emptyIcon: "🎥",
  //   contentType: "影片",
  // },
];

const currentSourceConfig = computed(() => {
  return sources.find((s) => s.id === currentSource.value) || sources[0];
});

const currentSubscriptions = computed(() => subscriptionsStore.currentSubscriptions);
const currentVideos = computed(() => subscriptionsStore.currentVideos);

// 計算使用者顯示資訊
const userName = computed(() => {
  if (authStore.user) {
    return authStore.user.name || authStore.user.email || authStore.user.account || "使用者";
  }
  return "使用者";
});

const userInitial = computed(() => {
  const name = userName.value;
  return name.charAt(0).toUpperCase();
});

const switchSource = (sourceId) => {
  subscriptionsStore.switchSource(sourceId);
};

const openManageModal = async () => {
  isModalOpen.value = true;

  // 根據當前影音來源發送請求到 /v1/rss
  try {
    await subscriptionsStore.fetchSubscriptions(currentSource.value);
  } catch (error) {
    console.error("載入訂閱列表失敗:", error);
    // 如果 API 失敗，仍然顯示本地數據
  }
};

const closeManageModal = () => {
  isModalOpen.value = false;
  resetForm();
};

const closeModalOutside = (e) => {
  if (e.target.classList.contains("modal")) {
    closeManageModal();
  }
};

const resetForm = () => {
  subscriptionForm.value = {
    name: "",
    url: "",
  };
};

const handleAddSubscription = async () => {
  if (!subscriptionForm.value.name || !subscriptionForm.value.url) {
    alert("請填寫所有欄位");
    return;
  }

  try {
    await subscriptionsStore.addSubscription(subscriptionForm.value);
    showNotification("訂閱新增成功！");
    resetForm();
  } catch (error) {
    console.error("新增訂閱失敗:", error);
    alert(error.message || "新增訂閱失敗，請稍後再試");
  }
};

const deleteSubscription = async (index) => {
  const subscription = currentSubscriptions.value[index];
  const subscriptionName = subscription.title || subscription.name || "此頻道";

  if (confirm(`確定要取消訂閱「${subscriptionName}」嗎？`)) {
    try {
      await subscriptionsStore.deleteSubscription(index);
      showNotification("已取消訂閱");
    } catch (error) {
      console.error("刪除訂閱失敗:", error);
      alert("刪除訂閱失敗，請稍後再試");
    }
  }
};

const openVideo = (video) => {
  router.push({
    name: "Player",
    query: {
      title: video.title,
      source: currentSource.value,
      url: video.url,
    },
  });
};

const handleLogout = () => {
  if (confirm("確定要登出嗎？")) {
    authStore.logout();
    router.push("/login");
  }
};

const openSettings = () => {
  router.push("/settings");
};

const showNotification = (message) => {
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
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.header {
  background: white;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.app-logo {
  font-size: 24px;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-profile:hover {
  background: #e9ecef;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.logout-btn {
  padding: 8px 20px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 8px;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e9ecef;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 25px 20px 15px 20px;
}

.sidebar-title {
  font-size: 12px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
}

.source-list {
  list-style: none;
  padding: 0;
}

.source-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  position: relative;
}

.source-item:hover {
  background: #f8f9fa;
}

.source-item.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  border-left-color: #667eea;
}

.source-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.source-icon :deep(svg) {
  display: block;
}

.source-item.active .source-icon {
  transform: scale(1.1);
}

.source-info {
  flex: 1;
}

.source-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.source-count {
  font-size: 12px;
  color: #999;
}

.source-badge {
  background: #667eea;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
}

.content-header {
  background: white;
  padding: 30px;
  border-bottom: 1px solid #e9ecef;
}

.content-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.content-title-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.content-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-icon :deep(svg) {
  display: block;
}

.content-title-text h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 4px;
}

.content-title-text p {
  font-size: 14px;
  color: #999;
}

.manage-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.manage-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.subscriptions-container {
  padding: 25px 30px;
}

.subscriptions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.subscriptions-header h3 {
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.video-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.video-thumbnail {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.video-thumbnail :deep(svg) {
  width: 48px;
  height: 48px;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.video-info {
  padding: 15px;
}

.video-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.channel-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.channel-name {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.video-meta span:not(:last-child)::after {
  content: "•";
  margin-left: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin-bottom: 25px;
}

.add-subscription-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.add-subscription-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}

.modal.show {
  display: flex;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 25px 30px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  font-size: 20px;
  color: #333;
  font-weight: 700;
}

.close-modal {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f8f9fa;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
  transition: all 0.2s ease;
}

.close-modal:hover {
  background: #e9ecef;
  color: #333;
}

.modal-body {
  padding: 30px;
}

.subscription-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #666;
  border: 2px solid #e9ecef;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #d0d0d0;
}

.subscriptions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subscription-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.subscription-item:hover {
  background: #e9ecef;
}

.subscription-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
}

.subscription-info {
  flex: 1;
}

.subscription-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.subscription-url {
  font-size: 12px;
  color: #999;
  word-break: break-all;
}

.delete-subscription-btn {
  padding: 8px 16px;
  background: white;
  border: 2px solid #e74c3c;
  border-radius: 6px;
  color: #e74c3c;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-subscription-btn:hover {
  background: #e74c3c;
  color: white;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f5f7fa;
}

::-webkit-scrollbar-thumb {
  background: #d0d5dd;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b8bfcc;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-size: 14px;
  color: #666;
}

@media (max-width: 1024px) {
  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 240px;
  }

  .videos-grid {
    grid-template-columns: 1fr;
  }

  .content-header {
    padding: 20px;
  }

  .subscriptions-container {
    padding: 20px;
  }
}
</style>
