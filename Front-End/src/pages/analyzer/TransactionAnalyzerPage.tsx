import React, { useState } from 'react';
import { Card, Form, InputNumber, Select, Button, Row, Col, Typography, Alert, Divider } from 'antd';
import { SecurityScanOutlined, WarningOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { riskService } from '../../services/riskService';

const { Title, Text } = Typography;
const { Option } = Select;

export const TransactionAnalyzerPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ risk_score: number; risk_level: string } | null>(null);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await riskService.evaluateTransactionRisk(values);
      setResult(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result?.risk_score !== undefined
    ? (result.risk_score < 0.4 ? '#10b981' : result.risk_score < 0.6 ? '#f59e0b' : '#ef4444') 
    : '#94a3b8';

  return (
    <MainLayout>
      <div className="mb-8 mt-4 ml-2">
        <Title level={3} className="m-0 text-slate-800 flex items-center gap-2">
          <SecurityScanOutlined className="text-indigo-600" /> Transaction Risk Analyzer
        </Title>
        <Text className="text-slate-500">Live AI integration: Evaluate single transactions against the random forest model in real-time.</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Transaction Form" bordered={false} className="shadow-sm rounded-xl border border-slate-100">
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{
              Transaction_Amount: 5000,
              Account_Balance: 15000,
              Transaction_Type: 'POS',
              Card_Type: 'Visa',
              Device_Type: 'Mobile'
            }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Transaction Amount (PKR)" name="Transaction_Amount" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Account Balance (PKR)" name="Account_Balance" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} size="large" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Transaction Type" name="Transaction_Type">
                    <Select size="large">
                      <Option value="POS">POS</Option>
                      <Option value="E_Commerce">E-Commerce</Option>
                      <Option value="ATM">ATM</Option>
                      <Option value="Bank_Transfer">Bank Transfer</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Card Type" name="Card_Type">
                    <Select size="large">
                      <Option value="Visa">Visa</Option>
                      <Option value="Mastercard">Mastercard</Option>
                      <Option value="Amex">Amex</Option>
                      <Option value="Discover">Discover</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Device Type" name="Device_Type">
                    <Select size="large">
                      <Option value="Mobile">Mobile</Option>
                      <Option value="Desktop">Desktop</Option>
                      <Option value="Tablet">Tablet</Option>
                      <Option value="Unknown">Unknown</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Is Weekend? (0 or 1)" name="Is_Weekend">
                    <Select size="large">
                      <Option value={0}>No (Weekday)</Option>
                      <Option value={1}>Yes (Weekend)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider dashed />
              <Alert message="Missing fields will be automatically imputed by the backend's dataset averages and categorical modes." type="info" showIcon className="mb-4" />
              
              <Button type="primary" htmlType="submit" size="large" loading={loading} block style={{ background: '#4f46e5', height: '48px', fontSize: '16px' }}>
                Analyze Real-Time Risk
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <div className="flex flex-col gap-6 h-full">
            <Card title="Risk Score Card" bordered={false} className="shadow-sm rounded-xl border border-slate-100 flex-1">
              {result ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center transition-all duration-500">
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-md transition-all duration-700"
                    style={{ background: `linear-gradient(135deg, ${scoreColor}15, ${scoreColor}30)`, border: `6px solid ${scoreColor}` }}
                  >
                    <span className="text-4xl font-black" style={{ color: scoreColor }}>
                      {(result.risk_score * 100).toFixed(1)}<span className="text-2xl">%</span>
                    </span>
                  </div>
                  <Title level={3} style={{ color: scoreColor, margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {result.risk_level} RISK
                  </Title>
                  <Text type="secondary" className="mt-2 text-sm font-medium">
                    AI Probability Output calculated via Random Forest
                  </Text>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <SecurityScanOutlined className="text-6xl text-slate-200 mb-4" />
                  <Text className="text-slate-400 font-medium">Awaiting Transaction Input...</Text>
                </div>
              )}
            </Card>

            <Card title="Alerts Panel" bordered={false} className="shadow-sm rounded-xl border border-slate-100">
              {!result ? (
                <Text type="secondary" className="italic text-center block w-full py-6"><InfoCircleOutlined /> No active alerts triggered</Text>
              ) : result.risk_level === 'High' ? (
                <Alert 
                  message={<span className="font-bold text-red-700 text-base">Critical Fraud Alert</span>}
                  description={<span className="text-red-600 block mt-1">The AI model flagged this transaction pattern as HIGH RISK with a probability of {(result.risk_score * 100).toFixed(1)}%. Immediate block recommended.</span>}
                  type="error" 
                  showIcon 
                  icon={<WarningOutlined className="text-2xl mt-1" />}
                  className="shadow-sm border-red-300 py-4 bg-red-50"
                  style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                />
              ) : (
                <Alert 
                  message={<span className="font-bold text-emerald-700 text-base">Transaction Cleared</span>}
                  description={<span className="text-emerald-600 block mt-1">This transaction pattern appears completely normal. Characteristics match typical legitimate user behaviors.</span>}
                  type="success" 
                  showIcon 
                  icon={<CheckCircleOutlined className="text-2xl mt-1" />}
                  className="shadow-sm border-emerald-200 py-4 bg-emerald-50"
                />
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </MainLayout>
  );
};
