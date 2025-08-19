import React from 'react';
import { useAdminErrors } from '@/contexts/AdminErrorContext';

// Loading States
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function LoadingSpinner({ size = 'md', color = 'primary', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  height?: string;
}

export function LoadingSkeleton({ lines = 3, className = '', height = 'h-4' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded ${height} mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  skeleton?: boolean;
  skeletonLines?: number;
  className?: string;
  retryAction?: () => void;
}

export function LoadingState({
  loading,
  error,
  children,
  skeleton = false,
  skeletonLines = 3,
  className = '',
  retryAction
}: LoadingStateProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        {skeleton ? (
          <LoadingSkeleton lines={skeletonLines} className="w-full" />
        ) : (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          {retryAction && (
            <button
              onClick={retryAction}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Stats Cards
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  loading = false,
  className = ''
}: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow border ${className}`}>
        <LoadingSkeleton lines={2} />
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColors[changeType]}`}>
              {changeType === 'positive' && '↗'} 
              {changeType === 'negative' && '↘'} 
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-blue-600 text-2xl">{icon}</div>
        )}
      </div>
    </div>
  );
}

// Data Table
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  className = '',
  onSort,
  sortKey,
  sortDirection
}: DataTableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (onSort && columns.find(col => col.key === key)?.sortable) {
      const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(key, newDirection);
    }
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <LoadingState loading={loading} error={error} skeleton>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${column.className || ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="text-gray-400">
                          {sortKey === column.key ? (
                            sortDirection === 'asc' ? '↑' : '↓'
                          ) : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                          column.className || ''
                        }`}
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </LoadingState>
    </div>
  );
}

// Error Display Component
interface ErrorDisplayProps {
  title?: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = 'Error',
  message,
  severity = 'error',
  onRetry,
  onDismiss,
  className = ''
}: ErrorDisplayProps) {
  const { addError } = useAdminErrors();

  const severityStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    critical: 'bg-red-100 border-red-300 text-red-900'
  };

  const severityIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    critical: '🔥'
  };

  React.useEffect(() => {
    if (severity === 'error' || severity === 'critical') {
      addError({
        title,
        message,
        severity,
        context: { component: 'ErrorDisplay' }
      });
    }
  }, [message, severity, title, addError]);

  return (
    <div className={`p-4 rounded-lg border ${severityStyles[severity]} ${className}`}>
      <div className="flex items-start">
        <div className="mr-3 text-lg">{severityIcons[severity]}</div>
        <div className="flex-1">
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm">{message}</p>
          <div className="mt-3 flex space-x-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Actions Component
interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActions({ actions, className = '' }: QuickActionsProps) {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            variantStyles[action.variant || 'primary']
          }`}
        >
          {action.loading ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <span className="text-sm">{action.icon}</span>
          )}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
