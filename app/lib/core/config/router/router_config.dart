import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../presentation/pages/splash/splash_page.dart';
import '../../../presentation/pages/home/home_page.dart';
import '../../../presentation/pages/camera/camera_page.dart';
import '../../../presentation/pages/scene/scene_page.dart';
import '../../../presentation/pages/nft/nft_gallery_page.dart';
import '../../../presentation/pages/profile/profile_page.dart';
import '../../../presentation/pages/settings/settings_page.dart';
import '../../../presentation/bloc/user/user_bloc.dart';
import '../../../presentation/bloc/camera/camera_bloc.dart';

// 路由常量
class RouteConstants {
  static const String splash = '/splash';
  static const String home = '/home';
  static const String camera = '/camera';
  static const String scene = '/scene';
  static const String nftGallery = '/nft';
  static const String profile = '/profile';
  static const String settings = '/settings';
}

// 全局导航键
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

// GoRouter配置
final GoRouter routerConfig = GoRouter(
  initialLocation: RouteConstants.splash,
  navigatorKey: navigatorKey,
  debugLogDiagnostics: true,
  errorBuilder: (context, state) => ErrorPage(error: state.error),
  routes: [
    // 启动页面
    GoRoute(
      path: RouteConstants.splash,
      name: 'splash',
      builder: (context, state) => const SplashPage(),
    ),
    
    // 主要页面路由
    GoRoute(
      path: RouteConstants.home,
      name: 'home',
      builder: (context, state) => const HomePage(),
      routes: [
        GoRoute(
          path: RouteConstants.camera,
          name: 'camera',
          builder: (context, state) => const CameraPage(),
        ),
      ],
    ),
    
    // 场景查看器
    GoRoute(
      path: '${RouteConstants.scene}/:sceneId',
      name: 'scene',
      builder: (context, state) {
        final sceneId = state.pathParameters['sceneId']!;
        return ScenePage(sceneId: sceneId);
      },
      routes: [
        GoRoute(
          path: '/nft',
          name: 'nft_mint',
          builder: (context, state) {
            final sceneId = state.pathParameters['sceneId']!;
            return NFTMintPage(sceneId: sceneId);
          },
        ),
      ],
    ),
    
    // NFT画廊
    GoRoute(
      path: RouteConstants.nftGallery,
      name: 'nft_gallery',
      builder: (context, state) => const NFTGalleryPage(),
    ),
    
    // 个人资料
    GoRoute(
      path: RouteConstants.profile,
      name: 'profile',
      builder: (context, state) => const ProfilePage(),
      routes: [
        GoRoute(
          path: RouteConstants.settings,
          name: 'settings',
          builder: (context, state) => const SettingsPage(),
        ),
      ],
    ),
  ],
  redirect: (context, state) {
    // 检查用户认证状态
    final userState = context.read<UserBloc>().state;
    final isAuthenticated = userState.status == UserStatus.authenticated;
    
    // 如果是启动页面，自动跳转到主页
    if (state.location == RouteConstants.splash) {
      return RouteConstants.home;
    }
    
    // 检查需要认证的路由
    final protectedRoutes = [
      RouteConstants.scene,
      RouteConstants.nftGallery,
      RouteConstants.profile,
      RouteConstants.settings,
    ];
    
    final isProtectedRoute = protectedRoutes.any((route) => 
      state.location.startsWith(route)
    );
    
    if (!isAuthenticated && isProtectedRoute) {
      return RouteConstants.home;
    }
    
    return null;
  },
);

// 错误页面
class ErrorPage extends StatelessWidget {
  final Exception? error;
  
  const ErrorPage({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0F172A),
              Color(0xFF1E293B),
              Color(0xFF334155),
            ],
          ),
        ),
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(24.w),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // 错误图标
                Container(
                  width: 80.w,
                  height: 80.w,
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16.r),
                  ),
                  child: Icon(
                    Icons.error_outline,
                    size: 40.w,
                    color: Colors.red,
                  ),
                ),
                
                SizedBox(height: 24.h),
                
                // 错误标题
                Text(
                  '哎呀，时空隧道出现了波动',
                  style: TextStyle(
                    fontSize: 24.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                SizedBox(height: 12.h),
                
                // 错误描述
                Text(
                  '应用程序遇到了意外错误。这可能是由于网络问题或系统异常导致的。',
                  style: TextStyle(
                    fontSize: 16.sp,
                    color: Colors.white.withOpacity(0.8),
                  ),
                  textAlign: TextAlign.center,
                ),
                
                SizedBox(height: 32.h),
                
                // 错误详情（开发模式）
                if (error != null && kDebugMode)
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(16.w),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8.r),
                      border: Border.all(color: Colors.red.withOpacity(0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '错误详情',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.red,
                          ),
                        ),
                        SizedBox(height: 8.h),
                        Text(
                          error.toString(),
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Colors.red.withOpacity(0.8),
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ),
                
                if (error != null && kDebugMode) SizedBox(height: 24.h),
                
                // 操作按钮
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => context.go(RouteConstants.home),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8B5CF6),
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(vertical: 16.h),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                        ),
                        child: Text(
                          '返回首页',
                          style: TextStyle(
                            fontSize: 16.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    
                    SizedBox(width: 16.w),
                    
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => context.pop(),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Color(0xFF8B5CF6)),
                          padding: EdgeInsets.symmetric(vertical: 16.h),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                        ),
                        child: Text(
                          '重试',
                          style: TextStyle(
                            fontSize: 16.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// 路由守卫
class RouteGuard {
  static bool canNavigate(BuildContext context, String route) {
    final userState = context.read<UserBloc>().state;
    final isAuthenticated = userState.status == UserStatus.authenticated;
    
    final protectedRoutes = [
      RouteConstants.scene,
      RouteConstants.nftGallery,
      RouteConstants.profile,
      RouteConstants.settings,
    ];
    
    if (protectedRoutes.contains(route) && !isAuthenticated) {
      return false;
    }
    
    return true;
  }
  
  static void navigateWithAuth(BuildContext context, String route) {
    if (canNavigate(context, route)) {
      context.go(route);
    } else {
      // 显示需要登录的提示
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('请先登录'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

// 扩展方法
extension BuildContextX on BuildContext {
  void navigate(String route) {
    RouteGuard.navigateWithAuth(this, route);
  }
  
  void pop<T>([T? result]) {
    if (canPop()) {
      GoRouter.of(this).pop(result);
    }
  }
}