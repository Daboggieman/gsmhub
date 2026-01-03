"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for active session (via HttpOnly cookie) on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { apiClient } = await import('./api');
        const profile = await apiClient.getProfile();
        setUser(profile);
      } catch (err) {
        // Session invalid or expired
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser)); // Optional: persist user details for UI
    router.push('/admin/dashboard');
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error("Logout failed", e);
    }

    setUser(null);
    localStorage.removeItem('auth_user');
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, token: null, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
