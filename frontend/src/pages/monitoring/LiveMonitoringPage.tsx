import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Badge, Tabs, Alert } from 'antd';
import { SyncOutlined, DesktopOutlined } from '@ant-design/icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { riskService } from '../../services/riskService';
import { useAppSelector } from '../../hooks/reduxHooks';

const { Title, Text } = Typography;

export const LiveMonitoringPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const riskAlerts = useAppSelector(state => state.alert.alerts);
  const systemLogs = useAppSelector(state => state.systemLogs.logs);

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const history = await riskService.getDatabaseHistory();
      setData(history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 10000);
    return () => clearInterval(interval);
  }, []);

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (text: string) => <span className="font-semibold text-slate-700">{text || 'Unknown'}</span>
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk_score',
      key: 'risk_score',
      render: (val: number) => {
        const score = Math.round(val * 100);
        let color = score < 25 ? '#10b981' : score < 80 ? '#f59e0b' : '#ef4444';
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
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (level: string) => {
        let color = 'default';
        if (level && level.includes('High')) color = 'error';
        else if (level && level.includes('Blocked')) color = 'warning';
        else if (level && level.includes('Medium')) color = 'warning';
        else if (level === 'Low') color = 'success';
        return <Tag color={color} className="font-medium rounded-full px-3">{level.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Key Factors',
      dataIndex: 'flags',
      key: 'flags',
      render: (val: string) => {
        if (!val) return <Text type="secondary">None</Text>;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return <span className="text-xs text-slate-500">{parsed.join(', ')}</span>;
          }
          return <Text type="secondary">None</Text>;
        } catch (e) {
          return val;
        }
      },
    },
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val: string) => <span className="text-slate-500 text-xs">{new Date(val).toLocaleTimeString()}</span>,
    }
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

  const logColumns = [
    { title: 'Time', dataIndex: 'time', key: 'time', render: (t: string) => <span className="font-mono text-xs">{new Date(t).toLocaleString()}</span> },
    { title: 'User', dataIndex: 'user', key: 'user' },
    { title: 'Action', dataIndex: 'action', key: 'action' },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-2">
        <div>
          <Title level={2} className="text-slate-800 m-0 flex items-center gap-4">
            <DesktopOutlined className="text-blue-500" />
            <span>System Diagnostics Hub</span>
          </Title>
          <Text className="text-slate-500">
            Centralized live feed for transactions, alerts, and system logs.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<SyncOutlined spin={loading} />}
          onClick={fetchMonitoringData}
          loading={loading}
        >
          Refresh Feed
        </Button>
      </div>

      <Card className="shadow-sm rounded-2xl border border-slate-100" bordered={false} bodyStyle={{ padding: 0 }}>
        <Tabs
          defaultActiveKey="1"
          size="large"
          tabBarStyle={{ padding: '0 24px' }}
          items={[
            {
              key: '1',
              label: 'Live Monitoring',
              children: (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Badge status="processing" color="blue" />
                    <Text strong className="text-slate-700">Live Transaction Feed</Text>
                  </div>
                  <Table
                    columns={columns}
                    dataSource={data}
                    rowKey={(record) => record.created_at + record.risk_score}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              )
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
                  <Table dataSource={riskAlerts} columns={alertColumns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 'max-content' }} />
                </div>
              )
            },
            {
              key: '3',
              label: 'System Logs',
              children: (
                <div className="p-4">
                  <Table
                    dataSource={systemLogs}
                    columns={logColumns}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 15 }}
                    scroll={{ x: 'max-content' }}
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
