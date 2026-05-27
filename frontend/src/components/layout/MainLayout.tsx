import React, { useState, useEffect } from 'react';
import { Layout, Button, Breadcrumb, Badge, Input, Popover, List, Typography } from 'antd';
const { Text } = Typography;
import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import { Sidebar } from './Sidebar';
import './MainLayout.css';
import { useLocation, Link } from 'react-router-dom';

const { Header, Content } = Layout;

import { useAppSelector } from '../../hooks/reduxHooks';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [leftMargin, setLeftMargin] = useState<number>(280);
  const { activeAlerts, alerts } = useAppSelector((state) => state.alert);

  const notificationContent = (
    <div className="w-80 max-h-96 overflow-y-auto">
      {alerts.length === 0 ? (
        <div className="p-4 text-center text-slate-500">No notifications</div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={alerts}
          renderItem={(item) => (
            <List.Item className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
              <List.Item.Meta
                title={<Text strong className={item.type === 'error' || item.type === 'warning' ? 'text-amber-600' : 'text-slate-700'}>{item.message}</Text>}
                description={<div className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</div>}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isMobile) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    setLeftMargin(isMobile ? 0 : (collapsed ? 80 : 280));
  }, [collapsed, isMobile]);
  const location = useLocation();

  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const breadcrumbItems = [
    { title: <Link to="/dashboard" className="text-slate-500 hover:text-blue-600">Home</Link> },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const title = _.charAt(0).toUpperCase() + _.slice(1);
      return {
        title: <Link to={url} className="text-slate-500 hover:text-blue-600">{title}</Link>,
      };
    }),
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout
        style={{
          marginLeft: leftMargin,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'var(--bg-color)',
          minHeight: '100vh'
        }}
      >
        <Header
          style={{
            padding: '0 32px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-color)',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            width: '100%',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="flex items-center gap-6">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-slate-100 flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 transition-colors"
            />

            <div className="flex flex-col">
              <h2 className="m-0 text-slate-800 text-xl font-bold leading-tight tracking-tight">
                {pathSnippets.length > 0 ? pathSnippets[pathSnippets.length - 1].toUpperCase() : 'DASHBOARD'}
              </h2>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

            <div className="hidden md:block">
              <Breadcrumb items={breadcrumbItems} className="text-sm font-medium" />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <Popover content={notificationContent} title="Notifications" trigger="click" placement="bottomRight">
                <Button
                  type="text"
                  shape="circle"
                  icon={<Badge count={activeAlerts > 0 ? activeAlerts : 0} size="small" offset={[-2, 2]}>
                    <BellOutlined className="text-slate-500 text-lg" />
                  </Badge>}
                  className="hover:bg-slate-100 hover:text-indigo-600"
                />
              </Popover>
            </div>
          </div>
        </Header>

        <Content style={{ margin: '0', overflow: 'initial', display: 'flex', flexDirection: 'column' }}>
          <div className="main-content flex-1">
            {children}
          </div>
          <div className="text-center text-slate-400 text-xs font-medium border-t border-slate-100 mt-auto bg-slate-50" style={{ padding: '10px' }}>
            KYC Risk Engine v2.0 • Financial Security Systems © {new Date().getFullYear()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
