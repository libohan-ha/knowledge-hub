// Script to check saved articles in the database
const { supabase } = require('../lib/supabase');

async function checkArticles() {
  try {
    console.log('Checking recently saved articles...');
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('category', 'articles')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error(`Error fetching articles: ${error.message}`);
      return;
    }
    
    console.log(`Found ${data.length} recent articles:`);
    data.forEach((article, index) => {
      console.log(`\n[${index + 1}] ID: ${article.id}`);
      console.log(`Content: ${article.content}`);
      console.log(`Created: ${new Date(article.created_at).toLocaleString()}`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Run the script
checkArticles();
