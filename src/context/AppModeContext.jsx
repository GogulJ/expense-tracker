import React, { createContext, useContext, useState, useEffect } from 'react';

const AppModeContext = createContext();

export function useAppMode() {
  return useContext(AppModeContext);
}

export function AppModeProvider({ children }) {
  const [appMode, setAppMode] = useState(() => {
    return localStorage.getItem('appMode') || 'finance';
  });

  useEffect(() => {
    localStorage.setItem('appMode', appMode);
  }, [appMode]);

  const toggleAppMode = () => {
    setAppMode(prev => prev === 'finance' ? 'habits' : 'finance');
  };

  const value = {
    appMode,
    setAppMode,
    toggleAppMode,
    isFinanceMode: appMode === 'finance',
    isHabitsMode: appMode === 'habits'
  };

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
}
