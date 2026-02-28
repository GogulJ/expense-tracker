import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Notes from '../Notes';
import {
  FaWallet,
  FaChartPie,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
} from 'react-icons/fa';
import './FinanceLayout.css';

export default function FinanceLayout({ children }) {
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
    <div className="finance-layout">
      {/* Navbar */}
      <nav className="finance-navbar">
        <div className="container finance-navbar-inner">
          {/* Brand */}
          <Link to="/" className="finance-brand">
            <FaWallet />
            <span>Expensify</span>
          </Link>

          {currentUser && (
            <>
              {/* Mobile Toggle */}
              <button
                className="finance-menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>

              {/* Links */}
              <div className={`finance-nav-links ${isMenuOpen ? 'open' : ''}`}>
                <Link to="/" className="finance-nav-btn" onClick={() => setIsMenuOpen(false)}>
                  <FaChartPie /> Dashboard
                </Link>
                
                <Link to="/expenses" className="finance-nav-btn" onClick={() => setIsMenuOpen(false)}>
                  💳 Expenses
                </Link>

                <button onClick={toggleTheme} className="finance-nav-btn" title="Toggle Theme">
                  {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>

                <button onClick={handleLogout} className="finance-nav-btn logout">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="finance-main">
        {children}
      </main>

      {/* Footer */}
      <footer className="finance-footer">
        © {new Date().getFullYear()} <strong>Expensify</strong> — Track your money smartly 💸
      </footer>

      {/* Notes Section */}
      <Notes type="finance" />
    </div>
  );
}
