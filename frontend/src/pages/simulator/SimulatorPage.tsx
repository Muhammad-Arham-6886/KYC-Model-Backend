import React, { useEffect, lazy, Suspense } from 'react';
import { Card, Button, Form, Select, InputNumber, Table, Tag, Row, Col, Statistic, Alert, notification } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ClearOutlined, ThunderboltOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  setTransactions,
  setIsSimulating,
  setSimulationParams,
  addTransaction,
  setLoading,
} from '../../store/slices/transactionSlice';
import { addAlert } from '../../store/slices/alertSlice';
import { addLog } from '../../store/slices/systemLogsSlice';
import { MainLayout } from '../../components/layout/MainLayout';
import { riskService } from '../../services/riskService';

const TransactionChart = lazy(() => import('../../components/charts/TransactionChart'));

const { Option } = Select;

export const SimulatorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, isSimulating, simulationParams, loading } = useAppSelector(
    (state) => state.transaction
  );
  const { profiles } = useAppSelector((state) => state.kyc);
  const [form] = Form.useForm();

  // Dynamic customer data from KYC Panel
  const customers = profiles.map(p => ({
    label: `${p.name} (CUST-${p.id.length > 4 ? p.id.slice(-4) : p.id})`,
    value: p.id
  }));

  const handleStartSimulation = () => {
    form.validateFields().then(async () => {
      dispatch(setLoading(true));
      dispatch(setIsSimulating(true));
      
      const { transactionCount, timespanDays } = simulationParams;
      
      const promises = Array.from({ length: transactionCount }).map(async (_, i) => {
        const randomDays = Math.floor(Math.random() * timespanDays);
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - randomDays);
        
        const minAmount = 5000;
        const maxAmount = 2000000;
        const generatedAmount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;

        const bankNames = ['MCB', 'UBL', 'HBL', 'Allied Bank', 'Meezan'];
        const types = ['POS', 'E-Commerce', 'ATM', 'Bank_Transfer'];
        
        const rand = Math.random();
        let complianceFlags = {};
        if (rand < 0.03) complianceFlags = { Is_Layering_Loop: true };
        else if (rand < 0.06) complianceFlags = { Foreign_KYC_Mismatch: true };
        else if (rand < 0.09) complianceFlags = { Is_Hub_Portfolio: true };
        else if (rand < 0.12) complianceFlags = { Property_Doc_Missing: true };
        else if (rand < 0.15) complianceFlags = { Is_Cash_Structuring: true };
        
        const selectedProfile = profiles.find(p => p.id === (simulationParams.customerId || form.getFieldValue('customerId')));
        const customerName = selectedProfile ? selectedProfile.name : 'Unknown Customer';

        const mlPayload = {
          Customer_Name: customerName,
          Transaction_Amount: generatedAmount,
          Account_Balance: generatedAmount * Math.floor(Math.random() * 10 + 1), 
          Transaction_Type: types[Math.floor(Math.random() * types.length)],
          Device_Type: ['Mobile', 'Desktop', 'Tablet'][Math.floor(Math.random() * 3)],
          Bank_Name: bankNames[Math.floor(Math.random() * bankNames.length)],
          Is_Weekend: randomDate.getDay() % 6 === 0 ? 1 : 0,
          ...complianceFlags
        };

        try {
           const riskData = await riskService.evaluateTransactionRisk(mlPayload);

           if (riskData?.risk_level && riskData.risk_level !== 'Low' && riskData.risk_level !== 'Medium' && riskData.risk_level !== 'Unknown') {
               notification.warning({
                   message: `Alert: ${riskData.risk_level}`,
                   description: `Transaction amount PKR ${generatedAmount.toLocaleString()} triggered an alert.`,
                   placement: 'topRight',
               });
               
               dispatch(addAlert({
                   id: `ALT-${Date.now()}-${i}`,
                   type: 'warning',
                   message: `${riskData.risk_level} - PKR ${generatedAmount.toLocaleString()}`,
                   timestamp: new Date().toISOString(),
                   customerId: simulationParams.customerId || '1',
                   riskLevel: 'High',
                   actionRequired: true
               }));
           }

           const transaction = {
              id: `TXN-${Date.now()}-${i}`,
              customerId: simulationParams.customerId || '1',
              amount: generatedAmount,
              type: ['Income', 'Expense', 'Transfer'][Math.floor(Math.random() * 3)] as 'Income' | 'Expense' | 'Transfer',
              date: randomDate.toISOString(),
              description: `Batch Simulated`,
              category: 'Simulated',
              risk_level: riskData?.risk_level || 'Unknown',
              risk_score: riskData?.risk_score || 0
           };
           
           dispatch(addTransaction(transaction));
        } catch(e) {
           console.error("Simulation error", e);
        }
      });
      
      await Promise.all(promises);
      dispatch(setIsSimulating(false));
      dispatch(setLoading(false));
    }).catch((err) => {
      console.error("Validation failed", err);
      dispatch(setIsSimulating(false));
      dispatch(setLoading(false));
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
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => new Date(d).toLocaleString() },
    {
      title: 'Risk Status',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (level: string) => {
        let color = 'default';
        if (level.includes('High')) color = 'error';
        else if (level.includes('Blocked')) color = 'warning';
        else if (level.includes('Medium')) color = 'gold';
        else if (level === 'Low') color = 'success';
        return <Tag color={color}>{level || 'N/A'}</Tag>;
      }
    }
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
                transactionCount: 20,
                timespanDays: 30
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
                  <Form.Item label="Timespan (Days)" name="timespanDays">
                    <InputNumber min={1} max={365} style={{ width: '100%' }} disabled={isSimulating} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Batch Count" name="transactionCount">
                    <InputNumber min={1} max={100} style={{ width: '100%' }} disabled={isSimulating} />
                  </Form.Item>
                </Col>
              </Row>

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
                <Row gutter={[16, 16]} justify="space-around">
                  <Col xs={24} sm={8} className="text-center sm:border-r border-slate-100">
                    <Statistic title="Total Transactions" value={transactions.length} prefix={<ThunderboltOutlined />} />
                  </Col>
                  <Col xs={24} sm={8} className="text-center sm:border-r border-slate-100">
                    <Statistic
                      title="Total Volume"
                      value={transactions.reduce((acc, t) => acc + t.amount, 0)}
                      prefix="PKR"
                      precision={0}
                      formatter={(val) => (val !== undefined && val !== null) ? val.toLocaleString() : '0'}
                    />
                  </Col>
                  <Col xs={24} sm={8} className="text-center">
                    <Statistic 
                      title="Avg Amount" 
                      value={transactions.length ? Math.round(transactions.reduce((acc, t) => acc + t.amount, 0) / transactions.length) : 0} 
                      prefix="PKR" 
                      formatter={(val) => (val !== undefined && val !== null) ? val.toLocaleString() : '0'}
                    />
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
                  scroll={{ x: 'max-content' }}
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
