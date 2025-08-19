import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MousePointer, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import AnalyticsService from '@/services/analytics';
import { markAsTestUser, isTestUser, clearTestUserFlag } from '@/utils/analytics';
import toast from 'react-hot-toast';

export function AnalyticsManager() {
  useAnalytics(); // Keep the hook active for side effects
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState<'reset' | 'clear' | null>(null);
  const [testUserStatus, setTestUserStatus] = useState(false);

  useEffect(() => {
    setTestUserStatus(isTestUser());
    
    const fetchAnalyticsData = async () => {
      try {
        const service = new AnalyticsService();
        const data = await service.getAnalyticsData();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);

  const analyticsService = new AnalyticsService();

  const handleResetToday = async () => {
    setIsResetting(true);
    try {
      await analyticsService.resetAnalytics();
      toast.success('Today\'s analytics data has been reset');
      // Trigger a refresh of the analytics data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to reset analytics data');
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
      setShowConfirm(null);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await analyticsService.clearAllAnalytics();
      toast.success('All analytics data has been cleared');
      // Trigger a refresh of the analytics data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to clear analytics data');
      console.error('Clear error:', error);
    } finally {
      setIsClearing(false);
      setShowConfirm(null);
    }
  };

  const handleToggleTestUser = () => {
    if (testUserStatus) {
      clearTestUserFlag();
      setTestUserStatus(false);
      toast.success('Test user flag cleared - your activity will now be tracked');
    } else {
      markAsTestUser();
      setTestUserStatus(true);
      toast.success('Marked as test user - your activity will be filtered out');
    }
  };

  const getTopRoutes = () => {
    if (!analyticsData?.routes) return [];
    
    return Object.entries(analyticsData.routes)
      .filter(([key]) => key.startsWith('total_'))
      .map(([key, value]) => ({
        route: key.replace('total_', '').replace(/_/g, '/'),
        total: value,
        unique: analyticsData.routes[key.replace('total_', 'unique_')] || 0
      }))
      .sort((a, b) => (b.total as number) - (a.total as number))
      .slice(0, 10);
  };

  const getTopQRTypes = () => {
    if (!analyticsData?.qrTypes) return [];
    
    return Object.entries(analyticsData.qrTypes)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Management</h2>
        
        {/* Test User Status */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Test User Status</h3>
                <p className="text-sm text-blue-700">
                  {testUserStatus 
                    ? 'Your activity is being filtered out of analytics'
                    : 'Your activity is being tracked in analytics'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleTestUser}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                testUserStatus
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {testUserStatus ? 'Enable Tracking' : 'Disable Tracking'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowConfirm('reset')}
            disabled={isResetting}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Today's Data</span>
          </button>
          
          <button
            onClick={() => setShowConfirm('clear')}
            disabled={isClearing}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MousePointer className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Page Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.routes ? 
                  Object.entries(analyticsData.routes)
                    .filter(([key]) => key.startsWith('total_'))
                    .reduce((sum, [, value]) => sum + (value as number), 0) 
                  : 0
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.routes ? 
                  Object.entries(analyticsData.routes)
                    .filter(([key]) => key.startsWith('unique_'))
                    .reduce((sum, [, value]) => sum + (value as number), 0) 
                  : 0
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">QR Codes Generated</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.qrGenerated || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">QR Types</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.qrTypes ? Object.keys(analyticsData.qrTypes).length : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Routes</h3>
          <div className="space-y-3">
            {getTopRoutes().map((route, index) => (
              <div key={route.route} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm text-gray-900">{route.route}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{String(route.total)}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({route.unique} unique)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top QR Types */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top QR Types</h3>
          <div className="space-y-3">
            {getTopQRTypes().map(([type, count], index) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm text-gray-900 capitalize">{type}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{String(count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold">
                {showConfirm === 'reset' ? 'Reset Today\'s Data' : 'Clear All Data'}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {showConfirm === 'reset' 
                ? 'This will reset all analytics data for today. This action cannot be undone.'
                : 'This will permanently delete ALL analytics data. This action cannot be undone.'
              }
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={showConfirm === 'reset' ? handleResetToday : handleClearAll}
                disabled={isResetting || isClearing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {showConfirm === 'reset' 
                  ? (isResetting ? 'Resetting...' : 'Reset') 
                  : (isClearing ? 'Clearing...' : 'Clear All')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
