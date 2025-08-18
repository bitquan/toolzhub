import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, Calendar, BarChart3, Users, Crown } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [stats] = useState({
    totalQRCodes: 3,
    qrCodesThisMonth: 2,
    totalScans: 147,
    scansByDay: [],
  });

  const isPro = user?.subscription?.plan === 'pro';
  const qrLimit = isPro ? Infinity : 5;
  const usage = user?.usageStats?.qrCodesThisMonth || 0;

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
                <button className="btn-primary">
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
              {/* Sample QR codes - in real app, this would come from Firestore */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">🌐</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Website QR</p>
                    <p className="text-sm text-gray-600">https://example.com</p>
                    <p className="text-xs text-gray-500">Created 2 days ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">47 scans</p>
                  <p className="text-xs text-gray-500">Last scan: 2h ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">📶</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">WiFi QR</p>
                    <p className="text-sm text-gray-600">Office Network</p>
                    <p className="text-xs text-gray-500">Created 5 days ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">23 scans</p>
                  <p className="text-xs text-gray-500">Last scan: 1d ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Contact Card</p>
                    <p className="text-sm text-gray-600">John Doe</p>
                    <p className="text-xs text-gray-500">Created 1 week ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">77 scans</p>
                  <p className="text-xs text-gray-500">Last scan: 3h ago</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-primary-600 hover:text-primary-700 font-medium">
                View All QR Codes
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full btn-primary text-left p-4 flex items-center">
                <QrCode className="h-5 w-5 mr-3" />
                Create New QR Code
              </button>
              <button className="w-full btn-secondary text-left p-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-3" />
                View Analytics
              </button>
              {!isPro && (
                <button className="w-full btn-outline text-left p-4 flex items-center">
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