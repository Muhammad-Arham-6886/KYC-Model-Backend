import apiClient from './apiClient';

export interface RiskScore {
  customerId: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  score: number;
  factors: string[];
  timestamp: string;
}

export interface RiskAlert {
  id: string;
  customerId: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

export const riskService = {
  // Get risk scores
  async getRiskScores(): Promise<RiskScore[]> {
    try {
      const response = await apiClient.get('/risk-scores/');
      return response.data;
    } catch (error) {
      console.error('Error fetching risk scores:', error);
      return [];
    }
  },

  // Evaluate single transaction (FastAPI Integration)
  async evaluateTransactionRisk(transactionData: any): Promise<{risk_score: number, risk_level: string} | null> {
    try {
      const response = await apiClient.post('/risk/score', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error evaluating transaction risk via API:', error);
      return null;
    }
  },

  // Get risk score for customer
  async getCustomerRiskScore(customerId: string): Promise<RiskScore | null> {
    try {
      const response = await apiClient.get(`/risk-scores/${customerId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer risk score:', error);
      return null;
    }
  },

  // Get alerts
  async getAlerts(): Promise<RiskAlert[]> {
    try {
      const response = await apiClient.get('/alerts/');
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  // Get behavior drift detection
  async getBehaviorDrift(customerId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/behavior-drift/${customerId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavior drift:', error);
      return null;
    }
  },

  // Get database history logs
  async getDatabaseHistory(): Promise<any[]> {
    try {
      const response = await apiClient.get('/risk/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching database history:', error);
      return [];
    }
  },

  // Delete all database history logs
  async deleteHistoryAll(): Promise<void> {
    try {
      await apiClient.delete('/risk/history/all');
    } catch (error) {
      console.error('Error deleting all history:', error);
    }
  },

  // Delete history by customer
  async deleteHistoryByCustomer(customerName: string): Promise<void> {
    try {
      await apiClient.delete(`/risk/history/customer/${encodeURIComponent(customerName)}`);
    } catch (error) {
      console.error(`Error deleting history for ${customerName}:`, error);
    }
  },

  // Delete specific transaction
  async deleteHistoryTransaction(createdAt: string): Promise<void> {
    try {
      await apiClient.delete(`/risk/history/transaction/${encodeURIComponent(createdAt)}`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  },

  // Mark transaction as reviewed
  async reviewTransaction(createdAt: string): Promise<void> {
    try {
      await apiClient.put(`/risk/history/review/${encodeURIComponent(createdAt)}`);
    } catch (error) {
      console.error('Error reviewing transaction:', error);
      throw error;
    }
  },

  // Send real SAR email to State Bank
  async sendSAREmail(emailData: any): Promise<void> {
    try {
      await apiClient.post('/email/sar', emailData);
    } catch (error) {
      console.error('Error sending SAR email:', error);
      throw error;
    }
  },

  // Get suspicious activity log
  async getSuspiciousActivities(): Promise<any[]> {
    try {
      const response = await apiClient.get('/suspicious-activities/');
      return response.data;
    } catch (error) {
      console.error('Error fetching suspicious activities:', error);
      return [];
    }
  },

  // Export report
  async exportReport(format: 'pdf' | 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.get(`/reports/export/?format=${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },
};
