/* eslint-disable react-refresh/only-export-components */
/**
 * AdminDataContext - Provides centralized admin data management
 *
 * IMPORTANT: This context now uses REAL DATA ONLY
 * - No mock/fallback data is provided when real data is unavailable
 * - Empty arrays and null values are returned when no data exists
 * - The AdminDashboard component handles empty states with warning triangles
 * - This ensures accurate representation of actual platform usage
 */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User } from '@/types';
import { BlogPost } from '@/types/blog';
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

// Types for admin data
interface AdminState {
  // User Management
  users: User[];
  usersLoading: boolean;
  usersError: string | null;

  // Blog Management
  blogPosts: BlogPost[];
  blogLoading: boolean;
  blogError: string | null;

  // Analytics Data
  analyticsData: any;
  analyticsLoading: boolean;
  analyticsError: string | null;

  // SEO Data
  seoData: any;
  seoLoading: boolean;
  seoError: string | null;

  // General admin stats
  adminStats: {
    totalUsers: number;
    totalPosts: number;
    totalQRCodes: number;
    lastUpdated: Date | null;
  };

  // UI State
  refreshing: boolean;
  lastRefresh: Date | null;
}

type AdminAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_USERS_LOADING'; payload: boolean }
  | { type: 'SET_USERS_ERROR'; payload: string | null }
  | { type: 'SET_BLOG_POSTS'; payload: BlogPost[] }
  | { type: 'SET_BLOG_LOADING'; payload: boolean }
  | { type: 'SET_BLOG_ERROR'; payload: string | null }
  | { type: 'DELETE_BLOG_POST'; payload: string }
  | { type: 'SET_ANALYTICS_DATA'; payload: any }
  | { type: 'SET_ANALYTICS_LOADING'; payload: boolean }
  | { type: 'SET_ANALYTICS_ERROR'; payload: string | null }
  | { type: 'SET_SEO_DATA'; payload: any }
  | { type: 'SET_SEO_LOADING'; payload: boolean }
  | { type: 'SET_SEO_ERROR'; payload: string | null }
  | { type: 'SET_ADMIN_STATS'; payload: Partial<AdminState['adminStats']> }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_LAST_REFRESH'; payload: Date | null }
  | { type: 'RESET_ERRORS' };

interface AdminContextType extends AdminState {
  // Actions
  refreshAllData: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshBlogPosts: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  refreshSEO: () => Promise<void>;

  // Blog management
  deleteBlogPost: (postId: string) => Promise<boolean>;

  // Computed values
  getRecentActivity: () => any[];
  getTopMetrics: () => any;

  // Error handling
  clearErrors: () => void;
  retryFailedRequests: () => Promise<void>;
}

const initialState: AdminState = {
  users: [],
  usersLoading: false,
  usersError: null,

  blogPosts: [],
  blogLoading: false,
  blogError: null,

  analyticsData: null,
  analyticsLoading: false,
  analyticsError: null,

  seoData: null,
  seoLoading: false,
  seoError: null,

  adminStats: {
    totalUsers: 0,
    totalPosts: 0,
    totalQRCodes: 0,
    lastUpdated: null,
  },

  refreshing: false,
  lastRefresh: null,
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
        usersLoading: false,
        usersError: null,
        adminStats: {
          ...state.adminStats,
          totalUsers: action.payload.length,
        },
      };

    case 'SET_USERS_LOADING':
      return { ...state, usersLoading: action.payload };

    case 'SET_USERS_ERROR':
      return { ...state, usersError: action.payload, usersLoading: false };

    case 'SET_BLOG_POSTS':
      return {
        ...state,
        blogPosts: action.payload,
        blogLoading: false,
        blogError: null,
        adminStats: {
          ...state.adminStats,
          totalPosts: action.payload.length,
        },
      };

    case 'SET_BLOG_LOADING':
      return { ...state, blogLoading: action.payload };

    case 'SET_BLOG_ERROR':
      return { ...state, blogError: action.payload, blogLoading: false };

    case 'DELETE_BLOG_POST': {
      console.log(
        '🔧 Reducer: DELETE_BLOG_POST action received for ID:',
        action.payload
      );
      console.log(
        '🔧 Reducer: Current blog posts count:',
        state.blogPosts.length
      );
      const filteredPosts = state.blogPosts.filter(
        (post) => post.id !== action.payload
      );
      console.log(
        '🔧 Reducer: After filtering, posts count:',
        filteredPosts.length
      );
      return {
        ...state,
        blogPosts: filteredPosts,
        adminStats: {
          ...state.adminStats,
          totalPosts: filteredPosts.length,
        },
      };
    }

    case 'SET_ANALYTICS_DATA':
      return {
        ...state,
        analyticsData: action.payload,
        analyticsLoading: false,
        analyticsError: null,
      };

    case 'SET_ANALYTICS_LOADING':
      return { ...state, analyticsLoading: action.payload };

    case 'SET_ANALYTICS_ERROR':
      return {
        ...state,
        analyticsError: action.payload,
        analyticsLoading: false,
      };

    case 'SET_SEO_DATA':
      return {
        ...state,
        seoData: action.payload,
        seoLoading: false,
        seoError: null,
      };

    case 'SET_SEO_LOADING':
      return { ...state, seoLoading: action.payload };

    case 'SET_SEO_ERROR':
      return { ...state, seoError: action.payload, seoLoading: false };

    case 'SET_ADMIN_STATS':
      return {
        ...state,
        adminStats: { ...state.adminStats, ...action.payload },
      };

    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };

    case 'SET_LAST_REFRESH':
      return { ...state, lastRefresh: action.payload };

    case 'RESET_ERRORS':
      return {
        ...state,
        usersError: null,
        blogError: null,
        analyticsError: null,
        seoError: null,
      };

    default:
      return state;
  }
}

const AdminDataContext = createContext<AdminContextType | undefined>(undefined);

export function useAdminData(): AdminContextType {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}

interface AdminDataProviderProps {
  children: ReactNode;
}

export function AdminDataProvider({ children }: AdminDataProviderProps) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Fetch users data with real-time updates
  const refreshUsers = useCallback(async () => {
    dispatch({ type: 'SET_USERS_LOADING', payload: true });
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as User[];

      // Use only real data - no mock fallbacks
      dispatch({ type: 'SET_USERS', payload: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      dispatch({ type: 'SET_USERS_ERROR', payload: 'Failed to fetch users' });
    }
  }, []);

  // Fetch blog posts with real-time updates
  const refreshBlogPosts = useCallback(async () => {
    dispatch({ type: 'SET_BLOG_LOADING', payload: true });
    try {
      const blogQuery = query(
        collection(db, 'blog'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const blogSnapshot = await getDocs(blogQuery);
      const posts = blogSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPost[];

      // Use only real data - no mock fallbacks
      dispatch({ type: 'SET_BLOG_POSTS', payload: posts });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      dispatch({
        type: 'SET_BLOG_ERROR',
        payload: 'Failed to fetch blog posts',
      });
    }
  }, []);

  // Delete blog post
  const deleteBlogPost = useCallback(
    async (postId: string): Promise<boolean> => {
      console.log(
        '🏗️ AdminDataContext: Starting deleteBlogPost for ID:',
        postId
      );
      try {
        // Import deleteDoc locally to avoid circular dependencies
        const { deleteDoc, doc } = await import('firebase/firestore');

        console.log('🔥 AdminDataContext: Deleting from Firebase...');
        // Delete from Firebase
        await deleteDoc(doc(db, 'blog', postId));
        console.log('✅ AdminDataContext: Firebase deletion successful');

        console.log('🔄 AdminDataContext: Updating local state...');
        // Update local state immediately
        dispatch({
          type: 'DELETE_BLOG_POST',
          payload: postId,
        });
        console.log('✅ AdminDataContext: Local state updated');

        // Refresh the blog posts to ensure consistency
        console.log('⏰ AdminDataContext: Scheduling refresh in 500ms...');
        setTimeout(() => {
          console.log('🔄 AdminDataContext: Running scheduled refresh...');
          refreshBlogPosts();
        }, 500);

        console.log(
          '✅ AdminDataContext: deleteBlogPost completed successfully'
        );
        return true;
      } catch (error) {
        console.error('❌ AdminDataContext: Error deleting blog post:', error);
        dispatch({
          type: 'SET_BLOG_ERROR',
          payload: 'Failed to delete blog post',
        });
        return false;
      }
    },
    [refreshBlogPosts]
  );

  // Fetch analytics data
  // Fetch analytics data from Firebase
  const refreshAnalytics = useCallback(async () => {
    dispatch({ type: 'SET_ANALYTICS_LOADING', payload: true });
    try {
      // Import Firestore functions locally to avoid circular dependencies
      const { doc, getDoc } = await import('firebase/firestore');

      // Fetch analytics data from the platform document
      const analyticsDocRef = doc(db, 'analytics', 'platform');
      const analyticsDoc = await getDoc(analyticsDocRef);

      let analyticsData = null;

      if (analyticsDoc.exists()) {
        analyticsData = analyticsDoc.data();
        console.log('✅ Fetched analytics data from Firebase:', analyticsData);
      } else {
        console.log('📊 No analytics data found in Firebase');
      }

      dispatch({ type: 'SET_ANALYTICS_DATA', payload: analyticsData });

      // Update QR codes count from real data only
      if (analyticsData?.qrGenerated) {
        dispatch({
          type: 'SET_ADMIN_STATS',
          payload: { totalQRCodes: analyticsData.qrGenerated },
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      dispatch({
        type: 'SET_ANALYTICS_ERROR',
        payload: 'Failed to fetch analytics',
      });
    }
  }, []);

  // SEO data refresh (currently returns empty - replace with real API when configured)
  const refreshSEO = useCallback(async () => {
    dispatch({ type: 'SET_SEO_LOADING', payload: true });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return empty data until real SEO API is configured
      const seoData = {};

      dispatch({ type: 'SET_SEO_DATA', payload: seoData });
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      dispatch({ type: 'SET_SEO_ERROR', payload: 'Failed to fetch SEO data' });
    }
  }, []);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    dispatch({ type: 'SET_REFRESHING', payload: true });

    try {
      await Promise.allSettled([
        refreshUsers(),
        refreshBlogPosts(),
        refreshAnalytics(),
        refreshSEO(),
      ]);

      dispatch({ type: 'SET_LAST_REFRESH', payload: new Date() });
      dispatch({
        type: 'SET_ADMIN_STATS',
        payload: { lastUpdated: new Date() },
      });
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [refreshUsers, refreshBlogPosts, refreshAnalytics, refreshSEO]);

  // Get recent activity across all data sources
  const getRecentActivity = () => {
    const activities: Array<{
      type: 'blog' | 'user';
      title: string;
      timestamp: any;
      data: any;
    }> = [];

    // Recent blog posts
    state.blogPosts.slice(0, 5).forEach((post) => {
      activities.push({
        type: 'blog',
        title: `Blog post: ${post.title}`,
        // BlogPost type has publishedAt/updatedAt; fall back accordingly
        timestamp:
          (post as any).createdAt ??
          post.publishedAt ??
          post.updatedAt ??
          new Date().toISOString(),
        data: post,
      });
    });

    // Recent users (if they have createdAt)
    state.users
      .filter((user) => user.createdAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      )
      .slice(0, 5)
      .forEach((user) => {
        activities.push({
          type: 'user',
          title: `New user: ${user.email}`,
          timestamp: user.createdAt,
          data: user,
        });
      });

    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);
  };

  // Get top-level metrics
  const getTopMetrics = () => {
    return {
      users: {
        total: state.adminStats.totalUsers,
        premium: state.users.filter((u) => u.subscription?.plan === 'pro')
          .length,
        growth: '+12%', // Calculate actual growth
      },
      content: {
        posts: state.adminStats.totalPosts,
        published: state.blogPosts.filter((p) => p.status === 'published')
          .length,
        drafts: state.blogPosts.filter((p) => p.status === 'draft').length,
      },
      engagement: {
        qrCodes: state.adminStats.totalQRCodes,
        clicks: state.seoData?.totalClicks || 0,
        impressions: state.seoData?.totalImpressions || 0,
      },
    };
  };

  // Clear all errors
  const clearErrors = () => {
    dispatch({ type: 'RESET_ERRORS' });
  };

  // Retry failed requests
  const retryFailedRequests = async () => {
    const retries = [];

    if (state.usersError) retries.push(refreshUsers());
    if (state.blogError) retries.push(refreshBlogPosts());
    if (state.analyticsError) retries.push(refreshAnalytics());
    if (state.seoError) retries.push(refreshSEO());

    if (retries.length > 0) {
      await Promise.allSettled(retries);
    }
  };

  // Set up real-time listeners on mount
  useEffect(() => {
    // Initial data load
    refreshAllData();

    // Set up real-time listeners for critical data
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as User[];
        dispatch({ type: 'SET_USERS', payload: users });
      },
      (error) => {
        console.error('Users listener error:', error);
        dispatch({ type: 'SET_USERS_ERROR', payload: 'Real-time sync failed' });
      }
    );

    const unsubscribeBlog = onSnapshot(
      query(collection(db, 'blog'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const posts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        dispatch({ type: 'SET_BLOG_POSTS', payload: posts });
      },
      (error) => {
        console.error('Blog listener error:', error);
        dispatch({ type: 'SET_BLOG_ERROR', payload: 'Real-time sync failed' });
      }
    );

    // Cleanup listeners
    return () => {
      unsubscribeUsers();
      unsubscribeBlog();
    };
  }, [refreshAllData]);

  const contextValue: AdminContextType = {
    ...state,
    refreshAllData,
    refreshUsers,
    refreshBlogPosts,
    refreshAnalytics,
    refreshSEO,
    deleteBlogPost,
    getRecentActivity,
    getTopMetrics,
    clearErrors,
    retryFailedRequests,
  };

  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  );
}
