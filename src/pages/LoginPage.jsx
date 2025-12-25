import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function LoginPage() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      if (isLogin) {
        await login(emailRef.current.value, passwordRef.current.value);
      } else {
        await signup(emailRef.current.value, passwordRef.current.value);
      }
      navigate('/');
    } catch {
      setError(`Failed to ${isLogin ? 'log in' : 'create an account'}`);
    }
    setLoading(false);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in">
        <h1>{isLogin ? 'Welcome Back 👋' : 'Create Your Account ✨'}</h1>
        <p className="subtitle">
          {isLogin
            ? 'Log in to continue managing your expenses'
            : 'Sign up to start tracking your spending smartly'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <div className="input-icon">
              <FaEnvelope />
              <input type="email" ref={emailRef} required placeholder="you@example.com" />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-icon">
              <FaLock />
              <input type="password" ref={passwordRef} required placeholder="••••••••" />
            </div>
          </div>

          <button disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Please wait…' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .auth-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366F1, #22C55E);
          padding: 1rem;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(14px);
          border-radius: 20px;
          padding: 2.2rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .auth-card h1 {
          text-align: center;
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
          color: #111827;
        }

        .subtitle {
          text-align: center;
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 1.8rem;
        }

        .auth-error {
          background: #fee2e2;
          color: #b91c1c;
          padding: 0.8rem;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .input-group {
          margin-bottom: 1.2rem;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
          display: block;
        }

        .input-icon {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #f9fafb;
          padding: 0.7rem 0.8rem;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }

        .input-icon input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 0.95rem;
        }

        .btn {
          margin-top: 0.6rem;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .auth-switch {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .auth-switch button {
          background: none;
          border: none;
          margin-left: 6px;
          color: #4f46e5;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .fade-in {
          animation: fade 0.4s ease-in;
        }

        @keyframes fade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
