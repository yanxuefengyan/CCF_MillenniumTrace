import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
// import { ConfigProvider } from 'antd'  // 暂时注释掉Ant Design
// import zhCN from 'antd/locale/zh_CN'   // 暂时注释掉Ant Design
import { App } from './App'
import './index.css'
// import './fonts.css'  // 暂时注释掉字体导入

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// 移除加载屏幕
const removeLoadingScreen = () => {
  const loading = document.getElementById('loading')
  if (loading) {
    loading.style.opacity = '0'
    setTimeout(() => {
      loading.remove()
    }, 500)
  }
}

// 性能监控
const initPerformanceMonitoring = () => {
  // 监控首屏渲染时间
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const loadTime = navigation.loadEventEnd - navigation.fetchStart
    console.log(`页面加载时间: ${loadTime}ms`)
    
    // 上报性能数据
    if (process.env.NODE_ENV === 'production') {
      // TODO: 发送到性能监控服务
    }
  })
  
  // 暂时注释掉Web Vitals监控，避免导入错误
  // import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
  //   getCLS(console.log)
  //   getFID(console.log)
  //   getFCP(console.log)
  //   getLCP(console.log)
  //   getTTFB(console.log)
  // }).catch(err => {
  //   console.warn('Web Vitals 加载失败:', err)
  // })
}

// 初始化应用
const initApp = () => {
  initPerformanceMonitoring()
  removeLoadingScreen()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)

// 初始化
initApp()