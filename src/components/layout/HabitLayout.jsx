import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AppSwitcher from '../AppSwitcher';
import Notes from '../Notes';
import {
  FaTasks,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaCalendarCheck,
  FaCalendarAlt,
  FaBullseye,
} from 'react-icons/fa';
import './HabitLayout.css';

export default function HabitLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <div className="habit-layout">
      {/* Navbar */}
      <nav className="habit-navbar">
        <div className="container habit-navbar-inner">
          {/* Brand */}
          <Link to="/habits" className="habit-brand">
            <FaTasks />
            <span>HabitFlow</span>
          </Link>

          {currentUser && (
            <>
              {/* Mobile Toggle */}
              <button
                className="habit-menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>

              {/* Links */}
              <div className={`habit-nav-links ${isMenuOpen ? 'open' : ''}`}>
                <Link to="/habits" className="habit-nav-btn" onClick={() => setIsMenuOpen(false)}>
                  <FaCalendarCheck /> Daily Habits
                </Link>
                
                <Link to="/habits/analytics" className="habit-nav-btn" onClick={() => setIsMenuOpen(false)}>
                  <FaChartLine /> Analytics
                </Link>

                <Link to="/habits/calendar" className="habit-nav-btn" onClick={() => setIsMenuOpen(false)}>
                  <FaCalendarAlt /> Calendar
                </Link>

                <button onClick={toggleTheme} className="habit-nav-btn" title="Toggle Theme">
                  {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>

                <button onClick={handleLogout} className="habit-nav-btn logout">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="habit-main">
        {children}
      </main>

      {/* Footer */}
      <footer className="habit-footer">
        © {new Date().getFullYear()} <strong>HabitFlow</strong> — Build better habits daily 🌱
      </footer>

      {/* Notes Section */}
      <Notes type="habits" />

      {/* App Switcher */}
      <AppSwitcher />
    </div>
  );
}
