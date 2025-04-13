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

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: '邮箱格式不正确' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: '密码长度至少为6个字符' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查邮箱是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      return new Response(
        JSON.stringify({ error: '注册失败，请重试' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: '该邮箱已被注册' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }])
      .select('id, email')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ error: '注册失败，请重试' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建会话令牌
    const token = await bcrypt.hash(newUser.id + Date.now().toString(), 8);

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
        user_id: newUser.id,
        token,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() // 7天后过期
      }]);

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      // 即使会话创建失败，仍然返回成功，因为用户已经创建
    }

    return new Response(
      JSON.stringify({ id: newUser.id, email: newUser.email }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: '注册失败，请重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
