import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaWallet,
  FaChartPie,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
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
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
      }}
    >
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
              <Link to="/" className="nav-btn">
                <FaChartPie /> Dashboard
              </Link>

              <Link to="/expenses" className="nav-btn">
                💳 Expenses
              </Link>

              <button onClick={handleLogout} className="nav-btn logout">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Styles */}
      <style>{`
        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-primary);
          text-decoration: none;
          letter-spacing: 0.5px;
        }

        .nav-links {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1rem;
          border-radius: 10px;
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: #333;
          transition: all 0.25s ease;
        }

        .nav-btn:hover {
          background: rgba(0, 123, 255, 0.08);
          color: var(--color-primary);
          transform: translateY(-1px);
        }

        .logout:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.4rem;
          cursor: pointer;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }

          .nav-links {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            padding: 1rem;
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
            transform: translateY(-10px);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
          }

          .nav-links.open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }

          .nav-btn {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </nav>
  );
}
