import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserModel } from '../../../src/app/auth/user.model';

describe('UserModel', () => {
  const now = new Date('2026-01-01T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exposes the token only until its expiration time', () => {
    const user = new UserModel('guest@example.com', 'user-1', 'test-token', new Date(+now + 1000));

    expect(user.getToken).toBe('test-token');

    vi.advanceTimersByTime(1000);

    expect(user.getToken).toBeNull();
  });

  it('rejects an already expired token', () => {
    const user = new UserModel('guest@example.com', 'user-1', 'test-token', new Date(+now - 1));

    expect(user.getToken).toBeNull();
  });

  it('rejects an invalid expiration date', () => {
    const user = new UserModel('guest@example.com', 'user-1', 'test-token', new Date('invalid'));

    expect(user.getToken).toBeNull();
  });

  it('rejects an empty token even when the expiration date is in the future', () => {
    const user = new UserModel('guest@example.com', 'user-1', '', new Date(+now + 1000));

    expect(user.getToken).toBeNull();
  });
});
