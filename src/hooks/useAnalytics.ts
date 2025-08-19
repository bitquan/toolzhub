import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AnalyticsService from '../services/analytics';
import { createAnalyticsEvent } from '../utils/analytics';

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();
  const analytics = AnalyticsService.getInstance();

  // Track route changes with filtering
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Create analytics event with filtering
        const analyticsEvent = createAnalyticsEvent(location.pathname);
        
        // Only track if not excluded
        if (analyticsEvent) {
          await analytics.trackRoute(location.pathname, analyticsEvent.userId, {
            sessionId: analyticsEvent.sessionId,
            isTestTraffic: analyticsEvent.isTestTraffic,
            timestamp: analyticsEvent.timestamp
          });
        }
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    };

    trackPageView();
  }, [location.pathname, analytics]);

  const trackQRGeneration = async (qrType: string) => {
    try {
      await analytics.trackQRGeneration(qrType, user?.uid);
    } catch (error) {
      console.error('QR tracking error:', error);
    }
  };

  const trackEvent = async (eventName: string, properties: Record<string, any> = {}) => {
    try {
      await analytics.trackEvent(eventName, properties, user?.uid);
    } catch (error) {
      console.error('Event tracking error:', error);
    }
  };

  return {
    trackQRGeneration,
    trackEvent
  };
};
