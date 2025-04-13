"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import DeletableContentCard from "@/components/deletable-content-card"
import { useToast } from "@/hooks/use-toast"

// 定义干货收藏类型
interface KnowledgeItem {
  id: string;
  content: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export default function KnowledgePage() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewKnowledgeInput, setShowNewKnowledgeInput] = useState(false)
  const [newKnowledgeContent, setNewKnowledgeContent] = useState('')
  const { toast } = useToast()

  // 加载干货收藏数据
  const loadKnowledgeItems = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content?category=knowledge')
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge items')
      }

      const responseData = await response.json()
      const knowledgeData = responseData.data || []
      setKnowledgeItems(knowledgeData)
    } catch (err) {
      console.error('Error loading knowledge items:', err)
      setError('加载干货收藏时出错，请刷新页面重试。')
    } finally {
      setIsLoading(false)
    }
  }

  // 删除干货收藏
  const handleDeleteKnowledgeItem = async (id: string) => {
    try {
      console.log(`Attempting to delete knowledge item with ID: ${id}`);

      if (!id) {
        console.error('Invalid ID provided for deletion:', id);
        toast({
          title: "删除失败",
          description: "无效的干货ID",
          variant: "destructive",
        });
        return;
      }

      // 先从前端状态中移除该干货，提供即时反馈
      setKnowledgeItems(knowledgeItems.filter(item => item.id !== id));

      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Delete API error: ${response.status} ${errorData}`);
        // 如果删除失败，重新加载数据恢复状态
        await loadKnowledgeItems();
        throw new Error(`Failed to delete knowledge item: ${response.status} ${errorData}`);
      }

      toast({
        title: "干货已删除",
        description: "干货已成功删除",
        variant: "default",
      })
    } catch (err) {
      console.error('Error deleting knowledge item:', err)
      toast({
        title: "删除失败",
        description: "删除干货时出错，请重试",
        variant: "destructive",
      })
    }
  }

  // 编辑干货收藏
  const handleEditKnowledgeItem = async (id: string, newContent: string) => {
    try {
      console.log(`Attempting to edit knowledge item with ID: ${id}`);

      if (!id) {
        console.error('Invalid ID provided for editing:', id);
        toast({
          title: "编辑失败",
          description: "无效的干货ID",
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
          category: 'resources'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Edit API error: ${response.status} ${errorData}`);
        throw new Error(`Failed to edit knowledge item: ${response.status} ${errorData}`);
      }

      // 重新加载干货收藏
      await loadKnowledgeItems()

      toast({
        title: "干货已更新",
        description: "干货收藏已成功更新",
        variant: "default",
      })
    } catch (err) {
      console.error('Error editing knowledge item:', err)
      toast({
        title: "编辑失败",
        description: "编辑干货时出错，请重试",
        variant: "destructive",
      })
    }
  }

  // 创建新干货
  const handleCreateKnowledge = async () => {
    try {
      if (!newKnowledgeContent.trim()) {
        toast({
          title: "创建失败",
          description: "干货内容不能为空",
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
          content: newKnowledgeContent,
          category: 'resources'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Create API error: ${response.status} ${errorData}`);
        throw new Error(`Failed to create knowledge item: ${response.status} ${errorData}`);
      }

      // 重置表单
      setNewKnowledgeContent('');
      setShowNewKnowledgeInput(false);

      // 重新加载干货收藏
      await loadKnowledgeItems();

      toast({
        title: "干货已创建",
        description: "新干货已成功创建",
        variant: "default",
      })
    } catch (err) {
      console.error('Error creating knowledge item:', err)
      toast({
        title: "创建失败",
        description: "创建干货时出错，请重试",
        variant: "destructive",
      })
    }
  };

  // 初始加载
  useEffect(() => {
    loadKnowledgeItems()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-green-400 opacity-30 blur-3xl"></div>

        <div className="container relative z-10">
          <Link href="/" className="mb-6 inline-flex items-center text-xl font-medium text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回首页
          </Link>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-7xl font-black tracking-tighter md:text-8xl">干货收藏</h1>
              <p className="mt-4 max-w-2xl text-xl text-gray-300">
                收集和整理有价值的知识、技巧和资源。
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                className="flex items-center gap-2 bg-green-400 text-black hover:bg-green-500"
                onClick={() => setShowNewKnowledgeInput(!showNewKnowledgeInput)}
              >
                <Plus className="h-4 w-4" />
                新干货
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Knowledge Input */}
      {showNewKnowledgeInput && (
        <section className="py-6 border-b border-gray-800">
          <div className="container">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">新干货</h2>
              <p className="text-gray-400">添加有价值的知识、技巧和资源。</p>
            </div>
            <div className="space-y-4">
              <Textarea
                placeholder="输入干货内容..."
                className="min-h-[120px] bg-gray-900 border-gray-700"
                value={newKnowledgeContent}
                onChange={(e) => setNewKnowledgeContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewKnowledgeInput(false)}>取消</Button>
                <Button onClick={handleCreateKnowledge}>保存</Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Knowledge Grid */}
      <section className="py-8">
        <div className="container">
          <h2 className="mb-8 text-3xl font-bold">干货收藏</h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-3 p-6 text-center bg-gray-900 rounded-lg">
                <p className="text-gray-400">加载中...</p>
              </div>
            ) : error ? (
              <div className="col-span-3 p-6 text-center bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            ) : knowledgeItems.length > 0 ? (
              knowledgeItems.map((item) => (
                <DeletableContentCard
                  key={item.id}
                  id={item.id}
                  content={item.content}
                  category={item.category}
                  created_at={item.created_at || new Date().toISOString()}
                  updated_at={item.updated_at}
                  onDelete={handleDeleteKnowledgeItem}
                  onEdit={handleEditKnowledgeItem}
                />
              ))
            ) : (
              <div className="col-span-3 p-6 text-center bg-gray-900 rounded-lg">
                <p className="text-gray-400">暂无干货收藏。在首页添加一些干货吧！</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
