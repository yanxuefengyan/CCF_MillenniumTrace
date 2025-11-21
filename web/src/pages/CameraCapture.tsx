import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Zap, RefreshCw, Sparkles } from 'lucide-react';
import { aiRecognitionService } from '@/services/aiRecognitionService';
import { Artifact, RecognitionResult } from '@/types';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface CameraCaptureProps {
  onRecognitionComplete: (result: RecognitionResult) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onRecognitionComplete,
  onClose,
}) => {
  const { isMobile, cameraAvailable } = useDeviceDetection();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化相机
  useEffect(() => {
    // 即使不支持相机或不是移动设备，也尝试初始化相机
    // 因为部分桌面浏览器也支持摄像头
    initializeCamera();
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      // 首先检查是否支持MediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('浏览器不支持MediaDevices API');
      }

      // 简化相机配置，增加兼容性
      const constraints = {
        video: {
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 1280 },  // 降低理想分辨率，提高兼容性
          height: { ideal: 720 },
        },
        audio: false,
      };

      console.log('正在请求相机权限...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('相机权限获取成功，设置视频流');
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('视频元数据加载完成，播放视频');
          videoRef.current?.play().catch(e => {
            console.error('自动播放失败:', e);
            setError('视频启动失败，请点击屏幕尝试播放');
          });
        };
      }
    } catch (error) {
      console.error('相机初始化失败:', error);
      setError('无法访问相机，请确保已授予相机权限并刷新页面');
    }
  };

  // 拍照
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // 设置画布尺寸
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 绘制当前帧
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 转换为Blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);

        // 创建File对象用于识别
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        
        // 开始识别
        await performRecognition(file);
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('拍照失败:', error);
      setError('拍照失败，请重试');
    } finally {
      setIsCapturing(false);
    }
  }, [zoom]);

  // 文件选择处理
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setCapturedImage(URL.createObjectURL(file));
    await performRecognition(file);
  };

  // 执行识别
  const performRecognition = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await aiRecognitionService.recognizeArtifact(file);
      setRecognitionResult(result);

      if (result.success) {
        // 延迟显示结果，给用户更好的体验
        setTimeout(() => {
          onRecognitionComplete(result);
        }, 2000);
      } else {
        setError(result.error || '识别失败，请重试');
      }
    } catch (error) {
      console.error('识别失败:', error);
      setError('识别过程中出现错误，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 重新拍照
  const retakePhoto = () => {
    setCapturedImage(null);
    setRecognitionResult(null);
    setError(null);
  };

  // 切换闪光灯
  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
    // 实际闪光灯控制需要相机API支持
  };

  // 调整缩放
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    // 实际缩放控制需要相机API支持
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <AnimatePresence mode="wait">
        {/* 相机视图 */}
        {!capturedImage && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full"
          >
            {/* 视频预览 */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* 画布（用于拍照） */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* 控制栏 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center justify-between max-w-md mx-auto">
                {/* 文件上传按钮 */}
                {!cameraAvailable && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white/20 rounded-full backdrop-blur-sm"
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </button>
                )}

                {/* 拍照按钮 */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-black rounded-full" />
                  {isCapturing && (
                    <motion.div
                      className="absolute inset-0 border-4 border-white rounded-full"
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>

                {/* 闪光灯控制 */}
                {cameraAvailable && (
                  <button
                    onClick={toggleFlash}
                    className="p-3 bg-white/20 rounded-full backdrop-blur-sm"
                  >
                    <Zap className={`w-6 h-6 text-white ${isFlashOn ? 'opacity-100' : 'opacity-50'}`} />
                  </button>
                )}
              </div>
            </div>

            {/* 顶部控制栏 */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                
                <div className="text-white text-sm font-medium">
                  AI藏品识别
                </div>
                
                {isMobile && (
                  <button
                    onClick={initializeCamera}
                    className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                  >
                    <RefreshCw className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* 关闭摄像头按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full backdrop-blur-sm"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* 指导提示 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="text-center">
                <div className="w-64 h-64 border-2 border-white/30 rounded-lg mb-4" />
                <p className="text-white/80 text-sm">
                  请将藏品置于框内
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 拍摄结果视图 */}
        {capturedImage && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative w-full h-full flex flex-col"
          >
            {/* 预览图片 */}
            <div className="flex-1 relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain bg-black"
              />

              {/* 处理状态 */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 border-4 border-t-white border-white/30 rounded-full mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-white text-sm">AI识别中...</p>
                  </div>
                </div>
              )}

              {/* 识别结果 */}
              {recognitionResult && recognitionResult.success && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-md mx-auto">
                    <h3 className="text-white font-semibold mb-2">
                      识别成功！
                    </h3>
                    <p className="text-white/80 text-sm mb-1">
                      {recognitionResult.artifact?.name}
                    </p>
                    <p className="text-white/60 text-xs">
                      置信度: {(recognitionResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 错误提示 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-900/80 to-transparent p-6"
                >
                  <div className="bg-red-500/20 backdrop-blur-md rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-white text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 底部控制栏 */}
            <div className="bg-black p-4">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <button
                  onClick={retakePhoto}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm text-white font-medium"
                >
                  重新拍摄
                </button>
                
                {recognitionResult && recognitionResult.success && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRecognitionComplete(recognitionResult)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium"
                  >
                    查看详情
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};