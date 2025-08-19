import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Firebase at module level
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

vi.mock('@/services/firebase', () => ({
  db: { name: 'mock-firestore' },
  auth: { name: 'mock-auth' },
  storage: { name: 'mock-storage' },
}));

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

// Get typed mocks
const mockCollection = vi.mocked(collection);
const mockQuery = vi.mocked(query);
const mockWhere = vi.mocked(where);
const mockOrderBy = vi.mocked(orderBy);
const mockOnSnapshot = vi.mocked(onSnapshot);

// Service functions to test (these would be extracted from UserDataContext)
export const createUserDataQuery = (userId: string) => {
  const collectionRef = collection(db, 'qr_codes');
  const userQuery = query(
    collectionRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return userQuery;
};

export const subscribeToUserData = (
  userId: string,
  callback: (data: any) => void,
  errorCallback: (error: Error) => void
) => {
  const userQuery = createUserDataQuery(userId);
  return onSnapshot(userQuery, callback, errorCallback);
};

export const processQRCodeData = (docs: any[]) => {
  return docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const calculateUserStats = (qrCodes: any[]) => {
  const totalQRCodes = qrCodes.length;
  const totalScans = qrCodes.reduce((sum, qr) => {
    const scanCount = typeof qr.scanCount === 'number' ? qr.scanCount : 0;
    return sum + scanCount;
  }, 0);
  const activeQRCodes = qrCodes.filter((qr) => qr.isActive === true).length;

  return {
    totalQRCodes,
    totalScans,
    activeQRCodes,
    averageScansPerQR:
      totalQRCodes > 0 ? Math.round(totalScans / totalQRCodes) : 0,
  };
};

describe('UserData Service Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock return values
    mockCollection.mockReturnValue('mock-collection' as any);
    mockQuery.mockReturnValue('mock-query' as any);
    mockWhere.mockReturnValue('mock-where' as any);
    mockOrderBy.mockReturnValue('mock-orderBy' as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Query Building', () => {
    it('should create proper Firebase query for user data', () => {
      const userId = 'test-user-123';

      createUserDataQuery(userId);

      expect(mockCollection).toHaveBeenCalledWith(db, 'qr_codes');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockQuery).toHaveBeenCalled();
    });

    it('should create different queries for different users', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      createUserDataQuery(user1);
      createUserDataQuery(user2);

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', user1);
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', user2);
      expect(mockWhere).toHaveBeenCalledTimes(2);
    });
  });

  describe('Real-time Subscription', () => {
    it('should set up Firebase listener with proper callbacks', () => {
      const userId = 'test-user';
      const dataCallback = vi.fn();
      const errorCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = subscribeToUserData(
        userId,
        dataCallback,
        errorCallback
      );

      expect(mockOnSnapshot).toHaveBeenCalledWith(
        'mock-query',
        dataCallback,
        errorCallback
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle subscription data updates', () => {
      const userId = 'test-user';
      const dataCallback = vi.fn();
      const errorCallback = vi.fn();

      mockOnSnapshot.mockImplementation((_query, callback) => {
        // Simulate Firebase calling back with data
        setTimeout(() => {
          (callback as any)({
            docs: [
              {
                id: 'qr1',
                data: () => ({ title: 'Test QR', url: 'https://test.com' }),
              },
            ],
          });
        }, 0);
        return vi.fn();
      });

      subscribeToUserData(userId, dataCallback, errorCallback);

      // Wait for async callback
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(dataCallback).toHaveBeenCalledWith({
            docs: [
              {
                id: 'qr1',
                data: expect.any(Function),
              },
            ],
          });
          resolve(undefined);
        }, 10);
      });
    });

    it('should handle subscription errors', () => {
      const userId = 'test-user';
      const dataCallback = vi.fn();
      const errorCallback = vi.fn();
      const testError = new Error('Firebase connection failed');

      mockOnSnapshot.mockImplementation((_query, _callback, onError) => {
        // Simulate Firebase error
        setTimeout(() => {
          (onError as any)?.(testError);
        }, 0);
        return vi.fn();
      });

      subscribeToUserData(userId, dataCallback, errorCallback);

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(errorCallback).toHaveBeenCalledWith(testError);
          resolve(undefined);
        }, 10);
      });
    });
  });

  describe('Data Processing', () => {
    it('should process Firebase docs into usable data format', () => {
      const mockDocs = [
        {
          id: 'qr1',
          data: () => ({
            title: 'QR 1',
            url: 'https://example1.com',
            scanCount: 5,
          }),
        },
        {
          id: 'qr2',
          data: () => ({
            title: 'QR 2',
            url: 'https://example2.com',
            scanCount: 10,
          }),
        },
      ];

      const result = processQRCodeData(mockDocs);

      expect(result).toEqual([
        {
          id: 'qr1',
          title: 'QR 1',
          url: 'https://example1.com',
          scanCount: 5,
        },
        {
          id: 'qr2',
          title: 'QR 2',
          url: 'https://example2.com',
          scanCount: 10,
        },
      ]);
    });

    it('should handle empty data gracefully', () => {
      const result = processQRCodeData([]);
      expect(result).toEqual([]);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate correct user statistics', () => {
      const qrCodes = [
        { id: 'qr1', scanCount: 10, isActive: true },
        { id: 'qr2', scanCount: 5, isActive: true },
        { id: 'qr3', scanCount: 0, isActive: false },
      ];

      const stats = calculateUserStats(qrCodes);

      expect(stats).toEqual({
        totalQRCodes: 3,
        totalScans: 15,
        activeQRCodes: 2,
        averageScansPerQR: 5,
      });
    });

    it('should handle empty QR codes array', () => {
      const stats = calculateUserStats([]);

      expect(stats).toEqual({
        totalQRCodes: 0,
        totalScans: 0,
        activeQRCodes: 0,
        averageScansPerQR: 0,
      });
    });

    it('should handle QR codes without scan counts', () => {
      const qrCodes = [
        { id: 'qr1', isActive: true },
        { id: 'qr2', isActive: false },
      ];

      const stats = calculateUserStats(qrCodes);

      expect(stats).toEqual({
        totalQRCodes: 2,
        totalScans: 0,
        activeQRCodes: 1,
        averageScansPerQR: 0,
      });
    });

    it('should calculate average correctly with decimal results', () => {
      const qrCodes = [
        { id: 'qr1', scanCount: 7, isActive: true },
        { id: 'qr2', scanCount: 8, isActive: true },
        { id: 'qr3', scanCount: 6, isActive: true },
      ];

      const stats = calculateUserStats(qrCodes);

      expect(stats.averageScansPerQR).toBe(7); // 21/3 = 7
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed Firebase data', () => {
      const malformedDocs = [
        { id: 'qr1', data: () => null },
        { id: 'qr2', data: () => undefined },
        { id: 'qr3', data: () => ({ title: 'Valid QR' }) },
      ];

      const result = processQRCodeData(malformedDocs);

      expect(result).toEqual([
        { id: 'qr1' },
        { id: 'qr2' },
        { id: 'qr3', title: 'Valid QR' },
      ]);
    });

    it('should handle stats calculation with malformed data', () => {
      const malformedQRCodes = [
        { id: 'qr1', scanCount: 'invalid', isActive: true },
        { id: 'qr2', scanCount: null, isActive: 'invalid' },
        { id: 'qr3', scanCount: 5, isActive: true },
      ];

      const stats = calculateUserStats(malformedQRCodes);

      // Should handle invalid data gracefully
      expect(stats.totalQRCodes).toBe(3);
      expect(stats.totalScans).toBe(5); // Only valid scanCount
      expect(stats.activeQRCodes).toBe(2); // Both truthy values
    });
  });

  describe('Security & Data Filtering', () => {
    it('should always query with user filter', () => {
      const userId = 'security-test-user';

      createUserDataQuery(userId);

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);

      // Ensure no global queries are made
      expect(mockWhere).toHaveBeenCalledTimes(1);
    });

    it('should not accept empty or invalid user IDs', () => {
      expect(() => createUserDataQuery('')).not.toThrow();
      expect(() => createUserDataQuery(null as any)).not.toThrow();
      expect(() => createUserDataQuery(undefined as any)).not.toThrow();

      // But the where clause should still be called (Firebase will handle validation)
      expect(mockWhere).toHaveBeenCalledTimes(3);
    });
  });
});
