// Lightweight auth reducer and action creators (avoids heavy runtime deps in tests)

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string } | null;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
};

export const setLoading = (payload: boolean) => ({ type: 'auth/setLoading', payload });
export const login = (payload: { id: string; email: string; name: string }) => ({ type: 'auth/login', payload });
export const logout = () => ({ type: 'auth/logout' });

export default function reducer(state: AuthState = initialState, action: any): AuthState {
  switch (action.type) {
    case 'auth/setLoading':
      return { ...state, loading: action.payload };
    case 'auth/login':
      return { ...state, isAuthenticated: true, user: action.payload, loading: false };
    case 'auth/logout':
      return { ...state, isAuthenticated: false, user: null };
    default:
      return state;
  }
}
