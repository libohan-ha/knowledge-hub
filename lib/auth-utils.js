import { cookies } from 'next/headers';
import { supabase } from './supabase';

/**
 * 从请求中获取当前认证用户
 * @returns {Promise<{id: string, email: string} | null>} 用户信息或null
 */
export async function getAuthUser() {
  try {
    // 获取认证令牌 - 使用 await
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    // 查找会话
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      console.error('Session not found or error:', sessionError);
      return null;
    }

    // 检查会话是否过期
    if (new Date(session.expires_at) < new Date()) {
      console.log('Session expired');
      return null;
    }

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      console.error('User not found or error:', userError);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * 验证请求是否已认证
 * @returns {Promise<boolean>} 是否已认证
 */
export async function isAuthenticated() {
  const user = await getAuthUser();
  return !!user;
}

/**
 * 获取认证令牌
 * @returns {Promise<string|null>} 认证令牌或null
 */
export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}
