import { NFT, NFTCollection, MintNFTRequest, MintNFTResponse } from '@/types';
import { mockNFTs } from '@/data/mockNFTs';

// NFT服务类
export class NFTService {
  private static instance: NFTService;
  private apiUrl: string;
  private apiKey: string;

  private constructor() {
    this.apiUrl = import.meta.env.VITE_NFT_API_URL || 'https://api.millennium-trace.ai/nft';
    this.apiKey = import.meta.env.VITE_NFT_API_KEY || '';
  }

  public static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  /**
   * 铸造影迹NFT
   * @param request 铸造请求
   * @returns 铸造结果
   */
  async mintNFT(request: MintNFTRequest): Promise<{
    success: boolean;
    response?: MintNFTResponse;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/mint`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene_id: request.sceneId,
          artifact_id: request.artifactId,
          name: request.name,
          description: request.description,
          donation_amount: request.donationAmount,
          recipient_address: request.recipientAddress,
          metadata: request.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`NFT铸造失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        response: {
          transactionHash: result.transaction_hash,
          tokenId: result.token_id,
          contractAddress: result.contract_address,
          status: result.status,
          message: result.message,
        },
      };
    } catch (error) {
      console.error('NFT铸造失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取NFT详情
   * @param tokenId NFT token ID
   * @returns NFT详情
   */
  async getNFTDetails(tokenId: string): Promise<{
    success: boolean;
    nft?: NFT;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/details/${tokenId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取NFT详情失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        nft: this.transformNFTData(result),
      };
    } catch (error) {
      console.error('获取NFT详情失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取用户的NFT收藏
   * @param walletAddress 钱包地址
   * @param options 查询选项
   * @returns NFT收藏列表
   */
  async getUserNFTs(
    walletAddress: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'created_at' | 'donation_amount' | 'token_id';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    success: boolean;
    nfts?: NFT[];
    total?: number;
    hasMore?: boolean;
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('wallet_address', walletAddress);
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.sortBy) params.append('sort_by', options.sortBy);
      if (options.sortOrder) params.append('sort_order', options.sortOrder);

      const response = await fetch(`${this.apiUrl}/user?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取用户NFT失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        nfts: result.nfts.map((nft: any) => this.transformNFTData(nft)),
        total: result.total,
        hasMore: result.has_more,
      };
    } catch (error) {
      console.error('获取用户NFT失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取NFT画廊
   * @param options 查询选项
   * @returns NFT画廊数据
   */
  async getNFTGallery(options: {
    limit?: number;
    offset?: number;
    category?: string;
    minDonation?: number;
    maxDonation?: number;
    featured?: boolean;
  } = {}): Promise<{
    success: boolean;
    collections?: NFTCollection[];
    total?: number;
    hasMore?: boolean;
    error?: string;
  }> {
    try {
      // 使用模拟数据替代API调用
      console.log('使用模拟NFT数据');
      
      // 过滤数据
      let filteredNFTs = [...mockNFTs];
      
      if (options.category) {
        filteredNFTs = filteredNFTs.filter(nft => 
          nft.metadata?.material?.toLowerCase().includes(options.category?.toLowerCase() || '') ||
          nft.metadata?.era?.toLowerCase().includes(options.category?.toLowerCase() || '')
        );
      }
      
      if (options.minDonation !== undefined) {
        filteredNFTs = filteredNFTs.filter(nft => nft.donationAmount >= (options.minDonation || 0));
      }
      
      if (options.maxDonation !== undefined) {
        filteredNFTs = filteredNFTs.filter(nft => nft.donationAmount <= (options.maxDonation || Infinity));
      }
      
      if (options.featured !== undefined) {
        filteredNFTs = filteredNFTs.filter(nft => nft.status === 'confirmed');
      }
      
      // 创建集合
      const collections: NFTCollection[] = [
        {
          id: 'collection-001',
          name: '中国古代珍藏',
          description: '来自各朝代的珍贵文物藏品',
          nfts: filteredNFTs,
          totalCount: filteredNFTs.length,
          totalDonation: filteredNFTs.reduce((sum, nft) => sum + nft.donationAmount, 0),
          createdAt: new Date('2025-11-01'),
          updatedAt: new Date('2025-11-21')
        }
      ];
      
      // 应用分页
      const startIdx = options.offset || 0;
      const endIdx = startIdx + (options.limit || 10);
      
      return {
        success: true,
        collections: collections,
        total: filteredNFTs.length,
        hasMore: endIdx < filteredNFTs.length
      };
    } catch (error) {
      console.error('获取NFT画廊失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 转移NFT
   * @param tokenId NFT token ID
   * @param fromAddress 发送地址
   * @param toAddress 接收地址
   * @returns 转移结果
   */
  async transferNFT(
    tokenId: string,
    fromAddress: string,
    toAddress: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token_id: tokenId,
          from_address: fromAddress,
          to_address: toAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`NFT转移失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        transactionHash: result.transaction_hash,
      };
    } catch (error) {
      console.error('NFT转移失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取NFT市场数据
   * @param tokenId NFT token ID
   * @returns 市场数据
   */
  async getNFTMarketData(tokenId: string): Promise<{
    success: boolean;
    marketData?: {
      tokenId: string;
      floorPrice: number;
      lastSalePrice: number;
      totalVolume: number;
      holderCount: number;
      priceHistory: Array<{
        date: Date;
        price: number;
        transactionHash: string;
        buyer: string;
        seller: string;
      }>;
      lastUpdated: Date;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/market/${tokenId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取市场数据失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        marketData: {
          tokenId: result.token_id,
          floorPrice: result.floor_price,
          lastSalePrice: result.last_sale_price,
          totalVolume: result.total_volume,
          holderCount: result.holder_count,
          priceHistory: result.price_history.map((item: any) => ({
            date: new Date(item.date),
            price: item.price,
            transactionHash: item.transaction_hash,
            buyer: item.buyer,
            seller: item.seller,
          })),
          lastUpdated: new Date(result.last_updated),
        },
      };
    } catch (error) {
      console.error('获取市场数据失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取NFT统计信息
   * @returns 统计数据
   */
  async getNFTStatistics(): Promise<{
    success: boolean;
    statistics?: {
      totalMinted: number;
      confirmedCount: number;
      pendingCount: number;
      failedCount: number;
      totalDonation: number;
      averageDonation: number;
      monthlyDonations: Array<{
        month: Date;
        amount: number;
        count: number;
      }>;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/statistics`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取统计信息失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        statistics: {
          totalMinted: result.total_minted,
          confirmedCount: result.confirmed_count,
          pendingCount: result.pending_count,
          failedCount: result.failed_count,
          totalDonation: result.total_donation,
          averageDonation: result.average_donation,
          monthlyDonations: result.monthly_donations.map((item: any) => ({
            month: new Date(item.month),
            amount: item.amount,
            count: item.count,
          })),
        },
      };
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 验证NFT所有权
   * @param tokenId NFT token ID
   * @param address 钱包地址
   * @returns 验证结果
   */
  async verifyOwnership(tokenId: string, address: string): Promise<{
    success: boolean;
    owns?: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/verify/${tokenId}/${address}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`验证所有权失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        owns: result.owns,
      };
    } catch (error) {
      console.error('验证所有权失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取NFT铸造费用估算
   * @param donationAmount 捐赠金额
   * @returns 费用估算
   */
  async getMintingCost(donationAmount: number): Promise<{
    success: boolean;
    cost?: {
      gasFee: number;
      platformFee: number;
      totalCost: number;
      currency: string;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/cost?donation=${donationAmount}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取铸造费用失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        cost: {
          gasFee: result.gas_fee,
          platformFee: result.platform_fee,
          totalCost: result.total_cost,
          currency: result.currency,
        },
      };
    } catch (error) {
      console.error('获取铸造费用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 转换NFT数据格式
   */
  private transformNFTData(rawData: any): NFT {
    return {
      id: rawData.id,
      tokenId: rawData.token_id,
      artifactId: rawData.artifact_id,
      sceneId: rawData.scene_id,
      name: rawData.name,
      description: rawData.description,
      imageUrl: rawData.image_url,
      contractAddress: rawData.contract_address,
      transactionHash: rawData.transaction_hash,
      donationAmount: rawData.donation_amount,
      status: rawData.status,
      createdAt: new Date(rawData.created_at),
      updatedAt: new Date(rawData.updated_at),
      metadata: rawData.metadata || {},
    };
  }

  /**
   * 搜索NFT
   * @param query 搜索查询
   * @param options 搜索选项
   * @returns 搜索结果
   */
  async searchNFTs(
    query: string,
    options: {
      limit?: number;
      offset?: number;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    } = {}
  ): Promise<{
    success: boolean;
    nfts?: NFT[];
    total?: number;
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.category) params.append('category', options.category);
      if (options.minPrice) params.append('min_price', options.minPrice.toString());
      if (options.maxPrice) params.append('max_price', options.maxPrice.toString());

      const response = await fetch(`${this.apiUrl}/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`搜索NFT失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        nfts: result.nfts.map((nft: any) => this.transformNFTData(nft)),
        total: result.total,
      };
    } catch (error) {
      console.error('搜索NFT失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }
}

// 导出单例实例
export const nftService = NFTService.getInstance();