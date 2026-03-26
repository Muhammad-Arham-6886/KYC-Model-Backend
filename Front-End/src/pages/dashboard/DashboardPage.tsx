import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Row, Col, Card, Button, Table, Tag, Badge, Tabs, Alert, Space, Typography } from 'antd';
import { ReloadOutlined, CheckCircleFilled, WarningFilled, FireFilled, CaretUpOutlined, ArrowUpOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import type { RiskScore, RiskAlert } from '../../services/riskService';
import { MainLayout } from '../../components/layout/MainLayout';

const RiskScoreChart = lazy(() => import('../../components/charts/RiskScoreChart'));
const BehaviorDriftChart = lazy(() => import('../../components/charts/BehaviorDriftChart'));

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  // profiles not required on this page currently
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setRiskScores([
          { customerId: 'CUST-001', riskLevel: 'Low', score: 25, factors: ['Stable income'], timestamp: new Date().toISOString() },
          { customerId: 'CUST-002', riskLevel: 'Medium', score: 60, factors: ['Income increase'], timestamp: new Date().toISOString() },
          { customerId: 'CUST-003', riskLevel: 'High', score: 85, factors: ['Rapid movement', 'Large transfers'], timestamp: new Date().toISOString() },
          { customerId: 'CUST-004', riskLevel: 'Low', score: 15, factors: ['Salary deposit'], timestamp: new Date().toISOString() },
        ]);

        setRiskAlerts([
          { id: '1', customerId: 'CUST-002', riskLevel: 'Medium', message: 'Behavior shift detected - SUDDEN_INCOME_SPIKE', timestamp: new Date().toISOString(), actionRequired: true },
          { id: '2', customerId: 'CUST-003', riskLevel: 'High', message: 'Suspicious overseas transfer detected', timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: true },
          { id: '3', customerId: 'CUST-001', riskLevel: 'Low', message: 'KYC Verification Successful', timestamp: new Date(Date.now() - 86400000).toISOString(), actionRequired: false },
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    console.info(`Exporting as ${format.toUpperCase()}`);
  };

  const riskStats = {
    low: riskScores.filter(r => r.riskLevel === 'Low').length,
    medium: riskScores.filter(r => r.riskLevel === 'Medium').length,
    high: riskScores.filter(r => r.riskLevel === 'High').length,
  };

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customerId',
      render: (text: string) => <span className="font-semibold text-slate-700">{text}</span>
    },
    {
      title: 'Risk Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => {
        let color = score < 40 ? '#10b981' : score < 70 ? '#f59e0b' : '#ef4444';
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: color }}></div>
            </div>
            <span className="font-bold text-xs" style={{ color }}>{score}</span>
          </div>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (text: string) => {
        let color = text === 'Low' ? 'success' : text === 'Medium' ? 'warning' : 'error';
        return <Tag color={color} className="font-medium rounded-full px-3">{text.toUpperCase()}</Tag>;
      }
    },
    { title: 'Key Factors', dataIndex: 'factors', key: 'factors', render: (factors: string[]) => <span className="text-xs text-slate-500">{factors.join(', ')}</span> },
  ];

  const alertColumns = [
    { title: 'Time', dataIndex: 'timestamp', key: 'timestamp', render: (t: string) => <span className="text-slate-500 text-xs">{new Date(t).toLocaleString()}</span> },
    {
      title: 'Severity',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (text: string) => <Badge status={text === 'High' ? 'error' : text === 'Medium' ? 'warning' : 'default'} text={text} />
    },
    { title: 'Message', dataIndex: 'message', key: 'message', render: (text: string) => <span className="font-medium text-slate-700">{text}</span> },
    {
      title: 'Action',
      dataIndex: 'actionRequired',
      key: 'actionRequired',
      render: (req: boolean) => req ? <Button type="link" size="small" danger>Review</Button> : <span className="text-slate-400">Archived</span>
    }
  ];

  const StatCard = ({ title, value, color, icon, subtext }: { title: string, value: number, color: string, icon: React.ReactNode, subtext?: React.ReactNode }) => (
    <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden border border-slate-100">
      <div className="flex justify-between items-start">
        <div>
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</Text>
          <Title level={3} className="m-0 mt-1 text-2xl">{value}</Title>
          {subtext && <div className="mt-2">{subtext}</div>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl`} style={{ backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pt-4">
        <div>
          <Title level={4} className="m-0 text-slate-800">System Overview</Title>
          <Text className="text-slate-500">Real-time risk monitoring and alerts</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDashboardData} loading={loading} className="rounded-lg border-slate-200">Refresh</Button>
          <Button type="primary" icon={<CloudDownloadOutlined />} onClick={() => handleExport('pdf')} className="rounded-lg bg-blue-600 shadow-sm">Export Report</Button>
        </Space>
      </div>

      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Low Risk Profiles"
            value={riskStats.low}
            color="#10b981"
            icon={<CheckCircleFilled />}
            subtext={<span className="text-green-600 text-xs font-semibold flex items-center gap-1"><ArrowUpOutlined /> +5% this week</span>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Medium Risk Attention"
            value={riskStats.medium}
            color="#f59e0b"
            icon={<WarningFilled />}
            subtext={<span className="text-slate-400 text-xs">Requires review</span>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Critical Alerts"
            value={riskStats.high}
            color="#ef4444"
            icon={<FireFilled />}
            subtext={<span className="text-red-500 text-xs font-bold animate-pulse">Action required</span>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Avg Risk Score"
            value={42}
            color="#3b82f6"
            icon={<CaretUpOutlined />}
            subtext={<span className="text-blue-500 text-xs font-semibold">Moderate Level</span>}
          />
        </Col>
      </Row>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <Card title="Traffic & Risk Trends" bordered={false} className="shadow-sm rounded-2xl h-full border border-slate-100">
            <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Chart...</div>}>
              <BehaviorDriftChart />
            </Suspense>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Risk Distribution" bordered={false} className="shadow-sm rounded-2xl h-full border border-slate-100">
            <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Chart...</div>}>
              <RiskScoreChart riskScores={riskScores} />
            </Suspense>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm rounded-2xl border border-slate-100" bordered={false} bodyStyle={{ padding: 0 }}>
        <Tabs
          defaultActiveKey="1"
          size="large"
          tabBarStyle={{ padding: '0 24px' }}
          items={[
            {
              key: '1',
              label: 'Live Monitoring',
              children: <div className="p-4"><Table dataSource={riskScores} columns={columns} rowKey="customerId" pagination={{ pageSize: 5 }} /></div>
            },
            {
              key: '2',
              label: (
                <span className="flex items-center gap-2">
                  Alerts
                  {riskAlerts.filter(a => a.actionRequired).length > 0 &&
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{riskAlerts.filter(a => a.actionRequired).length}</span>
                  }
                </span>
              ),
              children: (
                <div className="p-4">
                  {riskAlerts.some(a => a.actionRequired) && (
                    <Alert message="Critical Action Required" description="High-risk behavior detected in multiple accounts." type="error" showIcon className="mb-4 rounded-lg" />
                  )}
                  <Table dataSource={riskAlerts} columns={alertColumns} rowKey="id" />
                </div>
              )
            },
            {
              key: '3',
              label: 'System Logs',
              children: (
                <div className="p-4">
                  <Table
                    dataSource={[
                      { id: 1, action: 'User Login', user: 'Admin', time: new Date().toLocaleString() },
                      { id: 2, action: 'Viewed Profile CUST-002', user: 'Admin', time: new Date(Date.now() - 100000).toLocaleString() },
                      { id: 3, action: 'Exported PDF Report', user: 'Manager', time: new Date(Date.now() - 500000).toLocaleString() },
                    ]}
                    columns={[
                      { title: 'Time', dataIndex: 'time', key: 'time', render: (t) => <span className="font-mono text-xs">{t}</span> },
                      { title: 'User', dataIndex: 'user', key: 'user' },
                      { title: 'Action', dataIndex: 'action', key: 'action' },
                    ]}
                    rowKey="id"
                    size="small"
                  />
                </div>
              )
            }
          ]}
        />
      </Card>
    </MainLayout>
  );
};
