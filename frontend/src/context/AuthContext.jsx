import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('campusmate-token'));
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load user from token on mount
  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('campusmate-token');
    if (!storedToken) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const res = await getProfile(storedToken);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(storedToken);
      } else {
        // Token invalid
        localStorage.removeItem('campusmate-token');
        setToken(null);
        setUser(null);
      }
    } catch {
      // If profile fetch fails with 401, clear token
      localStorage.removeItem('campusmate-token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (emailOrRegister, password) => {
    const res = await apiLogin(emailOrRegister, password);
    if (res.success && res.token) {
      localStorage.setItem('campusmate-token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (formData) => {
    const res = await apiRegister(formData);
    return res;
  };

  const logout = async () => {
    try {
      if (token) {
        await apiLogout(token);
      }
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('campusmate-token');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    initialized,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    loadUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;