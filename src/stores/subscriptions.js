import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const currentSource = ref('youtube')
  
  const subscriptionsData = ref({
    youtube: [],
    spotify: [],
    firstory: [],
    podcast: [],
    soundcloud: [],
    vimeo: [],
  })

  const videosData = ref({
    youtube: [],
    spotify: [],
    firstory: [],
    podcast: [],
    soundcloud: [],
    vimeo: [],
  })

  // Computed
  const currentSubscriptions = computed(() => subscriptionsData.value[currentSource.value])
  const currentVideos = computed(() => videosData.value[currentSource.value])

  // Actions
  const loadData = () => {
    const savedSubscriptions = localStorage.getItem('subscriptionsData')
    const savedVideos = localStorage.getItem('videosData')

    if (savedSubscriptions) {
      subscriptionsData.value = JSON.parse(savedSubscriptions)
    }

    if (savedVideos) {
      videosData.value = JSON.parse(savedVideos)
    }
  }

  const saveData = () => {
    localStorage.setItem('subscriptionsData', JSON.stringify(subscriptionsData.value))
    localStorage.setItem('videosData', JSON.stringify(videosData.value))
  }

  const switchSource = (source) => {
    currentSource.value = source
  }

  const addSubscription = (subscription) => {
    const exists = subscriptionsData.value[currentSource.value].some(
      (sub) => sub.url === subscription.url
    )
    
    if (exists) {
      throw new Error('此頻道已在訂閱列表中')
    }

    subscriptionsData.value[currentSource.value].push({
      ...subscription,
      dateAdded: new Date().toISOString(),
    })

    generateMockVideos(subscription.name)
    saveData()
  }

  const deleteSubscription = (index) => {
    const subscription = subscriptionsData.value[currentSource.value][index]
    subscriptionsData.value[currentSource.value].splice(index, 1)
    
    // 刪除相關影片
    videosData.value[currentSource.value] = videosData.value[currentSource.value].filter(
      (video) => video.channel !== subscription.name
    )
    
    saveData()
  }

  const generateMockVideos = (channelName) => {
    const titles = [
      `${channelName} 的最新內容`,
      `精彩內容：${channelName}`,
      `${channelName} 精選集`,
      `不容錯過的內容`,
      `${channelName} 熱門內容`,
    ]

    const count = Math.floor(Math.random() * 3) + 2 // 2-4 個影片

    for (let i = 0; i < count; i++) {
      videosData.value[currentSource.value].push({
        title: titles[Math.floor(Math.random() * titles.length)],
        channel: channelName,
        url: '#',
        duration: `${Math.floor(Math.random() * 20) + 5}:${String(
          Math.floor(Math.random() * 60)
        ).padStart(2, '0')}`,
        views: `${Math.floor(Math.random() * 10000) + 1000}`,
        date: getRandomDate(),
      })
    }

    saveData()
  }

  const getRandomDate = () => {
    const dates = ['1 小時前', '3 小時前', '今天', '昨天', '2 天前', '1 週前']
    return dates[Math.floor(Math.random() * dates.length)]
  }

  // Initialize
  loadData()

  return {
    currentSource,
    subscriptionsData,
    videosData,
    currentSubscriptions,
    currentVideos,
    switchSource,
    addSubscription,
    deleteSubscription,
    loadData,
    saveData,
  }
})

