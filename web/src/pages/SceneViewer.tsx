import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, 
  Maximize2, Settings, RotateCcw,
  Zap, Eye, Headphones, Share2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { sceneGenerationService } from '@/services/sceneGenerationService';
import { Artifact, Scene, SceneSegment } from '@/types';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface SceneViewerProps {
  artifact: Artifact;
  scene?: Scene;
  onClose: () => void;
  onSceneGenerated?: (scene: Scene) => void;
}

interface SceneControls {
  isPlaying: boolean;
  currentSegment: number;
  volume: number;
  speed: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  isFullscreen: boolean;
  isVR: boolean;
  isAR: boolean;
}

export const SceneViewer: React.FC<SceneViewerProps> = ({
  artifact,
  scene: initialScene,
  onClose,
  onSceneGenerated,
}) => {
  const { isMobile, isTablet, capabilities } = useDeviceDetection();
  const [scene, setScene] = useState<Scene | null>(initialScene || null);
  const [isGenerating, setIsGenerating] = useState(!initialScene);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [controls, setControls] = useState<SceneControls>({
    isPlaying: false,
    currentSegment: 0,
    volume: 0.7,
    speed: 1,
    quality: capabilities.gpuLevel >= 2 ? 'high' : 'medium',
    isFullscreen: false,
    isVR: false,
    isAR: false,
  });

  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [is3DEnabled, setIs3DEnabled] = useState(true);
  const [particleEffects, setParticleEffects] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  const sceneContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  // 初始化场景
  useEffect(() => {
    if (!scene && artifact && !isGenerating) {
      generateScene();
    }
  }, [scene, artifact, isGenerating]);

  // 生成场景
  const generateScene = useCallback(async () => {
    if (!artifact) return;

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      const result = await sceneGenerationService.generateSceneStream(
        artifact,
        {
          quality: controls.quality,
          includeAudio: true,
          historicalAccuracy: 'balanced',
          onProgress: (progress) => {
            setGenerationProgress(progress.percentage);
            setGenerationStage(progress.stage);
          },
        }
      );

      if (result) {
        setScene(result);
        onSceneGenerated?.(result);
        initializeSceneView(result);
      } else {
        setError('场景生成失败，请重试');
      }
    } catch (error) {
      console.error('场景生成失败:', error);
      setError('场景生成过程中出现错误');
    } finally {
      setIsGenerating(false);
    }
  }, [artifact, controls.quality, onSceneGenerated]);

  // 初始化场景视图
  const initializeSceneView = (sceneData: Scene) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      console.error('WebGL not supported');
      setIs3DEnabled(false);
      return;
    }

    // 初始化WebGL渲染器
    initializeWebGLRenderer(gl, sceneData);
  };

  // 初始化WebGL渲染器
  const initializeWebGLRenderer = (gl: WebGLRenderingContext, sceneData: Scene) => {
    // 这里会集成Three.js或其他3D渲染引擎
    // 简化示例，实际实现会更复杂
    console.log('Initializing WebGL renderer for scene:', sceneData.title);
  };

  // 播放/暂停控制
  const togglePlay = () => {
    setControls(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));

    if (audioRef.current) {
      if (controls.isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // 音量控制
  const handleVolumeChange = (volume: number) => {
    setControls(prev => ({ ...prev, volume }));
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  // 切换到下一个片段
  const nextSegment = () => {
    if (!scene) return;
    
    const nextIndex = (controls.currentSegment + 1) % scene.segments.length;
    setControls(prev => ({ ...prev, currentSegment: nextIndex }));
  };

  // 切换到上一个片段
  const previousSegment = () => {
    if (!scene) return;
    
    const prevIndex = controls.currentSegment === 0 
      ? scene.segments.length - 1 
      : controls.currentSegment - 1;
    setControls(prev => ({ ...prev, currentSegment: prevIndex }));
  };

  // 全屏控制
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      sceneContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setControls(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  // VR模式控制
  const toggleVR = () => {
    if ('xr' in navigator) {
      setControls(prev => ({ ...prev, isVR: !prev.isVR }));
      // 初始化WebXR会话
    } else {
      setError('您的设备不支持VR模式');
    }
  };

  // AR模式控制
  const toggleAR = () => {
    if ('xr' in navigator) {
      setControls(prev => ({ ...prev, isAR: !prev.isAR }));
      // 初始化AR会话
    } else {
      setError('您的设备不支持AR模式');
    }
  };

  // 重置视角
  const resetView = () => {
    // 重置相机位置和旋转
    console.log('Resetting view');
  };

  // 显示控制栏
  const showControlsBar = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // 分享场景
  const shareScene = async () => {
    if (!scene) return;

    try {
      const shareUrl = `${window.location.origin}/scene/${scene.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: scene.title,
          text: scene.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // 显示复制成功提示
      }
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  // 当前场景片段
  const currentSegment = scene?.segments[controls.currentSegment];

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div 
        ref={sceneContainerRef}
        className="relative w-full h-full"
        onMouseMove={showControlsBar}
        onTouchStart={showControlsBar}
      >
        {/* 3D场景画布 */}
        {is3DEnabled && (
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: scene ? 'block' : 'none' }}
          />
        )}

        {/* 2D降级显示 */}
        {!is3DEnabled && scene && currentSegment && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">{currentSegment.title}</h2>
              <p className="text-lg mb-4">{currentSegment.description}</p>
              <div className="text-white/60">
                时间: {Math.floor(currentSegment.duration / 60)}:{(currentSegment.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        {/* 生成进度 */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white max-w-md mx-auto p-6">
              <motion.div
                className="w-24 h-24 mx-auto mb-6 border-4 border-purple-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <h3 className="text-xl font-semibold mb-2">正在生成4D时空场景</h3>
              <p className="text-white/60 mb-4">{generationStage}</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${generationProgress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-white/40 mt-2">{generationProgress.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white max-w-md mx-auto p-6">
              <p className="text-xl mb-4">{error}</p>
              <button
                onClick={generateScene}
                className="px-6 py-3 bg-purple-500 rounded-full font-medium"
              >
                重试
              </button>
            </div>
          </div>
        )}

        {/* 场景控制栏 */}
        <AnimatePresence>
          {scene && showControls && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
            >
              {/* 片段信息 */}
              <div className="text-center text-white mb-4">
                <h3 className="text-lg font-semibold">{currentSegment?.title}</h3>
                <p className="text-sm text-white/60">
                  {controls.currentSegment + 1} / {scene.segments.length}
                </p>
              </div>

              {/* 主控制栏 */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                {/* 片段切换 */}
                <button
                  onClick={previousSegment}
                  className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                  disabled={controls.currentSegment === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                {/* 播放/暂停 */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  className="p-4 bg-white rounded-full"
                >
                  {controls.isPlaying ? (
                    <Pause className="w-8 h-8 text-black" />
                  ) : (
                    <Play className="w-8 h-8 text-black" />
                  )}
                </motion.button>

                <button
                  onClick={nextSegment}
                  className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                  disabled={controls.currentSegment === scene.segments.length - 1}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* 辅助控制 */}
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {/* 左侧控制 */}
                <div className="flex items-center space-x-2">
                  {/* 音量控制 */}
                  <button
                    onClick={() => handleVolumeChange(controls.volume > 0 ? 0 : 0.7)}
                    className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                  >
                    {controls.volume > 0 ? (
                      <Volume2 className="w-5 h-5 text-white" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-white" />
                    )}
                  </button>

                  {/* 速度控制 */}
                  <select
                    value={controls.speed}
                    onChange={(e) => setControls(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                    className="bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm text-sm"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="1">1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                </div>

                {/* 中间控制 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={resetView}
                    className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                    title="重置视角"
                  >
                    <RotateCcw className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`p-2 ${autoRotate ? 'bg-purple-500' : 'bg-white/20'} rounded-full backdrop-blur-sm`}
                    title="自动旋转"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => setParticleEffects(!particleEffects)}
                    className={`p-2 ${particleEffects ? 'bg-purple-500' : 'bg-white/20'} rounded-full backdrop-blur-sm`}
                    title="粒子特效"
                  >
                    <Zap className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* 右侧控制 */}
                <div className="flex items-center space-x-2">
                  {/* VR/AR模式 */}
                  {capabilities.xr && (
                    <>
                      <button
                        onClick={toggleVR}
                        className={`p-2 ${controls.isVR ? 'bg-purple-500' : 'bg-white/20'} rounded-full backdrop-blur-sm`}
                        title="VR模式"
                      >
                        <div className="w-5 h-5 text-white font-bold">VR</div>
                      </button>

                      <button
                        onClick={toggleAR}
                        className={`p-2 ${controls.isAR ? 'bg-purple-500' : 'bg-white/20'} rounded-full backdrop-blur-sm`}
                        title="AR模式"
                      >
                        <div className="w-5 h-5 text-white font-bold">AR</div>
                      </button>
                    </>
                  )}

                  {/* 全屏 */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                    title="全屏"
                  >
                    <Maximize2 className="w-5 h-5 text-white" />
                  </button>

                  {/* 分享 */}
                  <button
                    onClick={shareScene}
                    className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                    title="分享"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </button>

                  {/* 设置 */}
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                    title="设置"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 顶部关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-white/20 rounded-full backdrop-blur-sm z-10"
        >
          <div className="w-6 h-6 text-white">×</div>
        </button>

        {/* 设置面板 */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute top-4 right-4 bottom-4 w-80 bg-black/80 backdrop-blur-md rounded-lg p-6 text-white overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-4">场景设置</h3>
              
              {/* 质量设置 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">渲染质量</label>
                <select
                  value={controls.quality}
                  onChange={(e) => setControls(prev => ({ ...prev, quality: e.target.value as any }))}
                  className="w-full bg-white/20 rounded-lg px-3 py-2"
                >
                  <option value="low">低质量</option>
                  <option value="medium">中等质量</option>
                  <option value="high">高质量</option>
                  <option value="ultra">超高质量</option>
                </select>
              </div>

              {/* 音频设置 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">音频设置</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>背景音乐</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>音效</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 显示设置 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">显示设置</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>3D渲染</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={is3DEnabled}
                        onChange={(e) => setIs3DEnabled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>粒子特效</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={particleEffects}
                        onChange={(e) => setParticleEffects(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>自动旋转</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoRotate}
                        onChange={(e) => setAutoRotate(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 性能信息 */}
              <div className="text-sm text-white/60">
                <div>FPS: 60</div>
                <div>分辨率: {window.innerWidth}x{window.innerHeight}</div>
                <div>设备: {isMobile ? '移动设备' : '桌面设备'}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 音频元素 */}
        {currentSegment?.audioNarration && (
          <audio
            ref={audioRef}
            src={currentSegment.audioNarration}
            loop={false}
            onEnded={() => {
              if (controls.isPlaying) {
                nextSegment();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};