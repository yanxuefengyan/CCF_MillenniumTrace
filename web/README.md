# 千年影迹 Web 端

## 项目简介

千年影迹是一个创新的Web3应用，旨在通过AI技术让博物馆藏品"说话"，为用户提供沉浸式的历史文化体验。本项目使用React和Vite构建，集成了AI识别、4D场景生成和NFT铸造等功能。

## 本地开发指南

### 环境要求

- Node.js (v14.0.0 或更高版本)
- npm (v6.0.0 或更高版本) 或 yarn

### 安装步骤

1. 克隆仓库：

```bash
git clone https://github.com/your-repo/millennium-trace-web.git
cd millennium-trace-web
```

2. 安装依赖：

```bash
npm install
# 或
yarn install
```

3. 启动开发服务器：

```bash
npm run dev
# 或
yarn dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

### 环境配置

本项目使用 `.env` 文件进行环境配置。在开发模式下，会自动加载 `.env.development` 文件。主要配置项包括：

- `VITE_USE_MOCK`: 设置为 `true` 时使用模拟数据
- `VITE_API_BASE_URL`: API 基础 URL
- `VITE_AI_API_URL`: AI 服务 API URL
- `VITE_AI_API_KEY`: AI 服务 API 密钥（仅用于开发环境）

### 模拟数据

开发环境下默认使用模拟数据。模拟服务位于 `src/services/mockApiService.ts`，包含了用户认证、藏品识别、场景生成等功能的模拟实现。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

构建后的文件将位于 `dist` 目录中。

### 运行测试

```bash
npm run test
# 或
yarn test
```

## 项目结构

```
web/
├── src/
│   ├── components/    # 可复用组件
│   ├── pages/         # 页面组件
│   ├── services/      # API 服务
│   ├── hooks/         # 自定义 Hooks
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数
│   ├── App.tsx        # 应用入口
│   └── main.tsx       # 渲染入口
├── public/            # 静态资源
├── .env.development   # 开发环境配置
├── vite.config.ts     # Vite 配置
└── package.json       # 项目依赖和脚本
```

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 联系我们

如有任何问题或建议，请联系我们的开发团队：dev@millennium-trace.com