import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api";

export const useSubscriptionsStore = defineStore("subscriptions", () => {
  const currentSource = ref("youtube");
  const isLoading = ref(false);
  const isLoadingVideos = ref(false);
  const error = ref(null);

  const subscriptionsData = ref({
    youtube: [],
    spotify: [],
    firstory: [],
    podcast: [],
    soundcloud: [],
    vimeo: [],
  });

  const videosData = ref({
    youtube: [],
    spotify: [],
    firstory: [],
    podcast: [],
    soundcloud: [],
    vimeo: [],
  });

  // Computed
  const currentSubscriptions = computed(() => subscriptionsData.value[currentSource.value]);
  const currentVideos = computed(() => videosData.value[currentSource.value]);

  const switchSource = async (source) => {
    currentSource.value = source;
    // 切換來源時自動獲取該來源的訂閱和影片
    await Promise.all([fetchSubscriptions(source), fetchVideos(source)]);
  };

  const addSubscription = async (subscription) => {
    isLoading.value = true;
    error.value = null;

    try {
      // 調用 API 新增訂閱
      const response = await api.rss.addSubscription({
        ...subscription,
        type: currentSource.value,
      });

      // 新增成功後重新獲取訂閱列表和影片列表
      await Promise.all([fetchSubscriptions(currentSource.value), fetchVideos(currentSource.value)]);

      return response;
    } catch (err) {
      error.value = err.message || "新增訂閱失敗";
      console.error("新增訂閱失敗:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteSubscription = async (index) => {
    const subscription = subscriptionsData.value[currentSource.value][index];

    if (!subscription?.id) {
      throw new Error("訂閱資料不完整");
    }

    isLoading.value = true;
    error.value = null;

    try {
      // 調用 API 刪除訂閱
      await api.rss.deleteSubscription(subscription.id);

      // 刪除成功後重新獲取訂閱列表和影片列表
      await Promise.all([fetchSubscriptions(currentSource.value), fetchVideos(currentSource.value)]);
    } catch (err) {
      error.value = err.message || "刪除訂閱失敗";
      console.error("刪除訂閱失敗:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 從 API 獲取訂閱列表
  const fetchSubscriptions = async (type) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.rss.getSubscriptions(type);

      // 更新對應來源的訂閱數據
      if (response?.data) {
        subscriptionsData.value[type] = response.data;
      }

      return response;
    } catch (err) {
      error.value = err.message || "獲取訂閱列表失敗";
      console.error("獲取訂閱失敗:", err);
      // 如果 API 失敗，清空該來源的數據
      subscriptionsData.value[type] = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 從 API 獲取影片列表
  const fetchVideos = async (type) => {
    isLoadingVideos.value = true;
    error.value = null;

    try {
      const response = await api.videos.getBySource(type);

      // 更新對應來源的影片數據
      if (response?.data) {
        videosData.value[type] = response.data;
      }

      return response;
    } catch (err) {
      error.value = err.message || "獲取影片列表失敗";
      console.error("獲取影片失敗:", err);
      // 如果 API 失敗，清空該來源的數據
      videosData.value[type] = [];
      throw err;
    } finally {
      isLoadingVideos.value = false;
    }
  };

  // 初始化時載入當前來源的數據
  const initialize = async () => {
    await Promise.all([fetchSubscriptions(currentSource.value), fetchVideos(currentSource.value)]);
  };

  // 初始化
  initialize();

  return {
    currentSource,
    subscriptionsData,
    videosData,
    currentSubscriptions,
    currentVideos,
    isLoading,
    isLoadingVideos,
    error,
    switchSource,
    addSubscription,
    deleteSubscription,
    fetchSubscriptions,
    fetchVideos,
    initialize,
  };
});
