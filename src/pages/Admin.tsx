import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AdminDataProvider } from '../contexts/AdminDataContext';
import {
  AdminErrorProvider,
  AdminErrorBoundary,
} from '../contexts/AdminErrorContext';
import AdminDashboard from '../components/Admin/AdminDashboard';
import UserManagement from '../components/Admin/UserManagement';
import Analytics from '../components/Admin/Analytics';
import { BlogManager } from '../components/Admin/BlogManager';
import { AnalyticsManager } from '../components/Admin/AnalyticsManager';

// Owner/admin email whitelist (fallback if Firestore flag isn't present)
const ADMIN_EMAIL_WHITELIST = new Set<string>([
  'sayquanmclaurinwork@gmail.com',
]);

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Fast-path: allow if email is whitelisted
        if (user.email && ADMIN_EMAIL_WHITELIST.has(user.email)) {
          setIsAdmin(true);
          return;
        }

        // Otherwise, check Firestore flag
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const adminStatus = userData?.isAdmin === true;
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'blog', name: 'Blog Management', icon: '📝' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'analytics-manage', name: 'Analytics Management', icon: '⚙️' },
  ];

  return (
    <AdminErrorProvider>
      <AdminDataProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6">
                <div className="flex items-center mb-2 sm:mb-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Admin Panel
                  </h1>
                  <span className="ml-2 sm:ml-3 inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Super Admin
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">
                  Welcome back, {user.email}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                {/* Desktop tabs */}
                <nav className="hidden sm:flex -mb-px space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <span>{tab.icon}</span>
                      <span className="hidden lg:inline">{tab.name}</span>
                      <span className="lg:hidden">
                        {tab.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </nav>

                {/* Mobile horizontal scroll tabs */}
                <nav className="sm:hidden -mb-px flex space-x-1 overflow-x-auto px-4 scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      } whitespace-nowrap py-2 px-3 border-b-2 font-medium text-xs flex items-center space-x-1 rounded-t-lg min-w-max`}
                    >
                      <span className="text-sm">{tab.icon}</span>
                      <span>{tab.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <AdminErrorBoundary component="AdminTabContent">
              {activeTab === 'dashboard' && <AdminDashboard />}
              {activeTab === 'blog' && (
                <AdminErrorBoundary component="BlogManager">
                  <BlogManager />
                </AdminErrorBoundary>
              )}
              {activeTab === 'users' && (
                <AdminErrorBoundary component="UserManagement">
                  <UserManagement />
                </AdminErrorBoundary>
              )}
              {activeTab === 'analytics' && (
                <AdminErrorBoundary component="Analytics">
                  <Analytics />
                </AdminErrorBoundary>
              )}
              {activeTab === 'analytics-manage' && (
                <AdminErrorBoundary component="AnalyticsManager">
                  <AnalyticsManager />
                </AdminErrorBoundary>
              )}
            </AdminErrorBoundary>
          </div>
        </div>
      </AdminDataProvider>
    </AdminErrorProvider>
  );
};

export default Admin;
