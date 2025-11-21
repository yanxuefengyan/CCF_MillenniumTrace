import React from 'react';

export const TestApp: React.FC = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1e293b',
      color: 'white',
      fontSize: '24px'
    }}>
      <div>
        <h1>测试页面</h1>
        <p>如果您看到这段文字，说明React应用已经成功渲染！</p>
      </div>
    </div>
  );
};