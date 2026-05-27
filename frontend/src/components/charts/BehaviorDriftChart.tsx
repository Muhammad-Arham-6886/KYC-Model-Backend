import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';
import { Card } from 'antd';

interface BehaviorDriftChartProps {
  history?: any[];
}

export const BehaviorDriftChart: React.FC<BehaviorDriftChartProps> = ({ history = [] }) => {
  // Process the history into a time-series
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    // Sort by created_at ascending to form a timeline
    const sorted = [...history].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // To make it look continuously expanding and allow zooming,
    // we take up to the last 200 transactions.
    const recent = sorted.slice(-200);
    
    // Calculate a rolling average for the 'drift' metric
    const processed = recent.map((item, index, arr) => {
      const riskScore = Math.round((item.risk_score || 0) * 100);
      
      // Drift is calculated as a moving average of the last 5 transactions
      const window = arr.slice(Math.max(0, index - 4), index + 1);
      const avgScore = window.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / window.length;
      const drift = Math.round(avgScore * 100);

      return {
        time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        riskScore,
        drift,
        originalTime: item.created_at
      };
    });
    
    return processed;
  }, [history]);

  if (!chartData || chartData.length === 0) {
    return (
      <Card title="Behavior Drift Analysis" bordered={false} className="shadow-sm h-full">
         <div style={{ textAlign: 'center', padding: '40px' }}>No timeline data available</div>
      </Card>
    );
  }

  return (
    <Card title="Live Behavior Drift Analysis" bordered={false} className="shadow-sm h-full">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} syncId="dashboardTimeline" margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            tick={{ fontSize: 10 }}
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis stroke="#94a3b8" domain={[0, 100]} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line 
            type="monotone" 
            dataKey="riskScore" 
            stroke="#1e3a8a" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6 }} 
            name="Transaction Risk" 
            isAnimationActive={true}
            animationDuration={500}
          />
          <Line 
            type="monotone" 
            dataKey="drift" 
            stroke="#dc2626" 
            strokeWidth={2} 
            dot={false} 
            name="Moving Average (Drift)" 
            isAnimationActive={true}
            animationDuration={500}
          />
          <Brush dataKey="time" height={30} stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BehaviorDriftChart;
