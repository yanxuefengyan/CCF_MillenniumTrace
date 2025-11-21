import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Home, Camera, ViewInAr, Grid, User as UserIcon, Settings as SettingsIcon,
  Sparkles, Zap, Heart, Share2, Menu, X, Upload
} from 'lucide-react';

import { SimpleHome as HomePage } from '@/pages/SimpleHome';
import { CameraCapture } from '@/pages/CameraCapture';
import { SceneViewer } from '@/pages/SceneViewer';
import { NFTGallery } from '@/pages/NFTGallery';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { syncService } from '@/services/syncService';
import { Artifact, RecognitionResult, Scene, User } from '@/types';

// 主应用组件
export const App: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet, capabilities } = useDeviceDetection();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showSceneViewer, setShowSceneViewer] = useState<Artifact | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  // 应用初始化
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('开始初始化应用...');
      
      // 检查用户认证状态
      const authStatus = await checkAuthentication();
      console.log('认证状态检查完成:', authStatus);
      setIsAuthenticated(authStatus.isAuthenticated);
      setCurrentUser(authStatus.user);

      // 暂时跳过同步服务初始化，避免卡住
      // 初始化同步服务（添加超时处理）
      // if (authStatus.isAuthenticated && authStatus.user) {
      //   try {
      //     // 设置更短的超时时间，避免页面卡住
      //     await Promise.race([
      //       syncService.initialize(authStatus.user.id),
      //       new Promise((resolve) => 
      //         setTimeout(() => {
      //           console.warn('同步服务初始化超时，使用离线模式');
      //           resolve(null);
      //         }, 3000)
      //       )
      //     ]);
      //   } catch (syncError) {
      //     console.warn('同步服务初始化失败，使用离线模式:', syncError);
      //     // 继续初始化，但不依赖同步服务
      //   }
      // }

      // 注册全局事件监听器
      registerEventListeners();

      console.log('应用初始化完成');
      setIsInitialized(true);
    } catch (error) {
      console.error('应用初始化失败:', error);
      setAppError('应用初始化失败，请刷新页面重试');
      setIsInitialized(true); // 即使失败也要设置为true，让用户看到错误界面
    }
  };

  // 检查认证状态
  const checkAuthentication = async () => {
    try {
      // 这里应该调用实际的认证服务
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        return {
          isAuthenticated: true,
          user: JSON.parse(userData) as User,
        };
      }
      
      return {
        isAuthenticated: false,
        user: null,
      };
    } catch (error) {
      console.error('认证检查失败:', error);
      return {
        isAuthenticated: false,
        user: null,
      };
    }
  };

  // 注册事件监听器
  const registerEventListeners = () => {
    // 同步更新事件
    window.addEventListener('syncUpdate', handleSyncUpdate);
    window.addEventListener('syncConflict', handleSyncConflict);
    window.addEventListener('syncCompleted', handleSyncCompleted);
    window.addEventListener('localDataUpdated', handleLocalDataUpdate);
    
    // 网络状态监听
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  // 事件处理器
  const handleSyncUpdate = (event: any) => {
    console.log('同步更新:', event.detail);
    // 处理数据同步更新
  };

  const handleSyncConflict = (event: any) => {
    console.log('同步冲突:', event.detail);
    // 处理数据冲突
  };

  const handleSyncCompleted = (event: any) => {
    console.log('同步完成:', event.detail);
    // 处理同步完成
  };

  const handleLocalDataUpdate = (event: any) => {
    console.log('本地数据更新:', event.detail);
    // 处理本地数据更新
  };

  const handleNetworkChange = () => {
    const status = syncService.getSyncStatus();
    console.log('网络状态变化:', status);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // 页面重新可见时检查同步状态
      const status = syncService.getSyncStatus();
      if (status.queueLength > 0) {
        // 有待同步数据，触发同步
        console.log('页面重新可见，触发同步');
      }
    }
  };

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        // 这里可以调用识别服务或直接显示上传的图片
        handleRecognitionComplete({
          success: true,
          artifact: {
            id: 'uploaded-image',
            name: file.name,
            description: '上传的图片',
            imageUrl: imageDataUrl,
          } as Artifact,
          confidence: 1,
          processingTime: 0,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 相机识别完成处理
  const handleRecognitionComplete = (result: RecognitionResult) => {
    if (result.success && result.artifact) {
      setShowCamera(false);
      setShowSceneViewer(result.artifact);
    }
  };

  // 场景生成完成处理
  const handleSceneGenerated = (scene: Scene) => {
    setCurrentScene(scene);
  };

  // 导航处理器
  const handleNavigation = (destination: string) => {
    switch (destination) {
      case 'camera':
        setShowCamera(true);
        break;
      case 'gallery':
        navigate('/gallery');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/');
        break;
    }
    setMobileMenuOpen(false);
  };

  // 登录处理
  const handleLogin = async (user: User) => {
    try {
      setIsAuthenticated(true);
      setCurrentUser(user);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // 初始化同步服务
      await syncService.initialize(user.id);
    } catch (error) {
      console.error('登录失败:', error);
      setAppError('登录失败，请重试');
    }
  };

  // 登出处理
  const handleLogout = async () => {
    try {
      // 断开同步服务
      syncService.disconnect();
      
      // 清除本地数据
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentScene(null);
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 应用初始化完成后，移除HTML页面中的加载界面
  useEffect(() => {
    if (isInitialized) {
      // 移除HTML中的加载界面
      const loading = document.getElementById('loading');
      if (loading) {
        console.log('移除初始加载界面');
        loading.style.opacity = '0';
        setTimeout(() => {
          loading.remove();
        }, 500);
      }
    }
  }, [isInitialized]);

  // 如果正在初始化，显示加载屏幕
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // 如果有应用错误，显示错误页面
  if (appError) {
    return (
      <ErrorBoundary
        error={appError}
        onRetry={() => {
          setAppError(null);
          setIsInitialized(false);
        }}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white overflow-hidden">
          {/* 主应用内容 */}
          <div className="relative w-full h-full">
            {/* 移动端菜单按钮 */}
            {isMobile && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </motion.button>
            )}

            {/* 移动端导航菜单 */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  className="fixed inset-y-0 left-0 z-40 w-64 bg-black/90 backdrop-blur-lg"
                >
                  <div className="flex flex-col p-6 space-y-6">
                    {/* 用户信息 */}
                    {currentUser && (
                      <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {currentUser.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{currentUser.username}</div>
                          <div className="text-sm text-white/60">
                            {currentUser.statistics.scenesCreated} 场景创建
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 导航菜单 */}
                    <nav className="flex-1 space-y-2">
                      <button
                        onClick={() => handleNavigation('home')}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <Home className="w-5 h-5 text-white" />
                        <span className="text-white">首页</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigation('camera')}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <Camera className="w-5 h-5 text-white" />
                        <span className="text-white">拍照识别</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigation('gallery')}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <Grid className="w-5 h-5 text-white" />
                        <span className="text-white">我的NFT</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigation('profile')}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <UserIcon className="w-5 h-5 text-white" />
                        <span className="text-white">个人资料</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigation('settings')}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <SettingsIcon className="w-5 h-5 text-white" />
                        <span className="text-white">设置</span>
                      </button>
                    </nav>

                    {/* 退出登录 */}
                    {isAuthenticated && (
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <span className="text-red-400">退出登录</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 底部导航栏 */}
            <motion.nav
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="fixed bottom-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-30"
            >
              {/* 首页按钮 */}
              <button
                onClick={() => handleNavigation('home')}
                className="flex flex-col items-center justify-center w-16 h-full hover:bg-white/10 transition-colors group"
                title="首页"
              >
                <Home className="w-6 h-6 text-white/60 group-hover:text-white" />
                <div className="mt-1 text-xs text-white/50 group-hover:text-white/80">首页</div>
              </button>
              
              {/* 相机按钮 */}
              <button
                onClick={() => handleNavigation('camera')}
                className="flex flex-col items-center justify-center w-16 h-full hover:bg-white/10 transition-colors group"
                title="拍照识别"
              >
                <Camera className="w-6 h-6 text-white/60 group-hover:text-white" />
                <div className="mt-1 text-xs text-white/50 group-hover:text-white/80">相机</div>
              </button>
              
              {/* NFT画廊按钮 */}
              <button
                onClick={() => handleNavigation('gallery')}
                className="flex flex-col items-center justify-center w-16 h-full hover:bg-white/10 transition-colors group"
                title="NFT画廊"
              >
                <Grid className="w-6 h-6 text-white/60 group-hover:text-white" />
                <div className="mt-1 text-xs text-white/50 group-hover:text-white/80">画廊</div>
              </button>
              
              {/* 个人资料按钮 */}
              <button
                onClick={() => handleNavigation('profile')}
                className="flex flex-col items-center justify-center w-16 h-full hover:bg-white/10 transition-colors group"
                title="个人资料"
              >
                <UserIcon className="w-6 h-6 text-white/60 group-hover:text-white" />
                <div className="mt-1 text-xs text-white/50 group-hover:text-white/80">我的</div>
              </button>

              {/* 设置按钮 */}
              <button
                onClick={() => handleNavigation('settings')}
                className="flex flex-col items-center justify-center w-16 h-full hover:bg-white/10 transition-colors group"
                title="设置"
              >
                <SettingsIcon className="w-6 h-6 text-white/60 group-hover:text-white" />
                <div className="mt-1 text-xs text-white/50 group-hover:text-white/80">设置</div>
              </button>

              {/* 拍照按钮 */}
              <button
                onClick={() => setShowCamera(true)}
                className="flex flex-col items-center justify-center w-16 h-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all group"
                title="快速拍照"
              >
                <Camera className="w-6 h-6 text-white" />
                <div className="mt-1 text-xs text-white">拍照</div>
              </button>

              {/* 上传图片按钮 */}
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex flex-col items-center justify-center w-16 h-full bg-gradient-to-br from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 transition-all group"
                title="上传图片"
              >
                <Upload className="w-6 h-6 text-white" />
                <div className="mt-1 text-xs text-white">上传</div>
              </button>
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e)}
              />

              {/* 关闭摄像头按钮 */}
              {showCamera && (
                <button
                  onClick={() => setShowCamera(false)}
                  className="flex flex-col items-center justify-center w-16 h-full hover:bg-white/10 transition-colors group"
                  title="关闭摄像头"
                >
                  <X className="w-6 h-6 text-red-400 group-hover:text-red-300" />
                  <div className="mt-1 text-xs text-red-400 group-hover:text-red-300">关闭</div>
                </button>
              )}
            </motion.nav>

            {/* 主内容区域 */}
            <main className={`${isMobile ? 'w-full' : 'w-full pb-20'} h-full`}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      onNavigate={handleNavigation}
                      user={currentUser}
                    />
                  }
                />
                <Route path="/gallery" element={<NFTGallery />} />
                <Route path="/profile" element={<Profile user={currentUser} />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>

            {/* 移除快速操作按钮 */}
          </div>

          {/* 相机模态框 */}
          <AnimatePresence>
            {showCamera && (
              <CameraCapture
                onRecognitionComplete={handleRecognitionComplete}
                onClose={() => setShowCamera(false)}
              />
            )}
          </AnimatePresence>

          {/* 场景查看器模态框 */}
          <AnimatePresence>
            {showSceneViewer && (
              <SceneViewer
                artifact={showSceneViewer}
                scene={currentScene}
                onSceneGenerated={handleSceneGenerated}
                onClose={() => {
                  setShowSceneViewer(null);
                  setCurrentScene(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* 全局加载指示器 */}
          <div id="global-loading" className="hidden" />
          
          {/* 全局提示容器 */}
          <div id="global-toast" className="fixed top-4 right-4 z-50 space-y-2" />
        </div>
    </ErrorBoundary>
  );
};