ai调用使用deepseek，官方示例代码：


// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: '<DeepSeek API Key>'
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();

apikey：sk-ee38bd528f754f7583cb044a9db66041


提示词：
请将用户输入的内容进行分类：待看文章、想法、安排、干货收藏。用户可能会输入很多内容，将内容拆分并分类。直接输出分类的结果，不用其他解释和说明。
格式：
待看文章：
想法：
安排：
干货收藏：