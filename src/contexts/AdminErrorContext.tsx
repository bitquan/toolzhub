/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AdminError {
  id: string;
  title: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    data?: any;
  };
  resolved?: boolean;
  retryable?: boolean;
  retryAction?: () => Promise<void>;
}

interface ErrorState {
  errors: AdminError[];
  notifications: AdminError[];
  dismissedErrors: string[];
  criticalErrorsCount: number;
  showErrorBanner: boolean;
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<AdminError, 'id' | 'timestamp'> }
  | { type: 'RESOLVE_ERROR'; payload: string }
  | { type: 'DISMISS_ERROR'; payload: string }
  | { type: 'RETRY_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'CLEAR_RESOLVED_ERRORS' }
  | { type: 'SET_ERROR_BANNER'; payload: boolean };

interface ErrorContextType extends ErrorState {
  addError: (error: Omit<AdminError, 'id' | 'timestamp'>) => void;
  resolveError: (id: string) => void;
  dismissError: (id: string) => void;
  retryError: (id: string) => Promise<void>;
  clearAllErrors: () => void;
  clearResolvedErrors: () => void;
  setErrorBanner: (show: boolean) => void;

  // Utility functions
  getErrorsByComponent: (component: string) => AdminError[];
  getErrorsBySeverity: (severity: ErrorSeverity) => AdminError[];
  hasUnresolvedCriticalErrors: () => boolean;
  getLatestError: () => AdminError | null;
}

const initialState: ErrorState = {
  errors: [],
  notifications: [],
  dismissedErrors: [],
  criticalErrorsCount: 0,
  showErrorBanner: false,
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const newError: AdminError = {
        ...action.payload,
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      const criticalCount =
        newError.severity === 'critical'
          ? state.criticalErrorsCount + 1
          : state.criticalErrorsCount;

      return {
        ...state,
        errors: [newError, ...state.errors],
        notifications:
          newError.severity === 'critical' || newError.severity === 'error'
            ? [newError, ...state.notifications.slice(0, 4)]
            : state.notifications,
        criticalErrorsCount: criticalCount,
        showErrorBanner: criticalCount > 0 || newError.severity === 'error',
      };
    }

    case 'RESOLVE_ERROR': {
      const updatedErrors = state.errors.map((error) =>
        error.id === action.payload ? { ...error, resolved: true } : error
      );

      const resolvedError = state.errors.find((e) => e.id === action.payload);
      const criticalCount =
        resolvedError?.severity === 'critical'
          ? Math.max(0, state.criticalErrorsCount - 1)
          : state.criticalErrorsCount;

      return {
        ...state,
        errors: updatedErrors,
        criticalErrorsCount: criticalCount,
        showErrorBanner: criticalCount > 0,
      };
    }

    case 'DISMISS_ERROR': {
      return {
        ...state,
        dismissedErrors: [...state.dismissedErrors, action.payload],
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
    }

    case 'RETRY_ERROR': {
      const updatedErrors = state.errors.map((error) =>
        error.id === action.payload ? { ...error, resolved: false } : error
      );

      return {
        ...state,
        errors: updatedErrors,
      };
    }

    case 'CLEAR_ALL_ERRORS': {
      return {
        ...state,
        errors: [],
        notifications: [],
        dismissedErrors: [],
        criticalErrorsCount: 0,
        showErrorBanner: false,
      };
    }

    case 'CLEAR_RESOLVED_ERRORS': {
      const unresolvedErrors = state.errors.filter((error) => !error.resolved);

      return {
        ...state,
        errors: unresolvedErrors,
        notifications: state.notifications.filter(
          (n) => !state.errors.find((e) => e.id === n.id)?.resolved
        ),
      };
    }

    case 'SET_ERROR_BANNER': {
      return {
        ...state,
        showErrorBanner: action.payload,
      };
    }

    default:
      return state;
  }
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function useAdminErrors(): ErrorContextType {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useAdminErrors must be used within an AdminErrorProvider');
  }
  return context;
}

interface AdminErrorProviderProps {
  children: ReactNode;
}

export function AdminErrorProvider({ children }: AdminErrorProviderProps) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = (error: Omit<AdminError, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_ERROR', payload: error });

    // Auto-log critical errors
    if (error.severity === 'critical') {
      console.error('Critical Admin Error:', error);
    }
  };

  const resolveError = (id: string) => {
    dispatch({ type: 'RESOLVE_ERROR', payload: id });
  };

  const dismissError = (id: string) => {
    dispatch({ type: 'DISMISS_ERROR', payload: id });
  };

  const retryError = async (id: string) => {
    const error = state.errors.find((e) => e.id === id);
    if (error?.retryAction) {
      try {
        dispatch({ type: 'RETRY_ERROR', payload: id });
        await error.retryAction();
        resolveError(id);
      } catch (retryErr) {
        addError({
          title: 'Retry Failed',
          message: `Failed to retry action: ${error.title}`,
          severity: 'error',
          context: {
            ...error.context,
            action: 'retry_failed',
          },
        });
      }
    }
  };

  const clearAllErrors = () => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };

  const clearResolvedErrors = () => {
    dispatch({ type: 'CLEAR_RESOLVED_ERRORS' });
  };

  const setErrorBanner = (show: boolean) => {
    dispatch({ type: 'SET_ERROR_BANNER', payload: show });
  };

  // Utility functions
  const getErrorsByComponent = (component: string) => {
    return state.errors.filter(
      (error) => error.context?.component === component && !error.resolved
    );
  };

  const getErrorsBySeverity = (severity: ErrorSeverity) => {
    return state.errors.filter(
      (error) => error.severity === severity && !error.resolved
    );
  };

  const hasUnresolvedCriticalErrors = () => {
    return state.criticalErrorsCount > 0;
  };

  const getLatestError = () => {
    const unresolvedErrors = state.errors.filter((e) => !e.resolved);
    return unresolvedErrors.length > 0 ? unresolvedErrors[0] : null;
  };

  const contextValue: ErrorContextType = {
    ...state,
    addError,
    resolveError,
    dismissError,
    retryError,
    clearAllErrors,
    clearResolvedErrors,
    setErrorBanner,
    getErrorsByComponent,
    getErrorsBySeverity,
    hasUnresolvedCriticalErrors,
    getLatestError,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

// Error boundary component for admin pages
interface AdminErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  component?: string;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AdminErrorBoundary extends React.Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin Error Boundary caught an error:', error, errorInfo);

    // If we have access to the error context, add the error
    // This would need to be passed down or accessed via a global error handler
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[400px] flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-2">⚠️</div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Something went wrong in{' '}
                {this.props.component || 'this component'}
              </h3>
              <p className="text-red-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
