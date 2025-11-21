import { RecognitionResult } from '@/types';
import { mockArtifacts } from '@/data/mockArtifacts';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiRecognitionService = {
  // 模拟文物识别
  recognizeArtifact: async (imageFile: File): Promise<RecognitionResult> => {
    await delay(2000 + Math.random() * 1000); // 2-3秒延迟
    
    // 随机选择一个文物
    const artifact = mockArtifacts[Math.floor(Math.random() * mockArtifacts.length)];
    const confidence = 0.85 + Math.random() * 0.1; // 85-95%的置信度
    
    const isSuccess = Math.random() > 0.1; // 90%成功率
    
    if (isSuccess) {
      return {
        success: true,
        artifact: {
          ...artifact,
          imageUrl: URL.createObjectURL(imageFile), // 使用上传的图片
        },
        confidence,
        processingTime: 2500,
      };
    } else {
      return {
        success: false,
        error: '识别失败，请确保图片清晰且包含文物',
        confidence: 0,
        processingTime: 1500,
      };
    }
  },
};