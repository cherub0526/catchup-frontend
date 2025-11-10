import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api";

export const useMediaStore = defineStore("media", () => {
  const currentSource = ref("youtube");
  const isLoading = ref(false);
  const error = ref(null);

  const mediaData = ref({
    youtube: [],
    spotify: [],
    firstory: [],
    podcast: [],
    soundcloud: [],
    vimeo: [],
  });

  // 分頁資訊
  const paginationInfo = ref({
    youtube: { currentPage: 1, hasNextPage: false, totalPages: 1, total: 0, perPage: 10 },
    spotify: { currentPage: 1, hasNextPage: false, totalPages: 1, total: 0, perPage: 10 },
    firstory: { currentPage: 1, hasNextPage: false, totalPages: 1, total: 0, perPage: 10 },
    podcast: { currentPage: 1, hasNextPage: false, totalPages: 1, total: 0, perPage: 10 },
    soundcloud: { currentPage: 1, hasNextPage: false, totalPages: 1, total: 0, perPage: 10 },
    vimeo: { currentPage: 1, hasNextPage: false, totalPages: 1, total: 0, perPage: 10 },
  });

  // Computed
  const currentMedia = computed(() => mediaData.value[currentSource.value]);
  const currentPagination = computed(() => paginationInfo.value[currentSource.value]);

  const switchSource = async (source) => {
    currentSource.value = source;
    // 切換來源時自動獲取該來源的影片（重置為第一頁）
    await fetchMedia(source, true);
  };

  // 從 API 獲取影片列表
  const fetchMedia = async (type, reset = false) => {
    // 如果正在載入或沒有下一頁且不是重置，則不執行
    if (
      isLoading.value ||
      (!reset && !paginationInfo.value[type].hasNextPage && paginationInfo.value[type].currentPage > 1)
    ) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // 如果是重置，從第1頁開始，否則載入下一頁
      const page = reset ? 1 : paginationInfo.value[type].currentPage + 1;

      const response = await api.media.getMediaByType(type, page);

      // 更新對應來源的影片數據
      if (response?.data) {
        // 如果是重置，直接替換資料；否則附加到現有資料
        if (reset) {
          mediaData.value[type] = response.data;
          console.log(`[Media Store] 重置載入 ${type} 第 ${page} 頁，共 ${response.data.length} 項`);
        } else {
          mediaData.value[type] = [...mediaData.value[type], ...response.data];
          console.log(
            `[Media Store] 附加載入 ${type} 第 ${page} 頁，新增 ${response.data.length} 項，目前總共 ${mediaData.value[type].length} 項`
          );
        }
      }

      // 更新分頁資訊（從 meta 取得）
      if (response?.meta) {
        paginationInfo.value[type] = {
          currentPage: response.meta.current_page,
          hasNextPage: response.meta.current_page < response.meta.last_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        };
      } else {
        // 如果沒有分頁資訊，假設只有一頁
        paginationInfo.value[type] = {
          currentPage: page,
          hasNextPage: false,
          totalPages: 1,
          total: response?.data?.length || 0,
          perPage: response?.data?.length || 0,
        };
      }

      return response;
    } catch (err) {
      error.value = err.message || "獲取影片列表失敗";
      console.error("獲取影片失敗:", err);
      // 如果 API 失敗且是重置，清空該來源的數據
      if (reset) {
        mediaData.value[type] = [];
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 載入下一頁
  const fetchNextPage = async (type) => {
    if (!paginationInfo.value[type].hasNextPage || isLoading.value) {
      return;
    }
    await fetchMedia(type, false);
  };

  // 初始化時載入當前來源的數據
  const initialize = async () => {
    await fetchMedia(currentSource.value, true);
  };

  // 初始化
  initialize();

  return {
    currentSource,
    mediaData,
    currentMedia,
    currentPagination,
    paginationInfo,
    isLoading,
    error,
    switchSource,
    fetchMedia,
    fetchNextPage,
    initialize,
  };
});
