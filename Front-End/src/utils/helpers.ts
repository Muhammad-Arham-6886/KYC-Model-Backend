// Generate unique ID for alerts and transactions
export const generateId = (prefix: string = 'ID'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'PKR'): string => {
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get risk color
export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'Low':
      return '#10b981';
    case 'Medium':
      return '#f59e0b';
    case 'High':
      return '#dc2626';
    default:
      return '#6b7280';
  }
};
