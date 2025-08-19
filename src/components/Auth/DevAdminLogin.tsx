import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, LogIn } from 'lucide-react';

const DevAdminLogin: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('sayquanmclaurinwork@gmail.com');
  const [password, setPassword] = useState('');

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      // For development, create a temporary admin user in Firebase Auth emulator
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Dev admin login error:', error);
      // If user doesn't exist, we might need to create them
      alert(
        'Admin user not found. Please use the Firebase Auth emulator to create the admin user first.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDevAccess = async () => {
    // For development only - bypass auth temporarily
    window.location.href = '/admin?dev=true';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Access Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Admin email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDevLogin}
              disabled={loading || !email || !password}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {loading ? 'Signing in...' : 'Sign in as Admin'}
            </button>

            {import.meta.env.DEV && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 text-center mb-2">
                  Development Mode Only
                </p>
                <button
                  onClick={handleQuickDevAccess}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Quick Dev Access (Bypass Auth)
                </button>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Development Setup
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>To access the admin dashboard, either:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Create an admin user in Firebase Auth emulator</li>
                    <li>Use the quick dev access button above</li>
                    <li>Sign in with the whitelisted admin email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevAdminLogin;
