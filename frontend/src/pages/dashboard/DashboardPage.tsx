import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Row, Col, Card, Button, Table, Tag, Badge, Tabs, Alert, Space, Typography } from 'antd';
import { ReloadOutlined, CheckCircleFilled, WarningFilled, FireFilled, CaretUpOutlined, ArrowUpOutlined, CloudDownloadOutlined, TeamOutlined, ThunderboltOutlined, BellFilled } from '@ant-design/icons';
import { riskService } from '../../services/riskService';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAppSelector } from '../../hooks/reduxHooks';

const RiskScoreChart = lazy(() => import('../../components/charts/RiskScoreChart'));
const BehaviorDriftChart = lazy(() => import('../../components/charts/BehaviorDriftChart'));

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const profiles = useAppSelector(state => state.kyc.profiles);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const history = await riskService.getDatabaseHistory();
      setDbHistory(history);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = (format: 'pdf' | 'csv') => {
    if (format === 'csv') {
      if (!dbHistory || dbHistory.length === 0) return;
      const headers = ['Date', 'Customer Name', 'Amount', 'Balance', 'Risk Score', 'Risk Level'];
      const rows = dbHistory.map(item => [
        new Date(item.created_at).toLocaleString().replace(/,/g, ''),
        item.customer_name || 'Unknown',
        item.transaction_amount || 0,
        item.account_balance || 0,
        (item.risk_score || 0).toFixed(2),
        item.risk_level || 'N/A',
      ].join(','));
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  const riskStats = {
    totalAlerts: dbHistory.filter(r => r.risk_level && (r.risk_level.includes('High') || r.risk_level.includes('Medium') || r.risk_level.includes('Blocked'))).length,
    totalCustomers: profiles.length,
    totalTransactions: dbHistory.length,
  };

  const avgRiskScore = dbHistory.length > 0
    ? Math.round((dbHistory.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / dbHistory.length) * 100)
    : 0;



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
        <Space wrap className="justify-center md:justify-end">
          <Button icon={<ReloadOutlined />} onClick={fetchDashboardData} loading={loading} className="rounded-lg border-slate-200">Refresh</Button>
          <Button type="default" icon={<CloudDownloadOutlined />} onClick={() => handleExport('csv')} className="rounded-lg border-slate-200 shadow-sm">Export CSV</Button>
          <Button type="primary" icon={<CloudDownloadOutlined />} onClick={() => handleExport('pdf')} className="rounded-lg bg-blue-600 shadow-sm">Print PDF</Button>
        </Space>
      </div>

      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Alerts"
            value={riskStats.totalAlerts}
            color="#ef4444"
            icon={<BellFilled />}
            subtext={<span className="text-red-500 text-xs font-semibold flex items-center gap-1 animate-pulse"><FireFilled /> Action required</span>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Customers Registered"
            value={riskStats.totalCustomers}
            color="#10b981"
            icon={<TeamOutlined />}
            subtext={<span className="text-green-600 text-xs font-semibold">Active in KYC system</span>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Transactions"
            value={riskStats.totalTransactions}
            color="#f59e0b"
            icon={<ThunderboltOutlined />}
            subtext={<span className="text-slate-400 text-xs">All processed events</span>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Avg Risk Score"
            value={avgRiskScore}
            color="#3b82f6"
            icon={<CaretUpOutlined />}
            subtext={<span className="text-blue-500 text-xs font-semibold">Scale 0 - 100</span>}
          />
        </Col>
      </Row>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <Card title="Traffic & Risk Trends" bordered={false} className="shadow-sm rounded-2xl h-full border border-slate-100">
            <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Chart...</div>}>
              <BehaviorDriftChart history={dbHistory} />
            </Suspense>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Risk Distribution" bordered={false} className="shadow-sm rounded-2xl h-full border border-slate-100">
            <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Chart...</div>}>
              <RiskScoreChart data={dbHistory} />
            </Suspense>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
};
