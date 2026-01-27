import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cashiers, Cashier } from '@/data/demoData';

interface AuthState {
  isAuthenticated: boolean;
  userType: 'admin' | 'manager' | 'cashier' | null;
  currentUser: Cashier | null;
  sessionId: string | null;
}

interface AuthContextType extends AuthState {
  loginByPin: (pin: string) => boolean;
  logout: () => void;
  getCashierSessions: () => Cashier[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userType: null,
    currentUser: null,
    sessionId: null,
  });

  const loginByPin = useCallback((pin: string): boolean => {
    const user = cashiers.find((c) => c.pin === pin && c.active);
    if (user) {
      setAuthState({
        isAuthenticated: true,
        userType: user.role,
        currentUser: user,
        sessionId: `${user.id}-${Date.now()}`,
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      userType: null,
      currentUser: null,
      sessionId: null,
    });
  }, []);

  const getCashierSessions = useCallback(() => {
    return cashiers.filter((c) => c.active);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loginByPin,
        logout,
        getCashierSessions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
