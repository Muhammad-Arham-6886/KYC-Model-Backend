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
  Brush,
} from 'recharts';
import type { Transaction } from '../../store/slices/transactionSlice';

interface TransactionChartProps {
  transactions: Transaction[];
}

const TransactionChartImpl: React.FC<TransactionChartProps> = ({ transactions }) => {
  const chartData = [...transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-200)
    .map((txn) => ({
      date: new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      amount: txn.amount,
      type: txn.type,
    }));

  if (chartData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>No data to display</div>;
  }

  const maxAmount = Math.max(...chartData.map(d => d.amount));
  const yAxisMax = maxAmount > 0 ? Math.ceil(maxAmount * 1.1) : 1000;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8" 
          tick={{ fontSize: 10 }}
          tickMargin={10}
          minTickGap={30}
        />
        <YAxis stroke="#94a3b8" tickFormatter={(value) => `PKR ${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`} domain={[0, yAxisMax]} />
        <Tooltip
          formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Transaction Amount']}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend verticalAlign="top" height={36} />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#3b82f6" 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 6 }} 
          name="Transaction Amount" 
          isAnimationActive={true}
          animationDuration={500}
        />
        <Brush dataKey="date" height={30} stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TransactionChartImpl;
