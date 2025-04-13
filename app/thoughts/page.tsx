"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import DeletableContentCard from "@/components/deletable-content-card"
import { useToast } from "@/hooks/use-toast"

// 定义想法类型
interface Thought {
  id: string;
  content: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export default function ThoughtsPage() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewThoughtInput, setShowNewThoughtInput] = useState(false)
  const [newThoughtContent, setNewThoughtContent] = useState('')
  const { toast } = useToast()

  // 加载想法数据 - 使用 useCallback 优化
  const loadThoughts = useCallback(async (bypassCache = false) => {
    setIsLoading(true)
    setError(null)

    try {
      // 使用标准的 URL 查询参数格式
      let url = '/api/content?category=ideas';
      if (bypassCache) {
        url += `&forceRefresh=true&_=${Date.now()}`;
      }
      console.log('Fetching URL:', url);
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
        throw new Error('Failed to fetch thoughts')
      }

      const responseData = await response.json()
      const thoughtsData = responseData.data || []
      console.log('Loaded thoughts:', thoughtsData.length)
      setThoughts(thoughtsData)
    } catch (err) {
      console.error('Error loading thoughts:', err)
      setError('加载想法时出错，请刷新页面重试。')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 删除想法 - 增强版本
  const handleDeleteThought = async (id: string) => {
    try {
      console.log(`Attempting to delete thought with ID: ${id}`);

      if (!id) {
        console.error('Invalid ID provided for deletion:', id);
        toast({
          title: "删除失败",
          description: "无效的想法ID",
          variant: "destructive",
        });
        return;
      }

      // 先从前端状态中移除该想法，提供即时反馈
      const thoughtToDelete = thoughts.find(thought => thought.id === id);
      if (!thoughtToDelete) {
        console.error('Thought not found in current state:', id);
        toast({
          title: "删除失败",
          description: "找不到要删除的想法",
          variant: "destructive",
        });
        return;
      }

      // 保存要删除的想法，以便在删除失败时恢复
      const backupThought = { ...thoughtToDelete };

      // 从前端状态中移除
      setThoughts(prevThoughts => prevThoughts.filter(thought => thought.id !== id));

      // 发送删除请求
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      // 解析响应为JSON
      const result = await response.json();
      console.log('Delete API response:', result);

      // 检查响应状态和结果成功标志
      if (!response.ok || !result.success) {
        console.error(`Delete API error: ${response.status}`, result);

        // 如果删除失败，将想法恢复到前端状态
        setThoughts(prevThoughts => [...prevThoughts, backupThought]);

        // 强制重新加载数据，确保前端和后端数据一致
        await loadThoughts(true);

        toast({
          title: "删除失败",
          description: result.message || "删除想法时出错，请重试",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "想法已删除",
        description: "想法已成功删除",
        variant: "default",
      })
    } catch (err) {
      console.error('Error deleting thought:', err)
      toast({
        title: "删除失败",
        description: "删除想法时出错，请重试",
        variant: "destructive",
      })
    }
  }

  // 编辑想法
  const handleEditThought = async (id: string, newContent: string) => {
    try {
      console.log(`Attempting to edit thought with ID: ${id}`);

      if (!id) {
        console.error('Invalid ID provided for editing:', id);
        toast({
          title: "编辑失败",
          description: "无效的想法ID",
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
          category: 'ideas'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Edit API error: ${response.status} ${errorData}`);
        throw new Error(`Failed to edit thought: ${response.status} ${errorData}`);
      }

      // 重新加载想法
      await loadThoughts()

      toast({
        title: "想法已更新",
        description: "想法已成功更新",
        variant: "default",
      })
    } catch (err) {
      console.error('Error editing thought:', err)
      toast({
        title: "编辑失败",
        description: "编辑想法时出错，请重试",
        variant: "destructive",
      })
    }
  }

  // 显示新想法输入框
  const handleShowNewThoughtInput = useCallback(() => {
    setShowNewThoughtInput(true);
  }, []);

  // 取消创建新想法
  const handleCancelNewThought = useCallback(() => {
    setShowNewThoughtInput(false);
    setNewThoughtContent('');
  }, []);

  // 创建新想法
  const handleCreateThought = useCallback(async () => {
    // 如果没有输入内容，则使用默认文本
    const content = newThoughtContent.trim() || '新想法';

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          category: 'ideas'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Create thought API error: ${response.status} ${errorData}`);
        throw new Error(`Failed to create thought: ${response.status} ${errorData}`);
      }

      // 重新加载想法，绕过缓存获取最新数据
      await loadThoughts(true)

      // 重置输入框
      setNewThoughtContent('');
      setShowNewThoughtInput(false);

      toast({
        title: "想法已创建",
        description: "新想法已成功创建",
        variant: "default",
      })
    } catch (err) {
      console.error('Error creating thought:', err)
      toast({
        title: "创建失败",
        description: "创建想法时出错，请重试",
        variant: "destructive",
      })
    }
  }, [loadThoughts, toast, newThoughtContent]);

  // 初始加载
  useEffect(() => {
    // 首次加载时始终绕过缓存获取最新数据
    loadThoughts(true) // 强制绕过缓存获取最新数据

    // 每 10 秒自动刷新一次数据，强制绕过缓存
    const intervalId = setInterval(() => {
      loadThoughts(true); // 强制绕过缓存获取最新数据
    }, 10000); // 减少到 10 秒，确保能快速看到新内容

    // 添加页面可见性变化事件监听器
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 当页面变为可见时，强制刷新数据
        loadThoughts(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadThoughts])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-cyan-500 opacity-30 blur-3xl"></div>

        <div className="container relative z-10">
          <Link href="/" className="mb-6 inline-flex items-center text-xl font-medium text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回首页
          </Link>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-7xl font-black tracking-tighter md:text-8xl">想法</h1>
              <p className="mt-4 max-w-2xl text-xl text-gray-300">
                捕捉灵感、创意和思考，让它们不再转瞬即逝。
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                className="flex items-center gap-2 bg-cyan-500 text-black hover:bg-cyan-600"
                onClick={handleShowNewThoughtInput}
              >
                <Plus className="h-4 w-4" />
                新想法
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Thought Input */}
      {showNewThoughtInput && (
        <section className="py-6 border-b border-gray-800">
          <div className="container">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">新想法</h2>
              <p className="text-gray-400">记录你的想法、创意和灵感。</p>
            </div>

            <div className="mb-4">
              <Textarea
                placeholder="输入你的想法..."
                className="min-h-[120px] bg-gray-900 border-gray-700 text-white"
                value={newThoughtContent}
                onChange={(e) => setNewThoughtContent(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="bg-cyan-500 text-black hover:bg-cyan-600"
                onClick={handleCreateThought}
              >
                保存想法
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={handleCancelNewThought}
              >
                取消
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Thoughts Grid */}
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
            ) : thoughts.length > 0 ? (
              thoughts.map((thought) => (
                <DeletableContentCard
                  key={thought.id}
                  id={thought.id}
                  content={thought.content}
                  category={thought.category}
                  created_at={thought.created_at || new Date().toISOString()}
                  updated_at={thought.updated_at}
                  onDelete={handleDeleteThought}
                  onEdit={handleEditThought}
                />
              ))
            ) : (
              <div className="col-span-3 p-6 text-center bg-gray-900 rounded-lg">
                <p className="text-gray-400">暂无想法。在首页添加一些想法吧！</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
