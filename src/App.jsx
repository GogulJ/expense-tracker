import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
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
      <Router>
        <AuthProvider>
            <Routes>
              <Route path="/login" element={
                  <PublicRoute>
                      <LoginPage />
                  </PublicRoute>
              } />
              
              <Route path="/" element={
                <PrivateRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/expenses" element={
                <PrivateRoute>
                  <Layout>
                    <ExpensesPage />
                  </Layout>
                </PrivateRoute>
              } />
            </Routes>
        </AuthProvider>
      </Router>
  );
}

export default App;
