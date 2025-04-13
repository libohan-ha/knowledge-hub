"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import DeletableContentCard from "@/components/deletable-content-card"
import { useToast } from "@/hooks/use-toast"

// 定义资源类型
interface Resource {
  id: string;
  content: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewResourceInput, setShowNewResourceInput] = useState(false)
  const [newResourceContent, setNewResourceContent] = useState('')
  const { toast } = useToast()

  // 加载干货收藏数据 - 使用 useCallback 优化
  const loadResources = useCallback(async (bypassCache = false) => {
    setIsLoading(true)
    setError(null)

    try {
      // 使用标准的 URL 查询参数格式
      let url = '/api/content?category=knowledge';
      if (bypassCache) {
        url += `&forceRefresh=true&_=${Date.now()}`;
      }
      console.log('Fetching resources URL:', url);
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
        throw new Error('Failed to fetch resources')
      }

      const responseData = await response.json()
      const resourcesData = responseData.data || []
      console.log('Loaded resources:', resourcesData.length)
      setResources(resourcesData)
    } catch (err) {
      console.error('Error loading resources:', err)
      setError('加载干货收藏时出错，请刷新页面重试。')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 删除干货收藏
  const handleDeleteResource = async (id: string) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }

      // 从状态中移除已删除的资源
      setResources(prev => prev.filter(resource => resource.id !== id))

      toast({
        title: "已删除",
        description: "干货收藏已成功删除",
        variant: "default",
      })
    } catch (err) {
      console.error('Error deleting resource:', err)
      toast({
        title: "删除失败",
        description: "删除干货收藏时出错，请重试",
        variant: "destructive",
      })
    }
  }

  // 编辑干货收藏
  const handleEditResource = async (id: string, newContent: string) => {
    try {
      if (!id) {
        console.error('Invalid ID provided for editing:', id);
        toast({
          title: "编辑失败",
          description: "无效的干货收藏ID",
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
          category: 'knowledge'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Edit API error: ${response.status} ${errorData}`);
        throw new Error(`Failed to edit resource: ${response.status} ${errorData}`);
      }

      // 重新加载干货收藏
      await loadResources(true)

      toast({
        title: "干货收藏已更新",
        description: "干货收藏已成功更新",
        variant: "default",
      })
    } catch (err) {
      console.error('Error editing resource:', err)
      toast({
        title: "编辑失败",
        description: "编辑干货收藏时出错，请重试",
        variant: "destructive",
      })
    }
  }

  // 显示新干货收藏输入框
  const handleShowNewResourceInput = useCallback(() => {
    setShowNewResourceInput(true);
  }, []);

  // 创建新干货收藏
  const handleCreateResource = useCallback(async () => {
    if (!newResourceContent.trim()) {
      toast({
        title: "内容不能为空",
        description: "请输入干货收藏内容",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newResourceContent.trim(),
          category: 'knowledge'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Create resource API error: ${response.status} ${errorData}`);
        throw new Error(`Failed to create resource: ${response.status} ${errorData}`);
      }

      // 重新加载干货收藏，绕过缓存获取最新数据
      await loadResources(true)

      // 重置输入框
      setNewResourceContent('');
      setShowNewResourceInput(false);

      toast({
        title: "干货收藏已创建",
        description: "新干货收藏已成功创建",
        variant: "default",
      })
    } catch (err) {
      console.error('Error creating resource:', err)
      toast({
        title: "创建失败",
        description: "创建干货收藏时出错，请重试",
        variant: "destructive",
      })
    }
  }, [loadResources, toast, newResourceContent]);

  // 初始加载
  useEffect(() => {
    // 首次加载时始终绕过缓存获取最新数据
    loadResources(true)

    // 每 10 秒自动刷新一次数据，强制绕过缓存
    const intervalId = setInterval(() => {
      loadResources(true); // 强制绕过缓存获取最新数据
    }, 10000); // 减少到 10 秒，确保能快速看到新内容

    // 添加页面可见性变化事件监听器
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 当页面变为可见时，强制刷新数据
        loadResources(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadResources])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-green-500 opacity-30 blur-3xl"></div>

        <div className="container relative z-10">
          <Link href="/" className="mb-6 inline-flex items-center text-xl font-medium text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回首页
          </Link>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-7xl font-black tracking-tighter md:text-8xl">干货收藏</h1>
              <p className="mt-4 max-w-2xl text-xl text-gray-300">
                收集有价值的知识、技巧和资源，方便随时查阅和分享。
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                className="flex items-center gap-2 bg-green-500 text-black hover:bg-green-600"
                onClick={handleShowNewResourceInput}
              >
                <Plus className="h-4 w-4" />
                新收藏
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Resource Input */}
      {showNewResourceInput && (
        <section className="py-6 border-b border-gray-800">
          <div className="container">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">新干货收藏</h2>
              <p className="text-gray-400">添加有价值的知识、技巧或资源。</p>
            </div>
            <div className="space-y-4">
              <Textarea
                placeholder="输入干货收藏内容..."
                className="min-h-[120px] bg-gray-900 border-gray-700"
                value={newResourceContent}
                onChange={(e) => setNewResourceContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewResourceInput(false)}>取消</Button>
                <Button onClick={handleCreateResource}>保存</Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Resources Grid */}
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
            ) : resources.length > 0 ? (
              resources.map((resource) => (
                <DeletableContentCard
                  key={resource.id}
                  id={resource.id}
                  content={resource.content}
                  category={resource.category}
                  created_at={resource.created_at || new Date().toISOString()}
                  updated_at={resource.updated_at}
                  onDelete={handleDeleteResource}
                  onEdit={handleEditResource}
                />
              ))
            ) : (
              <div className="col-span-3 p-6 text-center bg-gray-900 rounded-lg">
                <p className="text-gray-400">暂无干货收藏。在首页添加一些干货收藏吧！</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
