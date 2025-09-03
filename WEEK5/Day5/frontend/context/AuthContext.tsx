'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken, saveToken, clearToken } from '@/lib/storage';
import { toast } from 'react-hot-toast';
import { refreshSocket, disconnectSocket } from '@/lib/socket';

type User = { id?: string; _id?: string; name: string; email: string; username?: string; phone?: string } | null;

type Ctx = {
  user: User;
  token: string | null;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  signup(input: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
    captchaToken?: string;
  }): Promise<void>;
  logout(): void;
  refreshMe(): Promise<void>;
};

const AuthContext = createContext<Ctx>({
  user: null,
  token: null,
  isLoading: true,
  async login() {},
  async signup() {},
  logout() {},
  async refreshMe() {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (t) {
      setToken(t);
      // Ensure socket authenticates with the stored token on first load
      try { refreshSocket(); } catch {}
      refreshMe().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    try {
      console.log('Attempting login with:', { 
        email, 
        baseURL: api.defaults.baseURL,
        fullURL: `${api.defaults.baseURL}/auth/login`
      });
      
      // Direct fetch to backend
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Direct fetch response:', data);
      
      const accessToken: string = data?.access_token || data?.token;
      if (!accessToken) throw new Error('Token missing');
      saveToken(accessToken);
      setToken(accessToken);
      // Reconnect socket with new token so server joins correct user room
      try { refreshSocket(); } catch {}
      await refreshMe();
      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Login failed';
      toast.error(errorMsg);
      throw error;
    }
  }

  async function signup(input: { name: string; username: string; email: string; phone: string; password: string; confirmPassword: string; termsAccepted: boolean; captchaToken?: string; }) {
    try {
      await api.post('/auth/register', input);
      await login(input.email, input.password);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  }

  function logout() {
    clearToken();
    setToken(null);
    setUser(null);
    // Cleanly drop socket auth context on logout
    try { disconnectSocket(); } catch {}
  }

  async function refreshMe() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data?.user ?? null);
    } catch (error) {
      console.error('RefreshMe failed:', error);
      // If token is invalid, clear it
      clearToken();
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
