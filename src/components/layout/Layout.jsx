import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} <strong>Expensify</strong> — Track your money smartly 💸
      </footer>
    </div>
  );
}

