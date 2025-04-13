import { supabase, supabaseAdmin } from './supabase';

// 定义类型
/**
 * @typedef {'tasks' | 'articles' | 'ideas' | 'knowledge'} ContentCategory
 */

/**
 * @typedef {Object} Item
 * @property {string} [id]
 * @property {string} content
 * @property {ContentCategory} category
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

// Map our frontend categories to database categories
const categoryMap = {
  'articles': 'articles',
  'ideas': 'ideas',
  'tasks': 'tasks',
  'resources': 'knowledge',
  'knowledge': 'knowledge' // 添加直接映射，以兼容当前代码
};

/**
 * Save a single item to the database
 * @param {string} content - The content to save
 * @param {string} category - The category of the content
 * @param {string} [userId] - The user ID (optional, will be required in the future)
 */
export async function saveItem(content, category, userId) {
  try {
    console.log(`Saving item: category=${category}, content=${content.substring(0, 30)}...`);
    const dbCategory = categoryMap[category];
    console.log(`Mapped category: ${dbCategory}`);

    if (!dbCategory) {
      console.error(`Category mapping not found for: ${category}`);
      throw new Error(`Category mapping not found for: ${category}`);
    }

    // 准备插入数据
    const insertData = {
      content: content,
      category: dbCategory
    };

    // 如果提供了用户ID，添加到数据中
    if (userId) {
      insertData.user_id = userId;
    }

    const { data, error } = await supabase
      .from('items')
      .insert(insertData)
      .select();

    // 清除相关类别的缓存
    if (categoryDataCache[category]) {
      console.log(`Clearing cache for category: ${category}`);
      delete categoryDataCache[category];
    }

    // 同时清除数据库类别的缓存
    if (categoryDataCache[dbCategory]) {
      console.log(`Clearing cache for DB category: ${dbCategory}`);
      delete categoryDataCache[dbCategory];
    }

    console.log('Item saved successfully and cache cleared:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error saving content to database:', error);
    throw error;
  }
}

/**
 * Save multiple classified content items to the database
 * @param {Object} classification - The classification result
 * @param {string} [userId] - The user ID (optional, will be required in the future)
 */
export async function saveMultipleItems(classification, userId) {
  try {
    console.log('Saving multiple classified items');
    const results = {
      articles: [],
      ideas: [],
      tasks: [],
      resources: []
    };

    // 收集所有要插入的数据
    const allInsertData = [];
    const categoryToIndexMap = {};
    let startIndex = 0;

    // 处理每个类别的内容
    for (const [category, items] of Object.entries(classification)) {
      if (!Array.isArray(items) || items.length === 0) continue;

      console.log(`Processing ${items.length} items for category: ${category}`);

      const dbCategory = categoryMap[category];
      if (!dbCategory) {
        console.error(`Category mapping not found for: ${category}`);
        continue;
      }

      // 准备批量插入数据
      const insertData = items.map(item => {
        const data = {
          content: item.content,
          category: dbCategory
        };

        // 如果提供了用户ID，添加到数据中
        if (userId) {
          data.user_id = userId;
        }

        return data;
      });

      // 记录该类别在全部数据中的起始和结束索引
      categoryToIndexMap[category] = {
        start: startIndex,
        end: startIndex + insertData.length - 1
      };

      // 更新起始索引
      startIndex += insertData.length;

      // 添加到全部插入数据中
      allInsertData.push(...insertData);
    }

    // 如果没有数据要保存，直接返回
    if (allInsertData.length === 0) {
      console.log('No data to save');
      return results;
    }

    // 一次性批量插入所有数据
    console.log(`Batch inserting ${allInsertData.length} items`);
    const { data, error } = await supabase
      .from('items')
      .insert(allInsertData)
      .select();

    if (error) {
      console.error('Error saving items:', error);
      throw error;
    }

    // 将返回的数据分配到各个类别
    if (data && data.length > 0) {
      for (const [category, indices] of Object.entries(categoryToIndexMap)) {
        const { start, end } = indices;
        results[category] = data.slice(start, end + 1);
        console.log(`Assigned ${results[category].length} items to ${category}`);
      }
    }

    // 清除缓存 - 只清除有数据的类别的缓存
    const categoriesToClear = new Set();
    for (const [category, items] of Object.entries(classification)) {
      if (Array.isArray(items) && items.length > 0) {
        categoriesToClear.add(category);
        const dbCategory = categoryMap[category];
        if (dbCategory) {
          categoriesToClear.add(dbCategory);
        }
      }
    }

    // 批量清除缓存
    categoriesToClear.forEach(cat => {
      if (categoryDataCache[cat]) {
        console.log(`Clearing cache for category: ${cat}`);
        delete categoryDataCache[cat];
      }
    });

    console.log(`Successfully saved ${data.length} items in total`);
    return results;
  } catch (error) {
    console.error('Error saving multiple items to database:', error);
    throw error;
  }
}
/**
 * Save classified contents (legacy function, use saveMultipleItems instead)
 */
export async function saveClassifiedContents(classificationResult) {
  console.log('saveClassifiedContents called with:', classificationResult);
  const savePromises = [];

  // Process each category
  for (const [category, items] of Object.entries(classificationResult)) {
    console.log(`Processing category: ${category}, items count: ${items.length}`);
    if (items.length > 0) {
      // For each item in the category, create a save promise
      for (const content of items) {
        if (content.trim()) {
          console.log(`Adding save promise for: ${content.substring(0, 30)}...`);
          savePromises.push(saveItem(content, category));
        }
      }
    }
  }

  console.log(`Total save promises: ${savePromises.length}`);
  // Wait for all saves to complete
  try {
    const results = await Promise.all(savePromises);
    console.log(`All items saved successfully, count: ${results.length}`);
    return results;
  } catch (error) {
    console.error('Error in Promise.all for saves:', error);
    throw error;
  }
}

/**
 * Get all items
 * @param {string} [userId] - The user ID to filter by (optional)
 */
export async function getAllItems(userId = null) {
  try {
    console.log(`Getting all items${userId ? ` for user: ${userId}` : ''}`);

    // 准备查询
    let query = supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    // 如果提供了用户ID，添加用户过滤条件
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // 执行查询
    const { data, error } = await query;

    if (error) {
      console.error('Supabase error when fetching all items:', error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} items in total`);
    return data || [];
  } catch (error) {
    console.error('Error fetching content from database:', error);
    throw error;
  }
}

/**
 * Get items by category
 * @param {string} category - The category to get items for
 * @param {boolean} [forceRefresh=false] - Whether to force refresh the cache
 * @param {string} [userId] - The user ID to filter by (optional)
 */
// 缓存已映射的类别，减少重复计算
const categoryMappingCache = {};

/**
 * 获取类别的数据库映射
 */
function getCategoryMapping(category) {
  console.log(`Getting category mapping for: '${category}'`);

  // 如果类别为空，返回默认值
  if (!category) {
    console.warn('Empty category provided to getCategoryMapping');
    return 'ideas'; // 默认使用 ideas 类别
  }

  // 如果已经缓存了该类别的映射，直接返回
  if (categoryMappingCache[category]) {
    console.log(`Using cached mapping for '${category}': '${categoryMappingCache[category]}'`);
    return categoryMappingCache[category];
  }

  // 将类别名称转换为小写，以确保一致性
  const lowerCategory = category.toLowerCase();
  console.log(`Lowercase category: '${lowerCategory}'`);

  // 检查是否有直接的映射
  let dbCategory = categoryMap[lowerCategory];
  console.log(`Direct mapping result: '${dbCategory || 'none'}'`);

  // 如果没有直接映射，尝试查找反向映射
  if (!dbCategory) {
    console.log('No direct mapping found, trying reverse mapping');
    // 查找反向映射
    for (const [key, value] of Object.entries(categoryMap)) {
      console.log(`Checking if '${value}' === '${lowerCategory}'`);
      if (value === lowerCategory) {
        dbCategory = value;
        console.log(`Found reverse mapping: '${dbCategory}'`);
        break;
      }
    }
  }

  // 如果仍然没有找到映射，使用原始类别
  if (!dbCategory) {
    console.log(`No mapping found, using original category: '${lowerCategory}'`);
    dbCategory = lowerCategory;
  }

  // 缓存结果
  categoryMappingCache[category] = dbCategory;

  return dbCategory;
}

// 缓存各类别的数据，减少重复查询
const categoryDataCache = {};
const CACHE_TTL = 1000; // 缓存有效期降低为1秒，减少缓存引起的问题

export async function getItemsByCategory(category, forceRefresh = false, userId = null) {
  try {
    // 生成缓存键，包含用户ID以区分不同用户的缓存
    const cacheKey = userId ? `${category}_${userId}` : category;
    console.log(`getItemsByCategory called for category: ${category}, forceRefresh: ${forceRefresh}, userId: ${userId || 'none'}, cacheKey: ${cacheKey}`);

    // 检查缓存，除非强制刷新
    const now = Date.now();
    if (!forceRefresh && categoryDataCache[cacheKey] &&
        categoryDataCache[cacheKey].timestamp > now - CACHE_TTL) {
      console.log(`Using cached data for category: ${category}, cache age: ${now - categoryDataCache[cacheKey].timestamp}ms, items: ${categoryDataCache[cacheKey].data.length}`);
      return categoryDataCache[cacheKey].data;
    }

    console.log(`${forceRefresh ? 'Force refreshing' : 'Fetching'} data for category: ${category}${userId ? ` and user: ${userId}` : ''}, cache expired or not found`);

    // 使用缓存的类别映射
    const dbCategory = getCategoryMapping(category);
    console.log(`Mapped category '${category}' to DB category '${dbCategory}'`);

    // 准备查询
    let query = supabase
      .from('items')
      .select('*')
      .eq('category', dbCategory)
      .order('created_at', { ascending: false })
      .limit(100); // 限制返回数量，提高性能

    // 如果提供了用户ID，添加用户过滤条件
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // 执行查询
    console.log(`Querying database for category: ${dbCategory}${userId ? ` and user: ${userId}` : ''}`);
    const { data, error } = await query;

    console.log(`Query result: ${data ? data.length : 0} items, error: ${error ? error.message : 'none'}`);

    if (error) {
      console.error(`Supabase error when fetching ${dbCategory}:`, error);
      throw error;
    }

    // 更新缓存
    categoryDataCache[cacheKey] = {
      data: data || [],
      timestamp: now
    };

    return data || [];
  } catch (error) {
    console.error(`Error fetching ${category} from database:`, error);
    throw error;
  }
}

/**
 * Check database health
 */
export async function checkDatabaseHealth() {
  try {
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error checking database health:', error);
    throw error;
  }
}

/**
 * Update an item in the database
 * @param {string} id - The ID of the item to update
 * @param {string} content - The new content
 * @param {string} category - The category
 * @param {string} [userId] - The user ID (optional, for authorization)
 * @param {Object} [options] - Additional options for the update
 * @param {boolean} [options.is_read] - Whether the item is read (for articles)
 */
export async function updateItem(id, content, category, userId = null, options = {}) {
  try {
    console.log(`Updating item: id=${id}, category=${category}, content=${content.substring(0, 30)}...`);
    const dbCategory = categoryMap[category] || category;
    console.log(`Mapped category: ${dbCategory}`);

    // 首先检查项目是否存在，使用服务角色权限
    const { data: itemExists, error: checkError } = await supabaseAdmin
      .from('items')
      .select('id, category, user_id')
      .eq('id', id)
      .maybeSingle();

    // 如果项目不存在，返回错误
    if (!itemExists) {
      console.error(`Item with ID ${id} does not exist`);
      throw new Error(`Item with ID ${id} does not exist`);
    }

    // 检查用户权限，如果提供了用户ID
    if (userId && itemExists.user_id && itemExists.user_id !== userId) {
      console.error(`User ${userId} does not have permission to update item ${id}`);
      throw new Error(`You do not have permission to update this item`);
    }

    // 准备更新数据
    const updateData = {
      content: content,
      category: dbCategory,
      updated_at: new Date()
    };

    // 如果提供了is_read选项，添加到更新数据中
    if (options.is_read !== undefined) {
      updateData.is_read = options.is_read;
      console.log(`Including is_read=${options.is_read} in update`);
    }

    // 使用服务角色权限执行更新操作，绕过权限检查
    const { data, error } = await supabaseAdmin
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // 更新后清除所有缓存，确保数据一致性
    console.log('Clearing all category caches to ensure data consistency after update');
    Object.keys(categoryDataCache).forEach(key => {
      console.log(`Clearing cache for key: ${key}`);
      delete categoryDataCache[key];
    });

    // 添加延迟，确保缓存完全清除
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('Item updated successfully and all caches cleared:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error updating content in database:', error);
    throw error;
  }
}

/**
 * Delete an item from the database
 * @param {string} id - The ID of the item to delete
 * @param {string} [userId] - The user ID (optional, for authorization)
 */
export async function deleteItem(id, userId = null) {
  try {
    console.log(`Deleting item: id=${id}${userId ? `, user=${userId}` : ''}`);

    // 首先检查项目是否存在，使用服务角色权限
    const { data: itemExists, error: checkError } = await supabaseAdmin
      .from('items')
      .select('id, category, user_id')
      .eq('id', id)
      .maybeSingle();

    // 如果项目不存在，返回成功，因为删除不存在的项目也算成功
    if (!itemExists) {
      console.log(`Item with ID ${id} does not exist, considering delete successful`);
      return {
        success: true,
        message: 'Item already deleted or does not exist',
        category: null
      };
    }

    // 检查用户权限，如果提供了用户ID
    if (userId && itemExists.user_id && itemExists.user_id !== userId) {
      console.error(`User ${userId} does not have permission to delete item ${id}`);
      return {
        success: false,
        message: 'You do not have permission to delete this item',
        category: null
      };
    }

    // 使用服务角色权限执行删除操作，绕过权限检查
    const { data: deletedData, error } = await supabaseAdmin
      .from('items')
      .delete()
      .eq('id', id);

    // 如果有错误，说明删除操作失败
    if (error) {
      console.error('Supabase error during deletion:', error);
      throw error;
    }

    // 即使没有删除任何行，也返回成功，因为项目可能已经被删除或不存在
    const category = itemExists.category;
    console.log(`Item category of deleted item: ${category}`);

    // 删除成功后，清除所有缓存以确保数据一致性
    console.log('Clearing all category caches to ensure data consistency after deletion');
    Object.keys(categoryDataCache).forEach(key => {
      console.log(`Clearing cache for key: ${key}`);
      delete categoryDataCache[key];
    });

    // 添加延迟，确保缓存完全清除
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('Item deleted successfully and cache cleared');
    return {
      success: true,
      message: 'Item deleted successfully',
      category: category
    };
  } catch (error) {
    console.error('Error deleting content from database:', error);
    throw error;
  }
}

/**
 * Search items in the database
 */
export async function searchItems(query) {
  try {
    console.log(`Searching items with query: ${query}`);

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching content in database:', error);
    throw error;
  }
}

/**
 * Get a single item by ID
 */
export async function getItemById(id) {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching item with id ${id} from database:`, error);
    throw error;
  }
}
