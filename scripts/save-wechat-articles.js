// Script to save WeChat article links to the database
const { supabase } = require('../lib/supabase');

// WeChat article links to save
const wechatArticles = [
  "https://mp.weixin.qq.com/s/HYEQNMaX9scd9yIc_b4rei6Hw",
  "https://mp.weixin.qq.com/s/l1z-IE2NYXS_b4irei6Hw"
];

// Function to save an article directly to Supabase
async function saveArticle(content) {
  try {
    const { data, error } = await supabase
      .from('items')
      .insert({
        content: content,
        category: 'articles'
      })
      .select();

    if (error) {
      console.error(`Error saving article: ${error.message}`);
      return false;
    }

    console.log(`Successfully saved article: ${content}`);
    return true;
  } catch (error) {
    console.error(`Error saving article: ${error.message}`);
    return false;
  }
}

// Main function to save all articles
async function saveAllArticles() {
  console.log(`Starting to save ${wechatArticles.length} WeChat articles...`);

  let successCount = 0;

  for (const article of wechatArticles) {
    const success = await saveArticle(article);
    if (success) {
      successCount++;
    }
  }

  console.log(`Completed: ${successCount} of ${wechatArticles.length} articles saved successfully.`);
}

// Run the script
saveAllArticles();
