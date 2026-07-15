import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface KYCProfile {
  id: string;
  name: string;
  email: string;
  occupation: string;
  expectedIncome: number;
  cnic: string;
  createdAt: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
  documents: string[];
  handledSuggestions?: string[];
}

interface KYCState {
  profiles: KYCProfile[];
  selectedProfile: KYCProfile | null;
  loading: boolean;
  filter: {
    riskLevel: 'All' | 'Low' | 'Medium' | 'High';
    searchTerm: string;
  };
}

const loadProfiles = (): KYCProfile[] => {
  try {
    const saved = localStorage.getItem('kyc_profiles');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load KYC profiles from local storage', e);
  }
  return [];
};

const saveProfiles = (profiles: KYCProfile[]) => {
  try {
    localStorage.setItem('kyc_profiles', JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save KYC profiles to local storage', e);
  }
};

const initialState: KYCState = {
  profiles: loadProfiles(),
  selectedProfile: null,
  loading: false,
  filter: {
    riskLevel: 'All',
    searchTerm: '',
  },
};

export const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    setProfiles: (state, action: PayloadAction<KYCProfile[]>) => {
      state.profiles = action.payload;
      saveProfiles(state.profiles);
    },
    addProfile: (state, action: PayloadAction<KYCProfile>) => {
      state.profiles.push(action.payload);
      saveProfiles(state.profiles);
    },
    updateProfile: (state, action: PayloadAction<KYCProfile>) => {
      const index = state.profiles.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.profiles[index] = action.payload;
        saveProfiles(state.profiles);
      }
    },
    deleteProfile: (state, action: PayloadAction<string>) => {
      state.profiles = state.profiles.filter((p) => p.id !== action.payload);
      saveProfiles(state.profiles);
    },
    setSelectedProfile: (state, action: PayloadAction<KYCProfile | null>) => {
      state.selectedProfile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFilter: (
      state,
      action: PayloadAction<{ riskLevel?: 'All' | 'Low' | 'Medium' | 'High'; searchTerm?: string }>
    ) => {
      if (action.payload.riskLevel !== undefined) {
        state.filter.riskLevel = action.payload.riskLevel;
      }
      if (action.payload.searchTerm !== undefined) {
        state.filter.searchTerm = action.payload.searchTerm;
      }
    },
  },
});

export const {
  setProfiles,
  addProfile,
  updateProfile,
  deleteProfile,
  setSelectedProfile,
  setLoading,
  setFilter,
} = kycSlice.actions;
export default kycSlice.reducer;
