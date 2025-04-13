import { saveMultipleItems } from '../../../../lib/db-service';
import { getAuthUser } from '@/lib/auth-utils';

export async function POST(request) {
  try {
    // 获取当前用户
    const user = await getAuthUser();

    // 如果用户未登录，返回未授权错误
    if (!user) {
      return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const classification = await request.json();

    if (!classification || typeof classification !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid classification data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证分类数据结构
    const validCategories = ['articles', 'ideas', 'tasks', 'resources'];
    for (const category of validCategories) {
      if (!Array.isArray(classification[category])) {
        return new Response(JSON.stringify({ error: `Invalid ${category} data` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 批量保存所有分类的内容，传递用户ID
    const results = await saveMultipleItems(classification, user.id);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in batch content API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to save content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
