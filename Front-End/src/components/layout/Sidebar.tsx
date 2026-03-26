import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Tooltip } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  LogoutOutlined,
  UserOutlined,
  BellFilled,
  SecurityScanFilled
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
        <div className="flex-1 py-4 px-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
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
            onClick={({ key }) => navigate(key)}
            className="bg-transparent border-none font-medium"
            style={{ background: 'transparent', fontSize: '15px' }}
          />
        </div>

        {/* User Profile Section - Bottom Fixed */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/5 shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full transition-all`}>
            <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1 group cursor-pointer">
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
                <div className="flex flex-col overflow-hidden min-w-0 justify-center ml-1">
                  <span className="text-sm font-semibold truncate text-slate-200 group-hover:text-white transition-colors">
                    {user?.name || 'Admin User'}
                  </span>
                  <span className="text-xs text-slate-500 truncate group-hover:text-indigo-400 transition-colors">
                    Head of Risk
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip title={`${activeAlerts} Active Alerts`}>
                  <div className="cursor-pointer w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
                    <div className="relative">
                      <BellFilled className={activeAlerts > 0 ? "text-rose-500" : "text-slate-400"} />
                      {activeAlerts > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
                    </div>
                  </div>
                </Tooltip>

                <Dropdown menu={userMenu} placement="topRight" trigger={['click']}>
                  <div className="cursor-pointer w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
                    <LogoutOutlined className="text-slate-400 hover:text-white transition-colors" />
                  </div>
                </Dropdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sider>
  );
};
