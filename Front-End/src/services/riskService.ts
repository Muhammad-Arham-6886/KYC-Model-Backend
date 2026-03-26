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
