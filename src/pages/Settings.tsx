import { useAuth } from '@/hooks/useAuth';

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={user?.displayName || ''}
                  className="input-field"
                  placeholder="Your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input-field"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>

          {/* Subscription */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Current Plan: {user?.subscription?.plan === 'pro' ? 'Pro' : 'Free'}
                </p>
                <p className="text-sm text-gray-600">
                  {user?.subscription?.plan === 'pro' 
                    ? 'Unlimited QR codes with advanced features'
                    : 'Limited to 5 QR codes per month'
                  }
                </p>
              </div>
              {user?.subscription?.plan !== 'pro' && (
                <button className="btn-primary">Upgrade to Pro</button>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border-red-200">
            <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700 mb-3">
                  This action cannot be undone. All your QR codes and data will be permanently deleted.
                </p>
                <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}