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

直接输出分类的结果，不用其他解释和说明。
格式：
待看文章：
想法：
安排：
干货收藏：`;

export async function classifyContent(userInput) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput }
      ],
      model: "deepseek-chat",
    });

    const result = completion.choices[0].message.content;
    return parseClassificationResult(result);
  } catch (error) {
    console.error('Error classifying content:', error);
    throw error;
  }
}

function parseClassificationResult(result) {
  // Parse the AI response into structured data
  const categories = {
    articles: [],    // 待看文章
    ideas: [],       // 想法
    tasks: [],       // 安排
    resources: []    // 干货收藏
  };

  const lines = result.split('\n');
  let currentCategory = null;

  for (const line of lines) {
    if (line.startsWith('待看文章：')) {
      currentCategory = 'articles';
      // If there's content on the same line after the category
      const content = line.substring('待看文章：'.length).trim();
      if (content) categories.articles.push(content);
    } else if (line.startsWith('想法：')) {
      currentCategory = 'ideas';
      const content = line.substring('想法：'.length).trim();
      if (content) categories.ideas.push(content);
    } else if (line.startsWith('安排：')) {
      currentCategory = 'tasks';
      const content = line.substring('安排：'.length).trim();
      if (content) categories.tasks.push(content);
    } else if (line.startsWith('干货收藏：')) {
      currentCategory = 'resources';
      const content = line.substring('干货收藏：'.length).trim();
      if (content) categories.resources.push(content);
    } else if (line.trim() && currentCategory) {
      // Add non-empty lines to the current category
      categories[currentCategory].push(line.trim());
    }
  }

  return categories;
}
