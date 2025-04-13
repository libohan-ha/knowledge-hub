"use client"

import { useState } from 'react';
import { classifyContent } from '../lib/ai-service';
import { saveClassifiedContents } from '../lib/db-service';

export default function ContentClassifier() {
  const [userInput, setUserInput] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    setIsClassifying(true);
    setError(null);
    setClassificationResult(null);

    try {
      // Classify the content using AI
      console.log('Classifying content...');
      const result = await classifyContent(userInput);
      console.log('Classification result:', result);
      setClassificationResult(result);

      // Clear the input
      setUserInput('');
    } catch (err) {
      console.error('Error in classification process:', err);
      setError('分类过程中出现错误，请重试。');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSave = async () => {
    if (!classificationResult) return;

    setError(null);
    try {
      // Save the classified content to the database
      console.log('Saving classified content to database...');
      const savedData = await saveClassifiedContents(classificationResult);
      console.log('Saved data:', savedData);
      alert('内容已成功保存！'); // 内容已成功保存！
    } catch (saveError) {
      console.error('Error saving to database:', saveError);
      setError('保存到数据库时出错：' + saveError.message);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">内容分类器</h2>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="输入您想要分类的内容..."
            className="w-full p-3 border border-gray-300 rounded-md min-h-[150px]"
            disabled={isClassifying}
          />
        </div>

        <button
          type="submit"
          disabled={isClassifying || !userInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isClassifying ? '分类中...' : '分类内容'}
        </button>
      </form>

      {classificationResult && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold">分类结果:</h3>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              保存内容
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-md">
              <h4 className="font-medium text-lg mb-2">待看文章</h4>
              {classificationResult.articles.length > 0 ? (
                <ul className="list-disc pl-5">
                  {classificationResult.articles.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">无内容</p>
              )}
            </div>

            <div className="p-4 border border-gray-200 rounded-md">
              <h4 className="font-medium text-lg mb-2">想法</h4>
              {classificationResult.ideas.length > 0 ? (
                <ul className="list-disc pl-5">
                  {classificationResult.ideas.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">无内容</p>
              )}
            </div>

            <div className="p-4 border border-gray-200 rounded-md">
              <h4 className="font-medium text-lg mb-2">安排</h4>
              {classificationResult.tasks.length > 0 ? (
                <ul className="list-disc pl-5">
                  {classificationResult.tasks.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">无内容</p>
              )}
            </div>

            <div className="p-4 border border-gray-200 rounded-md">
              <h4 className="font-medium text-lg mb-2">干货收藏</h4>
              {classificationResult.resources.length > 0 ? (
                <ul className="list-disc pl-5">
                  {classificationResult.resources.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">无内容</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
