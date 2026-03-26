import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  customerId?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
  actionRequired?: boolean;
}

interface AlertState {
  alerts: Alert[];
  activeAlerts: number;
}

const initialState: AlertState = {
  alerts: [],
  activeAlerts: 0,
};

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload);
      if (action.payload.type === 'warning' || action.payload.type === 'error') {
        state.activeAlerts += 1;
      }
      if (state.alerts.length > 100) {
        state.alerts = state.alerts.slice(0, 100);
      }
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      const index = state.alerts.findIndex((a) => a.id === action.payload);
      if (index !== -1) {
        const alert = state.alerts[index];
        if (alert.type === 'warning' || alert.type === 'error') {
          state.activeAlerts = Math.max(0, state.activeAlerts - 1);
        }
        state.alerts.splice(index, 1);
      }
    },
    clearAlerts: (state) => {
      state.alerts = [];
      state.activeAlerts = 0;
    },
  },
});

export const { addAlert, removeAlert, clearAlerts } = alertSlice.actions;
export default alertSlice.reducer;
