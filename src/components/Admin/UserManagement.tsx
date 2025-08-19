import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt?: any;
  subscription?: {
    plan: 'free' | 'pro';
    customerId?: string;
    status?: string;
  };
  usage?: {
    qrGenerated: number;
    monthlyLimit: number;
  };
  isAdmin?: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'pro'>('all');
  const [sortBy, setSortBy] = useState<'email' | 'createdAt' | 'usage'>('createdAt');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isAdmin: !currentStatus
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: !currentStatus }
          : user
      ));
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  const updateUserPlan = async (userId: string, newPlan: 'free' | 'pro') => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'subscription.plan': newPlan,
        'usage.monthlyLimit': newPlan === 'pro' ? 1000 : 10
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              subscription: { ...user.subscription, plan: newPlan },
              usage: { ...user.usage, monthlyLimit: newPlan === 'pro' ? 1000 : 10, qrGenerated: user.usage?.qrGenerated || 0 }
            }
          : user
      ));
    } catch (error) {
      console.error('Error updating user plan:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPlan === 'all' || user.subscription?.plan === filterPlan;
    return matchesSearch && matchesFilter;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'email':
        return a.email.localeCompare(b.email);
      case 'createdAt':
        return (b.createdAt?.toDate?.() || new Date()).getTime() - (a.createdAt?.toDate?.() || new Date()).getTime();
      case 'usage':
        return (b.usage?.qrGenerated || 0) - (a.usage?.qrGenerated || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as 'all' | 'free' | 'pro')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'email' | 'createdAt' | 'usage')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="email">Sort by Email</option>
            <option value="usage">Sort by Usage</option>
          </select>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-blue-600">Total Users</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.subscription?.plan === 'pro').length}
            </div>
            <div className="text-sm text-green-600">Pro Users</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.isAdmin).length}
            </div>
            <div className="text-sm text-purple-600">Admin Users</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {(user.displayName || user.email)[0].toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {user.displayName || user.email}
                          {user.isAdmin && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.subscription?.plan === 'pro'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.subscription?.plan || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((user.usage?.qrGenerated || 0) / (user.usage?.monthlyLimit || 10)) * 100,
                              100
                            )}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs">
                        {user.usage?.qrGenerated || 0}/{user.usage?.monthlyLimit || 10}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <select
                      value={user.subscription?.plan || 'free'}
                      onChange={(e) => updateUserPlan(user.id, e.target.value as 'free' | 'pro')}
                      className="text-xs px-2 py-1 border border-gray-300 rounded"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </select>
                    <button
                      onClick={() => toggleAdminStatus(user.id, user.isAdmin || false)}
                      className={`text-xs px-2 py-1 rounded ${
                        user.isAdmin
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default UserManagement;
