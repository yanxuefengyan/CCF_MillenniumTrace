// 藏品信息类型
export interface ArtifactInfo {
  id: string;
  name: string;
  era: string;
  origin: string;
  description: string;
  category: string;
  materials: string[];
  dimensions: {
    height: number;
    width: number;
    depth: number;
    unit: 'cm' | 'mm' | 'm';
  };
  imageUrl?: string;
  museumName: string;
  registrationNumber: string;
  currentStatus: 'exhibited' | 'storage' | 'restoration' | 'loaned';
}

// 4D情景分镜类型
export interface SceneSegment {
  id: string;
  title: string;
  duration: number; // 毫秒
  type: 'creation' | 'circulation' | 'museum_entry' | 'restoration' | 'digital_return';
  description: string;
  gltfModel?: string; // glTF模型路径
  audioNarration?: string; // 语音解说
  particleEffects: ParticleEffect[];
  interactions: SceneInteraction[];
}

// 粒子特效配置
export interface ParticleEffect {
  id: string;
  type: 'starfield' | 'dust' | 'energy' | 'color_restore' | 'portal';
  position: {
    x: number;
    y: number;
    z: number;
  };
  intensity: number; // 0-1
  color?: string;
  duration: number;
  trigger: 'auto' | 'interaction';
}

// 场景交互配置
export interface SceneInteraction {
  id: string;
  type: 'gesture' | 'touch' | 'voice' | 'hover';
  trigger: string; // 触发条件
  action: 'open_door' | 'pick_brush' | 'zoom_in' | 'rotate' | 'play_sound';
  target: string; // 交互目标
  feedback: {
    visual?: string;
    audio?: string;
    haptic?: boolean;
  };
}

// 4D时空情景完整数据
export interface SpaceTimeScene {
  id: string;
  artifactId: string;
  userId: string;
  createdAt: number;
  segments: SceneSegment[];
  backgroundMusic: string;
  skyboxUrl: string;
  totalDuration: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

// 影迹NFT数据结构
export interface TraceNFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  chainId: number;
  artifactId: string;
  sceneId: string;
  userId: string;
  imageHash: string; // 用户合影哈希
  metadataHash: string; // 元数据哈希
  donationAmount: number; // 自动捐赠金额（元）
  createdAt: number;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

// 用户数据结构
export interface UserData {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  platform: 'wechat' | 'apple' | 'google' | 'anonymous';
  createdAt: number;
  settings: UserSettings;
  statistics: UserStatistics;
}

// 用户设置
export interface UserSettings {
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
  quality: 'low' | 'medium' | 'high' | 'auto';
  notifications: {
    nft_minted: boolean;
    donation_completed: boolean;
    scene_shared: boolean;
  };
  privacy: {
    share_analytics: boolean;
    allow_personalization: boolean;
  };
}

// 用户统计数据
export interface UserStatistics {
  scenesCreated: number;
  nftsMinted: number;
  totalDonation: number;
  viewingTime: number; // 总观看时长（毫秒）
  favoriteCategories: string[];
  achievements: Achievement[];
}

// 成就系统
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  timestamp: number;
}

// 设备信息
export interface DeviceInfo {
  platform: 'web' | 'ios' | 'android';
  version: string;
  model?: string;
  capabilities: {
    camera: boolean;
    gyroscope: boolean;
    webgl: boolean;
    webgl2: boolean;
    maxTextureSize: number;
    audioContext: boolean;
  };
  performance: {
    cpu: 'low' | 'medium' | 'high';
    gpu: 'low' | 'medium' | 'high';
    memory: number; // MB
  };
}

// 同步状态
export interface SyncStatus {
  lastSyncAt: number;
  pendingUpload: number;
  pendingDownload: number;
  conflicts: SyncConflict[];
}

// 同步冲突
export interface SyncConflict {
  id: string;
  type: 'scene' | 'nft' | 'user_data';
  localVersion: any;
  remoteVersion: any;
  resolvedAt?: number;
}