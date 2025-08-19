# Debug System Documentation

## Overview

The blog system includes a comprehensive debug utility that can be easily toggled for development and production.

## Quick Toggle

To enable/disable all debug logs, simply change one line in `/src/utils/debug.ts`:

```typescript
const DEBUG_ENABLED = true; // Enable debug logs
const DEBUG_ENABLED = false; // Disable debug logs (production)
```

## Debug Categories

### 🔍 BlogPost Debugging

- Component render cycles
- Data fetching process
- Loading state changes
- Post rendering status

### 🔍 useBlog Hook Debugging

- Firebase queries
- Mock data fallbacks
- Function calls
- Data retrieval status

### ❌ Error Tracking

- Centralized error logging
- Stack traces (when enabled)
- Fallback behavior tracking

## Usage Examples

### Basic Logging

```typescript
debugLog.blogPost('Component render', { slug, loading });
debugLog.useBlog('Firebase query completed', { empty: snapshot.empty });
```

### Error Logging

```typescript
debugLog.error('Error fetching post', error);
```

### Performance Tracking

```typescript
debugLog.performance('Firebase Query', () => {
  // Your code here
});
```

## Production vs Development

### Development Mode (`DEBUG_ENABLED = true`)

- Full console logging with emojis
- Performance timing
- Detailed data inspection
- Error stack traces

### Production Mode (`DEBUG_ENABLED = false`)

- Zero console output
- No performance overhead
- Clean user experience
- Optimized bundle size

## Benefits

1. **Easy Toggle**: One-line change enables/disables all logging
2. **Categorized**: Different log types for different systems
3. **Performance Safe**: No overhead when disabled
4. **Future Proof**: Easy to extend for new features
5. **Maintainable**: Clean, organized debug structure

## Adding New Debug Points

```typescript
// In any component
import { debugLog } from '@/utils/debug';

// Use in your code
debugLog.blogPost('Your message', optionalData);
debugLog.useBlog('Your message', optionalData);
debugLog.error('Error message', errorObject);
```

## Current Status

Debug system is **DISABLED** for production deployment.
All previous console.log statements have been replaced with the debug system.
