import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取令牌
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ error: '未认证' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 查找会话
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      console.error('Session not found or error:', sessionError);
      return new Response(
        JSON.stringify({ error: '会话已过期或无效' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查会话是否过期
    if (new Date(session.expires_at) < new Date()) {
      console.log('Session expired');
      return new Response(
        JSON.stringify({ error: '会话已过期' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      console.error('User not found or error:', userError);
      return new Response(
        JSON.stringify({ error: '用户不存在' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(user),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting current user:', error);
    return new Response(
      JSON.stringify({ error: '获取用户信息失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
