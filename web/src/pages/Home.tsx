import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DeviceInfo } from '@/types'

interface HomeProps {
  deviceInfo?: DeviceInfo
}

export const Home: React.FC<HomeProps> = ({ deviceInfo }) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    // 3秒后隐藏欢迎动画
    const timer = setTimeout(() => {
      setShowWelcome(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleStartJourney = () => {
    setIsLoading(true)
    setTimeout(() => {
      navigate('/capture')
    }, 1500)
  }

  const handleViewGallery = () => {
    navigate('/nft')
  }

  if (showWelcome) {
    return <WelcomeAnimation />
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景星空效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <StarField />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 头部导航 */}
        <header className="p-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">影</span>
            </div>
            <span className="text-white font-semibold text-lg">千年影迹</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex space-x-4"
          >
            <button className="text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <button className="text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </motion.div>
        </header>

        {/* 主要内容区域 */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl w-full"
          >
            {/* 标题 */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                让文物说话
              </span>
              <br />
              <span className="text-3xl md:text-5xl text-gray-300">
                30秒穿越千年
              </span>
            </h1>

            {/* 副标题 */}
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              拍摄博物馆藏品，AI即刻生成4D时空长卷，体验从制作到数字归还的完整旅程
            </p>

            {/* 核心特性 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <FeatureCard
                icon="📸"
                title="智能识别"
                description="拍照或语音触发，精准识别藏品信息"
                delay={0.5}
              />
              <FeatureCard
                icon="🎭"
                title="4D时空剧"
                description="裸眼3D效果，沉浸式历史重现"
                delay={0.6}
              />
              <FeatureCard
                icon="🎨"
                title="影迹NFT"
                description="0成本铸造，永久保存文化记忆"
                delay={0.7}
              />
            </motion.div>

            {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                onClick={handleStartJourney}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在准备时空隧道...
                  </span>
                ) : (
                  '开始时空之旅'
                )}
              </motion.button>

              <motion.button
                onClick={handleViewGallery}
                className="px-8 py-4 bg-slate-700 bg-opacity-50 text-white font-semibold rounded-xl border border-slate-600 hover:bg-opacity-70 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                浏览影迹画廊
              </motion.button>
            </motion.div>
          </motion.div>
        </main>

        {/* 底部信息 */}
        <footer className="p-6 text-center">
          <p className="text-gray-400 text-sm">
            Built with Comate & Wenxin-4.5 • 让每一次凝视成为穿越千年的旅程
          </p>
        </footer>
      </div>
    </div>
  )
}

// 欢迎动画组件
const WelcomeAnimation: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 1.5 }}
        className="text-center"
      >
        <motion.div
          className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl"
          animate={{
            rotate: [0, 10, -10, 10, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
        >
          <span className="text-white text-6xl font-bold">影</span>
        </motion.div>
        
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          千年影迹
        </motion.h1>
        
        <motion.p
          className="text-xl text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          用AI让藏品说话，30秒穿越千年
        </motion.p>
      </motion.div>
    </div>
  )
}

// 特性卡片组件
interface FeatureCardProps {
  icon: string
  title: string
  description: string
  delay: number
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-colors duration-300"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  )
}

// 星空背景组件
const StarField: React.FC = () => {
  return (
    <div className="absolute inset-0">
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random(),
          }}
          animate={{
            opacity: [Math.random(), 1, Math.random()],
            scale: [Math.random(), 1.5, Math.random()],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}