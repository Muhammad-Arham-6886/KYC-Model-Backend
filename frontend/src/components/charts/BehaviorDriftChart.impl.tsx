import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BehaviorDriftChartImpl: React.FC = () => {
  const data = [
    { date: 'Jan 1', expectedSpending: 15000, actualSpending: 14500 },
    { date: 'Jan 8', expectedSpending: 15000, actualSpending: 16200 },
    { date: 'Jan 15', expectedSpending: 15000, actualSpending: 18900 },
    { date: 'Jan 22', expectedSpending: 15000, actualSpending: 22500 },
    { date: 'Jan 29', expectedSpending: 15000, actualSpending: 28000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value) => [`PKR ${(value as number).toLocaleString()}`, '']}
          labelStyle={{ color: '#1e293b', fontWeight: 600, marginBottom: '4px' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line
          type="monotone"
          dataKey="expectedSpending"
          stroke="#0d9488"
          name="Expected Spending"
          strokeWidth={3}
          dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="actualSpending"
          stroke="#ef4444"
          name="Actual Spending"
          strokeWidth={3}
          dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BehaviorDriftChartImpl;
