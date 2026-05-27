import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Provider } from 'react-redux';
import { store } from './store';
const LoginPage = lazy(() => import('./pages/login/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const KYCPage = lazy(() => import('./pages/kyc/KYCPage').then(m => ({ default: m.KYCPage })));
const SimulatorPage = lazy(() => import('./pages/simulator/SimulatorPage').then(m => ({ default: m.SimulatorPage })));
const DatabaseHistoryPage = lazy(() => import('./pages/history/DatabaseHistoryPage').then(m => ({ default: m.DatabaseHistoryPage })));
const LiveMonitoringPage = lazy(() => import('./pages/monitoring/LiveMonitoringPage').then(m => ({ default: m.LiveMonitoringPage })));
import { ProtectedRoute } from './utils/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
        <BrowserRouter>
          <Suspense fallback={<div style={{padding:20}}>Loading...</div>}>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc"
              element={
                <ProtectedRoute>
                  <KYCPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/simulator"
              element={
                <ProtectedRoute>
                  <SimulatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <DatabaseHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/monitoring"
              element={
                <ProtectedRoute>
                  <LiveMonitoringPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
    </Provider>
  );
};

export default App;
