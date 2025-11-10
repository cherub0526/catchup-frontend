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

  const logout = () => {
    token.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem("token");
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
    logout,
    oauthLogin,
    initAuth,
  };
});
