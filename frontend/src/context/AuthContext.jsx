import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: '1', name: 'Administrador', email: 'marcogarridocepeda@gmail.com', role: 'ADMIN' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Almacenamos un token mockeado para solicitudes del cliente
    localStorage.setItem('token', 'always-logged-in-token');
  }, []);

  const login = async (email, password) => {
    setUser({ id: '1', name: 'Administrador', email: 'marcogarridocepeda@gmail.com', role: 'ADMIN' });
  };

  const logout = () => {
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
