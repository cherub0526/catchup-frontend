import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhTW from './locales/zh-TW.json'

const getUserLocale = () => {
  // 1. Check localStorage for user preference
  const savedLocale = localStorage.getItem('user-locale')
  if (savedLocale) {
    return savedLocale
  }

  // 2. Check browser language
  const browserLocale = navigator.language || navigator.userLanguage
  
  // If Traditional Chinese (zh-TW, zh-HK)
  if (browserLocale.toLowerCase().includes('zh-tw') || browserLocale.toLowerCase().includes('zh-hk')) {
    return 'zh-TW'
  }

  // Default to English for everything else
  return 'en'
}

const i18n = createI18n({
  legacy: false, // Set to false to use Composition API
  locale: getUserLocale(), // Dynamic default locale
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-TW': zhTW
  }
})

export default i18n
