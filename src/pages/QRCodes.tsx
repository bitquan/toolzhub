import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Calendar,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Filter options for QR codes
const FILTER_OPTIONS = [
  { value: 'all', label: 'All QR Codes' },
  { value: 'active', label: 'Active Only' },
  { value: 'inactive', label: 'Inactive Only' },
  { value: 'recent', label: 'Created Recently' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-scanned', label: 'Most Scanned' },
  { value: 'title', label: 'Title A-Z' },
];

export function QRCodes() {
  const { user } = useAuth();
  const { state: userData } = useUserData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedQRCodes, setSelectedQRCodes] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const qrCodes = userData.qrCodes;
  const isLoading = userData.qrCodesLoading;
  const isPro = user?.subscription?.plan === 'pro';
  const qrLimit = isPro ? Infinity : 5;
  const usage = userData.stats.qrCodesThisMonth;

  // Filter and sort QR codes
  const getFilteredAndSortedQRCodes = () => {
    const filtered = qrCodes.filter((qr) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        qr.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.url?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'active' && qr.isActive) ||
        (selectedFilter === 'inactive' && !qr.isActive) ||
        (selectedFilter === 'recent' && isRecent(qr.createdAt));

      return matchesSearch && matchesFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'newest':
          return getDateValue(b.createdAt) - getDateValue(a.createdAt);
        case 'oldest':
          return getDateValue(a.createdAt) - getDateValue(b.createdAt);
        case 'most-scanned':
          return (b.scanCount || 0) - (a.scanCount || 0);
        case 'title':
          return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getDateValue = (date: any) => {
    if (!date) return 0;
    return date.toDate ? date.toDate().getTime() : new Date(date).getTime();
  };

  const isRecent = (date: any) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const qrDate = date?.toDate ? date.toDate() : new Date(date);
    return qrDate >= sevenDaysAgo;
  };

  const handleCreateNew = () => {
    if (!isPro && usage >= qrLimit) {
      toast.error(
        `You've reached your monthly limit of ${qrLimit} QR codes. Upgrade to Pro for unlimited QR codes!`
      );
      return;
    }
    navigate('/qr-generator');
  };

  const handleToggleActive = async (
    _qrCodeId: string,
    _currentStatus: boolean
  ) => {
    try {
      // TODO: Implement QR code status update
      toast.error('QR code status update not yet implemented');
    } catch (error) {
      toast.error('Failed to update QR code status');
    }
  };

  const handleDelete = async (_qrCodeId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this QR code? This action cannot be undone.'
      )
    ) {
      try {
        // TODO: Implement QR code deletion
        toast.error('QR code deletion not yet implemented');
        setSelectedQRCodes((prev) => prev.filter((id) => id !== _qrCodeId));
      } catch (error) {
        toast.error('Failed to delete QR code');
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleBulkDelete = async () => {
    if (selectedQRCodes.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedQRCodes.length} QR code(s)? This action cannot be undone.`
      )
    ) {
      try {
        // TODO: Implement bulk QR code deletion
        toast.error('Bulk QR code deletion not yet implemented');
        setSelectedQRCodes([]);
      } catch (error) {
        toast.error('Failed to delete some QR codes');
      }
    }
  };

  const toggleSelectAll = () => {
    const filteredCodes = getFilteredAndSortedQRCodes();
    if (selectedQRCodes.length === filteredCodes.length) {
      setSelectedQRCodes([]);
    } else {
      setSelectedQRCodes(filteredCodes.map((qr) => qr.id));
    }
  };

  const filteredQRCodes = getFilteredAndSortedQRCodes();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-lg text-gray-600 mt-4">Loading QR codes...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
              <p className="text-gray-600 mt-2">
                Manage all your QR codes in one place
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New
            </button>
          </div>
        </div>

        {/* Usage Info for Free Users */}
        {!isPro && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <QrCode className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {usage}/{qrLimit} QR codes used this month
                  </p>
                  <p className="text-xs text-yellow-700">
                    {usage >= qrLimit
                      ? 'Upgrade to Pro for unlimited QR codes'
                      : `${qrLimit - usage} remaining this month`}
                  </p>
                </div>
              </div>
              {usage >= qrLimit && (
                <button
                  onClick={async () => {
                    const { subscriptionService } = await import(
                      '@/services/subscription'
                    );
                    await subscriptionService.upgradeToProWithRedirect(user!);
                  }}
                  className="btn-primary text-sm"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search QR codes by title or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              {FILTER_OPTIONS.find((f) => f.value === selectedFilter)?.label}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      selectedFilter === option.value
                        ? 'bg-primary-50 text-primary-700'
                        : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <BarChart3 className="h-4 w-4" />
              {SORT_OPTIONS.find((s) => s.value === selectedSort)?.label}
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedSort(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      selectedSort === option.value
                        ? 'bg-primary-50 text-primary-700'
                        : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedQRCodes.length > 0 && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-primary-900">
                {selectedQRCodes.length} QR code(s) selected
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedQRCodes([])}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear selection
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Codes List */}
        <div className="card p-6">
          {filteredQRCodes.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {qrCodes.length === 0
                  ? 'No QR codes yet'
                  : 'No matching QR codes found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {qrCodes.length === 0
                  ? 'Create your first QR code to get started.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {qrCodes.length === 0 && (
                <button
                  onClick={handleCreateNew}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First QR Code
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={
                          selectedQRCodes.length === filteredQRCodes.length &&
                          filteredQRCodes.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQRCodes.map((qrCode) => {
                    const createdDate = qrCode.createdAt?.toDate
                      ? qrCode.createdAt.toDate()
                      : new Date(qrCode.createdAt);
                    const isSelected = selectedQRCodes.includes(qrCode.id);

                    return (
                      <tr
                        key={qrCode.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedQRCodes((prev) => [
                                  ...prev,
                                  qrCode.id,
                                ]);
                              } else {
                                setSelectedQRCodes((prev) =>
                                  prev.filter((id) => id !== qrCode.id)
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
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
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {createdDate.toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {qrCode.scanCount || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              handleToggleActive(qrCode.id, qrCode.isActive)
                            }
                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                              qrCode.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {qrCode.isActive ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            {qrCode.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyUrl(qrCode.url)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Copy URL"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/qr-generator?edit=${qrCode.id}`)
                              }
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Edit QR Code"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(qrCode.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete QR Code"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <QrCode className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total QR Codes
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {qrCodes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Eye className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Codes
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {qrCodes.filter((qr) => qr.isActive).length}
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
                  {qrCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
