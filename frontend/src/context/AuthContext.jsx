import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          setLoading(false);
          return;
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      
      // Auto-login con credenciales por defecto si no hay token válido
      try {
        const { data } = await api.post('/auth/login', { 
          email: 'marcogarridocepeda@gmail.com', 
          password: '123456' 
        });
        localStorage.setItem('token', data.token);
        setUser(data.user);
      } catch (err) {
        console.error('Auto login failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
