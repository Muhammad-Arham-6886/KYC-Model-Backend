import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Select, Popconfirm, message } from 'antd';
import { SyncOutlined, DatabaseOutlined, DownloadOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { riskService } from '../../services/riskService';
import { useDispatch } from 'react-redux';
import { clearAlerts } from '../../store/slices/alertSlice';
import { clearLogs } from '../../store/slices/systemLogsSlice';

const { Title, Text } = Typography;

export const DatabaseHistoryPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('All');
  const dispatch = useDispatch();

  const downloadCSV = () => {
    if (!filteredData || filteredData.length === 0) return;

    const headers = ['Date', 'Customer Name', 'Amount', 'Balance', 'Risk Score', 'Risk Level', 'Compliance Flags'];
    const rows = filteredData.map(item => {
      let flags = 'None';
      try {
        const parsed = JSON.parse(item.flags);
        if (Array.isArray(parsed) && parsed.length > 0) flags = parsed.join('; ');
      } catch (e) {
        flags = item.flags || 'None';
      }

      return [
        new Date(item.created_at).toLocaleString().replace(/,/g, ''),
        item.customer_name || 'Unknown',
        item.transaction_amount || 0,
        item.account_balance || 0,
        (item.risk_score || 0).toFixed(2),
        item.risk_level || 'N/A',
        flags
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `risk_logs_${selectedCustomer === 'All' ? 'all' : selectedCustomer.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchHistory = async () => {
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

  const handleDeleteTransaction = async (createdAt: string) => {
    await riskService.deleteHistoryTransaction(createdAt);
    message.success('Transaction deleted');
    fetchHistory();
  };

  const handleClearRecords = async () => {
    if (selectedCustomer === 'All') {
      await riskService.deleteHistoryAll();
      message.success('All database history deleted');
      // Clear redux states as well for full sync
      dispatch(clearAlerts());
      dispatch(clearLogs());
    } else {
      await riskService.deleteHistoryByCustomer(selectedCustomer);
      message.success(`History for ${selectedCustomer} deleted`);
    }
    fetchHistory();
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const uniqueCustomers = Array.from(new Set(data.map(item => item.customer_name).filter(Boolean)));

  const filteredData = selectedCustomer === 'All' 
    ? data 
    : data.filter(item => item.customer_name === selectedCustomer);

  const columns = [
    {
      title: 'Date / Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: 'Customer Name',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (val: string) => <Text strong>{val || 'Unknown'}</Text>,
    },
    {
      title: 'Amount',
      dataIndex: 'transaction_amount',
      key: 'transaction_amount',
      render: (val: number) => `PKR ${val ? val.toLocaleString() : 0}`,
    },
    {
      title: 'Balance',
      dataIndex: 'account_balance',
      key: 'account_balance',
      render: (val: number) => `PKR ${val ? val.toLocaleString() : 0}`,
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk_score',
      key: 'risk_score',
      render: (val: number) => val.toFixed(2),
    },
    {
      title: 'Risk Level',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (level: string) => {
        let color = 'default';
        if (level && level.includes('High')) color = 'error';
        else if (level && level.includes('Blocked')) color = 'warning';
        else if (level && level.includes('Medium')) color = 'gold';
        else if (level === 'Low') color = 'success';
        return <Tag color={color}>{level || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Compliance Flags',
      dataIndex: 'flags',
      key: 'flags',
      render: (val: string) => {
        if (!val) return <Text type="secondary">None</Text>;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((flag: string, i: number) => (
              <Tag key={i} color="blue" className="mb-1">
                {flag}
              </Tag>
            ));
          }
          return <Text type="secondary">None</Text>;
        } catch (e) {
          return val;
        }
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record: any) => (
        <Popconfirm
          title="Delete this transaction?"
          description="Are you sure to delete this transaction from history?"
          onConfirm={() => handleDeleteTransaction(record.created_at)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-2">
        <div>
          <Title level={2} className="text-slate-800 m-0">
            <DatabaseOutlined className="mr-3 text-indigo-500" />
            Database Logs
          </Title>
          <Text className="text-slate-500">
            View the permanent, historical records of all ML evaluations stored in SQLite.
          </Text>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <Select
            value={selectedCustomer}
            onChange={(val) => setSelectedCustomer(val)}
            style={{ width: 250 }}
            options={[
              { label: 'All Customers', value: 'All' },
              ...uniqueCustomers.map(name => ({ label: name as string, value: name as string }))
            ]}
          />
          <Button
            type="primary"
            icon={<SyncOutlined spin={loading} />}
            onClick={fetchHistory}
            loading={loading}
          >
            Refresh Data
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={downloadCSV}
            disabled={filteredData.length === 0}
          >
            Export CSV
          </Button>
          <Popconfirm
            title={selectedCustomer === 'All' ? "Delete all history?" : `Delete history for ${selectedCustomer}?`}
            description="This action cannot be undone and will reset the dashboard charts."
            onConfirm={handleClearRecords}
            okText="Yes, delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<ClearOutlined />}
              disabled={filteredData.length === 0}
            >
              Clear Records
            </Button>
          </Popconfirm>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(record) => record.created_at + record.risk_score}
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </MainLayout>
  );
};
