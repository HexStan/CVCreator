import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth.me()
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password, remember) => {
    const d = await api.auth.login(username, password, remember);
    setUser(d.user);
    return d;
  }, []);

  const register = useCallback(async (username, password) => {
    const d = await api.auth.register(username, password);
    setUser(d.user);
    return d;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  const changeUsername = useCallback(async (newUsername, password) => {
    const d = await api.auth.changeUsername(newUsername, password);
    setUser(d.user);
    return d;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const d = await api.auth.changePassword(currentPassword, newPassword);
    return d;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, changeUsername, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
