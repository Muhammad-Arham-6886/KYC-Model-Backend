import React, { useEffect, lazy, Suspense } from 'react';
import { Card, Button, Form, Select, InputNumber, Table, Tag, Row, Col, Statistic, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ClearOutlined, ThunderboltOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  setTransactions,
  setIsSimulating,
  setSimulationParams,
  addTransaction,
  setLoading,
} from '../../store/slices/transactionSlice';
import { MainLayout } from '../../components/layout/MainLayout';

const TransactionChart = lazy(() => import('../../components/charts/TransactionChart'));

const { Option } = Select;

export const SimulatorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, isSimulating, simulationParams, loading } = useAppSelector(
    (state) => state.transaction
  );
  const [form] = Form.useForm();

  // Mock customer data
  const customers = [
    { label: 'Ahmed Ali (CUST-001)', value: '1' },
    { label: 'Fatima Khan (CUST-002)', value: '2' },
    { label: 'Bilal Ahmed (CUST-003)', value: '3' },
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSimulating) {
      interval = setInterval(() => {
        const transaction = {
          id: `TXN-${Date.now()}`,
          customerId: simulationParams.customerId || '1',
          amount: Math.floor(Math.random() * 50000) + 1000,
          type: ['Income', 'Expense', 'Transfer'][Math.floor(Math.random() * 3)] as 'Income' | 'Expense' | 'Transfer',
          date: new Date().toISOString(),
          description: `Simulated ${simulationParams.transactionType}`,
          category: 'Simulated',
        };
        dispatch(addTransaction(transaction));
      }, simulationParams.frequency * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, simulationParams, dispatch]);

  const handleStartSimulation = () => {
    form.validateFields().then(() => {
      // Values are already in sync via Redux but good to validate
      dispatch(setLoading(true));
      setTimeout(() => {
        dispatch(setIsSimulating(true));
        dispatch(setLoading(false));
      }, 500);
    });
  };

  const handleStopSimulation = () => {
    dispatch(setIsSimulating(false));
  };

  const columns = [
    { title: 'Transaction ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = type === 'Income' ? 'green' : type === 'Expense' ? 'red' : 'blue';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (val: number) => `PKR ${val.toLocaleString()}`
    },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => new Date(d).toLocaleTimeString() },
    { title: 'Category', dataIndex: 'category', key: 'category' },
  ];

  return (
    <MainLayout>
      <div className="mb-8 mt-2">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Transaction Simulator</h2>
        <p className="text-slate-500">Generate synthetic transaction patterns to test risk models.</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Configuration" className="shadow-sm h-full" bordered={false}>
            <Form
              layout="vertical"
              form={form}
              initialValues={{
                customerId: '1',
                transactionType: 'Income',
                amount: 5000,
                frequency: 2
              }}
              onValuesChange={(_, allValues) => {
                dispatch(setSimulationParams(allValues));
              }}
            >
              <Form.Item label="Select Customer" name="customerId" rules={[{ required: true }]}>
                <Select disabled={isSimulating}>
                  {customers.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
                </Select>
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item label="Type" name="transactionType">
                    <Select disabled={isSimulating}>
                      <Option value="Income">Income</Option>
                      <Option value="Expense">Expense</Option>
                      <Option value="Transfer">Transfer</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Freq (sec)" name="frequency">
                    <InputNumber min={0.5} max={60} style={{ width: '100%' }} disabled={isSimulating} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Base Amount (PKR)" name="amount">
                <InputNumber
                  min={100}
                  style={{ width: '100%' }}
                  formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\D/g, '') as unknown as 100}
                  disabled={isSimulating}
                />
              </Form.Item>

              <div className="flex flex-col gap-2 mt-4">
                {!isSimulating ? (
                  <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartSimulation} loading={loading} block size="large">
                    Start Simulation
                  </Button>
                ) : (
                  <Button danger type="primary" icon={<PauseCircleOutlined />} onClick={handleStopSimulation} block size="large">
                    Stop Simulation
                  </Button>
                )}
                <Button icon={<ClearOutlined />} onClick={() => dispatch(setTransactions([]))} disabled={isSimulating} block>
                  Clear History
                </Button>
              </div>

              {isSimulating && (
                <Alert
                  message="Simulation Running"
                  description="Generating transactions..."
                  type="success"
                  showIcon
                  className="mt-4"
                  action={<ExperimentOutlined spin />}
                />
              )}
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]} className="h-full">
            <Col span={24}>
              <Card bodyStyle={{ padding: 12 }} className="h-auto shadow-sm" bordered={false}>
                <Row justify="space-around">
                  <Col span={8} className="text-center border-r border-slate-100">
                    <Statistic title="Total Transactions" value={transactions.length} prefix={<ThunderboltOutlined />} />
                  </Col>
                  <Col span={8} className="text-center border-r border-slate-100">
                    <Statistic
                      title="Total Volume"
                      value={transactions.reduce((acc, t) => acc + t.amount, 0)}
                      prefix="PKR"
                      precision={0}
                      formatter={(val) => val ? val.toLocaleString() : ''}
                    />
                  </Col>
                  <Col span={8} className="text-center">
                    <Statistic title="Avg Amount" value={transactions.length ? Math.round(transactions.reduce((acc, t) => acc + t.amount, 0) / transactions.length) : 0} prefix="PKR" />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Live Feed" className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
                <Table
                  dataSource={[...transactions].reverse()}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </Col>

            <Col span={24}>
              <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 12 }}>
                <Suspense fallback={<div>Loading chart...</div>}>
                  <TransactionChart transactions={transactions} />
                </Suspense>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </MainLayout>
  );
};
