import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Zap } from 'lucide-react';

interface SimpleHomeProps {
  onNavigate?: (destination: string) => void;
  user?: any;
}

export const SimpleHome: React.FC<SimpleHomeProps> = ({ onNavigate, user }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #2d3748 0%, #4c51bf 50%, #2d3748 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      position: 'relative',
      paddingBottom: '80px' // 为底部导航栏留出空间
    }}>
      {/* 顶部导航栏 */}
      <div style={{
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>千年影迹</span>
        </div>

        {/* 导航按钮 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => onNavigate?.('home')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '25px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            首页
          </button>
          <button
            onClick={() => onNavigate?.('camera')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '25px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            拍照识别
          </button>
          <button
            onClick={() => onNavigate?.('gallery')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '25px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            我的藏品
          </button>
          <button
            onClick={() => onNavigate?.('profile')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '25px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            个人中心
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
        textAlign: 'center'
      }}>
        {/* 主标题 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '40px' }}
        >
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '20px',
            lineHeight: '1.1'
          }}>
            用AI让藏品说话
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            探索文物背后的故事，体验4D时空穿越之旅
          </p>

          {/* 开始探索按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate?.('camera')}
            style={{
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
              border: 'none',
              borderRadius: '30px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)'
            }}
          >
            开始探索
          </motion.button>
        </motion.div>

        {/* 功能卡片区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            maxWidth: '1200px',
            width: '100%',
            marginTop: '80px'
          }}
        >
          {/* AI智能识别卡片 */}
          <motion.div
            whileHover={{ y: -8 }}
            onClick={() => onNavigate?.('camera')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '40px 32px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Camera style={{ width: '40px', height: '40px', color: 'white' }} />
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'white'
            }}>
              AI智能识别
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.6'
            }}>
              拍摄即可识别文物信息，秒级精准分析，多维度深度解读
            </p>
          </motion.div>

          {/* 4D时空重现卡片 */}
          <motion.div
            whileHover={{ y: -8 }}
            onClick={() => onNavigate?.('gallery')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '40px 32px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Sparkles style={{ width: '40px', height: '40px', color: 'white' }} />
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'white'
            }}>
              4D时空重现
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.6'
            }}>
              沉浸式历史场景体验，AR/VR技术加持，穿越时空对话历史
            </p>
          </motion.div>

          {/* 影迹NFT卡片 */}
          <motion.div
            whileHover={{ y: -8 }}
            onClick={() => onNavigate?.('profile')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '40px 32px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Zap style={{ width: '40px', height: '40px', color: 'white' }} />
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'white'
            }}>
              影迹NFT
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.6'
            }}>
              区块链数字藏品，公益捐赠结合，永久保存文化记忆
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
