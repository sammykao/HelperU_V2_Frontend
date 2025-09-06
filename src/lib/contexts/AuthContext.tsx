import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../api/client';
import { authApi, CurrentUser, ProfileStatusResponse } from '../api/auth';

interface AuthContextType {
  user: CurrentUser | null;
  profileStatus: ProfileStatusResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string, user: CurrentUser) => void;
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
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!apiClient;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        apiClient.setToken(token);
        try {
          const status = await authApi.getProfileStatus();
          setProfileStatus(status);
        } catch (error) {
          console.error('Failed to verify token:', error);
          localStorage.removeItem('access_token');
          apiClient.setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (accessToken: string, userData: CurrentUser) => {
    setToken(accessToken);
    apiClient.setToken(accessToken);
    setUser(userData);
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
      localStorage.removeItem('access_token');
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
