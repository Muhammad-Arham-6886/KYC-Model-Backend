import reducer, { login, logout, setLoading } from '../authSlice';

describe('authSlice reducer (vitest)', () => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    loading: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle setLoading', () => {
    const next = reducer(initialState, setLoading(true));
    expect(next.loading).toBe(true);
  });

  it('should handle login', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test User' };
    const next = reducer(initialState, login(user));
    expect(next.isAuthenticated).toBe(true);
    expect(next.user).toEqual(user);
    expect(next.loading).toBe(false);
  });

  it('should handle logout', () => {
    const loggedIn = { isAuthenticated: true, user: { id: '1', email: 'a', name: 'b' }, loading: false };
    const next = reducer(loggedIn as any, logout());
    expect(next.isAuthenticated).toBe(false);
    expect(next.user).toBeNull();
  });
});
