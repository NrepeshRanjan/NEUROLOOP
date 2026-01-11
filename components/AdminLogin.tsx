
import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import { AuthSession } from '@supabase/supabase-js';
import { AuthService } from '../services/authService';
import { Button } from './Button';

interface AdminLoginProps {
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
  onSignOut: () => void;
  session: AuthSession | null;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onClose, onLoginSuccess, onSignOut, session }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { session: newSession, error: authError } = await AuthService.signInWithPassword(email, password);

    if (authError) {
      setError(authError.message);
    } else if (newSession) {
      onLoginSuccess(newSession);
      onClose(); // Close the login modal on success
    }
    setLoading(false);
  }, [email, password, onLoginSuccess, onClose]);

  const handleSignOutClick = useCallback(async () => {
    setIsSigningOut(true);
    const { error: signOutError } = await AuthService.signOut();
    if (signOutError) {
      setError(signOutError.message);
    } else {
      onSignOut();
      onClose(); // Close the modal after signing out
    }
    setIsSigningOut(false);
  }, [onSignOut, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative border-2 border-indigo-600 text-white">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 text-2xl font-bold leading-none"
          aria-label="Close Admin Login Panel"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-indigo-400" id="admin-login-title">Admin Access</h3>

        {session ? (
          <div className="text-center">
            <p className="text-lg mb-4">You are currently logged in as:</p>
            <p className="font-semibold text-green-300">{session.user?.email}</p>
            <Button onClick={handleSignOutClick} disabled={isSigningOut} className="mt-6 bg-red-600 hover:bg-red-700">
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                id="email"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Admin Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                id="password"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Admin Password"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Logging In...' : 'Login'}
            </Button>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Please use your admin credentials.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export { AdminLogin };
