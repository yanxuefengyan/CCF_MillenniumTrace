import React, { ErrorInfo } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // 这里可以添加错误日志上报逻辑
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 max-w-md w-full text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
          className="text-6xl mb-4"
        >
          😵
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-4">糟糕，出错了！</h1>
        <p className="text-gray-300 mb-6">
          我们遇到了一些意外情况。请稍后再试或联系支持团队。
        </p>
        {error && (
          <div className="bg-red-500 bg-opacity-20 rounded p-4 mb-6">
            <p className="text-red-200 text-sm break-words">
              错误信息：{error.message}
            </p>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition duration-300 ease-in-out transform hover:shadow-lg"
        >
          刷新页面
        </motion.button>
      </motion.div>
    </div>
  );
};

export { ErrorBoundary };