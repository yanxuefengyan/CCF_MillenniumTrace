import { User, Artifact, Scene, NFT, UserActivity } from '@/types';
import { mockApiService } from './mockApiService';

// 跨端数据同步服务类
export class SyncService {
  private static instance: SyncService;
  private apiUrl: string;
  private apiKey: string;
  private wsConnection: WebSocket | null = null;
  private syncQueue: Array<{
    type: string;
    data: any;
    timestamp: number;
    retryCount: number;
  }> = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private useMockApi: boolean = false;

  private constructor() {
    this.apiUrl = import.meta.env.VITE_SYNC_API_URL || 'https://api.millennium-trace.ai/sync';
    this.apiKey = import.meta.env.VITE_SYNC_API_KEY || '';
    
    // 检查是否需要使用模拟API
    this.useMockApi = !this.apiUrl.includes('localhost') || import.meta.env.DEV;
    
    // 监听网络状态变化
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // 启动定期同步
    this.startPeriodicSync();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * 初始化同步服务
   */
  async initialize(userId: string): Promise<void> {
    try {
      // 检查是否使用模拟API
      if (this.useMockApi) {
        await this.initializeWithMock(userId);
        return;
      }

      // 连接WebSocket用于实时同步
      await this.connectWebSocket(userId);
      
      // 执行初始同步
      await this.performInitialSync(userId);
      
      console.log('同步服务初始化完成');
    } catch (error) {
      console.error('同步服务初始化失败，尝试使用模拟API:', error);
      // 失败时尝试使用模拟API
      try {
        this.useMockApi = true;
        await this.initializeWithMock(userId);
      } catch (mockError) {
        console.error('模拟API初始化也失败:', mockError);
        throw error; // 抛出原始错误
      }
    }
  }

  /**
   * 使用模拟API初始化
   */
  private async initializeWithMock(userId: string): Promise<void> {
    try {
      // 创建模拟WebSocket
      this.wsConnection = mockApiService.createMockWebSocket(userId);
      
      // 执行模拟初始同步
      const result = await mockApiService.initialSync(userId);
      
      // 更新本地数据
      await this.updateLocalData(result.data);
      
      console.log('模拟API初始化完成');
    } catch (error) {
      console.error('模拟API初始化失败:', error);
      throw error;
    }
  }

  /**
   * 连接WebSocket
   */
  private async connectWebSocket(userId: string): Promise<void> {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `${this.apiUrl.replace('http', 'ws')}/ws/${userId}?token=${this.apiKey}`;
    
    return new Promise((resolve, reject) => {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('WebSocket连接已建立');
        resolve();
      };
      
      this.wsConnection.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };
      
      this.wsConnection.onclose = () => {
        console.log('WebSocket连接已关闭');
        this.handleWebSocketDisconnect();
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        reject(error);
      };
      
      // 连接超时处理
      setTimeout(() => {
        if (this.wsConnection?.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket连接超时'));
        }
      }, 10000);
    });
  }

  /**
   * 处理WebSocket消息
   */
  private handleWebSocketMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'sync_update':
          this.handleSyncUpdate(message.data);
          break;
        case 'conflict_detected':
          this.handleConflict(message.data);
          break;
        case 'sync_completed':
          this.handleSyncCompleted(message.data);
          break;
        default:
          console.warn('未知的WebSocket消息类型:', message.type);
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error);
    }
  }

  /**
   * 处理同步更新
   */
  private handleSyncUpdate(data: any): void {
    const { entityType, action, payload } = data;
    
    // 触发自定义事件，通知UI更新
    const event = new CustomEvent('syncUpdate', {
      detail: { entityType, action, payload }
    });
    window.dispatchEvent(event);
  }

  /**
   * 处理数据冲突
   */
  private handleConflict(data: any): void {
    const { conflictId, entityType, localData, remoteData } = data;
    
    // 触发冲突解决事件
    const event = new CustomEvent('syncConflict', {
      detail: { conflictId, entityType, localData, remoteData }
    });
    window.dispatchEvent(event);
  }

  /**
   * 处理同步完成
   */
  private handleSyncCompleted(data: any): void {
    const { syncedCount, errors } = data;
    
    // 触发同步完成事件
    const event = new CustomEvent('syncCompleted', {
      detail: { syncedCount, errors }
    });
    window.dispatchEvent(event);
  }

  /**
   * 处理WebSocket断开连接
   */
  private handleWebSocketDisconnect(): void {
    // 5秒后尝试重连
    setTimeout(() => {
      if (this.isOnline) {
        this.reconnectWebSocket();
      }
    }, 5000);
  }

  /**
   * 重连WebSocket
   */
  private async reconnectWebSocket(): Promise<void> {
    try {
      await this.connectWebSocket(this.getCurrentUserId());
    } catch (error) {
      console.error('WebSocket重连失败:', error);
      setTimeout(() => this.reconnectWebSocket(), 10000);
    }
  }

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): string {
    // 从本地存储或状态管理中获取当前用户ID
    return localStorage.getItem('currentUserId') || 'anonymous';
  }

  /**
   * 执行初始同步
   */
  private async performInitialSync(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/initial/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`初始同步失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      // 更新本地数据
      await this.updateLocalData(result.data);
      
      console.log('初始同步完成，同步数据:', result.synced_count);
    } catch (error) {
      console.error('初始同步失败:', error);
      throw error;
    }
  }

  /**
   * 更新本地数据
   */
  private async updateLocalData(data: any): Promise<void> {
    const updates = {
      user: data.user,
      artifacts: data.artifacts || [],
      scenes: data.scenes || [],
      nfts: data.nfts || [],
      activities: data.activities || [],
    };

    // 保存到本地存储
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        localStorage.setItem(`sync_${key}`, JSON.stringify(value));
      }
    }

    // 触发数据更新事件
    const event = new CustomEvent('localDataUpdated', { detail: updates });
    window.dispatchEvent(event);
  }

  /**
   * 同步用户数据
   */
  async syncUser(user: User): Promise<void> {
    await this.addToSyncQueue('user', 'update', user);
  }

  /**
   * 同步藏品数据
   */
  async syncArtifact(artifact: Artifact, action: 'create' | 'update' | 'delete'): Promise<void> {
    await this.addToSyncQueue('artifact', action, artifact);
  }

  /**
   * 同步场景数据
   */
  async syncScene(scene: Scene, action: 'create' | 'update' | 'delete'): Promise<void> {
    await this.addToSyncQueue('scene', action, scene);
  }

  /**
   * 同步NFT数据
   */
  async syncNFT(nft: NFT, action: 'create' | 'update' | 'delete'): Promise<void> {
    await this.addToSyncQueue('nft', action, nft);
  }

  /**
   * 同步用户活动
   */
  async syncActivity(activity: UserActivity): Promise<void> {
    await this.addToSyncQueue('activity', 'create', activity);
  }

  /**
   * 添加到同步队列
   */
  private async addToSyncQueue(entityType: string, action: string, data: any): Promise<void> {
    const syncItem = {
      type: entityType,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(syncItem);
    
    // 立即尝试同步（如果在线）
    if (this.isOnline && !this.syncInProgress) {
      await this.processSyncQueue();
    }
  }

  /**
   * 处理同步队列
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const batch = this.syncQueue.splice(0, 10); // 每次处理10个
      
      for (const item of batch) {
        try {
          await this.syncSingleItem(item);
        } catch (error) {
          console.error(`同步失败 (${item.type}):`, error);
          
          // 重试逻辑
          item.retryCount++;
          if (item.retryCount < 3) {
            this.syncQueue.push(item); // 重新加入队列
          } else {
            console.error(`同步失败，已达到最大重试次数:`, item);
          }
        }
      }

      // 继续处理剩余项目
      if (this.syncQueue.length > 0) {
        setTimeout(() => this.processSyncQueue(), 1000);
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 同步单个项目
   */
  private async syncSingleItem(item: any): Promise<void> {
    const response = await fetch(`${this.apiUrl}/sync/${item.type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: item.action,
        data: item.data,
        timestamp: item.timestamp,
        device_id: this.getDeviceId(),
      }),
    });

    if (!response.ok) {
      throw new Error(`同步失败: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '同步失败');
    }
  }

  /**
   * 获取设备ID
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  /**
   * 生成设备ID
   */
  private generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * 处理网络连接恢复
   */
  private handleOnline(): void {
    this.isOnline = true;
    console.log('网络连接已恢复');
    
    // 立即尝试同步
    if (this.syncQueue.length > 0) {
      this.processSyncQueue();
    }
    
    // 重连WebSocket
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      this.reconnectWebSocket();
    }
  }

  /**
   * 处理网络连接断开
   */
  private handleOffline(): void {
    this.isOnline = false;
    console.log('网络连接已断开');
    
    // 关闭WebSocket连接
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * 启动定期同步
   */
  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000); // 每30秒检查一次
  }

  /**
   * 强制同步所有数据
   */
  async forceSync(): Promise<{
    success: boolean;
    syncedCount: number;
    errors: string[];
  }> {
    try {
      const userId = this.getCurrentUserId();
      const response = await fetch(`${this.apiUrl}/force/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`强制同步失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      // 更新本地数据
      await this.updateLocalData(result.data);
      
      return {
        success: true,
        syncedCount: result.synced_count,
        errors: result.errors || [],
      };
    } catch (error) {
      console.error('强制同步失败:', error);
      return {
        success: false,
        syncedCount: 0,
        errors: [error instanceof Error ? error.message : '未知错误'],
      };
    }
  }

  /**
   * 解决同步冲突
   */
  async resolveConflict(
    conflictId: string,
    resolution: 'local' | 'remote' | 'merge',
    mergedData?: any
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/resolve/${conflictId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution,
          merged_data: mergedData,
          device_id: this.getDeviceId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`解决冲突失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      console.error('解决冲突失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(): {
    isOnline: boolean;
    isConnected: boolean;
    queueLength: number;
    lastSyncTime: number;
  } {
    return {
      isOnline: this.isOnline,
      isConnected: this.wsConnection?.readyState === WebSocket.OPEN,
      queueLength: this.syncQueue.length,
      lastSyncTime: parseInt(localStorage.getItem('lastSyncTime') || '0'),
    };
  }

  /**
   * 清理同步队列
   */
  clearSyncQueue(): void {
    this.syncQueue = [];
    console.log('同步队列已清理');
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    
    // 清理事件监听器
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    console.log('同步服务已断开连接');
  }
}

// 导出单例实例
export const syncService = SyncService.getInstance();