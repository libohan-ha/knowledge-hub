"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import DeletableContentCard from "@/components/deletable-content-card"
import { useToast } from "@/hooks/use-toast"

// 定义文章类型
interface Article {
  id: string;
  content: string;
  category: string;
  created_at?: string;
  updated_at?: string;
  is_read?: boolean; // 添加已看状态
}

export default function ReadLaterPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewArticleInput, setShowNewArticleInput] = useState(false)
  const [newArticleContent, setNewArticleContent] = useState('')
  const { toast } = useToast()

  // 加载待看文章数据
  const loadArticles = async (bypassCache = false) => {
    setIsLoading(true)
    setError(null)

    try {
      // 构建 URL 并添加缓存控制参数
      let url = '/api/content?category=articles';
      if (bypassCache) {
        url += `&forceRefresh=true&_=${Date.now()}`;
      }
      console.log('Fetching articles URL:', url);

      const response = await fetch(url, {
        // 始终添加缓存控制头，确保获取最新数据
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }

      const responseData = await response.json()
      const articlesData = responseData.data || []
      console.log(`Loaded ${articlesData.length} articles`)
      setArticles(articlesData)
    } catch (err) {
      console.error('Error loading articles:', err)
      setError('加载待看文章时出错，请刷新页面重试。')
    } finally {
      setIsLoading(false)
    }
  }

  // 删除待看文章 - 增强版本
  const handleDeleteArticle = async (id: string) => {
    try {
      console.log(`Attempting to delete article with ID: ${id}`);

      if (!id) {
        console.error('Invalid ID provided for deletion:', id);
        toast({
          title: "删除失败",
          description: "无效的文章ID",
          variant: "destructive",
        });
        return;
      }

      // 先从前端状态中移除该文章，提供即时反馈
      const articleToDelete = articles.find(article => article.id === id);
      if (!articleToDelete) {
        console.error('Article not found in current state:', id);
        toast({
          title: "删除失败",
          description: "找不到要删除的文章",
          variant: "destructive",
        });
        return;
      }

      // 保存要删除的文章，以便在删除失败时恢复
      const backupArticle = { ...articleToDelete };

      // 从前端状态中移除
      setArticles(articles.filter(article => article.id !== id));

      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      // 解析响应
      const result = await response.json();

      // 即使响应是200，也要检查result.success
      if (!response.ok || !result.success) {
        console.error(`Delete API error:`, result);

        // 如果删除失败，将文章恢复到前端状态
        setArticles(prevArticles => [...prevArticles, backupArticle]);

        // 强制重新加载数据，确保前端和后端数据一致
        await loadArticles(true);

        toast({
          title: "删除失败",
          description: result.message || "删除文章时出错，请重试",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "文章已删除",
        description: "待看文章已成功删除",
        variant: "default",
      })
    } catch (err) {
      console.error('Error deleting article:', err)
      toast({
        title: "删除失败",
        description: "删除文章时出错，请重试",
        variant: "destructive",
      })
    }
  }

  // 编辑待看文章
  const handleEditArticle = async (id: string, newContent: string) => {
    try {
      console.log(`Attempting to edit article with ID: ${id}`);

      if (!id) {
        console.error('Invalid ID provided for editing:', id);
        toast({
          title: "编辑失败",
          description: "无效的文章ID",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newContent,
          category: 'articles'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Edit API error: ${response.status} ${errorData}`);
        throw new Error(`Failed to edit article: ${response.status} ${errorData}`);
      }

      // 重新加载文章
      await loadArticles()

      toast({
        title: "文章已更新",
        description: "文章已成功更新",
        variant: "default",
      })
    } catch (err) {
      console.error('Error editing article:', err)
      toast({
        title: "编辑失败",
        description: "编辑文章时出错，请重试",
        variant: "destructive",
      })
    }
  }

  // 创建新文章
  const handleCreateArticle = async () => {
    try {
      if (!newArticleContent.trim()) {
        toast({
          title: "创建失败",
          description: "文章内容不能为空",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newArticleContent,
          category: 'articles'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Create API error: ${response.status} ${errorData}`);
        throw new Error(`Failed to create article: ${response.status} ${errorData}`);
      }

      // 重置表单
      setNewArticleContent('');
      setShowNewArticleInput(false);

      // 重新加载文章
      await loadArticles();

      toast({
        title: "文章已创建",
        description: "新文章已成功创建",
        variant: "default",
      })
    } catch (err) {
      console.error('Error creating article:', err)
      toast({
        title: "创建失败",
        description: "创建文章时出错，请重试",
        variant: "destructive",
      })
    }
  };

  // 切换文章已看状态
  const handleToggleReadStatus = async (id: string, isRead: boolean) => {
    try {
      console.log(`Attempting to toggle read status for article with ID: ${id} to ${isRead ? 'read' : 'unread'}`);

      if (!id) {
        console.error('Invalid ID provided for status update:', id);
        toast({
          title: "状态更新失败",
          description: "无效的文章ID",
          variant: "destructive",
        });
        return;
      }

      // 先从前端状态中更新该文章，提供即时反馈
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === id ? { ...article, is_read: isRead } : article
        )
      );

      // 发送更新请求
      const response = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          is_read: isRead,
          category: 'articles'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Update read status API error: ${response.status} ${errorData}`);

        // 如果更新失败，重新加载数据确保前端和后端一致
        await loadArticles();

        throw new Error(`Failed to update read status: ${response.status} ${errorData}`);
      }

      // 不需要显示通知，因为卡片组件已经显示了
    } catch (err) {
      console.error('Error updating article read status:', err);
      // 如果出错，重新加载数据确保前端和后端一致
      await loadArticles();
    }
  };

  // 初始加载
  useEffect(() => {
    // 首次加载时强制绕过缓存获取最新数据
    loadArticles(true)

    // 每 10 秒自动刷新一次数据，强制绕过缓存
    const intervalId = setInterval(() => {
      loadArticles(true);
    }, 10000); // 10 秒刷新一次，确保能快速看到新内容

    // 添加页面可见性变化事件监听器
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 当页面变为可见时，强制刷新数据
        loadArticles(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-fuchsia-500 opacity-30 blur-3xl"></div>

        <div className="container relative z-10">
          <Link href="/" className="mb-6 inline-flex items-center text-xl font-medium text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回首页
          </Link>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-7xl font-black tracking-tighter md:text-8xl">待看文章</h1>
              <p className="mt-4 max-w-2xl text-xl text-gray-300">
                保存有价值的文章和网页，以便稍后阅读和参考。
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                className="flex items-center gap-2 bg-fuchsia-500 text-white hover:bg-fuchsia-600"
                onClick={() => setShowNewArticleInput(!showNewArticleInput)}
              >
                <Plus className="h-4 w-4" />
                新文章
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Article Input */}
      {showNewArticleInput && (
        <section className="py-6 border-b border-gray-800">
          <div className="container">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">新文章</h2>
              <p className="text-gray-400">添加想要稍后阅读的文章或网页链接。</p>
            </div>
            <div className="space-y-4">
              <Textarea
                placeholder="输入文章标题、链接或简要描述..."
                className="min-h-[120px] bg-gray-900 border-gray-700"
                value={newArticleContent}
                onChange={(e) => setNewArticleContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewArticleInput(false)}>取消</Button>
                <Button onClick={handleCreateArticle}>保存</Button>
              </div>
            </div>
          </div>
        </section>
      )}



      {/* Articles Grid */}
      <section className="py-8">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-3 p-6 text-center bg-gray-900 rounded-lg">
                <p className="text-gray-400">加载中...</p>
              </div>
            ) : error ? (
              <div className="col-span-3 p-6 text-center bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <DeletableContentCard
                  key={article.id}
                  id={article.id}
                  content={article.content}
                  category={article.category}
                  created_at={article.created_at || new Date().toISOString()}
                  updated_at={article.updated_at}
                  is_read={article.is_read}
                  onDelete={handleDeleteArticle}
                  onEdit={handleEditArticle}
                  onToggleRead={handleToggleReadStatus}
                />
              ))
            ) : (
              <div className="col-span-3 p-6 text-center bg-gray-900 rounded-lg">
                <p className="text-gray-400">暂无待看文章。在首页添加一些文章吧！</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
