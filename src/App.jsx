import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TransactionProvider } from './context/TransactionContext';
import { HabitProvider } from './context/HabitContext';
import { EventProvider } from './context/EventContext';
import { AppModeProvider } from './context/AppModeContext';

// Layouts
import FinanceLayout from './components/layout/FinanceLayout';
import HabitLayout from './components/layout/HabitLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import HabitsPage from './pages/HabitsPage';
import HabitAnalyticsPage from './pages/HabitAnalyticsPage';
import HabitCalendarPage from './pages/HabitCalendarPage';

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
        <AppModeProvider>
          <TransactionProvider>
            <EventProvider>
              <HabitProvider>
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

                {/* ========== FINANCE APP ROUTES ========== */}
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

                <Route
                  path="/income"
                  element={
                    <PrivateRoute>
                      <FinanceLayout>
                        <IncomePage />
                      </FinanceLayout>
                    </PrivateRoute>
                  }
                />

                {/* ========== HABITS APP ROUTES ========== */}
                <Route
                  path="/habits"
                  element={
                    <PrivateRoute>
                      <HabitLayout>
                        <HabitsPage />
                      </HabitLayout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/habits/analytics"
                  element={
                    <PrivateRoute>
                      <HabitLayout>
                        <HabitAnalyticsPage />
                      </HabitLayout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/habits/calendar"
                  element={
                    <PrivateRoute>
                      <HabitLayout>
                        <HabitCalendarPage />
                      </HabitLayout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </HabitProvider>
          </EventProvider>
        </TransactionProvider>
        </AppModeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
