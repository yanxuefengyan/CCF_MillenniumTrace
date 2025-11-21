import { Artifact, Scene, SceneSegment, SceneObject, SceneEffect } from '@/types';

// 4D时空情景生成服务类
export class SceneGenerationService {
  private static instance: SceneGenerationService;
  private apiUrl: string;
  private apiKey: string;

  private constructor() {
    this.apiUrl = import.meta.env.VITE_SCENE_API_URL || 'https://api.millennium-trace.ai/scene';
    this.apiKey = import.meta.env.VITE_SCENE_API_KEY || '';
  }

  public static getInstance(): SceneGenerationService {
    if (!SceneGenerationService.instance) {
      SceneGenerationService.instance = new SceneGenerationService();
    }
    return SceneGenerationService.instance;
  }

  /**
   * 生成4D时空情景
   * @param artifact 藏品信息
   * @param options 生成选项
   * @returns 生成的场景
   */
  async generateScene(
    artifact: Artifact,
    options: {
      quality?: 'low' | 'medium' | 'high' | 'ultra';
      duration?: number;
      includeAudio?: boolean;
      customSegments?: Partial<SceneSegment>[];
      historicalAccuracy?: 'strict' | 'balanced' | 'creative';
    } = {}
  ): Promise<{
    success: boolean;
    scene?: Scene;
    processingTime: number;
    error?: string;
  }> {
    try {
      const requestBody = {
        artifact_id: artifact.id,
        artifact_info: {
          name: artifact.name,
          category: artifact.category,
          period: artifact.period,
          material: artifact.material,
          description: artifact.description,
        },
        options: {
          quality: options.quality || 'high',
          duration: options.duration || 120,
          include_audio: options.includeAudio !== false,
          custom_segments: options.customSegments || [],
          historical_accuracy: options.historicalAccuracy || 'balanced',
        },
        device_capabilities: await this.getDeviceCapabilities(),
      };

      const response = await fetch(`${this.apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`场景生成失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        scene: this.transformSceneData(result.scene),
        processingTime: result.processing_time || 0,
      };
    } catch (error) {
      console.error('场景生成失败:', error);
      return {
        success: false,
        processingTime: 0,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 实时生成场景流
   * @param artifact 藏品信息
   * @param onProgress 进度回调
   * @returns 场景流
   */
  async generateSceneStream(
    artifact: Artifact,
    onProgress?: (progress: {
      stage: string;
      percentage: number;
      estimatedTime: number;
    }) => void
  ): Promise<Scene | null> {
    try {
      const requestBody = {
        artifact_id: artifact.id,
        artifact_info: {
          name: artifact.name,
          category: artifact.category,
          period: artifact.period,
          material: artifact.material,
        },
        device_capabilities: await this.getDeviceCapabilities(),
      };

      const response = await fetch(`${this.apiUrl}/generate/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`流式生成失败: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let sceneData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'progress') {
                onProgress?.({
                  stage: parsed.stage,
                  percentage: parsed.percentage,
                  estimatedTime: parsed.estimated_time,
                });
              } else if (parsed.type === 'complete') {
                sceneData = parsed.scene;
              }
            } catch (e) {
              console.warn('解析流数据失败:', e);
            }
          }
        }
      }

      return sceneData ? this.transformSceneData(sceneData) : null;
    } catch (error) {
      console.error('流式生成失败:', error);
      return null;
    }
  }

  /**
   * 获取场景模板
   * @param category 藏品类别
   * @returns 场景模板列表
   */
  async getSceneTemplates(category?: string): Promise<{
    id: string;
    name: string;
    description: string;
    preview: string;
    category: string;
    segments: number;
    estimatedDuration: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }[]> {
    try {
      const params = category ? `?category=${encodeURIComponent(category)}` : '';
      const response = await fetch(`${this.apiUrl}/templates${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取模板失败: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取场景模板失败:', error);
      return [];
    }
  }

  /**
   * 自定义场景编辑
   * @param scene 场景对象
   * @param modifications 修改内容
   * @returns 修改后的场景
   */
  async customizeScene(
    scene: Scene,
    modifications: {
      segmentEdits?: {
        segmentId: string;
        changes: Partial<SceneSegment>;
      }[];
      objectAdditions?: SceneObject[];
      objectRemovals?: string[];
      effectChanges?: {
        segmentId: string;
        effects: SceneEffect[];
      }[];
      narrationChanges?: {
        segmentId: string;
        narration: string;
      }[];
    }
  ): Promise<{
    success: boolean;
    scene?: Scene;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/customize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene_id: scene.id,
          modifications,
        }),
      });

      if (!response.ok) {
        throw new Error(`场景定制失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        scene: this.transformSceneData(result.scene),
      };
    } catch (error) {
      console.error('场景定制失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 场景质量优化
   * @param scene 场景对象
   * @param quality 目标质量
   * @returns 优化后的场景
   */
  async optimizeScene(
    scene: Scene,
    quality: 'low' | 'medium' | 'high' | 'ultra'
  ): Promise<{
    success: boolean;
    scene?: Scene;
    optimizationDetails?: {
      fileReduction: number;
      qualityImprovement: number;
      processingTime: number;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene_id: scene.id,
          target_quality: quality,
          device_capabilities: await this.getDeviceCapabilities(),
        }),
      });

      if (!response.ok) {
        throw new Error(`场景优化失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        scene: this.transformSceneData(result.scene),
        optimizationDetails: result.optimization_details,
      };
    } catch (error) {
      console.error('场景优化失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 场景预渲染
   * @param scene 场景对象
   * @param previewTime 预览时间点
   * @returns 预览图片
   */
  async previewScene(
    scene: Scene,
    previewTime: number
  ): Promise<{
    success: boolean;
    imageUrl?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene_id: scene.id,
          preview_time: previewTime,
          device_capabilities: await this.getDeviceCapabilities(),
        }),
      });

      if (!response.ok) {
        throw new Error(`场景预览失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        imageUrl: result.preview_url,
      };
    } catch (error) {
      console.error('场景预览失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取设备能力
   */
  private async getDeviceCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    const capabilities = {
      webgl: !!gl,
      webgl2: canvas.getContext('webgl2') !== null,
      maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048,
      maxVertexAttributes: gl ? gl.getParameter(gl.MAX_VERTEX_ATTRIBS) : 16,
      memory: (navigator as any).deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4,
      pixelRatio: window.devicePixelRatio || 1,
      screen: {
        width: screen.width,
        height: screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    // 检测WebXR支持
    if ('xr' in navigator) {
      capabilities.xr = true;
    }

    return capabilities;
  }

  /**
   * 转换场景数据格式
   */
  private transformSceneData(rawData: any): Scene {
    return {
      id: rawData.id,
      artifactId: rawData.artifact_id,
      title: rawData.title,
      description: rawData.description,
      segments: rawData.segments.map((segment: any) => ({
        id: segment.id,
        title: segment.title,
        description: segment.description,
        type: segment.type,
        duration: segment.duration,
        audioNarration: segment.audio_narration,
        objects: segment.objects || [],
        effects: segment.effects || [],
        metadata: segment.metadata || {},
      })),
      settings: rawData.settings,
      createdAt: rawData.created_at,
      updatedAt: rawData.updated_at,
      metadata: rawData.metadata || {},
    };
  }

  /**
   * 获取场景生成状态
   */
  async getGenerationStatus(generationId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    estimatedTime: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/status/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取状态失败: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取生成状态失败:', error);
      throw error;
    }
  }

  /**
   * 取消场景生成
   */
  async cancelGeneration(generationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/cancel/${generationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`取消生成失败: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('取消生成失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const sceneGenerationService = SceneGenerationService.getInstance();