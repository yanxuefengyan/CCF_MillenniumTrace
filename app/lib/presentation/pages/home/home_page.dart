import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/theme/app_theme.dart';
import '../../../core/config/router/router_config.dart';
import '../../bloc/user/user_bloc.dart';
import '../../bloc/nft/nft_bloc.dart';
import '../../widgets/common/custom_app_bar.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/animated_button.dart';
import '../../widgets/home/feature_card.dart';
import '../../widgets/home/statistics_card.dart';
import '../../widgets/home/quick_actions.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  late TabController _tabController;
  late AnimationController _headerAnimationController;
  late Animation<double> _headerOpacityAnimation;
  late Animation<Offset> _headerSlideAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _tabController = TabController(length: 4, vsync: this);
    
    // 加载用户数据
    context.read<UserBloc>().add(const GetUserProfile('current_user'));
    context.read<NFTBloc>().add(const LoadNFTGallery());
  }

  void _initializeAnimations() {
    _headerAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _headerOpacityAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _headerAnimationController,
      curve: Curves.easeInOut,
    ));

    _headerSlideAnimation = Tween<Offset>(
      begin: const Offset(0, -0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _headerAnimationController,
      curve: Curves.easeOutBack,
    ));

    _headerAnimationController.forward();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _headerAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              // 自定义AppBar
              _buildAnimatedHeader(),
              
              // 主要内容
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildHomeTab(),
                    _buildExploreTab(),
                    _buildGalleryTab(),
                    _buildProfileTab(),
                  ],
                ),
              ),
              
              // 底部导航
              _buildBottomNavigation(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAnimatedHeader() {
    return AnimatedBuilder(
      animation: _headerAnimationController,
      builder: (context, child) {
        return SlideTransition(
          position: _headerSlideAnimation,
          child: FadeTransition(
            opacity: _headerOpacityAnimation,
            child: child,
          ),
        );
      },
      child: const CustomAppBar(
        title: '千年影迹',
        subtitle: '用AI让藏品说话，30秒穿越千年',
        showBackButton: false,
      ),
    );
  }

  Widget _buildBottomNavigation() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        backdropFilter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
      ),
      child: TabBar(
        controller: _tabController,
        indicatorColor: AppTheme.primaryColor,
        indicatorWeight: 3,
        labelColor: AppTheme.primaryColor,
        unselectedLabelColor: Colors.white.withOpacity(0.6),
        labelStyle: TextStyle(
          fontSize: 12.sp,
          fontWeight: FontWeight.w600,
        ),
        tabs: const [
          Tab(
            icon: Icon(Icons.home_outlined),
            text: '首页',
          ),
          Tab(
            icon: Icon(Icons.explore_outlined),
            text: '探索',
          ),
          Tab(
            icon: Icon(Icons.collections_outlined),
            text: '画廊',
          ),
          Tab(
            icon: Icon(Icons.person_outline),
            text: '我的',
          ),
        ],
      ),
    );
  }

  Widget _buildHomeTab() {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, userState) {
        return SingleChildScrollView(
          padding: EdgeInsets.all(16.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 欢迎信息
              if (userState.user != null) _buildWelcomeSection(userState.user!),
              
              // 快速操作
              const QuickActions(),
              
              SizedBox(height: 24.h),
              
              // 功能特色
              _buildFeatureSection(),
              
              SizedBox(height: 24.h),
              
              // 统计信息
              _buildStatisticsSection(userState.user),
              
              SizedBox(height: 24.h),
              
              // 最近活动
              _buildRecentActivity(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildWelcomeSection(User user) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 24.r,
                backgroundColor: AppTheme.primaryColor,
                child: user.avatar != null
                    ? ClipOval(
                        child: Image.network(
                          user.avatar!,
                          width: 48.w,
                          height: 48.w,
                          fit: BoxFit.cover,
                        ),
                      )
                    : Text(
                        user.username.isNotEmpty ? user.username[0] : '用',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18.sp,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '欢迎回来，${user.username}',
                      style: context.titleLarge,
                    ),
                    Text(
                      '开始您的时空之旅',
                      style: context.bodyMedium?.copyWith(
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '核心功能',
          style: context.headlineSmall,
        ),
        SizedBox(height: 16.h),
        Row(
          children: [
            Expanded(
              child: FeatureCard(
                title: '拍照识别',
                description: 'AI智能识别藏品信息',
                icon: Icons.camera_alt_outlined,
                color: AppTheme.primaryColor,
                onTap: () => context.go(RouteConstants.camera),
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: FeatureCard(
                title: '时空重现',
                description: '4D情景还原历史',
                icon: Icons.view_in_ar_outlined,
                color: AppTheme.secondaryColor,
                onTap: () {
                  // TODO: 导航到场景列表
                },
              ),
            ),
          ],
        ),
        SizedBox(height: 12.h),
        Row(
          children: [
            Expanded(
              child: FeatureCard(
                title: '影迹NFT',
                description: '铸造专属数字藏品',
                icon: Icons.token_outlined,
                color: AppTheme.accentColor,
                onTap: () => context.go(RouteConstants.nftGallery),
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: FeatureCard(
                title: '公益捐赠',
                description: '支持文化遗产保护',
                icon: Icons.volunteer_activism_outlined,
                color: Colors.green,
                onTap: () {
                  // TODO: 导航到捐赠页面
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatisticsSection(User? user) {
    if (user == null) return const SizedBox.shrink();
    
    final statistics = user.statistics;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '我的成就',
          style: context.headlineSmall,
        ),
        SizedBox(height: 16.h),
        Row(
          children: [
            Expanded(
              child: StatisticsCard(
                title: '创建场景',
                value: statistics.scenesCreated.toString(),
                icon: Icons.view_in_ar,
                color: AppTheme.primaryColor,
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: StatisticsCard(
                title: 'NFT铸造',
                value: statistics.nftsMinted.toString(),
                icon: Icons.token,
                color: AppTheme.secondaryColor,
              ),
            ),
          ],
        ),
        SizedBox(height: 12.h),
        Row(
          children: [
            Expanded(
              child: StatisticsCard(
                title: '公益捐赠',
                value: '¥${statistics.totalDonation.toStringAsFixed(2)}',
                icon: Icons.volunteer_activism,
                color: Colors.green,
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: StatisticsCard(
                title: '成就解锁',
                value: statistics.achievements.length.toString(),
                icon: Icons.emoji_events,
                color: AppTheme.accentColor,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '最近活动',
              style: context.headlineSmall,
            ),
            TextButton(
              onPressed: () {
                // TODO: 查看全部活动
              },
              child: Text(
                '查看全部',
                style: TextStyle(
                  color: AppTheme.primaryColor,
                  fontSize: 14.sp,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 16.h),
        GlassCard(
          child: Column(
            children: [
              _buildActivityItem(
                icon: Icons.camera_alt,
                title: '识别了新的藏品',
                description: '明代青花瓷瓶',
                time: '2小时前',
                color: AppTheme.primaryColor,
              ),
              Divider(
                height: 1,
                color: Colors.white.withOpacity(0.1),
              ),
              _buildActivityItem(
                icon: Icons.token,
                title: '铸造了影迹NFT',
                description: '获得编号 #1234',
                time: '1天前',
                color: AppTheme.secondaryColor,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActivityItem({
    required IconData icon,
    required String title,
    required String description,
    required String time,
    required Color color,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 12.h),
      child: Row(
        children: [
          Container(
            width: 40.w,
            height: 40.w,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10.r),
            ),
            child: Icon(
              icon,
              color: color,
              size: 20.w,
            ),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: context.titleSmall,
                ),
                Text(
                  description,
                  style: context.bodySmall?.copyWith(
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
          Text(
            time,
            style: context.bodySmall?.copyWith(
              color: Colors.white.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExploreTab() {
    return const Center(
      child: Text(
        '探索功能开发中...',
        style: TextStyle(
          color: Colors.white,
          fontSize: 18,
        ),
      ),
    );
  }

  Widget _buildGalleryTab() {
    return BlocBuilder<NFTBloc, NFTState>(
      builder: (context, state) {
        if (state is NFTLoading) {
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF8B5CF6)),
            ),
          );
        }
        
        if (state is NFTLoaded) {
          return _buildNFTGallery(state.nfts);
        }
        
        if (state is NFTError) {
          return Center(
            child: Text(
              '加载失败: ${state.message}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
              ),
            ),
          );
        }
        
        return const Center(
          child: Text(
            '暂无NFT',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
            ),
          ),
        );
      },
    );
  }

  Widget _buildNFTGallery(List<TraceNFT> nfts) {
    return GridView.builder(
      padding: EdgeInsets.all(16.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12.w,
        mainAxisSpacing: 12.h,
        childAspectRatio: 0.8,
      ),
      itemCount: nfts.length,
      itemBuilder: (context, index) {
        final nft = nfts[index];
        return GlassCard(
          onTap: () {
            // TODO: 导航到NFT详情页
          },
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)],
                    ),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Center(
                    child: Text(
                      '影',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 32.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                '影迹 #${nft.tokenId}',
                style: context.titleSmall,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                '¥${nft.donationAmount.toStringAsFixed(2)}',
                style: context.bodySmall?.copyWith(
                  color: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProfileTab() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        children: [
          AnimatedButton(
            text: '个人资料',
            icon: Icons.person,
            onPressed: () => context.go(RouteConstants.profile),
          ),
          SizedBox(height: 12.h),
          AnimatedButton(
            text: '设置',
            icon: Icons.settings,
            onPressed: () => context.go('${RouteConstants.profile}${RouteConstants.settings}'),
          ),
        ],
      ),
    );
  }
}