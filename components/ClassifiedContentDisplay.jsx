"use client"

import { useState, useEffect } from 'react';
import { getAllItems, getItemsByCategory } from '../lib/db-service';

export default function ClassifiedContentDisplay() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'articles', name: '待看文章' },
    { id: 'ideas', name: '想法' },
    { id: 'tasks', name: '安排' },
    { id: 'knowledge', name: '干货收藏' }
  ];

  const fetchContents = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;
      if (activeCategory === 'all') {
        data = await getAllItems();
      } else {
        data = await getItemsByCategory(activeCategory);
      }
      setContents(data);
    } catch (err) {
      console.error('Error fetching classified content:', err);
      setError('获取内容失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [activeCategory]);

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'articles': return '待看文章';
      case 'ideas': return '想法';
      case 'tasks': return '安排';
      case 'knowledge': return '干货收藏';
      default: return category;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'articles': return 'bg-blue-100 text-blue-800';
      case 'ideas': return 'bg-purple-100 text-purple-800';
      case 'tasks': return 'bg-green-100 text-green-800';
      case 'knowledge': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">已分类内容</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm ${
              activeCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>加载中...</p>
        </div>
      ) : error ? (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>暂无内容</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contents.map((item) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded-md text-xs ${getCategoryColor(item.category)}`}>
                  {getCategoryLabel(item.category)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
