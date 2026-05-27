import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Tooltip } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  LogoutOutlined,
  UserOutlined,
  BellFilled,
  SecurityScanFilled,
  DatabaseOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { logout } from '../../store/slices/authSlice';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { activeAlerts } = useAppSelector((state) => state.alert);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },

    {
      key: '/kyc',
      icon: <FileTextOutlined />,
      label: 'KYC Panel',
    },
    {
      key: '/simulator',
      icon: <ExperimentOutlined />,
      label: 'Simulator',
    },
    {
      key: '/history',
      icon: <DatabaseOutlined />,
      label: 'Database Logs',
    },
    {
      key: '/monitoring',
      icon: <DesktopOutlined />,
      label: 'Live Monitoring',
    },
  ];

  const userMenu = {
    items: [
      {
        key: 'logout',
        label: 'Sign Out',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
        danger: true,
      }
    ]
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      breakpoint="md"
      collapsedWidth={0}
      className="site-layout-background"
      style={{
        background: '#0f172a', // Deep slate to match theme
        borderRight: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)', // Stronger shadow
        zIndex: 50,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0
      }}
    >
      <div className="flex flex-col h-full w-full">
        {/* Brand Section */}
        <div className="h-20 flex items-center justify-center relative shrink-0 border-b border-white/5 mx-4 mb-2">
          <div className={`flex items-center gap-3 transition-all duration-300 w-full ${collapsed ? 'justify-center px-0' : 'px-2'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 ring-1 ring-white/10">
              <SecurityScanFilled className="text-white text-lg" />
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden min-w-0 flex-1 justify-center">
                <span className="font-bold text-lg tracking-wide leading-none text-white">RISK ENGINE</span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase truncate text-indigo-400 mt-1">Enterprise</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden" style={{ padding: '20px' }}>
          {!collapsed && (
            <div className="text-[11px] font-bold uppercase tracking-widest mb-2 px-4 text-slate-500/80">
              Main Menu
            </div>
          )}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => {
              navigate(key);
              if (window.innerWidth < 768 && setCollapsed) {
                setCollapsed(true);
              }
            }}
            className="bg-transparent border-none font-medium"
            style={{ background: 'transparent', fontSize: '15px' }}
          />
        </div>

        {/* User Profile Section - Bottom Fixed */}
        <div className="p-5 bg-slate-900/80 backdrop-blur-md border-t border-white/5 shrink-0">
          <Dropdown menu={userMenu} placement="topRight" trigger={['click']}>
            <div 
              className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full transition-all cursor-pointer group hover:bg-white/10 rounded-xl`}
              style={{ padding: '10px' }}
            >
              <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                <div className="relative shrink-0">
                  <Avatar
                    size={collapsed ? 40 : 42}
                    src={(user as any)?.avatar}
                    icon={<UserOutlined />}
                    className="bg-indigo-600 ring-2 ring-indigo-500/20 transition-transform group-hover:scale-105"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                </div>

                {!collapsed && (
                  <div className="flex flex-col overflow-hidden min-w-0 justify-center ml-2">
                    <span className="text-sm font-semibold truncate text-white transition-colors">
                      {user?.name || 'Admin User'}
                    </span>
                    <span className="text-xs text-white/70 truncate transition-colors">
                      Head of Risk
                    </span>
                  </div>
                )}
              </div>

              {!collapsed && (
                <div className="flex items-center shrink-0 pl-2">
                  <LogoutOutlined style={{ color: '#ffffff', fontSize: '18px' }} className="transition-transform group-hover:scale-110" />
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      </div>
    </Sider>
  );
};
