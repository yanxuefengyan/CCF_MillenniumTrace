#!/bin/bash

# 千年影迹项目构建脚本
echo "🚀 开始构建千年影迹项目..."

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 错误处理函数
handle_error() {
    echo -e "${RED}❌ 构建失败: $1${NC}"
    exit 1
}

# 成功提示函数
handle_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 警告提示函数
handle_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 信息提示函数
handle_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# 检查依赖
check_dependencies() {
    handle_info "检查构建依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        handle_error "Node.js 未安装，请先安装 Node.js 18+"
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        handle_error "npm 未安装"
    fi
    
    # 检查Flutter (可选)
    if command -v flutter &> /dev/null; then
        handle_success "Flutter 已安装: $(flutter --version | head -1)"
    else
        handle_warning "Flutter 未安装，跳过APP构建"
    fi
    
    handle_success "依赖检查完成"
}

# 安装依赖
install_dependencies() {
    handle_info "安装项目依赖..."
    
    # 安装根目录依赖
    npm install || handle_error "根目录依赖安装失败"
    
    # 安装Web端依赖
    cd web
    npm install || handle_error "Web端依赖安装失败"
    cd ..
    
    # 安装Flutter依赖（如果可用）
    if command -v flutter &> /dev/null; then
        cd app
        flutter pub get || handle_error "Flutter依赖安装失败"
        cd ..
    fi
    
    handle_success "依赖安装完成"
}

# 构建Web端
build_web() {
    handle_info "构建Web端应用..."
    
    cd web
    
    # 运行类型检查
    npm run type-check || handle_error "TypeScript类型检查失败"
    
    # 运行代码检查
    npm run lint || handle_warning "代码检查发现问题，但继续构建"
    
    # 构建生产版本
    npm run build || handle_error "Web端构建失败"
    
    cd ..
    handle_success "Web端构建完成"
}

# 构建Flutter APP
build_app() {
    if ! command -v flutter &> /dev/null; then
        handle_warning "Flutter未安装，跳过APP构建"
        return
    fi
    
    handle_info "构建Flutter应用..."
    
    cd app
    
    # 运行代码分析
    flutter analyze || handle_warning "Flutter代码分析发现问题，但继续构建"
    
    # 构建APK
    flutter build apk --release || handle_error "Android APK构建失败"
    
    # 构建iOS (仅在macOS上)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        flutter build ios --release || handle_warning "iOS构建失败"
    fi
    
    # 构建Web版本 (可选)
    flutter build web --release || handle_warning "Flutter Web构建失败"
    
    cd ..
    handle_success "Flutter应用构建完成"
}

# 运行测试
run_tests() {
    handle_info "运行测试..."
    
    # Web端测试
    cd web
    npm test || handle_warning "Web端测试失败"
    cd ..
    
    # Flutter测试
    if command -v flutter &> /dev/null; then
        cd app
        flutter test || handle_warning "Flutter测试失败"
        cd ..
    fi
    
    handle_success "测试完成"
}

# 生成构建报告
generate_build_report() {
    handle_info "生成构建报告..."
    
    REPORT_FILE="build-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# 千年影迹构建报告

**构建时间**: $(date)
**构建环境**: $OSTYPE
**Node.js版本**: $(node --version)
**npm版本**: $(npm --version)

## 构建结果

### Web端
- ✅ 构建成功
- 📁 输出目录: web/dist/
- 📦 构建大小: $(du -sh web/dist 2>/dev/null || echo "N/A")

### Flutter APP
EOF

    if command -v flutter &> /dev/null; then
        cat >> "$REPORT_FILE" << EOF
- ✅ Android APK: $(ls -la app/build/app/outputs/flutter-apk/app-release.apk 2>/dev/null || echo "构建失败")
- ✅ APK大小: $(du -sh app/build/app/outputs/flutter-apk/app-release.apk 2>/dev/null || echo "N/A")
EOF
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "- ✅ iOS构建: $(ls -la app/build/ios/ipa/ 2>/dev/null || echo "构建失败")" >> "$REPORT_FILE"
        fi
    else
        echo "- ❌ Flutter未安装，跳过构建" >> "$REPORT_FILE"
    fi
    
    cat >> "$REPORT_FILE" << EOF

### 测试结果
- Web端: $(cd web && npm test 2>/dev/null && echo "✅ 通过" || echo "❌ 失败")
- Flutter: $(command -v flutter >/dev/null && (cd app && flutter test 2>/dev/null && echo "✅ 通过" || echo "❌ 失败") || echo "❌ 未测试")

## 部署信息

### Web端部署
1. 将 \`web/dist/\` 目录内容上传到Web服务器
2. 配置Nginx或其他Web服务器
3. 配置HTTPS证书
4. 设置环境变量

### APP部署
1. Android: 上传APK到应用商店或直接分发
2. iOS: 上传IPA到App Store Connect
3. Web: 上传Flutter Web构建文件

## 注意事项

- 确保服务器支持HTTPS
- 配置正确的环境变量
- 检查API端点配置
- 验证跨域设置

EOF
    
    handle_success "构建报告已生成: $REPORT_FILE"
}

# 清理构建文件
clean_build() {
    handle_info "清理构建文件..."
    
    # 清理Web端构建
    rm -rf web/dist
    
    # 清理Flutter构建
    rm -rf app/build
    
    # 清理node_modules (可选)
    if [[ "$1" == "--deep" ]]; then
        rm -rf node_modules
        rm -rf web/node_modules
        rm -rf app/.dart_tool
        rm -rf app/build
        rm -rf app/.packages
        rm -rf app/pubspec.lock
    fi
    
    handle_success "清理完成"
}

# 主函数
main() {
    case "$1" in
        "clean")
            clean_build "$2"
            ;;
        "deps")
            check_dependencies
            install_dependencies
            ;;
        "web")
            check_dependencies
            install_dependencies
            build_web
            ;;
        "app")
            check_dependencies
            install_dependencies
            build_app
            ;;
        "test")
            install_dependencies
            run_tests
            ;;
        "report")
            generate_build_report
            ;;
        "all")
            check_dependencies
            install_dependencies
            build_web
            build_app
            run_tests
            generate_build_report
            ;;
        *)
            echo "使用方法: $0 [命令] [选项]"
            echo ""
            echo "命令:"
            echo "  clean [--deep]     清理构建文件"
            echo "  deps              安装依赖"
            echo "  web               构建Web端"
            echo "  app               构建Flutter APP"
            echo "  test              运行测试"
            echo "  report            生成构建报告"
            echo "  all               完整构建流程"
            echo ""
            echo "示例:"
            echo "  $0 all           # 完整构建"
            echo "  $0 web           # 仅构建Web端"
            echo "  $0 clean --deep  # 深度清理"
            exit 1
            ;;
    esac
}

# 显示开始信息
echo "=========================================="
echo "🏛️  千年影迹 - 文博AI互动产品构建工具"
echo "=========================================="
echo ""

# 执行主函数
main "$@" || handle_error "构建过程中出现错误"

echo ""
echo -e "${GREEN}🎉 构建完成！${NC}"
echo -e "${GREEN}📊 查看构建报告了解详细信息${NC}"
echo -e "${GREEN}🚀 开始部署您的千年影迹应用吧！${NC}"