// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));  // ✅ Parse the JSON string
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Login function - updates state AND localStorage synchronously
  const login = useCallback((newToken, newUser) => {
    // Update localStorage first
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));  // ✅ Stringify the object
    
    // Then update state
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ✅ Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // ✅ Update user profile (for when profile is updated)
  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  // ✅ Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return;

      const response = await fetch('http://localhost:5000/api/user/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("data",data)
        updateUser(data.user || data);
      } else if (response.status === 401) {
        // Token expired
        logout();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [updateUser, logout]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
