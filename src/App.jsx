import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TransactionProvider } from './context/TransactionContext';

// Layouts
import FinanceLayout from './components/layout/FinanceLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';

import './index.css';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
          <TransactionProvider>
            <Routes>
              {/* Public Route */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />

              {/* Dashboard */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <FinanceLayout>
                      <DashboardPage />
                    </FinanceLayout>
                  </PrivateRoute>
                }
              />

              {/* Expenses */}
              <Route
                path="/expenses"
                element={
                  <PrivateRoute>
                    <FinanceLayout>
                      <ExpensesPage />
                    </FinanceLayout>
                  </PrivateRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </TransactionProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
