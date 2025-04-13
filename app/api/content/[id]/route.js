import { getItemById, updateItem, deleteItem } from '../../../../lib/db-service';
import { getAuthUser } from '@/lib/auth-utils';

// 获取单个内容项
export async function GET(request, context) {
  try {
    // 获取当前用户
    const user = await getAuthUser();

    // 等待 params，因为它是一个 Promise
    const params = await context.params;
    const id = params.id;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 如果用户未登录，返回未授权错误
    if (!user) {
      return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 传递用户ID获取内容
    const item = await getItemById(id, user.id);

    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET content API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 更新内容项
export async function PUT(request, context) {
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

    // 等待 params，因为它是一个 Promise
    const params = await context.params;
    const id = params.id;
    const requestData = await request.json();
    const { content, category, status, is_read } = requestData;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 如果是已看状态更新
    if (is_read !== undefined) {
      // 获取当前内容，传递用户ID进行权限验证
      const currentItem = await getItemById(id, user.id);
      if (!currentItem) {
        return new Response(JSON.stringify({ error: 'Item not found or you do not have permission to update it' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log(`Updating read status for item ${id} to ${is_read ? 'read' : 'unread'}`);

      // 更新已看状态
      const updatedItem = await updateItem(id, currentItem.content, currentItem.category, user.id, { is_read });

      // 构建响应对象，确保包含 success 字段
      const responseData = {
        ...updatedItem,
        success: true,
        message: is_read ? '文章已标记为已看' : '文章已标记为未看',
        timestamp: new Date().toISOString() // 添加时间戳防止缓存
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // 确保更新响应不被缓存
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // 如果是状态更新
    if (status !== undefined) {
      // 获取当前内容，传递用户ID进行权限验证
      const currentItem = await getItemById(id, user.id);
      if (!currentItem) {
        return new Response(JSON.stringify({ error: 'Item not found or you do not have permission to update it' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 更新内容，添加状态标记
      let newContent = currentItem.content;
      console.log(`Current content before status update: "${newContent}"`);

      // 如果状态是已完成，添加完成标记（如果没有的话）
      if (status === 'completed') {
        // 检查是否已经有完成标记
        const hasCompletionMark = (
          newContent.startsWith('✓') ||
          newContent.startsWith('√') ||
          newContent.startsWith('已完成') ||
          /^[✓√]\s/.test(newContent) ||
          /^已完成/.test(newContent)
        );

        if (!hasCompletionMark) {
          console.log('Adding completion mark to content');
          newContent = `✓ ${newContent}`;
        } else {
          console.log('Content already has completion mark');
        }
      }
      // 如果状态是进行中，移除完成标记（如果有的话）
      else if (status === 'in-progress') {
        // 移除各种可能的完成标记
        newContent = newContent.replace(/^[✓√]\s*/, '');
        newContent = newContent.replace(/^已完成[：:\s]*/, '');
        console.log(`Content after removing completion marks: "${newContent}"`);
      }

      console.log(`Final content after status update: "${newContent}"`);

      const updatedItem = await updateItem(id, newContent, currentItem.category, user.id);

      // 构建响应对象，确保包含 success 字段
      const responseData = {
        ...updatedItem,
        success: true,
        message: status === 'completed' ? '任务已标记为完成' : '任务已标记为进行中',
        timestamp: new Date().toISOString() // 添加时间戳防止缓存
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // 确保更新响应不被缓存
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    // 如果是常规内容更新
    else if (content && category) {
      const updatedItem = await updateItem(id, content, category, user.id);

      return new Response(JSON.stringify(updatedItem), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // 确保更新响应不被缓存
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    else {
      return new Response(JSON.stringify({ error: 'Invalid update data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in PUT content API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to update content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 删除内容项
export async function DELETE(request, context) {
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

    console.log('DELETE request received with context:', context);

    // 等待 params，因为它是一个 Promise
    const params = await context.params;
    console.log('Awaited params:', params);

    // 确保 params 存在并且有 id 属性
    if (!params || typeof params !== 'object') {
      console.error('Invalid params object:', params);
      return new Response(JSON.stringify({ error: 'Invalid request parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取 id
    const id = params.id;
    console.log(`Extracted ID from params: ${id}`);

    if (!id) {
      console.error('Missing ID in params:', params);
      return new Response(JSON.stringify({ error: 'ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 尝试删除项目，传递用户ID进行权限验证
    const result = await deleteItem(id, user.id);
    console.log(`Delete operation result for ID ${id}:`, result);

    // 即使项目不存在或已经被删除，也返回成功
    // 确保响应中包含 success 字段
    const responseData = {
      ...result,
      success: result.success !== false, // 默认为 true，除非特别指定为 false
      timestamp: new Date().toISOString() // 添加时间戳防止缓存
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // 确保删除响应不被缓存
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in DELETE content API route:', error);
    return new Response(JSON.stringify({ error: `Failed to delete content: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
