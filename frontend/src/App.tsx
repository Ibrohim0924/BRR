import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ProductsPage from './pages/Products';
import CustomersPage from './pages/Customers';
import SalesPage from './pages/Sales';
import WarehousePage from './pages/Warehouse';
import ExpensesPage from './pages/Expenses';
import ReportsPage from './pages/Reports';
import UsersPage from './pages/Users';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="warehouse" element={<WarehousePage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            {(user.role === 'admin' || user.role === 'accountant') && (
              <Route path="users" element={<UsersPage />} />
            )}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </Box>
  );
}

export default App;