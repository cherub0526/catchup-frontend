import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api";

// 將 API 返回的方案資料轉換為應用程式格式
const transformPlanFromAPI = (apiPlan) => {
  const planId = apiPlan.title.toLowerCase();

  // 轉換價格格式
  const price = {
    monthly: null,
    annually: null,
  };

  apiPlan.prices.forEach((p) => {
    if (p.unit === "monthly") {
      price.monthly = {
        id: p.id,
        paddlePriceId: p.paddle.id || "",
        price: p.price,
      };
    } else if (p.unit === "annually") {
      price.annually = {
        id: p.id,
        paddlePriceId: p.paddle.id || "",
        price: p.price,
      };
    }
  });

  // 生成功能列表
  const features = [];

  if (planId === "advance") {
    features.push("優先客服支援");
  }

  return {
    id: planId,
    apiId: apiPlan.id, // 保留原始 API ID 用於後續請求
    paddlePlanId: apiPlan.paddle.id || "", // Paddle 方案 ID
    name: apiPlan.title,
    description: apiPlan.description || "",
    price: price,
    limits: {
      channels: apiPlan.channel_limit,
      media: apiPlan.video_limit,
      chat: apiPlan.chat_limit,
    },
    features: features,
  };
};

export const usePlansStore = defineStore("plans", () => {
  const currentPlan = ref(null);
  const billingCycle = ref("monthly"); // 'monthly' or 'annually'
  const isLoading = ref(false);
  const error = ref(null);

  // 方案列表（從 API 獲取）
  const plans = ref([]);

  // 使用情況統計
  const usage = ref({
    channels: 0,
    media: 0,
  });

  // 獲取所有方案（從 API）
  const allPlans = computed(() => plans.value);

  // 根據 ID 獲取方案
  const getPlanById = (id) => {
    return plans.value.find((plan) => plan.id === id || plan.apiId === id);
  };

  // 當前方案的限制
  const currentLimits = computed(() => {
    if (!currentPlan.value) {
      // 如果沒有當前方案，返回免費方案的預設限制
      const freePlan = plans.value.find((p) => p.id === "free");
      return freePlan?.limits || { channels: 1, media: 3, chat: 0 };
    }
    return currentPlan.value.limits;
  });

  // 檢查是否達到限制
  const isChannelLimitReached = computed(() => {
    return usage.value.channels >= currentLimits.value.channels;
  });

  const isMediaLimitReached = computed(() => {
    return usage.value.media >= currentLimits.value.media;
  });

  // 獲取所有方案（從 API）
  const fetchPlans = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.subscription.getPlans();

      if (response.data && Array.isArray(response.data)) {
        // 轉換 API 返回的方案資料
        plans.value = response.data.map(transformPlanFromAPI);

        console.log(currentPlan.value);

        // 如果當前方案存在，同步更新其限制值（使用最新的方案列表）
        if (currentPlan.value) {
          const latestPlan = getPlanById(currentPlan.value.id) || getPlanById(currentPlan.value.apiId);

          if (latestPlan) {
            // 更新當前方案的限制值，但保留其他屬性
            currentPlan.value = {
              ...currentPlan.value,
              limits: {
                ...latestPlan.limits,
              },
            };
          }
        }
      } else {
        console.warn("API 返回的方案資料格式不正確");
        plans.value = [];
      }

      return response;
    } catch (err) {
      error.value = err.message || "獲取方案列表失敗";
      console.error("獲取方案列表失敗:", err);
      plans.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 當前訂閱的原始數據（包含 API 返回的完整信息）
  const currentSubscriptionData = ref(null);

  // 獲取當前訂閱信息
  const fetchCurrentSubscription = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.subscription.getCurrentSubscription();

      if (response) {
        // 保存原始訂閱數據
        currentSubscriptionData.value = response;

        // 使用 response.data.id 來比對 plan.apiId
        const subscriptionPlanId = response.id;
        // 從方案列表中查找對應的方案（使用 apiId 比對）
        const foundPlan = plans.value.find((p) => p.apiId === subscriptionPlanId);

        if (foundPlan) {
          // 創建新的方案對象，確保使用最新的限制值
          currentPlan.value = {
            ...foundPlan,
          };

          // 如果 API 返回了 plan 限制（channel_limit, video_limit），優先使用 API 的值

          currentPlan.value.limits = {
            channels: response.channel_limit,
            media: response.video_limit,
            chat: response.chat_limit,
          };

          // 根據 prices[0].unit 來確定 billingCycle
          if (response.prices && response.prices.length > 0) {
            const currentPrice = response.prices[0];
            billingCycle.value = currentPrice.unit;
          }
        }
      }

      return response;
    } catch (err) {
      error.value = err.message || "獲取訂閱信息失敗";
      currentSubscriptionData.value = null;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新訂閱方案
  const updateSubscription = async (planId, cycle = "monthly") => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.subscription.updateSubscription({
        planId,
        billingCycle: cycle,
      });

      // 更新成功後重新獲取當前訂閱和使用情況
      await fetchCurrentSubscription();
      await updateUsage();

      return response;
    } catch (err) {
      error.value = err.message || "更新訂閱方案失敗";
      console.error("更新訂閱方案失敗:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 取消訂閱
  const cancelSubscription = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.subscription.cancelSubscription();

      // 取消後回到免費方案
      currentPlan.value = plans.value.find((p) => p.id === "free");
      billingCycle.value = "monthly";

      // 更新使用情況
      await updateUsage();

      return response;
    } catch (err) {
      error.value = err.message || "取消訂閱失敗";
      console.error("取消訂閱失敗:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新使用情況
  const updateUsage = async () => {
    try {
      const response = await api.subscription.getUsage();

      if (response) {
        // API 返回結構: { plan: {channel_limit, video_limit}, usage: {channels, media} }
        if (response.data?.usage) {
          usage.value = {
            channels: response.data.usage.channels || response.data.usage.channel_count || usage.value.channels,
            media:
              response.data.usage.media ||
              response.data.usage.video_count ||
              response.data.usage.media_count ||
              usage.value.media,
          };
        }
      }

      return response;
    } catch (err) {
      console.error("更新使用情況失敗:", err);
      throw err;
    }
  };

  // 檢查是否可以添加頻道
  const canAddChannel = () => {
    return !isChannelLimitReached.value;
  };

  // 檢查是否可以添加影音
  const canAddMedia = () => {
    return !isMediaLimitReached.value;
  };

  // 計算方案價格（根據計費週期）
  const getPlanPrice = (plan, cycle = null) => {
    const currentCycle = cycle || billingCycle.value;
    const priceObj = plan.price[currentCycle];
    return priceObj ? priceObj.price : 0;
  };

  // 獲取方案的 Paddle 價格 ID（用於 Paddle 結帳）
  const getPlanPriceId = (plan, cycle = null) => {
    const currentCycle = cycle || billingCycle.value;
    const priceObj = plan.price[currentCycle];
    return priceObj ? priceObj.paddlePriceId : null;
  };

  // 獲取方案的 API 價格 ID（從 /v1/plans 返回的 prices[].id）
  const getPlanApiPriceId = (plan, cycle = null) => {
    const currentCycle = cycle || billingCycle.value;
    const priceObj = plan.price[currentCycle];
    return priceObj ? priceObj.id : null;
  };

  // 計算年費節省金額
  const getYearlySavings = (plan) => {
    const monthlyPrice = plan.price.monthly?.price || 0;
    const annuallyPrice = plan.price.annually?.price || 0;
    const monthlyTotal = monthlyPrice * 12;
    const annuallySaving = monthlyTotal - annuallyPrice;
    return annuallySaving;
  };

  // 初始化
  const initialize = async () => {
    // 先獲取方案列表
    await fetchPlans();
    // 然後獲取當前訂閱信息
    await fetchCurrentSubscription();
  };

  return {
    currentPlan,
    currentSubscriptionData,
    billingCycle,
    isLoading,
    error,
    usage,
    plans,
    allPlans,
    currentLimits,
    isChannelLimitReached,
    isMediaLimitReached,
    fetchPlans,
    fetchCurrentSubscription,
    updateSubscription,
    cancelSubscription,
    updateUsage,
    canAddChannel,
    canAddMedia,
    getPlanById,
    getPlanPrice,
    getPlanPriceId,
    getPlanApiPriceId,
    getYearlySavings,
    initialize,
  };
});
