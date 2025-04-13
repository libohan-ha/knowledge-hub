import { saveClassifiedContents } from '../../../lib/db-service';

export async function POST(request) {
  try {
    const classificationResult = await request.json();

    if (!classificationResult || typeof classificationResult !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid classification result' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证分类数据结构
    const validCategories = ['articles', 'ideas', 'tasks', 'resources'];
    for (const category of validCategories) {
      if (!Array.isArray(classificationResult[category])) {
        return new Response(JSON.stringify({ error: `Invalid ${category} data` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 使用新的批量保存API
    try {
      const response = await fetch('/api/content/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classificationResult),
      });

      if (response.ok) {
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // 如果新API失败，回退到旧方法
        console.log('Batch API failed, falling back to legacy method');
        const result = await saveClassifiedContents(classificationResult);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (err) {
      console.error('Error using batch API, falling back to legacy method:', err);
      const result = await saveClassifiedContents(classificationResult);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in save API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to save content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
