import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export interface SystemLog {
  id: string;
  action: string;
  user: string;
  time: string;
}

interface SystemLogsState {
  logs: SystemLog[];
}

const loadLogs = (): SystemLog[] => {
  try {
    const saved = localStorage.getItem('system_logs');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load system logs from local storage', e);
  }
  return [
    { id: generateId(), action: 'User Login', user: 'Admin', time: new Date(Date.now() - 5000).toISOString() },
    { id: generateId(), action: 'System Initialized', user: 'System', time: new Date(Date.now() - 6000).toISOString() },
  ];
};

const saveLogs = (logs: SystemLog[]) => {
  try {
    localStorage.setItem('system_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save system logs to local storage', e);
  }
};

const initialState: SystemLogsState = {
  logs: loadLogs(),
};

export const systemLogsSlice = createSlice({
  name: 'systemLogs',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<{ action: string; user?: string }>) => {
      state.logs.unshift({
        id: generateId(),
        action: action.payload.action,
        user: action.payload.user || 'Admin',
        time: new Date().toISOString(),
      });
      if (state.logs.length > 200) {
        state.logs = state.logs.slice(0, 200);
      }
      saveLogs(state.logs);
    },
    clearLogs: (state) => {
      state.logs = [];
      saveLogs(state.logs);
    },
  },
});

export const { addLog, clearLogs } = systemLogsSlice.actions;
export default systemLogsSlice.reducer;
