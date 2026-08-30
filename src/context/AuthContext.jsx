import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

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

  const abhaLogin = useCallback(async (abhaAddress, otp, transactionId) => {
    setLoading(true);
    try {
      const loggedUser = await authService.abhaLogin(abhaAddress, otp, transactionId);
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
    // Clear any saved attendant session
    try { sessionStorage.removeItem('attendant_session'); } catch (_) {}
  }, []);

  // ─── Family-member session switching ─────────────────────────
  // Before switching to a family member we persist the current
  // (attendant's) session so we can restore it later without
  // requiring the attendant to re-type their own password.

  const switchToMember = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // Save the current (attendant) session to sessionStorage
      const currentSession = await authService.getSession();
      if (currentSession?.access_token) {
        try {
          sessionStorage.setItem('attendant_session', JSON.stringify({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token,
          }));
        } catch (_) { /* sessionStorage unavailable — degraded mode */ }
      }

      // Sign in as the family member (password-gated)
      await authService.switchToMember(email, password);

      // The onAuthStateChange listener will fire and update user/session
      const newSession = await authService.getSession();
      if (newSession?.user) {
        const profile = await authService.getCurrentUser();
        setUser(profile);
        setSession(newSession);
        setIsAuthenticated(true);
      }
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  const returnToAttendant = useCallback(async () => {
    setLoading(true);
    try {
      const saved = sessionStorage.getItem('attendant_session');
      if (!saved) {
        throw new Error('No saved attendant session — you may need to log in again.');
      }
      const { access_token, refresh_token } = JSON.parse(saved);

      // Restore the attendant's session
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) throw error;

      // Clear the saved session
      try { sessionStorage.removeItem('attendant_session'); } catch (_) {}

      // Update context
      const restoredSession = await authService.getSession();
      if (restoredSession?.user) {
        const profile = await authService.getCurrentUser();
        setUser(profile);
        setSession(restoredSession);
        setIsAuthenticated(true);
      }
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated,
      loading,
      login,
      abhaLogin,
      signup,
      updateUserProfile,
      logout,
      switchToMember,
      returnToAttendant
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