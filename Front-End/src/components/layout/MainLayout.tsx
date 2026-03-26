import React, { useState, useEffect } from 'react';
import { Layout, Button, Breadcrumb, Badge, Input } from 'antd';
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
  const [collapsed, setCollapsed] = useState(false);
  const [leftMargin, setLeftMargin] = useState<number>(280);
  const { activeAlerts } = useAppSelector((state) => state.alert);
  useEffect(() => {
    const update = () => setLeftMargin(collapsed ? 80 : (window.innerWidth < 768 ? 0 : 280));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [collapsed]);
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
            <div className="hidden md:block w-72">
              <Input
                prefix={<SearchOutlined className="text-slate-400 text-base" />}
                placeholder="Search..."
                className="rounded-full bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all py-2 px-4 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="text"
                shape="circle"
                icon={<SettingOutlined className="text-slate-500 text-lg" />}
                className="hover:bg-slate-100 hover:text-indigo-600"
              />
              <Button
                type="text"
                shape="circle"
                icon={<Badge count={activeAlerts > 0 ? activeAlerts : 0} size="small" offset={[-2, 2]}>
                  <BellOutlined className="text-slate-500 text-lg" />
                </Badge>}
                className="hover:bg-slate-100 hover:text-indigo-600"
              />
            </div>
          </div>
        </Header>

        <Content style={{ margin: '0', overflow: 'initial', display: 'flex', flexDirection: 'column' }}>
          <div className="main-content flex-1">
            {children}
          </div>
          <div className="text-center text-slate-400 py-6 text-xs font-medium border-t border-slate-100 mt-auto bg-slate-50">
            KYC Risk Engine v2.0 • Financial Security Systems © {new Date().getFullYear()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
