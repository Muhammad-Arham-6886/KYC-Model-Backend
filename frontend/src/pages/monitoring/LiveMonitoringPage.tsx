import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Badge, Tabs, Alert, Modal, message } from 'antd';
import { SyncOutlined, DesktopOutlined, DeleteOutlined } from '@ant-design/icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { SARReportModal } from '../../components/common/SARReportModal';
import { riskService } from '../../services/riskService';
import { useAppSelector } from '../../hooks/reduxHooks';

const { Title, Text } = Typography;

export const LiveMonitoringPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSarAlert, setSelectedSarAlert] = useState<any | null>(null);

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

  const handleReviewAlert = (createdAt: string, customerName: string, amount: number) => {
    Modal.confirm({
      title: 'Confirm Alert Review',
      content: `Are you sure you want to mark the alert for ${customerName || 'Unknown Customer'} (PKR ${amount?.toLocaleString() || 0}) as reviewed?`,
      okText: 'Mark as Reviewed',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        await processReview(createdAt);
      }
    });
  };

  const processReview = async (createdAt: string) => {
    try {
      await riskService.reviewTransaction(createdAt);
      message.success('Alert successfully marked as reviewed.');
      fetchMonitoringData();
      setSelectedSarAlert(null);
    } catch (e) {
      console.error(e);
      message.error('Failed to update alert status.');
    }
  };

  const handleDeleteAlert = (createdAt: string) => {
    Modal.confirm({
      title: 'Delete Alert',
      content: 'Are you sure you want to permanently delete this alert? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await riskService.deleteHistoryTransaction(createdAt);
          message.success('Alert deleted successfully.');
          fetchMonitoringData();
        } catch (e) {
          message.error('Failed to delete alert.');
        }
      }
    });
  };

  const handleDeleteAllAlerts = () => {
    Modal.confirm({
      title: 'Clear All Alerts',
      content: 'Are you sure you want to permanently delete these alerts? This will only remove the alerts listed below.',
      okText: 'Clear Alerts',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Delete only the records currently shown in the Alerts table
          await Promise.all(dbAlerts.map(alert => riskService.deleteHistoryTransaction(alert.createdAt)));
          message.success('Listed alerts cleared successfully.');
          fetchMonitoringData();
        } catch (e) {
          message.error('Failed to clear alerts.');
        }
      }
    });
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
      render: (req: boolean, record: any) => {
        return (
          <div className="flex gap-4 items-center">
            {req ? (
              record.riskLevel === 'High' ? (
                <Button type="primary" danger size="small" onClick={() => setSelectedSarAlert(record)}>File SAR</Button>
              ) : (
                <Button type="link" size="small" onClick={() => handleReviewAlert(record.createdAt, record.customerName, record.amount)}>Review</Button>
              )
            ) : (
              <span className="text-slate-400 text-sm">Reviewed</span>
            )}
            <Button 
              type="text" 
              danger 
              size="small" 
              icon={<DeleteOutlined />} 
              title="Delete Alert"
              onClick={() => handleDeleteAlert(record.createdAt)} 
            />
          </div>
        );
      }
    }
  ];

  const dbAlerts = data
    .filter(d => d.risk_level === 'High' || d.risk_level === 'Medium')
    .map(d => ({
      id: `ALT-${d.created_at}`,
      type: d.risk_level === 'High' ? 'error' : 'warning',
      message: `${d.risk_level} Risk - PKR ${d.transaction_amount?.toLocaleString() || 0} (${d.customer_name})`,
      timestamp: d.created_at,
      riskLevel: d.risk_level,
      actionRequired: !d.is_reviewed,
      createdAt: d.created_at,
      customerName: d.customer_name,
      amount: d.transaction_amount
    }));

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
          defaultActiveKey="2"
          size="large"
          tabBarStyle={{ padding: '0 24px' }}
          items={[
            /* Live Monitoring tab temporarily removed */
            {
              key: '2',
              label: (
                <span className="flex items-center gap-2">
                  Alerts
                  {dbAlerts.filter(a => a.actionRequired).length > 0 &&
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{dbAlerts.filter(a => a.actionRequired).length}</span>
                  }
                </span>
              ),
              children: (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4 gap-4">
                    <div className="flex-1">
                      {dbAlerts.some(a => a.actionRequired) && (
                        <Alert message="Critical Action Required" description="High-risk behavior detected in multiple accounts." type="error" showIcon className="rounded-lg" />
                      )}
                    </div>
                    {dbAlerts.length > 0 && (
                      <Button danger icon={<DeleteOutlined />} onClick={handleDeleteAllAlerts}>
                        Clear All Alerts
                      </Button>
                    )}
                  </div>
                  <Table dataSource={dbAlerts} columns={alertColumns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 'max-content' }} />
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
      
      <SARReportModal 
        open={!!selectedSarAlert} 
        alert={selectedSarAlert} 
        onCancel={() => setSelectedSarAlert(null)}
        onSuccess={processReview}
      />
    </MainLayout>
  );
};
