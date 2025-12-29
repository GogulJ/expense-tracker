import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppMode } from '../context/AppModeContext';
import { FaWallet, FaTasks } from 'react-icons/fa';
import './AppSwitcher.css';

export default function AppSwitcher() {
  const { appMode, setAppMode } = useAppMode();
  const navigate = useNavigate();

  const handleSwitch = (mode) => {
    setAppMode(mode);
    // Navigate to the default page for each mode
    if (mode === 'finance') {
      navigate('/');
    } else {
      navigate('/habits');
    }
  };

  return (
    <div className="app-switcher">
      <button
        className={`app-switcher-btn finance ${appMode === 'finance' ? 'active' : ''}`}
        onClick={() => handleSwitch('finance')}
        title="Finance Tracker"
      >
        <FaWallet />
        <span>Finance</span>
      </button>

      <button
        className={`app-switcher-btn habits ${appMode === 'habits' ? 'active' : ''}`}
        onClick={() => handleSwitch('habits')}
        title="Habit Tracker"
      >
        <FaTasks />
        <span>Habits</span>
      </button>
    </div>
  );
}
