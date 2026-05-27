import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { RiskScore } from '../../services/riskService';

interface RiskScoreChartProps {
  data: any[];
}

const COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#dc2626',
};

const RiskScoreChartImpl: React.FC<RiskScoreChartProps> = ({ data: history }) => {
  const chartData = [
    {
      name: 'Low Risk',
      value: history.filter((r) => r.risk_level === 'Low').length,
      color: COLORS.Low,
    },
    {
      name: 'Medium Risk',
      value: history.filter((r) => r.risk_level && r.risk_level.includes('Medium')).length,
      color: COLORS.Medium,
    },
    {
      name: 'High Risk',
      value: history.filter((r) => r.risk_level && r.risk_level.includes('High')).length,
      color: COLORS.High,
    },
  ];

  if (chartData.every((d) => d.value === 0)) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>No risk data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default RiskScoreChartImpl;
