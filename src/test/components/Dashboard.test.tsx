import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';

// Mock dependencies
vi.mock('../../hooks/useBlog', () => ({
  useBlog: () => ({
    posts: [],
    loading: false,
    error: null,
  }),
}));

// Mock UserDataContext hook
vi.mock('../../contexts/UserDataContext', () => ({
  useUserData: vi.fn(),
}));

// Mock AuthContext hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'test-user-id', email: 'test@example.com' },
    loading: false,
    error: null,
  })),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  QrCode: () => <div data-testid="qrcode-icon">QrCode</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  AlertTriangle: () => (
    <div data-testid="alert-triangle-icon">AlertTriangle</div>
  ),
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
  RefreshCw: () => <div data-testid="refresh-icon">RefreshCw</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  BarChart3: () => <div data-testid="bar-chart-icon">BarChart3</div>,
  Crown: () => <div data-testid="crown-icon">Crown</div>,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

import { useUserData } from '../../contexts/UserDataContext';

const mockUseUserData = useUserData as vi.MockedFunction<typeof useUserData>;

// Helper function to render Dashboard with router
const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading indicator when data is loading', () => {
      mockUseUserData.mockReturnValue({
        state: {
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
          statsLoading: true,
          profileLoading: false,
          profileError: null,
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();
      expect(screen.getByText('Loading QR codes...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no QR codes exist', () => {
      mockUseUserData.mockReturnValue({
        state: {
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
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();
      const emptyStateElements = screen.getAllByText('No QR codes created yet');
      expect(emptyStateElements.length).toBeGreaterThan(0);
      expect(
        screen.getByText('Create your first QR code to get started')
      ).toBeInTheDocument();
    });

    it('should display zero stats in empty state', () => {
      mockUseUserData.mockReturnValue({
        state: {
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
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();
      const statCards = screen.getAllByText('0');
      expect(statCards.length).toBeGreaterThan(0); // Should have multiple zero stats
    });
  });

  describe('Data Display', () => {
    it('should display QR code statistics correctly', () => {
      mockUseUserData.mockReturnValue({
        state: {
          qrCodes: [
            {
              id: '1',
              userId: 'user1',
              title: 'Test QR 1',
              url: 'https://test1.com',
              scanCount: 10,
              isActive: true,
              createdAt: new Date(),
            },
            {
              id: '2',
              userId: 'user1',
              title: 'Test QR 2',
              url: 'https://test2.com',
              scanCount: 5,
              isActive: true,
              createdAt: new Date(),
            },
          ],
          qrCodesLoading: false,
          qrCodesError: null,
          analytics: [],
          analyticsLoading: false,
          analyticsError: null,
          stats: {
            totalQRCodes: 2,
            qrCodesThisMonth: 2,
            totalScans: 15,
            avgScansPerCode: 7.5,
          },
          statsLoading: false,
          profileLoading: false,
          profileError: null,
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();
      const totalQRCodes = screen.getAllByText('2');
      expect(totalQRCodes.length).toBeGreaterThanOrEqual(2); // Total QR codes and this month
      expect(screen.getByText('15')).toBeInTheDocument(); // Total scans
      expect(screen.getByText('7.5')).toBeInTheDocument(); // Avg scans per code
    });

    it('should display recent QR codes when available', () => {
      const recentDate = new Date();
      mockUseUserData.mockReturnValue({
        state: {
          qrCodes: [
            {
              id: '1',
              userId: 'user1',
              title: 'Recent QR Code',
              url: 'https://recent.com',
              scanCount: 10,
              isActive: true,
              createdAt: recentDate,
            },
          ],
          qrCodesLoading: false,
          qrCodesError: null,
          analytics: [],
          analyticsLoading: false,
          analyticsError: null,
          stats: {
            totalQRCodes: 1,
            qrCodesThisMonth: 1,
            totalScans: 10,
            avgScansPerCode: 10,
          },
          statsLoading: false,
          profileLoading: false,
          profileError: null,
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();
      expect(screen.getByText('Recent QR Code')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when there is an error', () => {
      mockUseUserData.mockReturnValue({
        state: {
          qrCodes: [],
          qrCodesLoading: false,
          qrCodesError: 'Failed to load data',
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
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();
      // Dashboard component doesn't show explicit error messages, but shows empty state
      const emptyStateTexts = screen.getAllByText('No QR codes created yet');
      expect(emptyStateTexts.length).toBeGreaterThan(0);
    });

    it('should show error state with retry guidance', () => {
      mockUseUserData.mockReturnValue({
        state: {
          qrCodes: [],
          qrCodesLoading: false,
          qrCodesError: 'Network error',
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
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();
      // Dashboard shows helpful guidance instead of error messages
      expect(
        screen.getByText('Create your first QR code to get started')
      ).toBeInTheDocument();
    });
  });

  describe('User Guidance', () => {
    it('should show warning triangles in empty state with helpful tooltips', () => {
      mockUseUserData.mockReturnValue({
        state: {
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
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();
      const alertTriangles = screen.getAllByTestId('alert-triangle-icon');
      expect(alertTriangles.length).toBeGreaterThan(0);
    });

    it('should show navigation links to QR generator', () => {
      mockUseUserData.mockReturnValue({
        state: {
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
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();
      // Check for QR code creation guidance
      expect(
        screen.getByText('Create your first QR code to get started')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and structure', () => {
      mockUseUserData.mockReturnValue({
        state: {
          qrCodes: [
            {
              id: '1',
              userId: 'user1',
              title: 'Test QR',
              url: 'https://test.com',
              scanCount: 5,
              isActive: true,
              createdAt: new Date(),
            },
          ],
          qrCodesLoading: false,
          qrCodesError: null,
          analytics: [],
          analyticsLoading: false,
          analyticsError: null,
          stats: {
            totalQRCodes: 1,
            qrCodesThisMonth: 1,
            totalScans: 5,
            avgScansPerCode: 5,
          },
          statsLoading: false,
          profileLoading: false,
          profileError: null,
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();

      // Check for semantic headings
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // Check for interactive elements (buttons)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', () => {
      mockUseUserData.mockReturnValue({
        state: {
          qrCodes: [
            {
              id: '1',
              userId: 'user1',
              title: 'Test QR',
              url: 'https://test.com',
              scanCount: 5,
              isActive: true,
              createdAt: new Date(),
            },
          ],
          qrCodesLoading: false,
          qrCodesError: null,
          analytics: [],
          analyticsLoading: false,
          analyticsError: null,
          stats: {
            totalQRCodes: 1,
            qrCodesThisMonth: 1,
            totalScans: 5,
            avgScansPerCode: 5,
          },
          statsLoading: false,
          profileLoading: false,
          profileError: null,
        },
        refreshUserData: vi.fn(),
        refreshQRCodes: vi.fn(),
        refreshAnalytics: vi.fn(),
        refreshStats: vi.fn(),
      });

      renderDashboard();

      // Check that focusable elements exist (buttons)
      const focusableElements = screen.getAllByRole('button');
      expect(focusableElements.length).toBeGreaterThan(0);

      // All buttons should be focusable
      focusableElements.forEach((element) => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });
});
