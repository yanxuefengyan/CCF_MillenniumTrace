import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserData, Achievement } from '@/types'

export const Profile: React.FC = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'statistics'>('overview')

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const result = await response.json()
      
      if (result.success) {
        setUserData(result.data)
      } else {
        console.error('Failed to load user profile')
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    // TODO: 实现登出逻辑
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">正在加载个人资料...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">无法加载个人资料</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 头部 */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h1 className="text-2xl font-bold text-white">个人中心</h1>
            
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 用户信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/10"
        >
          <div className="flex items-center space-x-6">
            {/* 头像 */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              {userData.avatar ? (
                <img src={userData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {userData.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* 用户信息 */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{userData.username}</h2>
              <p className="text-gray-400 mb-4">
                {userData.email || '未设置邮箱'} • {userData.platform}用户
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-gray-400">注册时间:</span>
                  <span className="text-white ml-2">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">用户ID:</span>
                  <span className="text-white ml-2 font-mono">{userData.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            {/* 编辑按钮 */}
            <button className="px-6 py-3 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
              编辑资料
            </button>
          </div>
        </motion.div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="创建场景"
            value={userData.statistics.scenesCreated}
            icon="🎭"
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            title="NFT铸造"
            value={userData.statistics.nftsMinted}
            icon="🎨"
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="公益捐赠"
            value={`¥${userData.statistics.totalDonation.toFixed(2)}`}
            icon="💚"
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            title="观看时长"
            value={`${Math.floor(userData.statistics.viewingTime / 60000)}分钟`}
            icon="⏰"
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* 标签页 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10">
          {/* 标签导航 */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'overview', label: '概览', icon: '📊' },
              { id: 'achievements', label: '成就', icon: '🏆' },
              { id: 'statistics', label: '统计', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-center transition-colors ${
                  activeTab === tab.id
                    ? 'text-white bg-white/10 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 标签内容 */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <OverviewTab userData={userData} />
                </motion.div>
              )}
              
              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AchievementsTab achievements={userData.statistics.achievements} />
                </motion.div>
              )}
              
              {activeTab === 'statistics' && (
                <motion.div
                  key="statistics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <StatisticsTab userData={userData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// 统计卡片组件
interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
          <span className="text-white text-xl font-bold">{value}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  )
}

// 概览标签页
interface OverviewTabProps {
  userData: UserData
}

const OverviewTab: React.FC<OverviewTabProps> = ({ userData }) => {
  return (
    <div className="space-y-6">
      {/* 最近活动 */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">最近活动</h3>
        <div className="space-y-3">
          {userData.statistics.scenesCreated > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">创建了新的时空情景</p>
                  <p className="text-gray-400 text-sm">最近</p>
                </div>
                <span className="text-2xl">🎭</span>
              </div>
            </div>
          )}
          
          {userData.statistics.nftsMinted > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">铸造了影迹NFT</p>
                  <p className="text-gray-400 text-sm">最近</p>
                </div>
                <span className="text-2xl">🎨</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 偏好类别 */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">偏好类别</h3>
        <div className="flex flex-wrap gap-2">
          {userData.statistics.favoriteCategories.map((category, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// 成就标签页
interface AchievementsTabProps {
  achievements: Achievement[]
}

const AchievementsTab: React.FC<AchievementsTabProps> = ({ achievements }) => {
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-500 to-orange-500'
      case 'epic':
        return 'from-purple-500 to-pink-500'
      case 'rare':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getRarityText = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return '传奇'
      case 'epic':
        return '史诗'
      case 'rare':
        return '稀有'
      default:
        return '普通'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">{achievement.iconUrl || '🏆'}</span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold">{achievement.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                {getRarityText(achievement.rarity)}
              </span>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
          
          <p className="text-gray-500 text-xs">
            获得时间: {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

// 统计标签页
interface StatisticsTabProps {
  userData: UserData
}

const StatisticsTab: React.FC<StatisticsTabProps> = ({ userData }) => {
  return (
    <div className="space-y-8">
      {/* 详细统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">创作统计</h3>
          <div className="space-y-4">
            <StatRow label="创建场景数" value={userData.statistics.scenesCreated} />
            <StatRow label="NFT铸造数" value={userData.statistics.nftsMinted} />
            <StatRow label="公益捐赠总额" value={`¥${userData.statistics.totalDonation.toFixed(2)}`} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">使用统计</h3>
          <div className="space-y-4">
            <StatRow label="总观看时长" value={`${Math.floor(userData.statistics.viewingTime / 60000)}分钟`} />
            <StatRow label="平均观看时长" value={`${Math.floor(userData.statistics.viewingTime / (userData.statistics.scenesCreated * 60000))}分钟`} />
            <StatRow label="每日平均使用" value={`${(userData.statistics.viewingTime / 86400000).toFixed(1)}小时`} />
          </div>
        </div>
      </div>

      {/* 设置偏好 */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">设置偏好</h3>
        <div className="space-y-4">
          <StatRow label="语言" value={userData.settings.language} />
          <StatRow label="渲染质量" value={userData.settings.quality} />
          <StatRow label="自动保存" value={userData.settings.autoSave ? '开启' : '关闭'} />
          <StatRow label="数据分析" value={userData.settings.privacy.share_analytics ? '允许' : '禁止'} />
        </div>
      </div>
    </div>
  )
}

// 统计行组件
interface StatRowProps {
  label: string
  value: string | number
}

const StatRow: React.FC<StatRowProps> = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  )
}