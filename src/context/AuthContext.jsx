import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch any existing session on app load
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        const currentSession = await authService.getSession();
        if (currentUser && currentSession) {
          setUser(currentUser);
          setSession(currentSession);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth init error', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Subscribe to future auth state changes (login, logout, token refresh)
    const unsubscribe = authService.onAuthStateChange((authUser, authSession) => {
      if (authUser || authSession) {
        setUser(authUser);
        setSession(authSession);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
      }
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      const userSession = await authService.getSession();
      setUser(loggedUser);
      setSession(userSession);
      setIsAuthenticated(true);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const newUser = await authService.signup(profileData);
      const userSession = await authService.getSession();
      setUser(newUser);
      setSession(userSession);
      setIsAuthenticated(true);
      return newUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (updates) => {
    const updated = await authService.updateUser(updates);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated,
      loading,
      login,
      signup,
      updateUserProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};