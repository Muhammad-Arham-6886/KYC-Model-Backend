import apiClient from './apiClient';
import type { KYCProfile } from '../store/slices/kycSlice';

export const kycService = {
  // Get all KYC profiles
  async fetchProfiles(): Promise<KYCProfile[]> {
    try {
      const response = await apiClient.get('/kyc-profiles/');
      return response.data;
    } catch (error) {
      console.error('Error fetching KYC profiles:', error);
      throw error;
    }
  },

  // Get single KYC profile
  async getProfile(id: string): Promise<KYCProfile> {
    try {
      const response = await apiClient.get(`/kyc-profiles/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching KYC profile:', error);
      throw error;
    }
  },

  // Create new KYC profile
  async createProfile(data: Partial<KYCProfile>): Promise<KYCProfile> {
    try {
      const response = await apiClient.post('/kyc-profiles/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating KYC profile:', error);
      throw error;
    }
  },

  // Update KYC profile
  async updateProfile(id: string, data: Partial<KYCProfile>): Promise<KYCProfile> {
    try {
      const response = await apiClient.put(`/kyc-profiles/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating KYC profile:', error);
      throw error;
    }
  },

  // Delete KYC profile
  async deleteProfile(id: string): Promise<void> {
    try {
      await apiClient.delete(`/kyc-profiles/${id}/`);
    } catch (error) {
      console.error('Error deleting KYC profile:', error);
      throw error;
    }
  },

  // Get KYC update suggestions
  async getUpdateSuggestions(id: string): Promise<string[]> {
    try {
      const response = await apiClient.get(`/kyc-profiles/${id}/suggestions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  },
};
