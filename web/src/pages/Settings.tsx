import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DeviceInfo } from '@/types'

interface SettingsProps {
  deviceInfo: DeviceInfo
}

export const Settings: React.FC<SettingsProps> = ({ deviceInfo }) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    language: 'zh-CN' as 'zh-CN' | 'en-US',
    autoSave: true,
    quality: 'auto' as 'low' | 'medium' | 'high' | 'auto',
    notifications: {
      nft_minted: true,
      donation_completed: true,
      scene_shared: false,
    },
    privacy: {
      share_analytics: true,
      allow_personalization: true,
    },
  })
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'privacy' | 'about'>('general')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
      } else {
        console.error('Failed to load settings')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (path: string, value: any) => {
    const newSettings = { ...settings }
    const keys = path.split('.')
    let current: any = newSettings
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    setSettings(newSettings)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setHasChanges(false)
        // TODO: 显示保存成功提示
      } else {
        console.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const handleReset = () => {
    // 重置为默认设置
    setSettings({
      language: 'zh-CN',
      autoSave: true,
      quality: 'auto',
      notifications: {
        nft_minted: true,
        donation_completed: true,
        scene_shared: false,
      },
      privacy: {
        share_analytics: true,
        allow_personalization: true,
      },
    })
    setHasChanges(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">正在加载设置...</p>
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
              onClick={() => navigate('/profile')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h1 className="text-2xl font-bold text-white">设置</h1>
            
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium"
                >
                  保存更改
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <nav className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              {[
                { id: 'general', label: '通用设置', icon: '⚙️' },
                { id: 'notifications', label: '通知设置', icon: '🔔' },
                { id: 'privacy', label: '隐私设置', icon: '🔒' },
                { id: 'about', label: '关于应用', icon: 'ℹ️' },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors mb-2 ${
                    activeSection === section.id
                      ? 'bg-purple-500/20 text-white border-l-4 border-purple-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-3">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeSection === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/10"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">通用设置</h2>
                  
                  <div className="space-y-6">
                    {/* 语言设置 */}
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">显示语言</label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                      >
                        <option value="zh-CN">简体中文</option>
                        <option value="en-US">English</option>
                      </select>
                    </div>

                    {/* 渲染质量 */}
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">渲染质量</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'low', label: '低质量', desc: '适合低端设备' },
                          { value: 'medium', label: '中等质量', desc: '平衡性能与效果' },
                          { value: 'high', label: '高质量', desc: '最佳视觉效果' },
                          { value: 'auto', label: '自动', desc: '根据设备自动选择' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleSettingChange('quality', option.value)}
                            className={`p-4 rounded-lg border transition-colors ${
                              settings.quality === option.value
                                ? 'bg-purple-500/20 border-purple-500 text-white'
                                : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm mt-1">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 自动保存 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">自动保存</h3>
                        <p className="text-gray-400 text-sm">自动保存您的创作进度</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          settings.autoSave ? 'bg-purple-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.autoSave ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/10"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">通知设置</h2>
                  
                  <div className="space-y-4">
                    {[
                      {
                        key: 'nft_minted',
                        title: 'NFT铸造完成',
                        description: '当您的影迹NFT铸造完成时收到通知',
                      },
                      {
                        key: 'donation_completed',
                        title: '捐赠完成',
                        description: '当公益捐赠成功完成时收到通知',
                      },
                      {
                        key: 'scene_shared',
                        title: '场景分享',
                        description: '当有人分享您的时空情景时收到通知',
                      },
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{notification.title}</h3>
                          <p className="text-gray-400 text-sm">{notification.description}</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange(`notifications.${notification.key}`, !settings.notifications[notification.key as keyof typeof settings.notifications])}
                          className={`w-14 h-8 rounded-full transition-colors ${
                            settings.notifications[notification.key as keyof typeof settings.notifications] ? 'bg-purple-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                            settings.notifications[notification.key as keyof typeof settings.notifications] ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/10"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">隐私设置</h2>
                  
                  <div className="space-y-6">
                    {/* 数据分析 */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">数据分析</h3>
                        <p className="text-gray-400 text-sm">允许我们收集匿名使用数据以改进服务</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('privacy.share_analytics', !settings.privacy.share_analytics)}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          settings.privacy.share_analytics ? 'bg-purple-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.privacy.share_analytics ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* 个性化推荐 */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">个性化推荐</h3>
                        <p className="text-gray-400 text-sm">根据您的使用习惯提供个性化内容推荐</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('privacy.allow_personalization', !settings.privacy.allow_personalization)}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          settings.privacy.allow_personalization ? 'bg-purple-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.privacy.allow_personalization ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* 应用信息 */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6">关于千年影迹</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">影</span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">千年影迹 MillenniumTrace</h3>
                          <p className="text-gray-400">版本 1.0.0</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-300">
                        用AI让藏品说话，30秒穿越千年。千年影迹是一个创新的文博AI互动产品，
                        通过拍照或语音触发，即时生成藏品的4D时空情景，让每一件文物都能讲述自己的故事。
                      </p>
                    </div>
                  </div>

                  {/* 设备信息 */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">设备信息</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">平台</p>
                        <p className="text-white font-medium">{deviceInfo.platform}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">版本</p>
                        <p className="text-white font-medium">{deviceInfo.version}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">设备型号</p>
                        <p className="text-white font-medium">{deviceInfo.model}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">WebGL</p>
                        <p className="text-white font-medium">
                          {deviceInfo.capabilities.webgl ? '支持' : '不支持'}
                          {deviceInfo.capabilities.webgl2 && ' (WebGL2)'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 重置设置 */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">重置设置</h3>
                    
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
                    >
                      恢复默认设置
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}