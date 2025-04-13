import { getAllItems, getItemsByCategory, saveItem } from '../../../lib/db-service';
import { getAuthUser } from '@/lib/auth-utils';

export async function GET(request) {
  try {
    // 获取当前用户
    const user = await getAuthUser();
    const userId = user?.id;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    const timestamp = searchParams.get('_'); // 获取时间戳参数
    const refreshKey = searchParams.get('refreshKey'); // 获取刷新键

    // 如果有时间戳或刷新键，强制刷新
    const shouldForceRefresh = forceRefresh || timestamp || refreshKey;
    console.log(`API request with params: category=${category}, forceRefresh=${forceRefresh}, timestamp=${timestamp}, refreshKey=${refreshKey}, shouldForceRefresh=${shouldForceRefresh}`);

    let data;
    if (category) {
      // 如果用户已登录，传递用户ID过滤数据
      data = await getItemsByCategory(category, shouldForceRefresh, userId);
      console.log(`Retrieved ${data?.length || 0} items for category ${category} with forceRefresh=${shouldForceRefresh}`);
    } else {
      // 如果用户已登录，传递用户ID过滤数据
      data = await getAllItems(userId);
      console.log(`Retrieved ${data?.length || 0} items in total`);
    }

    // 生成基于数据的 ETag
    const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 27)}"`;

    // 检查客户端的 If-None-Match 标头
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etag) {
      // 如果 ETag 匹配，返回 304 Not Modified
      return new Response(null, {
        status: 304,
        headers: {
          'Cache-Control': 'private, max-age=5',
          'ETag': etag
        }
      });
    }

    // 构建响应对象，添加时间戳防止缓存
    const responseData = {
      data,
      timestamp: new Date().toISOString(),
      success: true
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // 完全禁止缓存
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'ETag': etag
      }
    });
  } catch (error) {
    console.error('Error in GET all content API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

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

    const { content, category } = await request.json();

    if (!content || !category) {
      return new Response(JSON.stringify({ error: 'Content and category are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 传递用户ID保存数据
    const data = await saveItem(content, category, user.id);

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        // 确保创建响应不被缓存
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in POST content API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to create content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
