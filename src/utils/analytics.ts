// Analytics utilities for filtering test traffic and tracking unique users
import { v4 as uuidv4 } from 'uuid';

const ANALYTICS_STORAGE_KEY = 'toolzhub_analytics_user';
const ADMIN_EXCLUSION_KEY = 'toolzhub_admin_user';

// Generate or get existing user token
export const getAnalyticsUserToken = (): string => {
  let token = localStorage.getItem(ANALYTICS_STORAGE_KEY);
  if (!token) {
    token = uuidv4();
    localStorage.setItem(ANALYTICS_STORAGE_KEY, token);
  }
  return token;
};

// Mark user as admin/tester (excludes from analytics)
export const setAdminUser = (isAdmin: boolean = true) => {
  if (isAdmin) {
    localStorage.setItem(ADMIN_EXCLUSION_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_EXCLUSION_KEY);
  }
};

// Alias for setAdminUser(true)
export const markAsTestUser = () => {
  setAdminUser(true);
};

// Check if user is marked as test user
export const isTestUser = (): boolean => {
  return localStorage.getItem(ADMIN_EXCLUSION_KEY) === 'true';
};

// Clear admin/test user flag (alias for setAdminUser(false))
export const clearTestUserFlag = () => {
  setAdminUser(false);
};

// Check if current user should be excluded from analytics
export const shouldExcludeFromAnalytics = (): boolean => {
  // Exclude if marked as admin
  if (localStorage.getItem(ADMIN_EXCLUSION_KEY) === 'true') {
    return true;
  }

  // Exclude if on localhost/development
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return true;
  }

  // Exclude if user agent suggests bot/crawler
  const userAgent = navigator.userAgent.toLowerCase();
  const botKeywords = ['bot', 'crawler', 'spider', 'scraper', 'headless'];
  if (botKeywords.some((keyword) => userAgent.includes(keyword))) {
    return true;
  }

  return false;
};

// Enhanced analytics data structure
export interface AnalyticsEvent {
  id: string;
  userId: string;
  route: string;
  timestamp: number;
  sessionId: string;
  userAgent: string;
  referrer: string;
  isTestTraffic: boolean;
}

// Session management
export const getSessionId = (): string => {
  const SESSION_KEY = 'toolzhub_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Create analytics event with filtering
export const createAnalyticsEvent = (route: string): AnalyticsEvent | null => {
  const isTestTraffic = shouldExcludeFromAnalytics();

  // Return null if this should be excluded (no tracking)
  if (isTestTraffic && !import.meta.env.DEV) {
    return null;
  }

  return {
    id: uuidv4(),
    userId: getAnalyticsUserToken(),
    route: route,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    isTestTraffic: isTestTraffic,
  };
};
