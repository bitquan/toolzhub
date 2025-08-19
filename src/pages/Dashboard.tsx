import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/contexts/UserDataContext';
import { subscriptionService } from '@/services/subscription';
import { QrCode, Calendar, BarChart3, Users, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user } = useAuth();
  const { state: userData } = useUserData();
  const navigate = useNavigate();

  const isPro = user?.subscription?.plan === 'pro';
  const qrLimit = isPro ? Infinity : 5;
  const usage = user?.usageStats?.qrCodesThisMonth || 0;

  // Use real data from UserDataContext or fallback to meaningful defaults
  const stats = {
    totalQRCodes: userData.qrCodes?.length || 0,
    qrCodesThisMonth: userData.stats?.qrCodesThisMonth || 0,
    totalScans: userData.stats?.totalScans || 0,
    scansByDay: [],
  };

  const isLoading = userData.statsLoading || userData.qrCodesLoading;

  const handleUpgradeClick = async () => {
    if (!user) {
      toast.error('Please log in to upgrade to Pro');
      return;
    }

    try {
      await subscriptionService.upgradeToProWithRedirect(user);
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(
        `Failed to start upgrade process: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const handleCreateQRCode = () => {
    navigate('/generate');
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  const handleViewAllQRCodes = () => {
    // For now, navigate to the QR generator page
    // In the future, this could be a dedicated QR codes management page
    navigate('/generate');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
          </p>
        </div>

        {/* Subscription Status */}
        <div className="mb-8">
          <div className={`card p-6 ${isPro ? 'border-primary-200 bg-primary-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isPro ? (
                  <Crown className="h-6 w-6 text-primary-600 mr-3" />
                ) : (
                  <QrCode className="h-6 w-6 text-yellow-600 mr-3" />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isPro ? 'Pro Plan' : 'Free Plan'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {isPro 
                      ? 'Unlimited QR codes with advanced features'
                      : `${usage}/${qrLimit} QR codes used this month`
                    }
                  </p>
                </div>
              </div>
              {!isPro && (
                <button className="btn-primary" onClick={handleUpgradeClick}>
                  Upgrade to Pro
                </button>
              )}
            </div>
            {!isPro && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${Math.min((usage / qrLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <QrCode className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total QR Codes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQRCodes}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.qrCodesThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Scans/Code</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalQRCodes > 0 ? Math.round(stats.totalScans / stats.totalQRCodes) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent QR Codes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent QR Codes</h2>
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : userData.qrCodes && userData.qrCodes.length > 0 ? (
                userData.qrCodes.slice(0, 3).map((qr) => (
                  <div key={qr.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">🔗</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{qr.title}</p>
                        <p className="text-sm text-gray-600 truncate max-w-48">{qr.url}</p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(qr.createdAt?.toDate?.() || qr.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{qr.scanCount || 0} scans</p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm font-medium">No QR codes yet</p>
                  <p className="text-xs">Create your first QR code to get started</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button 
                className="w-full text-primary-600 hover:text-primary-700 font-medium"
                onClick={handleViewAllQRCodes}
              >
                View All QR Codes
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                className="w-full btn-primary text-left p-4 flex items-center"
                onClick={handleCreateQRCode}
              >
                <QrCode className="h-5 w-5 mr-3" />
                Create New QR Code
              </button>
              <button 
                className="w-full btn-secondary text-left p-4 flex items-center"
                onClick={handleViewAnalytics}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                View Analytics
              </button>
              {!isPro && (
                <button 
                  className="w-full btn-outline text-left p-4 flex items-center"
                  onClick={handleUpgradeClick}
                >
                  <Crown className="h-5 w-5 mr-3" />
                  Upgrade to Pro
                </button>
              )}
            </div>

            {/* Usage Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-blue-800">
                {isPro 
                  ? 'Use custom logos and colors to make your QR codes match your brand!'
                  : 'Upgrade to Pro for unlimited QR codes, custom branding, and detailed analytics!'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}