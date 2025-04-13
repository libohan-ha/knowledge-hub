import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbtgwklzktppapdrthkn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidGd3a2x6a3RwcGFwZHJ0aGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MzAxOTgsImV4cCI6MjA1OTUwNjE5OH0.zV7wawAtJL8ZY8o8h0liWgxwGw0CYEfTsaFU_PoBpgc';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidGd3a2x6a3RwcGFwZHJ0aGtuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzkzMDE5OCwiZXhwIjoyMDU5NTA2MTk4fQ.mUinGe9Lg47azyX9K7EhP_eq9ksRj7TZ4trlo5rPETk';

// 使用单例模式创建 Supabase 客户端，避免重复初始化
let supabaseInstance = null;

/**
 * 获取Supabase客户端实例
 * @param {string} [customToken] - 可选的自定义令牌
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getSupabaseClient(customToken) {
  // 如果提供了自定义令牌，创建新的实例
  if (customToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Cache-Control': 'no-cache',
        },
      },
    });
  }

  // 否则返回或创建单例实例
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // 启用会话持久化
      storageKey: 'supabase_auth_token',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'Cache-Control': 'no-cache',
      },
    },
  });

  return supabaseInstance;
}

// 创建使用服务角色权限的客户端
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
});

// 导出默认客户端
export const supabase = getSupabaseClient();

// 导出服务角色客户端
export { supabaseAdmin };

// 导出获取客户端的函数，用于服务器端组件
export { getSupabaseClient };
