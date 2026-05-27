import React, { Suspense, lazy } from 'react';

const LazyConfigProvider = lazy(() => import('antd').then(m => ({ default: m.ConfigProvider })));

interface AntdProviderProps {
  children: React.ReactNode;
}

export const AntdProvider: React.FC<AntdProviderProps> = ({ children }) => {
  const theme = {
    token: {
      colorPrimary: '#4f46e5', // Matches --primary-color
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      borderRadius: 8,
      fontFamily: "'Inter', sans-serif",
      colorBgContainer: '#ffffff',
      colorText: '#1e293b',
      colorTextSecondary: '#64748b',
    },
    components: {
      Button: {
        controlHeight: 40,
        borderRadius: 8,
        fontWeight: 500,
        colorPrimaryShadow: '0 4px 6px -1px rgb(79 70 229 / 0.2)',
      },
      Card: {
        borderRadiusLG: 16,
        boxShadowTertiary: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
      },
      Input: {
        controlHeight: 42,
        borderRadius: 8,
        activeBorderColor: '#6366f1',
      },
    },
  };

  return (
    <Suspense fallback={<>{children}</>}>
      <LazyConfigProvider theme={theme}>{children}</LazyConfigProvider>
    </Suspense>
  );
};

export default AntdProvider;
