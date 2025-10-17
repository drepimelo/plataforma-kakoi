import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(checkTokenValidity());

  function checkTokenValidity() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return false;

      const payload = JSON.parse(atob(payloadBase64));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem('token');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('token');
      return false;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  }

  // ⏳ Verifica a cada 60 segundos se o token ainda é válido
  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkTokenValidity()) {
        logout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
