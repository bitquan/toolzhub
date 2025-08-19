import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface AnalyticsData {
  routes: { [key: string]: number };
  qrTypes: { [key: string]: number };
  daily: { [key: string]: number };
  totalQRGenerated: number;
  totalUsers: number;
  date: string;
}

interface RouteData {
  path: string;
  visits: number;
  percentage: number;
}

interface QRTypeData {
  type: string;
  count: number;
  percentage: number;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [topRoutes, setTopRoutes] = useState<RouteData[]>([]);
  const [qrTypeStats, setQRTypeStats] = useState<QRTypeData[]>([]);
  const [dailyStats, setDailyStats] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data
      const analyticsSnapshot = await getDocs(collection(db, 'analytics'));
      const analyticsData = analyticsSnapshot.docs.map(doc => doc.data());

      // Aggregate route data
      const routeUsage: { [key: string]: number } = {};
      const qrTypeUsage: { [key: string]: number } = {};
      const dailyUsage: { [key: string]: number } = {};
      let totalQR = 0;

      analyticsData.forEach(record => {
        // Routes
        if (record.routes) {
          Object.entries(record.routes).forEach(([route, count]) => {
            routeUsage[route] = (routeUsage[route] || 0) + (count as number);
          });
        }

        // QR Types
        if (record.qrTypes) {
          Object.entries(record.qrTypes).forEach(([type, count]) => {
            qrTypeUsage[type] = (qrTypeUsage[type] || 0) + (count as number);
            totalQR += count as number;
          });
        }

        // Daily stats
        if (record.date && record.qrGenerated) {
          dailyUsage[record.date] = (dailyUsage[record.date] || 0) + record.qrGenerated;
        }
      });

      // Calculate total route visits
      const totalRouteVisits = Object.values(routeUsage).reduce((sum, count) => sum + count, 0);
      
      // Process top routes with percentages
      const routesWithPercentage = Object.entries(routeUsage)
        .map(([path, visits]) => ({
          path,
          visits,
          percentage: totalRouteVisits > 0 ? (visits / totalRouteVisits) * 100 : 0
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      // Process QR types with percentages
      const qrTypesWithPercentage = Object.entries(qrTypeUsage)
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalQR > 0 ? (count / totalQR) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Process daily stats (last 30 days)
      const today = new Date();
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last30Days.push({
          date: dateStr,
          count: dailyUsage[dateStr] || 0
        });
      }

      setTopRoutes(routesWithPercentage);
      setQRTypeStats(qrTypesWithPercentage);
      setDailyStats(last30Days);

      // Get user count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      setAnalytics({
        routes: routeUsage,
        qrTypes: qrTypeUsage,
        daily: dailyUsage,
        totalQRGenerated: totalQR,
        totalUsers: usersSnapshot.size,
        date: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    if (!analytics) return;

    const exportData = {
      summary: {
        totalQRGenerated: analytics.totalQRGenerated,
        totalUsers: analytics.totalUsers,
        exportDate: new Date().toISOString()
      },
      topRoutes,
      qrTypeStats,
      dailyStats
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `toolzhub-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total QR Generated</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.totalQRGenerated?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.totalUsers?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Top Route</p>
              <p className="text-xl font-bold text-gray-900">
                {topRoutes[0]?.path || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {topRoutes[0]?.visits || 0} visits
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Most Popular Routes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔥</span>
            Most Popular Routes
          </h3>
          <div className="space-y-4">
            {topRoutes.length > 0 ? (
              topRoutes.map((route, index) => (
                <div key={route.path} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{route.path}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${route.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium text-gray-900">{route.visits}</div>
                    <div className="text-xs text-gray-500">{route.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No route data available</p>
            )}
          </div>
        </div>

        {/* QR Code Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📱</span>
            QR Code Types
          </h3>
          <div className="space-y-4">
            {qrTypeStats.length > 0 ? (
              qrTypeStats.map((qrType) => (
                <div key={qrType.type} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 capitalize">
                        {qrType.type.replace('_', ' ')}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${qrType.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium text-gray-900">{qrType.count}</div>
                    <div className="text-xs text-gray-500">{qrType.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No QR type data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📈</span>
          Daily Activity (Last 30 Days)
        </h3>
        <div className="h-64 flex items-end justify-between space-x-1">
          {dailyStats.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div
                className="bg-blue-500 rounded-t w-full min-h-[4px] hover:bg-blue-600 transition-colors"
                style={{
                  height: `${Math.max((day.count / Math.max(...dailyStats.map(d => d.count))) * 240, 4)}px`
                }}
                title={`${day.date}: ${day.count} QR codes`}
              ></div>
              {index % 5 === 0 && (
                <div className="text-xs text-gray-500 mt-2 transform -rotate-45">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export Summary */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📄</span>
          Data Export
        </h3>
        <p className="text-gray-600 mb-4">
          Export your analytics data for external analysis or reporting. The export includes route usage, 
          QR code type statistics, daily activity, and user metrics.
        </p>
        <button
          onClick={exportData}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Download Full Analytics Report
        </button>
      </div>
    </div>
  );
};

export default Analytics;
