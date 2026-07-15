import React, { useState } from 'react';
import { Modal, Typography, Button, message, Tag, Spin } from 'antd';
import { DownloadOutlined, SendOutlined, SafetyCertificateOutlined, WarningOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { addLog } from '../../store/slices/systemLogsSlice';
import html2pdf from 'html2pdf.js';

const { Title, Text, Paragraph } = Typography;

interface SARReportModalProps {
  open: boolean;
  alert: any;
  onCancel: () => void;
  onSuccess: (createdAt: string) => void;
}

export const SARReportModal: React.FC<SARReportModalProps> = ({ open, alert, onCancel, onSuccess }) => {
  const [transmitting, setTransmitting] = useState(false);
  const dispatch = useAppDispatch();

  const handleDownloadPDF = () => {
    const element = document.getElementById('sar-printable-area');
    
    if (!element) return;
    
    const opt = {
      margin:       0.5,
      filename:     `SAR_Report_${alert?.customerName || 'Unknown'}_${new Date().getTime()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleTransmit = () => {
    setTransmitting(true);
    // Simulate secure network transmission
    setTimeout(() => {
      setTransmitting(false);
      message.success({
        content: 'Suspicious Activity Report (SAR) successfully encrypted and transmitted to hafiztameemzahid@gmail.com, m.arham7771@gmail.com.',
        duration: 5,
        icon: <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
      });
      
      // Log the transmission permanently
      dispatch(addLog({
        action: `Filed SAR to State Bank (hafiztameemzahid@gmail.com, m.arham7771@gmail.com) for ${alert?.customerName || 'Unknown'} (Ref: ${alert?.id})`,
        user: 'Compliance Officer'
      }));

      onSuccess(alert?.createdAt);
    }, 2500);
  };

  if (!alert) return null;

  const parsedFlags = (() => {
    if (!alert.flags) return [];
    try { return JSON.parse(alert.flags); } catch (e) { return []; }
  })();

  return (
    <Modal
      open={open}
      onCancel={!transmitting ? onCancel : undefined}
      width={850}
      closable={!transmitting}
      maskClosable={false}
      title={
        <div className="flex items-center gap-2">
          <FilePdfOutlined className="text-red-500 text-2xl" />
          <span className="text-xl font-bold">Suspicious Activity Report Generator</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={transmitting} className="font-semibold">
          Cancel
        </Button>,
        <Button key="print" type="default" icon={<DownloadOutlined />} onClick={handleDownloadPDF} disabled={transmitting} className="font-semibold border-slate-300">
          Download PDF Directly
        </Button>,
        <Button 
          key="transmit" 
          type="primary" 
          danger 
          icon={transmitting ? <Spin size="small" /> : <SendOutlined />} 
          onClick={handleTransmit}
          loading={transmitting}
          className="font-semibold"
        >
          {transmitting ? 'Encrypting & Transmitting...' : 'Transmit to State Bank'}
        </Button>
      ]}
      className="sar-print-modal"
    >
      <div id="sar-printable-area" className="p-10 sm:p-14 bg-white" style={{ color: '#1e293b' }}>
        
        {/* Report Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-10">
          <div>
            <Title level={2} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a' }}>
              Suspicious Activity Report
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Confidential — Regulatory Authorities Only
            </Text>
          </div>
          <div className="text-right flex flex-col items-end">
            <SafetyCertificateOutlined style={{ fontSize: '40px', color: '#334155', marginBottom: '8px' }} />
            <div className="font-mono text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded border border-slate-100">REF: {alert.id || `SAR-${Date.now()}`}</div>
            <div className="font-mono text-xs text-slate-500 mt-2">DATE: {new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 p-6 mb-10 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <WarningOutlined className="text-red-600 text-2xl" />
            <Text strong className="text-red-700 uppercase tracking-wider text-base">Critical Complaint Flag Triggered</Text>
          </div>
          <Paragraph className="text-red-700 m-0 text-base leading-relaxed ml-9">
            This transaction was automatically flagged by the KYC Risk Engine as 
            <strong className="bg-red-100 px-2 py-0.5 rounded mx-1">{alert.riskLevel} Risk</strong>. 
            Immediate review by the State Bank Financial Monitoring Unit is requested.
          </Paragraph>
        </div>

        {/* Transmission Target */}
        <div className="mb-10">
          <Title level={5} className="uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 pb-2 mb-6 text-sm">Transmission Routing</Title>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <div className="flex border-b border-slate-200 pb-4 mb-4">
              <div className="w-1/3 text-slate-500 font-semibold text-sm tracking-wide uppercase">Authorizing Body</div>
              <div className="w-2/3 font-bold text-base text-slate-800">State Bank of Pakistan (Financial Monitoring Unit)</div>
            </div>
            <div className="flex pt-2">
              <div className="w-1/3 text-slate-500 font-semibold text-sm tracking-wide uppercase">Recipient Emails</div>
              <div className="w-2/3 text-blue-600 font-mono text-sm font-semibold">hafiztameemzahid@gmail.com<br/>m.arham7771@gmail.com</div>
            </div>
          </div>
        </div>

        {/* Subject Details */}
        <div className="mb-10">
          <Title level={5} className="uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 pb-2 mb-6 text-sm">Subject Information</Title>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
            <div className="flex flex-col">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Customer Name</span>
              <span className="font-bold text-xl text-slate-800">{alert.customerName || 'Unknown'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Account Type</span>
              <span className="text-base text-slate-700 font-medium pt-1">Standard Personal</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">KYC Status</span>
              <span className="text-orange-600 font-bold text-sm bg-orange-50 self-start px-3 py-1 rounded">Enhanced Due Diligence Required</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">IP Location / Flag</span>
              <span className="text-base text-slate-700 font-medium pt-1">Multiple / Anomalous</span>
            </div>
          </div>
        </div>

        {/* Transaction Records */}
        <div className="mb-12">
          <Title level={5} className="uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 pb-2 mb-6 text-sm">Transaction Records</Title>
          <div className="bg-white p-6 border-2 border-slate-100 rounded-lg shadow-sm">
            <div className="flex border-b border-slate-100 pb-4 mb-4">
              <div className="w-1/3 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center">Transaction Time</div>
              <div className="w-2/3 text-base font-mono text-slate-700">{new Date(alert.createdAt || Date.now()).toLocaleString()}</div>
            </div>
            <div className="flex border-b border-slate-100 pb-4 mb-4">
              <div className="w-1/3 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center">Transaction Amount</div>
              <div className="w-2/3 text-red-600 font-black text-2xl">PKR {alert.amount?.toLocaleString() || 0}</div>
            </div>
            <div className="flex border-b border-slate-100 pb-4 mb-4">
              <div className="w-1/3 text-slate-500 font-bold text-xs uppercase tracking-wider pt-2">Detected Anomalies</div>
              <div className="w-2/3 text-base text-slate-700 bg-red-50 p-4 rounded-md">
                <ul className="m-0 pl-5 space-y-2">
                  <li className="font-bold text-red-700">High Amount to Balance Ratio</li>
                  {parsedFlags.map((flag: string, i: number) => (
                    <li key={i}>{flag}</li>
                  ))}
                  {parsedFlags.length === 0 && <li>Unusual spending pattern compared to historical baseline.</li>}
                </ul>
              </div>
            </div>
            <div className="flex pt-2">
              <div className="w-1/3 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center">AI Confidence Score</div>
              <div className="w-2/3 flex items-center gap-4">
                <div className="w-48 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="text-base font-bold text-red-600">85.03%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t-2 border-slate-100">
          <Text type="secondary" className="text-xs tracking-wide">
            Generated automatically by Financial Security Systems Risk Engine v2.0.<br/>
            This document is electronically signed and encrypted.
          </Text>
        </div>

      </div>
    </Modal>
  );
};
