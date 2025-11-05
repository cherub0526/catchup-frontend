import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api";

export const useAuthStore = defineStore("auth", () => {
  const isAuthenticated = ref(false);
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || null);

  // 初始化時檢查 token
  if (token.value) {
    isAuthenticated.value = true;
  }

  const login = async (account, password) => {
    try {
      const response = await api.auth.login(account, password);
      token.value = response.token;
      user.value = response.user;
      isAuthenticated.value = true;

      if (token.value) {
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
    user.value = null;
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

  return {
    isAuthenticated,
    user,
    token,
    login,
    register,
    logout,
    oauthLogin,
  };
});
