import React, { useEffect, useState } from 'react';
import { Descriptions, Tag, List, Button, Alert, Card, Spin } from 'antd';
import { FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../hooks/reduxHooks';

export const KYCProfileDetail: React.FC = () => {
  const selectedProfile = useAppSelector((state) => state.kyc.selectedProfile);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedProfile) {
      fetchSuggestions();
    }
  }, [selectedProfile]);

  const fetchSuggestions = async () => {
    if (!selectedProfile) return;
    try {
      setLoading(true);
      // Mock suggestions
      setTimeout(() => {
        setSuggestions([
          'Update income information - Current employment shows higher income',
          'Consider updating occupation profile',
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
    }
  };

  if (!selectedProfile) return <div>No profile selected</div>;

  return (
    <Spin spinning={loading}>
      <Descriptions bordered column={1} size="small" className="mb-6">
        <Descriptions.Item label="Full Name">{selectedProfile.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{selectedProfile.email}</Descriptions.Item>
        <Descriptions.Item label="CNIC">{selectedProfile.cnic}</Descriptions.Item>
        <Descriptions.Item label="Occupation">{selectedProfile.occupation}</Descriptions.Item>
        <Descriptions.Item label="Expected Income">{`PKR ${selectedProfile.expectedIncome.toLocaleString()}`}</Descriptions.Item>
        <Descriptions.Item label="Risk Level">
          <Tag color={selectedProfile.riskLevel === 'Low' ? 'green' : selectedProfile.riskLevel === 'Medium' ? 'orange' : 'red'}>
            {selectedProfile.riskLevel}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created At">{selectedProfile.createdAt}</Descriptions.Item>
        <Descriptions.Item label="Last Updated">{selectedProfile.lastUpdated}</Descriptions.Item>
      </Descriptions>

      <Card type="inner" title="AI Update Suggestions" className="mb-6" size="small">
        {suggestions.length > 0 ? (
          <>
            {suggestions.map((s, i) => (
              <Alert key={i} message={s} type="warning" showIcon className="mb-2" />
            ))}
            <Button type="primary" icon={<CheckCircleOutlined />} size="small" className="mt-2">Accept All Suggestions</Button>
          </>
        ) : (
          <Alert message="No suggestions available" type="success" showIcon />
        )}
      </Card>

      <Card type="inner" title="Submitted Documents" size="small">
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={selectedProfile.documents || []}
          renderItem={(item: any) => (
            <List.Item>
              <Card size="small" className="text-center bg-slate-50">
                <FileTextOutlined style={{ fontSize: 24, color: '#1e3a8a' }} />
                <div className="mt-2 text-xs font-semibold">{item}</div>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </Spin>
  );
};
