import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div
      className="layout"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: `
          radial-gradient(at 20% 20%, #c7d2fe 0px, transparent 50%),
          radial-gradient(at 80% 0%, #bae6fd 0px, transparent 50%),
          radial-gradient(at 0% 50%, #ddd6fe 0px, transparent 50%),
          radial-gradient(at 80% 50%, #bbf7d0 0px, transparent 50%),
          radial-gradient(at 0% 100%, #fef3c7 0px, transparent 50%),
          radial-gradient(at 80% 100%, #fecaca 0px, transparent 50%)
        `,
      }}
    >
      <Navbar />

      <main
        className="container"
        style={{
          flex: 1,
          padding: '2.5rem 1rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '1.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        © {new Date().getFullYear()} <strong>Expensify</strong> — Track your money smartly 💸
      </footer>
    </div>
  );
}
