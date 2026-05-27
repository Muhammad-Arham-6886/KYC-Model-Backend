import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateFilled } from '@ant-design/icons';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { login } from '../../store/slices/authSlice';
import './LoginPage.css';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values: any) => {
    setError('');
    setLoading(true);
    try {
      // Mock login logic simulation
      if (!values.email.includes('@') || values.password.length < 6) {
        throw new Error('Invalid credentials');
      }

      setTimeout(() => {
        dispatch(login({ id: '1', email: values.email, name: values.email.split('@')[0] }));
        localStorage.setItem('token', 'mock-token');
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-white">
      {/* Hero Section */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-[50px] xl:p-[60px] overflow-hidden login-hero">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-violet-600/20 animate-pulse-slow"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <SafetyCertificateFilled className="text-white text-xl" />
            </div>
            <span className="text-white font-bold text-xl tracking-wide">RISK ENGINE</span>
          </div>
        </div>

        <div className="relative z-10 mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Next Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Risk Intelligence
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Advanced KYC verification and fraudulent pattern detection powered by machine learning algorithms.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-sm text-slate-500 font-medium">
          <span>Security First</span>
          <span>•</span>
          <span>Real-time Analysis</span>
          <span>•</span>
          <span>Compliant</span>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 login-content">
        <div className="w-full max-w-[500px] bg-white p-8 lg:px-[50px] lg:py-[70px] rounded-2xl shadow-xl shadow-slate-200/50 login-card-custom">
          <div className="text-center mb-8 login-header-custom">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <SafetyCertificateFilled className="text-white text-2xl" />
              </div>
            </div>
            <Title level={2} className="!text-slate-800 !mb-2">Welcome Back</Title>
            <Text type="secondary">Sign in to your dashboard to continue</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              className="mb-6 rounded-lg border-red-100 bg-red-50 text-red-700"
            />
          )}

          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="modern-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your Email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
              className="mb-5"
            >
              <Input
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="Email Address"
                className="hover:border-indigo-400 focus:border-indigo-500 rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
              className="mb-5"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="Password"
                className="hover:border-indigo-400 focus:border-indigo-500 rounded-lg"
              />
            </Form.Item>

            <div className="flex items-center justify-between mb-8">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-slate-600">Remember me</Checkbox>
              </Form.Item>
              <a className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors" href="">
                Forgot password?
              </a>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-12 bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-200 text-lg font-medium rounded-xl transition-all hover:scale-[1.02]"
              >
                Sign In
              </Button>
            </Form.Item>

            <div className="mt-8 text-center text-xs text-slate-400">
              Protected by Enterprise Grade Security
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};
