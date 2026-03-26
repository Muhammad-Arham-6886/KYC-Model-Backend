import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from 'antd';

const data = [
  { name: 'Mon', riskScore: 20, drift: 5 },
  { name: 'Tue', riskScore: 25, drift: 8 },
  { name: 'Wed', riskScore: 22, drift: 6 },
  { name: 'Thu', riskScore: 40, drift: 15 },
  { name: 'Fri', riskScore: 35, drift: 12 },
  { name: 'Sat', riskScore: 55, drift: 25 },
  { name: 'Sun', riskScore: 50, drift: 20 },
];

export const BehaviorDriftChart: React.FC = () => {
  return (
    <Card title="Behavior Drift Analysis" bordered={false} className="shadow-sm h-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Line type="monotone" dataKey="riskScore" stroke="#1e3a8a" strokeWidth={2} activeDot={{ r: 8 }} name="Risk Score" />
          <Line type="monotone" dataKey="drift" stroke="#dc2626" strokeWidth={2} name="Drift Metric" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BehaviorDriftChart;
