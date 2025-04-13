import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // 获取令牌
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
      // 删除会话
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('token', token);

      if (error) {
        console.error('Error deleting session:', error);
        // 即使删除会话失败，仍然继续清除cookie
      }
    }

    // 清除cookie
    cookieStore.delete('auth_token');

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: '登出失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
