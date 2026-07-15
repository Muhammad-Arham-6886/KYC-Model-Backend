import React, { useEffect, useState } from 'react';
import { Descriptions, Tag, List, Button, Alert, Card, Spin, message } from 'antd';
import { FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { updateProfile, setSelectedProfile } from '../../store/slices/kycSlice';
import { riskService } from '../../services/riskService';

export const KYCProfileDetail: React.FC = () => {
  const selectedProfile = useAppSelector((state) => state.kyc.selectedProfile);
  const dispatch = useAppDispatch();
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
      
      // Fetch transaction history to make intelligent suggestions
      const history = await riskService.getDatabaseHistory();
      const customerTx = history.filter((h: any) => h.customer_name === selectedProfile.name);
      
      setTimeout(() => {
        const newSuggestions: string[] = [];
        
        // Transaction-based suggestions
        if (customerTx.length > 0) {
          const highRiskTx = customerTx.filter((t: any) => t.risk_level === 'High');
          if (highRiskTx.length > 0 && selectedProfile.riskLevel !== 'High') {
             newSuggestions.push(`WARNING: Customer has ${highRiskTx.length} recent High-Risk transactions. Profile is currently set to ${selectedProfile.riskLevel} Risk. Recommend upgrading profile to High Risk.`);
          }
        }

        // Profile-based suggestions
        if (selectedProfile.riskLevel === 'High') {
          newSuggestions.push('Enhanced Due Diligence (EDD) required immediately.');
          newSuggestions.push('Request updated source of funds declaration.');
        } else if (selectedProfile.riskLevel === 'Medium') {
          newSuggestions.push('Schedule standard profile review within 30 days.');
        }
        
        if (selectedProfile.occupation === 'Student' && selectedProfile.expectedIncome > 50000) {
          newSuggestions.push('Income appears unusually high for a student. Verify supplementary income sources.');
        } else if (selectedProfile.occupation === 'Housewife' && selectedProfile.expectedIncome > 50000) {
          newSuggestions.push('Verify primary source of household income or remittances.');
        }
        
        if (selectedProfile.occupation === 'Other' || selectedProfile.occupation === '') {
          newSuggestions.push('Specify precise occupation category to improve risk assessment accuracy.');
        }

        if (selectedProfile.expectedIncome > 200000) {
           newSuggestions.push('High-net-worth individual. Monitor for large bulk transfers.');
        }

        // If no specific risk factors, maybe just a standard reminder
        if (newSuggestions.length === 0) {
           const daysSinceUpdate = Math.floor((Date.now() - new Date(selectedProfile.lastUpdated).getTime()) / (1000 * 3600 * 24));
           if (daysSinceUpdate > 90) {
               newSuggestions.push('Profile has not been updated recently. Request periodic confirmation of details.');
           }
        }

        // Filter out suggestions that were already accepted/handled by the user
        const filteredSuggestions = newSuggestions.filter(s => !selectedProfile.handledSuggestions?.includes(s));

        setSuggestions(filteredSuggestions);
        setLoading(false);
      }, 300);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleAcceptSuggestions = () => {
    if (!selectedProfile) return;
    
    let updatedProfile = { ...selectedProfile };
    
    const shouldUpgradeToHigh = suggestions.some(s => s.includes('upgrading profile to High Risk'));
    if (shouldUpgradeToHigh) {
      updatedProfile.riskLevel = 'High';
    }
    
    // Save these suggestions so they don't reappear
    updatedProfile.handledSuggestions = [
      ...(updatedProfile.handledSuggestions || []),
      ...suggestions
    ];
    
    updatedProfile.lastUpdated = new Date().toISOString().split('T')[0];
    
    dispatch(updateProfile(updatedProfile));
    dispatch(setSelectedProfile(updatedProfile));

    message.success('Suggestions accepted and profile updated.');
    setSuggestions([]); // Clear suggestions to simulate them being "handled"
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
            <Button type="primary" icon={<CheckCircleOutlined />} size="small" className="mt-2" onClick={handleAcceptSuggestions}>Accept All Suggestions</Button>
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
