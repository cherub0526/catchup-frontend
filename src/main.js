import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
  faExpand,
  faCompress,
  faClosedCaptioning,
  faCog,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faSpinner,
  faUsers,
  faVideo,
  faCreditCard,
  faChevronRight,
  faChevronLeft,
  faChevronDown,
  faSearch,
  faFilter,
  faBars,
  faEllipsisV,
  faHome,
  faUser,
  faSignOutAlt,
  faBell,
  faStar,
  faHeart,
  faShare,
  faDownload,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faBolt,
  faMagic,
  faShieldAlt,
  faChartBar
} from '@fortawesome/free-solid-svg-icons'
import {
  faGoogle,
  faFacebook,
  faYoutube
} from '@fortawesome/free-brands-svg-icons'

// 將圖示添加到庫中
library.add(
  faArrowLeft,
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
  faExpand,
  faCompress,
  faClosedCaptioning,
  faCog,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faSpinner,
  faUsers,
  faVideo,
  faCreditCard,
  faChevronRight,
  faChevronLeft,
  faChevronDown,
  faSearch,
  faFilter,
  faBars,
  faEllipsisV,
  faHome,
  faUser,
  faSignOutAlt,
  faBell,
  faStar,
  faHeart,
  faShare,
  faDownload,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faBolt,
  faMagic,
  faShieldAlt,
  faChartBar,
  faGoogle,
  faFacebook,
  faYoutube
)

const app = createApp(App)

// 註冊 Font Awesome 組件
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')

