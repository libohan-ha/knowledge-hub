import OpenAI from "openai";

// 初始化OpenAI客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-ee38bd528f754f7583cb044a9db66041'
});

// 分类提示词
const CLASSIFICATION_PROMPT = `
请将用户输入的内容进行分类：待看文章、想法、安排、干货收藏。

重要规则：
1. 如果内容是一个整体（如项目说明、列表、大纲等），请保持其完整性，不要将其拆分成多个独立的条目。
2. 如果内容包含多个标题、编号或列表项，这通常表示它们是一个整体的组成部分，应保持在同一个分类中。
3. 只有当用户输入的是多个完全无关的内容时，才将其分到不同类别。

直接输出分类的结果，不用其他解释和说明。
格式：
待看文章：
想法：
安排：
干货收藏：
`;

export async function POST(request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({ error: 'Content is required and must be a string' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 调用DeepSeek API进行分类
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: CLASSIFICATION_PROMPT },
        { role: "user", content }
      ],
      model: "deepseek-chat",
    });

    // 获取分类结果
    const classificationText = completion.choices[0].message.content;

    // 解析分类结果
    const categories = {
      articles: [],
      ideas: [],
      tasks: [],
      resources: []
    };

    // 解析分类文本
    let currentCategory = null;
    for (const line of classificationText.split('\n')) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.startsWith('待看文章：')) {
        currentCategory = 'articles';
        const content = trimmedLine.substring('待看文章：'.length).trim();
        if (content) categories.articles.push({ content });
      } else if (trimmedLine.startsWith('想法：')) {
        currentCategory = 'ideas';
        const content = trimmedLine.substring('想法：'.length).trim();
        if (content) categories.ideas.push({ content });
      } else if (trimmedLine.startsWith('安排：')) {
        currentCategory = 'tasks';
        const content = trimmedLine.substring('安排：'.length).trim();
        if (content) categories.tasks.push({ content });
      } else if (trimmedLine.startsWith('干货收藏：')) {
        currentCategory = 'resources';
        const content = trimmedLine.substring('干货收藏：'.length).trim();
        if (content) categories.resources.push({ content });
      } else if (currentCategory && trimmedLine) {
        // 如果是当前类别下的内容项
        categories[currentCategory].push({ content: trimmedLine });
      }
    }

    // 返回分类结果
    return new Response(JSON.stringify(categories), {
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
