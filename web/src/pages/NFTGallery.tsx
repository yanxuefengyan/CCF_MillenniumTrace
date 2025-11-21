import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, Search, SortAsc, Grid3X3, List, 
  Heart, Share2, ExternalLink, Calendar,
  TrendingUp, Award, DollarSign, Clock, Image
} from 'lucide-react';
import { nftService } from '@/services/nftService';
import { NFT, NFTCollection } from '@/types';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface NFTGalleryProps {
  onClose?: () => void;
}

interface GalleryFilter {
  category: string;
  priceRange: [number, number];
  status: 'all' | 'confirmed' | 'pending' | 'transferred';
  sortBy: 'created_at' | 'donation_amount' | 'token_id';
  sortOrder: 'asc' | 'desc';
}

interface GalleryStats {
  totalNFTs: number;
  totalDonation: number;
  averagePrice: number;
  monthlyChange: number;
}

export const NFTGallery: React.FC<NFTGalleryProps> = ({ onClose }) => {
  const { isMobile, isTablet } = useDeviceDetection();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [stats, setStats] = useState<GalleryStats | null>(null);

  const handleImageReplace = useCallback(async (nftId: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const newImageUrl = event.target?.result as string;
          setNfts(prevNfts => 
            prevNfts.map(nft => 
              nft.id === nftId ? { ...nft, imageUrl: newImageUrl } : nft
            )
          );
          // Here you would typically upload the image to your backend
          // and update the NFT's image URL in the database
          console.log(`Image for NFT ${nftId} replaced with ${newImageUrl}`);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }, []);

  const [filters, setFilters] = useState<GalleryFilter>({
    category: 'all',
    priceRange: [0, 10000],
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  });

  // 加载NFT数据
  useEffect(() => {
    loadNFTGallery();
    loadStatistics();
  }, [filters, pagination.page, searchQuery]);

  const loadNFTGallery = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await nftService.getNFTGallery({
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        category: filters.category === 'all' ? undefined : filters.category,
        minDonation: filters.priceRange[0],
        maxDonation: filters.priceRange[1],
        featured: filters.status === 'confirmed',
      });

      if (result.success && result.collections) {
        const allNfts = result.collections.flatMap(collection => collection.nfts);
        setCollections(result.collections);
        
        // 应用搜索过滤
        let filteredNfts = allNfts;
        if (searchQuery) {
          filteredNfts = allNfts.filter(nft => 
            nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            nft.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // 应用状态过滤
        if (filters.status !== 'all') {
          filteredNfts = filteredNfts.filter(nft => nft.status === filters.status);
        }

        // 应用排序
        filteredNfts.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof NFT] as any;
          const bValue = b[filters.sortBy as keyof NFT] as any;
          
          if (filters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        setNfts(filteredNfts);
        setPagination(prev => ({
          ...prev,
          total: filteredNfts.length,
          hasMore: filteredNfts.length > prev.page * prev.limit,
        }));
      }
    } catch (error) {
      console.error('加载NFT画廊失败:', error);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await nftService.getNFTStatistics();
      if (result.success && result.statistics) {
        const stats = result.statistics;
        setStats({
          totalNFTs: stats.totalMinted,
          totalDonation: stats.totalDonation,
          averagePrice: stats.averageDonation,
          monthlyChange: stats.monthlyDonations[stats.monthlyDonations.length - 1]?.amount || 0,
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 加载更多
  const loadMore = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  // 搜索处理
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 过滤器更新
  const updateFilter = (key: keyof GalleryFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 分享NFT
  const shareNFT = async (nft: NFT) => {
    try {
      const shareUrl = `${window.location.origin}/nft/${nft.tokenId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: nft.name,
          text: nft.description,
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

  // 查看NFT详情
  const viewNFTDetail = (nft: NFT) => {
    setSelectedNFT(nft);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-white/60">总数</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalNFTs}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-xs text-white/60">总捐赠</span>
            </div>
            <div className="text-2xl font-bold text-white">¥{stats.totalDonation.toFixed(0)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-white/60">均价</span>
            </div>
            <div className="text-2xl font-bold text-white">¥{stats.averagePrice.toFixed(0)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-pink-400" />
              <span className="text-xs text-white/60">本月</span>
            </div>
            <div className="text-2xl font-bold text-white">¥{stats.monthlyChange.toFixed(0)}</div>
          </motion.div>
        </div>
      )}

      {/* 搜索和筛选栏 */}
      <div className="sticky top-0 bg-black/50 backdrop-blur-md z-10 p-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索NFT名称或描述..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden md:inline">筛选</span>
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 筛选面板 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-white/5 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 类别筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">类别</label>
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="all">全部类别</option>
                      <option value="陶瓷">陶瓷</option>
                      <option value="书画">书画</option>
                      <option value="玉器">玉器</option>
                      <option value="青铜器">青铜器</option>
                      <option value="金银器">金银器</option>
                    </select>
                  </div>

                  {/* 状态筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">状态</label>
                    <select
                      value={filters.status}
                      onChange={(e) => updateFilter('status', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="all">全部状态</option>
                      <option value="confirmed">已确认</option>
                      <option value="pending">铸造中</option>
                      <option value="transferred">已转移</option>
                    </select>
                  </div>

                  {/* 排序 */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">排序</label>
                    <div className="flex gap-2">
                      <select
                        value={filters.sortBy}
                        onChange={(e) => updateFilter('sortBy', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="created_at">创建时间</option>
                        <option value="donation_amount">捐赠金额</option>
                        <option value="token_id">Token ID</option>
                      </select>
                      <button
                        onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20"
                      >
                        <SortAsc className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NFT网格/列表 */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">{error}</p>
            <button
              onClick={loadNFTGallery}
              className="px-6 py-3 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition-colors"
            >
              重试
            </button>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">暂无NFT藏品</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {nfts.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    onClick={() => viewNFTDetail(nft)}
                    className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden cursor-pointer hover:bg-white/20 transition-all"
                  >
                    {/* NFT图片 */}
                    <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 relative">
                      {nft.imageUrl ? (
                        <img
                          src={nft.imageUrl}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">影</span>
                        </div>
                      )}
                      
                      {/* 状态标签 */}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-full text-xs text-white">
                        {nft.status === 'confirmed' ? '已确认' : nft.status}
                      </div>
                    </div>

                    {/* NFT信息 */}
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-1 truncate">
                        影迹 #{nft.tokenId}
                      </h3>
                      <p className="text-sm text-white/60 mb-2 truncate">
                        {nft.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-400">
                          ¥{nft.donationAmount.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareNFT(nft);
                            }}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-white/60" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // 添加收藏逻辑
                            }}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <Heart className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {nfts.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer"
                    onClick={() => viewNFTDetail(nft)}
                  >
                    <div className="flex gap-4">
                      {/* NFT缩略图 */}
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0">
                        {nft.imageUrl ? (
                          <img
                            src={nft.imageUrl}
                            alt={nft.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">影</span>
                          </div>
                        )}
                      </div>

                      {/* NFT信息 */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white mb-1">
                              影迹 #{nft.tokenId}
                            </h3>
                            <p className="text-sm text-white/60 mb-2">
                              {nft.description}
                            </p>
                          </div>
                          <div className="px-2 py-1 bg-black/50 rounded-full text-xs text-white">
                            {nft.status === 'confirmed' ? '已确认' : nft.status}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-400">
                            ¥{nft.donationAmount.toFixed(2)}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                shareNFT(nft);
                              }}
                              className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                              <Share2 className="w-4 h-4 text-white/60" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // 添加收藏逻辑
                              }}
                              className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                              <Heart className="w-4 h-4 text-white/60" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 加载更多 */}
            {pagination.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition-colors"
                >
                  加载更多
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* NFT详情模态框 */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedNFT(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* 关闭按钮 */}
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <div className="w-6 h-6 text-white">×</div>
                </button>

                {/* NFT详情内容 */}
                <div className="p-6">
                  {/* NFT图片 */}
                  <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-6 relative">
                    {selectedNFT.imageUrl ? (
                      <img
                        src={selectedNFT.imageUrl}
                        alt={selectedNFT.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">影</span>
                      </div>
                    )}
                  </div>

                  {/* NFT信息 */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        影迹 #{selectedNFT.tokenId}
                      </h2>
                      <p className="text-white/80">
                        {selectedNFT.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-sm text-white/60 mb-1">捐赠金额</div>
                        <div className="text-xl font-bold text-purple-400">
                          ¥{selectedNFT.donationAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-sm text-white/60 mb-1">状态</div>
                        <div className="text-xl font-bold text-green-400">
                          {selectedNFT.status === 'confirmed' ? '已确认' : selectedNFT.status}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">合约地址</div>
                        <div className="text-sm text-white/80 font-mono">
                          {selectedNFT.contractAddress.slice(0, 10)}...
                          {selectedNFT.contractAddress.slice(-8)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">交易哈希</div>
                        <div className="text-sm text-white/80 font-mono">
                          {selectedNFT.transactionHash.slice(0, 10)}...
                          {selectedNFT.transactionHash.slice(-8)}
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 px-6 py-3 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
                        <ExternalLink className="w-5 h-5" />
                        查看链上信息
                      </button>
                      <button
                        onClick={() => shareNFT(selectedNFT)}
                        className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-5 h-5" />
                        分享NFT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};