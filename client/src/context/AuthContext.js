import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const initialAuthState = {
    isAuthenticated: !!localStorage.getItem('token'),
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),
  };
  
  const [authData, setAuthData] = useState(initialAuthState);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (token && user) {
        setAuthData({
          isAuthenticated: true,
          token: token,
          user: user,
        });
      }
    };

    checkAuthStatus();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthData({ isAuthenticated: false, token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ authData, setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
