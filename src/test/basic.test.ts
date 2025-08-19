import { describe, it, expect } from 'vitest';

describe('Testing Infrastructure', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
