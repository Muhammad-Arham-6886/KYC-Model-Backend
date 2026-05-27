import apiClient from './apiClient';
import type { Transaction } from '../store/slices/transactionSlice';

export const transactionService = {
  // Get transactions
  async fetchTransactions(params?: {
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    try {
      const response = await apiClient.get('/transactions/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Create transaction
  async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    try {
      const response = await apiClient.post('/transactions/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  // Start simulation
  async startSimulation(params: {
    customerId: string;
    amount: number;
    frequency: number;
    transactionType: string;
  }): Promise<{ simulationId: string }> {
    try {
      const response = await apiClient.post('/simulate/', params);
      return response.data;
    } catch (error) {
      console.error('Error starting simulation:', error);
      throw error;
    }
  },

  // Stop simulation
  async stopSimulation(simulationId: string): Promise<void> {
    try {
      await apiClient.post(`/simulate/${simulationId}/stop/`);
    } catch (error) {
      console.error('Error stopping simulation:', error);
      throw error;
    }
  },

  // Get transaction trends
  async getTransactionTrends(customerId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/transactions/trends/${customerId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trends:', error);
      return [];
    }
  },
};
