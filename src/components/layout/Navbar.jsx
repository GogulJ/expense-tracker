import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FaWallet,
  FaChartPie,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaArrowUp,
  FaMoon,
  FaSun,
  FaTasks,
} from 'react-icons/fa';
import './Navbar.css';

export default function Navbar() {
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
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand">
          <FaWallet />
          <span>Expensify</span>
        </Link>

        {currentUser && (
          <>
            {/* Mobile Toggle */}
            <button
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Links */}
            <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
              <Link to="/" className="nav-btn" onClick={() => setIsMenuOpen(false)}>
                <FaChartPie /> Dashboard
              </Link>
              
              <Link to="/expenses" className="nav-btn" onClick={() => setIsMenuOpen(false)}>
                💳 Expenses
              </Link>

              <Link to="/income" className="nav-btn" onClick={() => setIsMenuOpen(false)}>
                <FaArrowUp /> Income
              </Link>

              <Link to="/habits" className="nav-btn" onClick={() => setIsMenuOpen(false)}>
                <FaTasks /> Habits
              </Link>

              <button onClick={toggleTheme} className="nav-btn theme-toggle-btn" title="Toggle Theme">
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
              </button>

              <button onClick={handleLogout} className="nav-btn logout">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

