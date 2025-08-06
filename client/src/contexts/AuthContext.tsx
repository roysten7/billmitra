import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types/routes';
import { api } from '../lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantId?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user data from token
  const loadUser = async () => {
    try {
      console.log('AuthContext - loadUser called');
      const token = localStorage.getItem('token');
      console.log('AuthContext - Token from localStorage:', token ? 'exists' : 'not found');
      
      if (!token) {
        console.log('AuthContext - No token found, setting loading to false');
        setIsLoading(false);
        return;
      }

      console.log('AuthContext - Fetching user data with token');
      const response = await api.get<{
        id: string;
        name: string;
        email: string;
        role: UserRole;
        restaurantId?: string;
      }>('/auth/me', token);
      
      if (response.error) {
        console.error('AuthContext - Error fetching user data:', response.error);
        throw new Error(response.error);
      }

      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post<{
        id: string;
        name: string;
        email: string;
        role: UserRole;
        token: string;
      }>('/auth/login', { email, password });
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data?.token) {
        throw new Error('No token received');
      }

      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error instanceof Error ? error : new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);
      const response = await api.post<{
        id: string;
        name: string;
        email: string;
        role: UserRole;
        token: string;
      }>('/auth/register', { name, email, password, role });
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data?.token) {
        throw new Error('No token received');
      }

      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error instanceof Error ? error : new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
