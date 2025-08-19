import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/contexts/UserDataContext';
import { useState } from 'react';
import {
  BarChart3,
  QrCode,
  TrendingUp,
  Users,
  Download,
  Filter,
  ChevronDown,
} from 'lucide-react';

// Time period options for analytics filtering
const TIME_PERIODS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: 'all', label: 'All time' },
];

export function Analytics() {
  const { user } = useAuth();
  const { state: userData } = useUserData();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Use real data from UserDataContext
  const qrCodes = userData.qrCodes;
  const isLoading = userData.statsLoading || userData.qrCodesLoading;

  const isPro = user?.subscription?.plan === 'pro';

  // Filter QR codes based on selected time period
  const getFilteredQRCodes = () => {
    if (selectedPeriod === 'all') return qrCodes;

    const now = new Date();
    const daysAgo =
      {
        '7d': 7,
        '30d': 30,
        '90d': 90,
      }[selectedPeriod] || 30;

    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return qrCodes.filter((qr) => {
      const createdDate = qr.createdAt?.toDate
        ? qr.createdAt.toDate()
        : new Date(qr.createdAt);
      return createdDate >= cutoffDate;
    });
  };

  const filteredQRCodes = getFilteredQRCodes();

  // Calculate analytics for filtered period
  const periodStats = {
    totalCodes: filteredQRCodes.length,
    totalScans: filteredQRCodes.reduce(
      (sum, qr) => sum + (qr.scanCount || 0),
      0
    ),
    avgScansPerCode:
      filteredQRCodes.length > 0
        ? Math.round(
            (filteredQRCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0) /
              filteredQRCodes.length) *
              10
          ) / 10
        : 0,
    topPerformer:
      filteredQRCodes.length > 0
        ? filteredQRCodes.reduce((top, qr) =>
            (qr.scanCount || 0) > (top.scanCount || 0) ? qr : top
          )
        : null,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-lg text-gray-600 mt-4">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Track your QR code performance and engagement
              </p>
            </div>

            {/* Time Period Filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                {TIME_PERIODS.find((p) => p.value === selectedPeriod)?.label}
                <ChevronDown className="h-4 w-4" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {TIME_PERIODS.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => {
                        setSelectedPeriod(period.value);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        selectedPeriod === period.value
                          ? 'bg-primary-50 text-primary-700'
                          : ''
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Notice for Free Users */}
        {!isPro && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Limited Analytics on Free Plan
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Upgrade to Pro for detailed scan analytics, geographic data,
                  and advanced insights.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <QrCode className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">QR Codes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStats.totalCodes}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {TIME_PERIODS.find(
                    (p) => p.value === selectedPeriod
                  )?.label.toLowerCase()}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {periodStats.totalScans}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {TIME_PERIODS.find(
                    (p) => p.value === selectedPeriod
                  )?.label.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg. Scans/Code
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStats.avgScansPerCode}
                </p>
                <p className="text-xs text-gray-500 mt-1">Per QR code</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Top Performer
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {periodStats.topPerformer
                    ? `${periodStats.topPerformer.scanCount || 0} scans`
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {periodStats.topPerformer?.title || 'No data'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Performance Table */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              QR Code Performance
            </h2>
            <button className="btn-outline flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>

          {filteredQRCodes.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No QR codes found
              </h3>
              <p className="text-gray-600">
                {selectedPeriod === 'all'
                  ? 'Create your first QR code to see analytics here.'
                  : 'No QR codes created in the selected time period.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      QR Code
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Scans
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQRCodes
                    .sort((a, b) => (b.scanCount || 0) - (a.scanCount || 0))
                    .map((qrCode) => {
                      const createdDate = qrCode.createdAt?.toDate
                        ? qrCode.createdAt.toDate()
                        : new Date(qrCode.createdAt);

                      return (
                        <tr
                          key={qrCode.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-sm">🔗</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {qrCode.title || 'Untitled QR Code'}
                                </p>
                                <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                  {qrCode.url}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 capitalize">
                              URL
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {createdDate.toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-gray-900">
                              {qrCode.scanCount || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                qrCode.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {qrCode.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pro Features Teaser for Free Users */}
        {!isPro && (
          <div className="mt-8 card p-6 bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unlock Advanced Analytics with Pro
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Geographic scan data and heatmaps</li>
                  <li>• Device and browser analytics</li>
                  <li>• Scan time patterns and trends</li>
                  <li>• Advanced export options (CSV, PDF)</li>
                  <li>• Real-time scan notifications</li>
                </ul>
              </div>
              <button
                onClick={async () => {
                  const { subscriptionService } = await import(
                    '@/services/subscription'
                  );
                  await subscriptionService.upgradeToProWithRedirect(user!);
                }}
                className="btn-primary whitespace-nowrap"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
