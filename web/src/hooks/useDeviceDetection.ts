import { useState, useEffect } from 'react';
import { DeviceDetectionResult } from '@/types';

export const useDeviceDetection = (): DeviceDetectionResult => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceDetectionResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    cameraAvailable: false,
    capabilities: {
      webgl: false,
      webgl2: false,
      audioContext: false,
      gyroscope: false,
    },
  });

  useEffect(() => {
    const detectDevice = () => {
      // 检测设备类型
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?=.*Mobile)/i.test(userAgent) && window.innerWidth > 768;
      const isDesktop = !isMobile && !isTablet;

      // 检测相机可用性
      const cameraAvailable = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

      // 检测WebGL支持
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const gl2 = canvas.getContext('webgl2');
      const webgl = !!gl;
      const webgl2 = !!gl2;

      // 检测AudioContext支持
      const audioContext = !!(window.AudioContext || (window as any).webkitAudioContext);

      // 检测陀螺仪支持
      const gyroscope = 'DeviceOrientationEvent' in window;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        cameraAvailable,
        capabilities: {
          webgl,
          webgl2,
          audioContext,
          gyroscope,
        },
      });
    };

    detectDevice();

    // 监听窗口大小变化，重新检测设备类型
    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
};

// 额外的设备检测工具函数
export const getDeviceCapabilities = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  const capabilities = {
    maxTextureSize: 0,
    maxViewportDims: [0, 0],
    maxRenderbufferSize: 0,
    maxCombinedTextureImageUnits: 0,
  };

  if (gl) {
    capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    capabilities.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    capabilities.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    capabilities.maxCombinedTextureImageUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  }

  return capabilities;
};

// 性能评估函数
export const getPerformanceRating = (): 'low' | 'medium' | 'high' => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return 'low';

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
  
  // 简单的性能评估逻辑
  if (renderer.includes('Mali') || renderer.includes('Adreno 3')) {
    return 'low';
  } else if (renderer.includes('GTX') || renderer.includes('RTX') || renderer.includes('RX')) {
    return 'high';
  } else {
    return 'medium';
  }
};

// 内存估算函数
export const getAvailableMemory = (): number => {
  // @ts-ignore
  if (navigator.deviceMemory) {
    // @ts-ignore
    return navigator.deviceMemory * 1024; // 转换为MB
  }
  
  // 如果没有API支持，根据设备类型估算
  const userAgent = navigator.userAgent;
  if (/iPhone|iPad/.test(userAgent)) {
    return 4096; // iOS设备通常有较多内存
  } else if (/Android/.test(userAgent)) {
    return 2048; // Android设备内存变化较大，使用保守估计
  } else {
    return 8192; // 桌面设备通常有更多内存
  }
};