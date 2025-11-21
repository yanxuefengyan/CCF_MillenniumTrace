# 千年影迹部署指南

## ?? 概述

千年影迹是一个跨平台的文博AI互动产品，包含Web端和Flutter移动端应用。本指南将帮助您完成完整的部署流程。

## 🏗️ 架构概览

```
millennium-trace/
├── web/              # React + TypeScript Web应用
├── app/              # Flutter移动应用
├── shared/           # 共享类型定义
├── api/              # 后端API服务 (单独仓库)
├── docs/             # 项目文档
└── scripts/          # 构建脚本
```

## 🚀 快速开始

### 1. 环境要求

- **Node.js**: 18.0+ 
- **npm**: 8.0+
- **Flutter**: 3.16+ (可选，用于移动端)
- **Git**: 最新版本

### 2. 克隆项目

```bash
git clone https://github.com/your-org/millennium-trace.git
cd millennium-trace
```

### 3. 一键构建

```bash
# 给构建脚本执行权限
chmod +x scripts/build.sh

# 完整构建流程
./scripts/build.sh all
```

## 🌐 Web端部署

### 开发环境

```bash
cd web
npm install
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 生产环境构建

```bash
# 自动化构建
./scripts/build.sh web

# 或手动构建
cd web
npm run build
```

构建文件输出到 `web/dist/` 目录。

### 服务器部署

#### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    root /var/www/millennium-trace/dist;
    index index.html;

    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass https://api.millennium-trace.ai/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 环境变量配置

创建 `.env.production` 文件：

```env
# API配置
VITE_API_URL=https://api.millennium-trace.ai
VITE_API_KEY=your-production-api-key

# AI识别服务
VITE_AI_API_URL=https://api.millennium-trace.ai/ai
VITE_AI_API_KEY=your-ai-api-key

# 场景生成服务
VITE_SCENE_API_URL=https://api.millennium-trace.ai/scene
VITE_SCENE_API_KEY=your-scene-api-key

# NFT服务
VITE_NFT_API_URL=https://api.millennium-trace.ai/nft
VITE_NFT_API_KEY=your-nft-api-key

# 同步服务
VITE_SYNC_API_URL=https://api.millennium-trace.ai/sync
VITE_SYNC_API_KEY=your-sync-api-key

# 其他配置
VITE_APP_VERSION=1.0.0
VITE_BUILD_MODE=production
```

### CDN部署

支持部署到以下CDN平台：

#### Vercel

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
cd web
vercel --prod
```

#### Netlify

```bash
# 安装Netlify CLI
npm i -g netlify-cli

# 部署
cd web
netlify deploy --prod --dir=dist
```

## 📱 移动端部署

### Android构建

```bash
# 确保Flutter环境
flutter doctor

# 构建APK
./scripts/build.sh app

# 或手动构建
cd app
flutter build apk --release
```

APK文件位置：`app/build/app/outputs/flutter-apk/app-release.apk`

### iOS构建

```bash
cd app
flutter build ios --release
```

需要在Xcode中配置签名证书和描述文件。

### 应用商店发布

#### Android (Google Play)

1. 生成签名的APK或AAB文件
2. 在Google Play Console创建应用
3. 上传构建文件
4. 填写应用信息和截图
5. 提交审核

#### iOS (App Store)

1. 在Xcode中配置项目设置
2. 生成Archive文件
3. 在App Store Connect创建应用
4. 上传构建文件
5. 配置应用信息和隐私政策
6. 提交审核

## 🔧 环境配置

### 开发环境变量

Web端 `.env.development`:

```env
VITE_API_URL=http://localhost:8080
VITE_API_KEY=dev-api-key
# ... 其他开发配置
```

Flutter端 `lib/core/config/app_config.dart`:

```dart
class AppConfig {
  static const String apiUrl = 'http://localhost:8080';
  static const String apiKey = 'dev-api-key';
  // ... 其他配置
}
```

### 生产环境变量

确保生产环境使用真实的API端点和密钥。

## 📊 监控和日志

### 错误监控

推荐集成以下监控服务：

- **Sentry**: 错误追踪和性能监控
- **Firebase Crashlytics**: 移动端崩溃报告
- **Google Analytics**: 用户行为分析

### 日志收集

Web端日志：

```javascript
// 错误日志
console.error('Application error:', error);

// 性能日志
console.time('operation');
// ... 操作
console.timeEnd('operation');

// 用户行为日志
analytics.track('user_action', {
  action: 'button_click',
  element: 'camera_button',
});
```

Flutter端日志：

```dart
import 'package:logger/logger.dart';

final logger = Logger();

// 错误日志
logger.e('Application error', error: error, stackTrace: stackTrace);

// 信息日志
logger.i('User action: ${action}');

// 调试日志
logger.d('Debug information: ${data}');
```

## 🔒 安全配置

### HTTPS配置

1. 获取SSL证书（推荐Let's Encrypt）
2. 配置Web服务器支持HTTPS
3. 设置HSTS头
4. 配置证书自动续期

### API安全

1. 使用HTTPS加密传输
2. 实施API密钥管理
3. 配置CORS策略
4. 实施请求频率限制
5. 输入验证和清理

### 数据保护

1. 用户数据加密存储
2. 敏感信息脱敏
3. 遵守GDPR等隐私法规
4. 实施访问控制

## 🧪 测试部署

### 预发布环境

建议设置预发布环境进行最终测试：

```bash
# 构建预发布版本
./scripts/build.sh web --env=staging

# 或使用Docker
docker build -t millennium-trace:staging .
docker run -p 3001:80 millennium-trace:staging
```

### 灰度发布

1. 配置负载均衡器
2. 设置流量分配规则
3. 监控关键指标
4. 逐步增加流量

## 📈 性能优化

### Web端优化

- 启用代码分割
- 配置资源压缩
- 实施缓存策略
- 优化图片资源
- 使用CDN加速

### 移动端优化

- 减少APK大小
- 优化启动时间
- 减少内存使用
- 优化网络请求

## 🔧 故障排除

### 常见问题

#### Web端构建失败

```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 检查Node.js版本
node --version  # 应该 >= 18.0.0
```

#### Flutter构建失败

```bash
# 清理Flutter缓存
flutter clean
flutter pub get

# 检查Flutter版本
flutter --version  # 应该 >= 3.16.0
```

#### API连接问题

1. 检查网络连接
2. 验证API端点配置
3. 检查API密钥有效性
4. 查看服务器日志

### 日志位置

- Web端: 浏览器开发者工具Console
- Flutter: `flutter logs` 或IDE控制台
- 服务器: 应用日志文件

## 📞 技术支持

如果遇到部署问题，请：

1. 查看本指南的故障排除部分
2. 检查项目的GitHub Issues
3. 提交新的Issue并提供详细信息
4. 联系技术支持团队

---

**祝您部署成功！** 🎉

如需更多帮助，请查看项目的其他文档或联系开发团队。