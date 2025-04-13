import OpenAI from 'openai';

const DEEPSEEK_API_KEY = 'sk-ee38bd528f754f7583cb044a9db66041';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: DEEPSEEK_API_KEY,
});

const SYSTEM_PROMPT = `请将用户输入的内容进行分类：待看文章、想法、安排、干货收藏。

重要规则：
1. 如果内容是一个整体（如项目说明、列表、大纲等），请保持其完整性，不要将其拆分成多个独立的条目。
2. 如果内容包含多个标题、编号或列表项，这通常表示它们是一个整体的组成部分，应保持在同一个分类中。
3. 只有当用户输入的是多个完全无关的内容时，才将其分到不同类别。

分类指南：
1. 即使是非常简短的内容也必须分类，不要返回空结果
2. 如果内容是行动、计划、待办事项、提醒等，归类为"安排"
3. 如果内容是网址、文章链接、阅读材料等，归类为"待看文章"
4. 如果内容是想法、创意、灵感、思考等，归类为"想法"
5. 如果内容是知识点、学习笔记、技巧等，归类为"干货收藏"

直接输出分类的结果，不用其他解释和说明。
格式：
待看文章：
想法：
安排：
干货收藏：`;

async function classifyContent(userInput) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userInput }
      ],
      model: 'deepseek-chat',
      temperature: 0.2,
    });

    const result = completion.choices[0].message.content;
    console.log('AI classification result:', result);

    // 解析结果
    const categories = {
      articles: [], // 待看文章
      ideas: [],    // 想法
      tasks: [],    // 安排
      resources: [] // 干货收藏
    };

    // 用于生成唯一ID
    const generateId = () => Math.random().toString(36).substring(2, 15);

    // 当前正在处理的类别
    let currentCategory = null;

    // 检查AI返回结果中是否包含干货收藏
    if (result.includes('干货收藏：')) {
      console.log('检测到干货收藏类别');
    }

    // 按行解析结果
    const lines = result.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      console.log('处理行:', trimmedLine);

      // 检查是否是类别标题
      if (trimmedLine.includes('待看文章：')) {
        currentCategory = 'articles';
        console.log('设置当前类别为:', currentCategory);
        // 如果冒号后有内容，也要处理
        const content = trimmedLine.substring(trimmedLine.indexOf('待看文章：') + '待看文章：'.length).trim();
        if (content) {
          console.log('添加内容到', currentCategory, ':', content);
          categories[currentCategory].push({
            id: generateId(),
            content: content
          });
        }
        continue;
      } else if (trimmedLine.includes('想法：')) {
        currentCategory = 'ideas';
        console.log('设置当前类别为:', currentCategory);
        const content = trimmedLine.substring(trimmedLine.indexOf('想法：') + '想法：'.length).trim();
        if (content) {
          console.log('添加内容到', currentCategory, ':', content);
          categories[currentCategory].push({
            id: generateId(),
            content: content
          });
        }
        continue;
      } else if (trimmedLine.includes('安排：')) {
        currentCategory = 'tasks';
        console.log('设置当前类别为:', currentCategory);
        const content = trimmedLine.substring(trimmedLine.indexOf('安排：') + '安排：'.length).trim();
        if (content) {
          console.log('添加内容到', currentCategory, ':', content);
          categories[currentCategory].push({
            id: generateId(),
            content: content
          });
        }
        continue;
      } else if (trimmedLine.includes('干货收藏：')) {
        currentCategory = 'resources';
        console.log('设置当前类别为:', currentCategory);
        const content = trimmedLine.substring(trimmedLine.indexOf('干货收藏：') + '干货收藏：'.length).trim();
        if (content) {
          console.log('添加内容到', currentCategory, ':', content);
          categories[currentCategory].push({
            id: generateId(),
            content: content
          });
        }
        continue;
      }

      // 如果有当前类别，将内容添加到该类别
      if (currentCategory) {
        console.log('添加内容到当前类别', currentCategory, ':', trimmedLine);
        categories[currentCategory].push({
          id: generateId(),
          content: trimmedLine
        });
      }
    }

    // 如果所有类别都为空，则将内容放入默认类别
    const allEmpty = Object.values(categories).every(arr => arr.length === 0);
    if (allEmpty && userInput.trim()) {
      console.log('All categories empty, using default classification for:', userInput);

      // 检查AI返回结果中是否有类别指示
      if (result.includes('干货收藏：')) {
        console.log('检测到干货收藏指示，将内容添加到干货收藏类别');
        categories.resources.push({
          id: generateId(),
          content: userInput.trim()
        });
        console.log('Classification corrected: content added to resources category');
      } else if (result.includes('待看文章：')) {
        console.log('检测到待看文章指示，将内容添加到待看文章类别');
        categories.articles.push({
          id: generateId(),
          content: userInput.trim()
        });
        console.log('Classification corrected: content added to articles category');
      } else if (result.includes('安排：')) {
        console.log('检测到安排指示，将内容添加到安排类别');
        categories.tasks.push({
          id: generateId(),
          content: userInput.trim()
        });
        console.log('Classification corrected: content added to tasks category');
      } else {
        // 如果没有明确的类别指示，则默认使用想法类别
        console.log('没有检测到明确的类别指示，默认使用想法类别');
        categories.ideas.push({
          id: generateId(),
          content: userInput.trim()
        });
        console.log('Default classification: content added to ideas category');
      }
    }

    return categories;
  } catch (error) {
    console.error('Error in AI classification:', error);
    // 如果AI分类失败，返回一个默认分类
    const categories = {
      articles: [],
      ideas: [{
        id: Math.random().toString(36).substring(2, 15),
        content: userInput.trim()
      }], // 默认放入想法类别
      tasks: [],
      resources: []
    };
    return categories;
  }
}

export async function POST(request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await classifyContent(content);
    console.log('Classification result:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in classify API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to classify content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
