// 从共享类型导入
export type {
  ArtifactInfo,
  SceneSegment,
  ParticleEffect,
  SceneInteraction,
  SpaceTimeScene,
  TraceNFT,
  UserData,
  UserSettings,
  UserStatistics,
  Achievement,
  ApiResponse,
  DeviceInfo,
  SyncStatus,
  SyncConflict,
} from '../../../shared/types';

// Web端特定类型

// 用户类型（简化版）
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  statistics: UserStatistics;
  settings: UserSettings;
  createdAt: string;
}

// 藏品类型（简化版）
export interface Artifact {
  id: string;
  name: string;
  description: string;
  era: string;
  origin: string;
  category: string;
  imageUrl?: string;
  museumName: string;
  materials: string[];
}

// 场景类型（简化版）
export interface Scene {
  id: string;
  artifactId: string;
  title: string;
  description: string;
  segments: SceneSegment[];
  duration: number;
  createdAt: string;
}

// NFT类型（简化版）
export interface NFT {
  id: string;
  tokenId: string;
  artifactId: string;
  sceneId: string;
  imageUrl?: string;
  donationAmount: number;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'failed';
}

// 识别结果
export interface RecognitionResult {
  success: boolean;
  artifact?: Artifact;
  confidence: number;
  error?: string;
  timestamp: number;
}

// 场景生成状态
export interface SceneGenerationStatus {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  currentStep?: string;
  error?: string;
}

// NFT铸造状态
export interface NFTMintStatus {
  status: 'idle' | 'preparing' | 'minting' | 'confirming' | 'completed' | 'error';
  transactionHash?: string;
  error?: string;
}

// 导航目的地
export type NavigationDestination = 'home' | 'camera' | 'gallery' | 'profile' | 'settings';

// 主页属性
export interface HomeProps {
  onNavigate: (destination: NavigationDestination) => void;
  user: User | null;
}

// 设备检测结果
export interface DeviceDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  cameraAvailable: boolean;
  capabilities: {
    webgl: boolean;
    webgl2: boolean;
    audioContext: boolean;
    gyroscope: boolean;
  };
}