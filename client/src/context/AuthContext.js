import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const initialAuthState = {
    isAuthenticated: !!localStorage.getItem('token'),
    token: localStorage.getItem('token'),
  };

  const [authData, setAuthData] = useState(initialAuthState);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      if (token) {
        // Update auth state based on token presence without backend validation
        setAuthData({
          isAuthenticated: true,
          token: token,
        });
        console.log('Auth state set to authenticated');
      }
      else {
        console.log('No token found, user not authenticated');
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};
