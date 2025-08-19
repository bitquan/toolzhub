/* eslint-disable react-refresh/only-export-components */
/**
 * UserDataContext - Provides centralized user data management
 *
 * IMPORTANT: This context uses REAL USER DATA ONLY
 * - No mock/fallback data is provided when real data is unavailable
 * - Empty arrays and null values are returned when no data exists
 * - The Dashboard component handles empty states with warning triangles
 * - Data is filtered by authenticated user's ID for security
 * - Follows patterns established in AdminDataContext
 */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

// Types for user-specific data
interface QRCode {
  id: string;
  userId: string;
  url: string;
  title: string;
  createdAt: any;
  customization?: {
    backgroundColor?: string;
    foregroundColor?: string;
    logo?: string;
  };
  scanCount: number;
  isActive: boolean;
}

interface UserAnalytic {
  id: string;
  qrCodeId: string;
  userId: string;
  scannedAt: any;
  location?: string;
  device?: string;
  browser?: string;
}

interface UserStats {
  totalQRCodes: number;
  qrCodesThisMonth: number;
  totalScans: number;
  avgScansPerCode: number;
}

interface UserState {
  // QR Codes
  qrCodes: QRCode[];
  qrCodesLoading: boolean;
  qrCodesError: string | null;

  // Analytics
  analytics: UserAnalytic[];
  analyticsLoading: boolean;
  analyticsError: string | null;

  // Computed Stats
  stats: UserStats;
  statsLoading: boolean;

  // User Profile
  profileLoading: boolean;
  profileError: string | null;
}

// Action types
type UserAction =
  | { type: 'SET_QR_CODES_LOADING'; payload: boolean }
  | { type: 'SET_QR_CODES'; payload: QRCode[] }
  | { type: 'SET_QR_CODES_ERROR'; payload: string | null }
  | { type: 'SET_ANALYTICS_LOADING'; payload: boolean }
  | { type: 'SET_ANALYTICS'; payload: UserAnalytic[] }
  | { type: 'SET_ANALYTICS_ERROR'; payload: string | null }
  | { type: 'SET_STATS_LOADING'; payload: boolean }
  | { type: 'SET_STATS'; payload: UserStats }
  | { type: 'SET_PROFILE_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE_ERROR'; payload: string | null };

// Context interface
interface UserDataContextType {
  state: UserState;
  refreshUserData: () => Promise<void>;
  refreshQRCodes: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

// Initial state
const initialState: UserState = {
  qrCodes: [],
  qrCodesLoading: false,
  qrCodesError: null,
  analytics: [],
  analyticsLoading: false,
  analyticsError: null,
  stats: {
    totalQRCodes: 0,
    qrCodesThisMonth: 0,
    totalScans: 0,
    avgScansPerCode: 0,
  },
  statsLoading: false,
  profileLoading: false,
  profileError: null,
};

// Reducer
function userDataReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_QR_CODES_LOADING':
      return { ...state, qrCodesLoading: action.payload };
    case 'SET_QR_CODES':
      return {
        ...state,
        qrCodes: action.payload,
        qrCodesLoading: false,
        qrCodesError: null,
      };
    case 'SET_QR_CODES_ERROR':
      return { ...state, qrCodesError: action.payload, qrCodesLoading: false };
    case 'SET_ANALYTICS_LOADING':
      return { ...state, analyticsLoading: action.payload };
    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: action.payload,
        analyticsLoading: false,
        analyticsError: null,
      };
    case 'SET_ANALYTICS_ERROR':
      return {
        ...state,
        analyticsError: action.payload,
        analyticsLoading: false,
      };
    case 'SET_STATS_LOADING':
      return { ...state, statsLoading: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload, statsLoading: false };
    case 'SET_PROFILE_LOADING':
      return { ...state, profileLoading: action.payload };
    case 'SET_PROFILE_ERROR':
      return { ...state, profileError: action.payload, profileLoading: false };
    default:
      return state;
  }
}

// Context
const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

// Provider component
export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(userDataReducer, initialState);

  // Helper function to calculate current month start
  const getCurrentMonthStart = useCallback(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  // Fetch user's QR codes with real-time updates
  const refreshQRCodes = useCallback(async () => {
    if (!user?.uid) {
      dispatch({ type: 'SET_QR_CODES', payload: [] });
      return;
    }

    dispatch({ type: 'SET_QR_CODES_LOADING', payload: true });
    try {
      const qrQuery = query(
        collection(db, 'qrcodes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const qrSnapshot = await getDocs(qrQuery);
      const qrCodes = qrSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QRCode[];

      // Use only real data - no mock fallbacks
      dispatch({ type: 'SET_QR_CODES', payload: qrCodes });
    } catch (error) {
      console.error('Error fetching user QR codes:', error);
      dispatch({
        type: 'SET_QR_CODES_ERROR',
        payload: 'Failed to fetch QR codes',
      });
    }
  }, [user?.uid]);

  // Fetch user's analytics with real-time updates
  const refreshAnalytics = useCallback(async () => {
    if (!user?.uid) {
      dispatch({ type: 'SET_ANALYTICS', payload: [] });
      return;
    }

    dispatch({ type: 'SET_ANALYTICS_LOADING', payload: true });
    try {
      const analyticsQuery = query(
        collection(db, 'analytics'),
        where('userId', '==', user.uid),
        orderBy('scannedAt', 'desc'),
        limit(1000) // Limit to recent analytics for performance
      );

      const analyticsSnapshot = await getDocs(analyticsQuery);
      const analytics = analyticsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserAnalytic[];

      // Use only real data - no mock fallbacks
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      dispatch({
        type: 'SET_ANALYTICS_ERROR',
        payload: 'Failed to fetch analytics',
      });
    }
  }, [user?.uid]);

  // Calculate user statistics from real data
  const refreshStats = useCallback(async () => {
    if (!user?.uid) {
      dispatch({ type: 'SET_STATS', payload: initialState.stats });
      return;
    }

    dispatch({ type: 'SET_STATS_LOADING', payload: true });

    try {
      const monthStart = getCurrentMonthStart();

      // Calculate stats from current data
      const totalQRCodes = state.qrCodes.length;
      const qrCodesThisMonth = state.qrCodes.filter((qr) => {
        if (!qr.createdAt) return false;
        const createdDate = qr.createdAt.toDate
          ? qr.createdAt.toDate()
          : new Date(qr.createdAt);
        return createdDate >= monthStart;
      }).length;

      const totalScans = state.analytics.length;
      const avgScansPerCode =
        totalQRCodes > 0 ? Math.round(totalScans / totalQRCodes) : 0;

      const stats: UserStats = {
        totalQRCodes,
        qrCodesThisMonth,
        totalScans,
        avgScansPerCode,
      };

      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      console.error('Error calculating user stats:', error);
      dispatch({ type: 'SET_STATS', payload: initialState.stats });
    }
  }, [state.qrCodes, state.analytics, getCurrentMonthStart, user?.uid]);

  // Refresh all user data
  const refreshUserData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await Promise.all([refreshQRCodes(), refreshAnalytics()]);
      // Stats will be calculated after QR codes and analytics are loaded
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [user?.uid, refreshQRCodes, refreshAnalytics]);

  // Auto-refresh stats when QR codes or analytics change
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Set up real-time listeners for user data
  useEffect(() => {
    if (!user?.uid) return;

    console.log(
      '🔥 UserDataContext: Setting up real-time listeners for user:',
      user.uid
    );

    // Real-time QR codes listener
    const qrQuery = query(
      collection(db, 'qrcodes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeQR = onSnapshot(
      qrQuery,
      (snapshot) => {
        const qrCodes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as QRCode[];

        console.log(
          '🔥 UserDataContext: Real-time QR codes update:',
          qrCodes.length
        );
        dispatch({ type: 'SET_QR_CODES', payload: qrCodes });
      },
      (error) => {
        console.error('Real-time QR codes listener error:', error);
        dispatch({
          type: 'SET_QR_CODES_ERROR',
          payload: 'Real-time QR codes update failed',
        });
      }
    );

    // Real-time analytics listener
    const analyticsQuery = query(
      collection(db, 'analytics'),
      where('userId', '==', user.uid),
      orderBy('scannedAt', 'desc'),
      limit(1000)
    );

    const unsubscribeAnalytics = onSnapshot(
      analyticsQuery,
      (snapshot) => {
        const analytics = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserAnalytic[];

        console.log(
          '🔥 UserDataContext: Real-time analytics update:',
          analytics.length
        );
        dispatch({ type: 'SET_ANALYTICS', payload: analytics });
      },
      (error) => {
        console.error('Real-time analytics listener error:', error);
        dispatch({
          type: 'SET_ANALYTICS_ERROR',
          payload: 'Real-time analytics update failed',
        });
      }
    );

    // Initial data load
    refreshUserData();

    // Cleanup listeners
    return () => {
      console.log('🔥 UserDataContext: Cleaning up real-time listeners');
      unsubscribeQR();
      unsubscribeAnalytics();
    };
  }, [user?.uid, refreshUserData]);

  const contextValue: UserDataContextType = {
    state,
    refreshUserData,
    refreshQRCodes,
    refreshAnalytics,
    refreshStats,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
}

// Hook to use the context
export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

export type { QRCode, UserAnalytic, UserStats, UserState };
