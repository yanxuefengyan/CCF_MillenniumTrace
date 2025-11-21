/**
 * 模拟API服务 - 用于开发环境
 * 当后端服务不可用时提供模拟数据
 */

import { User, Artifact, Scene, NFT, RecognitionResult, SceneGenerationStatus, NFTMintStatus } from '@/types';

export class MockApiService {
  private static instance: MockApiService;
  private mockData: {
    users: User[];
    artifacts: Artifact[];
    scenes: Scene[];
    nfts: NFT[];
  };

  private constructor() {
    this.mockData = this.generateMockData();
  }

  static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  // 模拟用户登录
  async login(username: string, password: string): Promise<User | null> {
    const user = this.mockData.users.find(u => u.username === username);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    return user || null;
  }

  // 模拟用户注册
  async register(username: string, email: string, password: string): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      avatar: '/assets/avatar-default.png',
      statistics: {
        scenesCreated: 0,
        nftsMinted: 0,
        totalDonation: 0,
        viewingTime: 0,
        favoriteCategories: [],
        achievements: []
      },
      settings: {
        language: 'zh-CN',
        autoSave: true,
        quality: 'medium',
        notifications: {
          nft_minted: true,
          donation_completed: true,
          scene_shared: true
        },
        privacy: {
          share_analytics: true,
          allow_personalization: true
        }
      },
      createdAt: new Date().toISOString()
    };
    this.mockData.users.push(newUser);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    return newUser;
  }

  // 模拟藏品识别
  async recognizeArtifact(imageFile: File): Promise<RecognitionResult> {
    await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟识别过程
    const randomArtifact = this.mockData.artifacts[Math.floor(Math.random() * this.mockData.artifacts.length)];
    return {
      success: true,
      artifact: randomArtifact,
      confidence: Math.random() * 0.3 + 0.7, // 70% - 100% 的置信度
      timestamp: Date.now()
    };
  }

  // 模拟场景生成
  async generateScene(artifactId: string): Promise<SceneGenerationStatus> {
    const totalSteps = 5;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 每步耗时2秒
      const status: SceneGenerationStatus = {
        status: step === totalSteps ? 'completed' : 'generating',
        progress: step / totalSteps,
        currentStep: `正在生成第 ${step} 个场景段落`,
      };
      // 在实际应用中，这里应该通过WebSocket发送状态更新
      console.log('Scene generation status:', status);
    }
    return {
      status: 'completed',
      progress: 1,
      currentStep: '场景生成完成'
    };
  }

  // 模拟NFT铸造
  async mintNFT(sceneId: string): Promise<NFTMintStatus> {
    await new Promise(resolve => setTimeout(resolve, 5000)); // 模拟铸造过程
    const newNFT: NFT = {
      id: `nft-${Date.now()}`,
      tokenId: Math.floor(Math.random() * 1000000).toString(),
      artifactId: this.mockData.scenes.find(s => s.id === sceneId)?.artifactId || '',
      sceneId,
      imageUrl: '/assets/nfts/sample-nft.jpg',
      donationAmount: Math.random() * 100,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };
    this.mockData.nfts.push(newNFT);
    return {
      status: 'completed',
      transactionHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    };
  }

  // 获取用户的NFT列表
  async getUserNFTs(userId: string): Promise<NFT[]> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    return this.mockData.nfts.filter(nft => nft.id.startsWith(userId));
  }

  // 获取用户创建的场景列表
  async getUserScenes(userId: string): Promise<Scene[]> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    return this.mockData.scenes.filter(scene => scene.id.startsWith(userId));
  }

  /**
   * 模拟初始同步API
   */
  async initialSync(userId: string): Promise<any> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = this.mockData.users.find(u => u.id === userId) || this.mockData.users[0];
    
    return {
      success: true,
      data: {
        user,
        artifacts: this.mockData.artifacts.slice(0, 3),
        scenes: this.mockData.scenes.slice(0, 2),
        nfts: this.mockData.nfts.slice(0, 1),
        activities: [
          {
            id: '1',
            type: 'scene_created',
            timestamp: new Date().toISOString(),
            description: '创建了第一个时空场景'
          }
        ]
      },
      synced_count: {
        artifacts: 3,
        scenes: 2,
        nfts: 1,
        activities: 1
      }
    };
  }

  /**
   * 模拟WebSocket连接
   */
  createMockWebSocket(userId: string): MockWebSocket {
    return new MockWebSocket(userId);
  }

  /**
   * 生成模拟数据
   */
  private generateMockData() {
    const mockUser: User = {
      id: 'demo-user-001',
      username: '时光旅人',
      email: 'traveler@millennium-trace.dev',
      avatar: '/assets/avatar-default.png',
      createdAt: '2024-01-15T00:00:00.000Z',
      statistics: {
        scenesCreated: 8,
        nftsMinted: 5,
        totalDonation: 268.5,
        viewingTime: 3600000,
        favoriteCategories: ['陶瓷', '青铜器', '字画'],
        achievements: [
          {
            id: 'ach-001',
            name: '时空探索者',
            description: '创建第一个4D场景',
            iconUrl: '/assets/achievements/explorer.png',
            unlockedAt: Date.now() - 86400000,
            rarity: 'rare'
          }
        ]
      },
      settings: {
        language: 'zh-CN',
        autoSave: true,
        quality: 'high',
        notifications: {
          nft_minted: true,
          donation_completed: true,
          scene_shared: true
        },
        privacy: {
          share_analytics: true,
          allow_personalization: true
        }
      }
    };

    const mockArtifacts: Artifact[] = [
      {
        id: 'artifact-001',
        name: '青花瓷瓶',
        description: '明代景德镇官窑青花瓷瓶，绘有山水人物图案，器型端庄，釉色纯正，青花发色鲜艳。',
        era: '明代',
        origin: '江西景德镇',
        category: '陶瓷',
        imageUrl: '/assets/artifacts/vase-1.jpg',
        museumName: '故宫博物院',
        materials: ['瓷土', '青花料', '釉料']
      },
      {
        id: 'artifact-002', 
        name: '青铜鼎',
        description: '商代晚期青铜鼎，饕餮纹饰，铸造精美，是商代青铜器的代表作品。',
        era: '商代',
        origin: '河南安阳',
        category: '青铜器',
        imageUrl: '/assets/artifacts/bronze-1.jpg',
        museumName: '中国国家博物馆',
        materials: ['青铜', '铜', '锡', '铅']
      },
      {
        id: 'artifact-003',
        name: '唐三彩马',
        description: '唐代三彩釉陶马，造型生动，色彩艳丽，展现了唐代制陶工艺的高超水平。',
        era: '唐代',
        origin: '陕西西安',
        category: '陶瓷',
        imageUrl: '/assets/artifacts/tang-horse.jpg',
        museumName: '陕西历史博物馆',
        materials: ['陶土', '三彩釉']
      }
    ];

    const mockScenes: Scene[] = [
      {
        id: 'scene-001',
        artifactId: 'artifact-001',
        title: '青花瓷瓶的诞生',
        description: '追溯明代景德镇官窑青花瓷的制作过程',
        segments: [],
        duration: 120000,
        createdAt: new Date().toISOString()
      },
      {
        id: 'scene-002',
        artifactId: 'artifact-002',
        title: '青铜鼎的铸造',
        description: '重现商代青铜器的铸造工艺',
        segments: [],
        duration: 150000,
        createdAt: new Date().toISOString()
      }
    ];

    const mockNFTs: NFT[] = [
      {
        id: 'nft-001',
        artifactId: 'artifact-001',
        sceneId: 'scene-001',
        tokenId: '1001',
        imageUrl: '/assets/nfts/vase-nft.jpg',
        donationAmount: 88.88,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      },
      {
        id: 'nft-002',
        artifactId: 'artifact-002',
        sceneId: 'scene-002',
        tokenId: '1002',
        imageUrl: '/assets/nfts/bronze-nft.jpg',
        donationAmount: 168.00,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      }
    ];

    return {
      users: [mockUser],
      artifacts: mockArtifacts,
      scenes: mockScenes,
      nfts: mockNFTs
    };
  }
}

/**
 * 模拟WebSocket类
 */
class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  constructor(private userId: string) {
    // 模拟连接过程
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
      
      // 发送欢迎消息
      if (this.onmessage) {
        setTimeout(() => {
          this.onmessage(new MessageEvent('message', {
            data: JSON.stringify({
              type: 'sync_completed',
              data: {
                message: '欢迎来到千年影迹！',
                userId: this.userId
              }
            })
          }));
        }, 500);
      }

      // 模拟定期发送状态更新
      setInterval(() => {
        if (this.onmessage) {
          this.onmessage(new MessageEvent('message', {
            data: JSON.stringify({
              type: 'status_update',
              data: {
                onlineUsers: Math.floor(Math.random() * 100 + 50),
                activeScenes: Math.floor(Math.random() * 20 + 5),
                recentlyMintedNFTs: Math.floor(Math.random() * 10)
              }
            })
          }));
        }
      }, 30000); // 每30秒发送一次状态更新
    }, 1000);
  }

  send(data: string): void {
    // 模拟发送消息
    console.log('MockWebSocket发送消息:', data);
    // 模拟接收响应
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'response',
            data: {
              message: '服务器已收到消息',
              originalData: data
            }
          })
        }));
      }
    }, 500);
  }

  close(): void {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

// 导出静态方法
export const mockApiService = MockApiService.getInstance();