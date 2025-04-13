"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 定义用户类型
export interface User {
  id: string;
  email: string;
}

// 定义认证上下文类型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 登录函数
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '登录失败');
      }

      const userData = await response.json();
      setUser(userData);
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 注册函数
  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '注册失败');
      }

      const userData = await response.json();
      setUser(userData);
      router.push('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const logout = async () => {
    setLoading(true);
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义钩子，用于访问认证上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
