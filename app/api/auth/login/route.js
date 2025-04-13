import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: '邮箱和密码是必填项' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 查找用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: '邮箱或密码不正确' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 验证密码
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return new Response(
        JSON.stringify({ error: '邮箱或密码不正确' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建会话令牌
    const token = await bcrypt.hash(user.id + Date.now().toString(), 8);

    // 设置cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    // 保存会话
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() // 7天后过期
      }]);

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      // 即使会话创建失败，仍然返回成功，因为用户已经验证
    }

    // 返回用户信息（不包含密码）
    return new Response(
      JSON.stringify({ id: user.id, email: user.email }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: '登录失败，请重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
