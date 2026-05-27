import React, { Suspense } from 'react';

const LazyTransactionChart = React.lazy(() => import('./TransactionChart.impl'));

export const TransactionChart: React.FC<{ transactions: any[] }> = (props) => {
  return (
    <Suspense fallback={<div style={{height: 300}}>Loading chart…</div>}>
      <LazyTransactionChart {...props} />
    </Suspense>
  );
};

export default TransactionChart;
