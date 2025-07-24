import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextProvider';

function parseJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Asegurar que isAdmin sea booleano
    if (payload && payload.user) {
      payload.user.isAdmin = Boolean(payload.user.isAdmin);
    }
    return payload;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const payload = parseJwt(token);
      if (payload && payload.user) {
        setUser(payload.user);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    const payload = parseJwt(token);
    if (payload && payload.user) {
      setUser(payload.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
