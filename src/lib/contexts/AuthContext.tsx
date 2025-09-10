import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../api/client';
import { authApi, CurrentUser, ProfileStatusResponse } from '../api/auth';

interface AuthContextType {
  user: CurrentUser | null;
  profileStatus: ProfileStatusResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  authRoute: 'client' | 'helper' | null;
  login: (token: string, user: CurrentUser, authRoute: 'client' | 'helper') => void;
  logout: () => Promise<void>;
  updateProfileStatus: (status: ProfileStatusResponse) => void;
  refreshProfileStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatusResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authRoute, setAuthRoute] = useState<'client' | 'helper' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!apiClient;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedAuthRoute = localStorage.getItem('auth_route') as 'client' | 'helper' | null;
      const storedUser = localStorage.getItem('user_data');
      
      if (token) {
        apiClient.setToken(token);
        setToken(token);
        setAuthRoute(storedAuthRoute);
        
        // Restore user data if available
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
          }
        }
        
        try {
          const status = await authApi.getProfileStatus();
          setProfileStatus(status);
        } catch (error) {
          console.error('Failed to verify token:', error);
          // Clear all auth data on token verification failure
          localStorage.removeItem('access_token');
          localStorage.removeItem('auth_route');
          localStorage.removeItem('user_data');
          apiClient.setToken(null);
          setToken(null);
          setUser(null);
          setAuthRoute(null);
          setProfileStatus(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (accessToken: string, userData: CurrentUser, authRoute: 'client' | 'helper') => {
    setToken(accessToken);
    apiClient.setToken(accessToken);
    setUser(userData);
    setAuthRoute(authRoute);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('auth_route', authRoute);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.setToken(null);
      setUser(null);
      setToken(null);
      setProfileStatus(null);
      setAuthRoute(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_route');
      localStorage.removeItem('user_data');
    }
  };

  const updateProfileStatus = (status: ProfileStatusResponse) => {
    setProfileStatus(status);
  };

  const refreshProfileStatus = async () => {
    try {
      const status = await authApi.getProfileStatus();
      setProfileStatus(status);
    } catch (error) {
      console.error('Failed to refresh profile status:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profileStatus,
    isLoading,
    isAuthenticated,
    token,
    authRoute,
    login,
    logout,
    updateProfileStatus,
    refreshProfileStatus,
  };

  return (
    <AuthContext.Provider value={value}>
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
