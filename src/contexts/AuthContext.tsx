import React, { ReactNode, createContext, useState, useContext, useEffect } from 'react';
import { signIn, signOut, getCurrentUser, AuthUser ,fetchUserAttributes } from 'aws-amplify/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser|null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const t_user = await getCurrentUser();
      setIsAuthenticated(true);
      setUser(t_user);
      console.log("user at checkAuthState " , user?.username);
    } catch {
      console.log('No user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const Result  = await signIn({username, password});
      setIsAuthenticated(true);
      //const userAttributes = await fetchUserAttributes();
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(null);
//      socket?.close();

      console.log("logout complete");

    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
