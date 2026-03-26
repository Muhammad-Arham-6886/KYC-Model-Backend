import React, { Suspense } from 'react';

const LazyRiskScoreChart = React.lazy(() => import('./RiskScoreChart.impl'));

export const RiskScoreChart: React.FC<{ riskScores: any[] }> = (props) => {
  return (
    <Suspense fallback={<div style={{height: 300}}>Loading chart…</div>}>
      <LazyRiskScoreChart {...props} />
    </Suspense>
  );
};

export default RiskScoreChart;
