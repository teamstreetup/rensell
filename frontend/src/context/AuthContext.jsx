import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [initializing, setInitializing] = useState(true);

  const persistSession = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setInitializing(false);
      return null;
    }
    try {
      const data = await userAPI.getMe();
      if (data?.user) {
        const normalized = {
          id: data.user._id,
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'user',
          isVerified: Boolean(data.user.isVerified),
          profileImage: data.user.profileImage || '',
          phone: data.user.phone || '',
          bio: data.user.bio || '',
        };
        localStorage.setItem('user', JSON.stringify(normalized));
        setUser(normalized);
        return normalized;
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        logout();
      }
    } finally {
      setInitializing(false);
    }
    return null;
  }, [logout]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(
    async (credentials) => {
      const data = await authAPI.login(credentials);
      persistSession(data.token, data.user);
      return data;
    },
    [persistSession]
  );

  const signup = useCallback(
    async (payload) => {
      const data = await authAPI.signup(payload);
      persistSession(data.token, data.user);
      return data;
    },
    [persistSession]
  );

  const updateLocalUser = useCallback((partial) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...partial };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isAdmin: Boolean(user?.role === 'admin'),
        initializing,
        login,
        signup,
        logout,
        refreshProfile,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
