import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import kycReducer from './slices/kycSlice';
import transactionReducer from './slices/transactionSlice';
import alertReducer from './slices/alertSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kyc: kycReducer,
    transaction: transactionReducer,
    alert: alertReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
