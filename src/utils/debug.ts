// Debug utilities for blog system
// Toggle DEBUG_ENABLED to control all debug logging

const DEBUG_ENABLED = false; // Set to true to enable debug logs

export const debugLog = {
  blogPost: (message: string, data?: any) => {
    if (DEBUG_ENABLED) {
      console.log(`🔍 [BlogPost] ${message}`, data || '');
    }
  },
  
  useBlog: (message: string, data?: any) => {
    if (DEBUG_ENABLED) {
      console.log(`🔍 [useBlog] ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (DEBUG_ENABLED) {
      console.error(`❌ ${message}`, error || '');
    }
  },
  
  performance: (label: string, fn: () => void) => {
    if (DEBUG_ENABLED) {
      console.time(label);
      fn();
      console.timeEnd(label);
    } else {
      fn();
    }
  }
};

// Usage:
// debugLog.blogPost('Component render', { slug, loading, post: post ? 'exists' : 'null' });
// debugLog.useBlog('Firebase query completed', { empty: snapshot.empty });
// debugLog.error('Error fetching post', error);
