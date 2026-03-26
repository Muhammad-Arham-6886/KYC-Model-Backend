import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  customerId: string;
  amount: number;
  type: 'Income' | 'Expense' | 'Transfer';
  date: string;
  description: string;
  category: string;
}

interface TransactionState {
  transactions: Transaction[];
  isSimulating: boolean;
  simulationParams: {
    amount: number;
    frequency: number;
    transactionType: 'Income' | 'Expense' | 'Transfer';
    customerId?: string;
  };
  loading: boolean;
}

const initialState: TransactionState = {
  transactions: [],
  isSimulating: false,
  simulationParams: {
    amount: 5000,
    frequency: 5,
    transactionType: 'Income',
    customerId: '1',
  },
  loading: false,
};

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    setIsSimulating: (state, action: PayloadAction<boolean>) => {
      state.isSimulating = action.payload;
    },
    setSimulationParams: (
      state,
      action: PayloadAction<{
        amount?: number;
        frequency?: number;
        transactionType?: 'Income' | 'Expense' | 'Transfer';
        customerId?: string;
      }>
    ) => {
      if (action.payload.amount !== undefined) {
        state.simulationParams.amount = action.payload.amount;
      }
      if (action.payload.frequency !== undefined) {
        state.simulationParams.frequency = action.payload.frequency;
      }
      if (action.payload.transactionType !== undefined) {
        state.simulationParams.transactionType = action.payload.transactionType;
      }
      if (action.payload.customerId !== undefined) {
        state.simulationParams.customerId = action.payload.customerId;
      }
    },
    clearTransactions: (state) => {
      state.transactions = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setTransactions,
  addTransaction,
  setIsSimulating,
  setSimulationParams,
  clearTransactions,
  setLoading,
} = transactionSlice.actions;
export default transactionSlice.reducer;
