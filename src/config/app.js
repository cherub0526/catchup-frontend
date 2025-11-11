/**
 * 應用程式配置文件
 * 集中管理應用名稱、Slogan 和其他全域配置
 *
 * 修改此文件後，所有引用的組件和頁面都會自動更新
 */

export const APP_CONFIG = {
  // 應用名稱
  name: "CatchUp",

  // 應用 Slogan
  slogan: {
    zh: "輕鬆跟上節奏，不再錯過精彩",
    en: "Stay caught up, without the catch.",
  },

  // 應用描述
  description: "自動化總結訂閱頻道內容的智能助理",

  // 版本號
  version: "1.0.0",

  // 作者
  author: "",

  // 其他配置
  meta: {
    // 預設語言
    defaultLanguage: "zh",

    // 支援的語言
    supportedLanguages: ["zh", "en"],
  },
};

// 導出常用的配置項目，方便直接使用
export const APP_NAME = APP_CONFIG.name;
export const APP_SLOGAN = APP_CONFIG.slogan;
export const APP_DESCRIPTION = APP_CONFIG.description;
export const APP_VERSION = APP_CONFIG.version;

// 預設導出整個配置物件
export default APP_CONFIG;
