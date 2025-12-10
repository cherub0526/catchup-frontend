import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api";

export const useAuthStore = defineStore("auth", () => {
  const isAuthenticated = ref(false);
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || null);
  const isInitialized = ref(false);

  const login = async (account, password) => {
    try {
      const response = await api.auth.login(account, password);
      token.value = response.access_token;
      isAuthenticated.value = true;

      if (token.value) {
        console.log("token", token.value);
        localStorage.setItem("token", token.value);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const response = await api.auth.register(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (account) => {
    try {
      const response = await api.auth.forgotPassword(account);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (data, queryParams) => {
    try {
      const response = await api.auth.resetPassword(data, queryParams);
      if (response.access_token) {
        token.value = response.access_token;
        isAuthenticated.value = true;
        localStorage.setItem("token", token.value);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      token.value = null;
      isAuthenticated.value = false;
      user.value = null;
      localStorage.removeItem("token");
    }
  };

  // 更新 token（用於 token 刷新後同步狀態）
  const updateToken = (newToken) => {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  };

  const oauthLogin = (provider) => {
    return new Promise((resolve, reject) => {
      if (window.ipcRenderer) {
        window.ipcRenderer.send("oauth-login", { provider });

        window.ipcRenderer.once("oauth-result", (event, result) => {
          if (result.success) {
            isAuthenticated.value = true;
            resolve(result);
          } else {
            reject(new Error(result.error));
          }
        });
      } else {
        reject(new Error("Electron IPC not available"));
      }
    });
  };

  // 初始化認證狀態 - 檢查 localStorage 的 token 並驗證
  const initAuth = async () => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      token.value = storedToken;
      try {
        // 發送請求到 /v1/users 驗證 token 並獲取使用者資料
        const userData = await api.user.getCurrentUser();
        user.value = userData;
        isAuthenticated.value = true;
        
        // 初始化訂閱方案信息
        // 動態導入 plans store 避免循環依賴
        const { usePlansStore } = await import("./plans");
        const plansStore = usePlansStore();
        await plansStore.initialize();
      } catch (error) {
        // Token 無效，清除本地儲存
        console.error("Token 驗證失敗:", error);
        token.value = null;
        user.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem("token");
      }
    }

    isInitialized.value = true;
  };

  return {
    isAuthenticated,
    user,
    token,
    isInitialized,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    oauthLogin,
    initAuth,
    updateToken,
  };
});
