'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken, saveToken, clearToken } from '@/lib/storage';
import type { User } from '@/lib/types';

type Ctx = {
  user: User | null;
  token: string | null;
  isLoading: boolean;     // 🆕 loading state for initialization
  login(email: string, password: string): Promise<void>;
  signup(name: string, email: string, password: string): Promise<void>;
  logout(): void;
  refreshMe(): Promise<void>;
  notifVersion: number;   // 🆕 bell ko trigger karne ke liye
};

const AuthContext = createContext<Ctx>({
  user: null,
  token: null,
  isLoading: true,  // Start with loading true
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshMe: async () => {},
  notifVersion: 0
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);    // 🆕 loading state
  const [notifVersion, setNotifVersion] = useState(0); // 🆕 new state

  useEffect(() => {
    console.log("🔑 AuthContext initializing...");
    const t = getToken();
    console.log("🔑 Found token in storage:", !!t);
    
    if (t) {
      setToken(t);
      console.log("🔑 Token set, refreshing user...");
      refreshMe().then(() => {
        console.log("✅ User refreshed successfully");
        setIsLoading(false);  // 🆕 Set loading false after user loaded
      }).catch((error) => {
        console.log("❌ refreshMe failed in useEffect:", error);
        setIsLoading(false);  // 🆕 Set loading false even on error
      });
    } else {
      console.log("❌ No token found, user not logged in");
      setIsLoading(false);    // 🆕 Set loading false when no token
    }
  }, []);

  async function login(email: string, password: string) {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;

      setToken(token);
      setUser(user);
      saveToken(token);

      // Auth is ready; ensure loading is false so UI updates immediately
      setIsLoading(false);

      // login ke baad bell ko trigger karo
      setNotifVersion(v => v + 1);

    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      throw err;
    }
  }

  async function signup(name: string, email: string, password: string) {
    try {
      await api.post('/auth/signup', { name, email, password });
      await login(email, password);
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      throw err;
    }
  }

  function logout() {
    clearToken();
    setToken(null);
    setUser(null);
    setIsLoading(false);
    setNotifVersion(v => v + 1); // logout par bhi bell reset
  }

  async function refreshMe() {
    console.log('🔄 refreshMe called');
    try {
      console.log('🌐 Making API request to /users/me');
      const { data } = await api.get<User>('/users/me');
      console.log('✅ User data received:', data);
      setUser(data);
      setIsLoading(false);
    } catch (error) {
      console.log('❌ refreshMe failed:', error);
      logout();
    }
  }

  console.log('🔄 AuthContext provider rendering with:', { user: !!user, token: !!token, isLoading, notifVersion });
  
  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, refreshMe, notifVersion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
