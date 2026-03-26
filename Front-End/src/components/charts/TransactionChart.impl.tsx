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
import type { Transaction } from '../../store/slices/transactionSlice';

interface TransactionChartProps {
  transactions: Transaction[];
}

const TransactionChartImpl: React.FC<TransactionChartProps> = ({ transactions }) => {
  const chartData = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-20)
    .map((txn) => ({
      date: new Date(txn.date).toLocaleTimeString(),
      amount: txn.amount,
      type: txn.type,
    }));

  if (chartData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>No data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value) => `PKR ${(value as number).toLocaleString()}`}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#1e3a8a" dot={false} name="Transaction Amount" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TransactionChartImpl;
