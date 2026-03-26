import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Modal, Space, Tooltip, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  setProfiles,
  setSelectedProfile,
  deleteProfile,
  setFilter,
  setLoading,
} from '../../store/slices/kycSlice';
import { KYCForm } from '../../components/forms/KYCForm';
import { KYCProfileDetail } from '../../components/common/KYCProfileDetail';
import { MainLayout } from '../../components/layout/MainLayout';

const { Option } = Select;

export const KYCPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profiles, loading, filter } = useAppSelector((state) => state.kyc);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      dispatch(setLoading(true));
      // Mock data
      setTimeout(() => {
        const mockData = [
          {
            id: '1',
            name: 'Ahmed Ali',
            email: 'ahmed@example.com',
            occupation: 'Software Engineer',
            expectedIncome: 150000,
            cnic: '12345-6789012-3',
            createdAt: '2024-01-15',
            riskLevel: 'Low' as 'Low',
            lastUpdated: '2024-12-20',
            documents: ['CNIC', 'Salary Slip'],
          },
          {
            id: '2',
            name: 'Fatima Khan',
            email: 'fatima@example.com',
            occupation: 'Housewife',
            expectedIncome: 0,
            cnic: '98765-4321098-7',
            createdAt: '2024-02-01',
            riskLevel: 'Medium' as 'Medium',
            lastUpdated: '2024-12-15',
            documents: ['CNIC'],
          },
        ];
        dispatch(setProfiles(mockData));
        dispatch(setLoading(false));
      }, 500);
    } catch (error) {
      console.error('Failed to fetch KYC profiles', error);
      dispatch(setLoading(false));
    }
  };

  const handleAddProfile = () => {
    setEditingProfile(null);
    setIsFormModalVisible(true);
  };

  const handleEditProfile = (profile: any) => {
    setEditingProfile(profile);
    setIsFormModalVisible(true);
  };

  const handleViewProfile = (profile: any) => {
    dispatch(setSelectedProfile(profile));
    setIsDetailModalVisible(true);
  };

  const handleDeleteProfile = async (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this profile?',
      content: 'This action cannot be undone.',
      onOk: async () => {
        dispatch(deleteProfile(id));
      }
    });
  };

  const handleFormSubmit = async (data: any) => {
    // Mock submit
    console.log('Submitting data:', data);
    dispatch(setLoading(true));
    setTimeout(() => {
      // Here we would actually call the API
      alert(editingProfile ? 'Profile updated successfully' : 'Profile created successfully');
      dispatch(setLoading(false));
      setIsFormModalVisible(false);
      fetchProfiles();
    }, 500);
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (filter.riskLevel !== 'All' && profile.riskLevel !== filter.riskLevel) {
      return false;
    }
    if (
      filter.searchTerm &&
      !profile.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) &&
      !profile.email.toLowerCase().includes(filter.searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Occupation', dataIndex: 'occupation', key: 'occupation' },
    {
      title: 'Expected Income',
      dataIndex: 'expectedIncome',
      key: 'expectedIncome',
      render: (val: number) => `PKR ${val.toLocaleString()}`
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (risk: string) => {
        const color = risk === 'Low' ? 'green' : risk === 'Medium' ? 'orange' : 'red';
        return <Tag color={color}>{risk.toUpperCase()}</Tag>;
      }
    },
    { title: 'Last Updated', dataIndex: 'lastUpdated', key: 'lastUpdated' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewProfile(record)} />
          </Tooltip>
          <Tooltip title="Edit Profile">
            <Button icon={<EditOutlined />} type="primary" ghost size="small" onClick={() => handleEditProfile(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleDeleteProfile(record.id)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 m-0">KYC Profiles</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProfile}>
          Add New Customer
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="flex gap-4 mb-4 flex-wrap">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search by name or email"
            className="max-w-md"
            value={filter.searchTerm}
            onChange={(e) => dispatch(setFilter({ searchTerm: e.target.value }))}
          />
          <Select
            defaultValue="All"
            style={{ width: 150 }}
            value={filter.riskLevel}
            onChange={(val: any) => dispatch(setFilter({ riskLevel: val }))}
          >
            <Option value="All">All Risks</Option>
            <Option value="Low">Low Risk</Option>
            <Option value="Medium">Medium Risk</Option>
            <Option value="High">High Risk</Option>
          </Select>
          <div className="ml-auto">
            <Button icon={<DownloadOutlined />}>Export List</Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProfiles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingProfile ? 'Edit KYC Profile' : 'Add New Customer'}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width={700}
      >
        <KYCForm profile={editingProfile} onSubmit={handleFormSubmit} onCancel={() => setIsFormModalVisible(false)} />
      </Modal>

      <Modal
        title="KYC Profile Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>Close</Button>]}
        width={700}
      >
        <KYCProfileDetail />
      </Modal>
    </MainLayout>
  );
};
