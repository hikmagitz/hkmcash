import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
}

interface TransactionContextType {
  // États d'authentification
  isAuthenticated: boolean;
  user: User | null;
  
  // Fonctions d'authentification
  login: () => void;
  logout: () => void;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    setIsAuthenticated(true);
    setUser({ name: 'Utilisateur Demo' });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <TransactionContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};