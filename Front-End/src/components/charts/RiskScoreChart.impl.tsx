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
  riskScores: RiskScore[];
}

const COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#dc2626',
};

const RiskScoreChartImpl: React.FC<RiskScoreChartProps> = ({ riskScores }) => {
  const data = [
    {
      name: 'Low Risk',
      value: riskScores.filter((r) => r.riskLevel === 'Low').length,
      color: COLORS.Low,
    },
    {
      name: 'Medium Risk',
      value: riskScores.filter((r) => r.riskLevel === 'Medium').length,
      color: COLORS.Medium,
    },
    {
      name: 'High Risk',
      value: riskScores.filter((r) => r.riskLevel === 'High').length,
      color: COLORS.High,
    },
  ];

  if (data.every((d) => d.value === 0)) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>No risk data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
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
