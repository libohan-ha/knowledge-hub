"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EditableContentItem from "@/components/editable-content-item"
import SearchContent from "@/components/search-content"
import AddContentForm from "@/components/add-content-form"

export default function ManagePage() {
  const [tasks, setTasks] = useState([])
  const [articles, setArticles] = useState([])
  const [ideas, setIdeas] = useState([])
  const [knowledge, setKnowledge] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("search")
  const [showAddForm, setShowAddForm] = useState(false)

  // 加载所有内容
  const loadContent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 加载任务
      const tasksResponse = await fetch("/api/content?category=tasks")
      const tasksData = await tasksResponse.json()
      setTasks(tasksData)

      // 加载文章
      const articlesResponse = await fetch("/api/content?category=articles")
      const articlesData = await articlesResponse.json()
      setArticles(articlesData)

      // 加载想法
      const ideasResponse = await fetch("/api/content?category=ideas")
      const ideasData = await ideasResponse.json()
      setIdeas(ideasData)

      // 加载干货
      const knowledgeResponse = await fetch("/api/content?category=knowledge")
      const knowledgeData = await knowledgeResponse.json()
      setKnowledge(knowledgeData)
    } catch (err) {
      console.error("加载内容错误:", err)
      setError("加载内容时出错，请刷新页面重试。")
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadContent()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600 opacity-30 blur-3xl"></div>

        <div className="container relative z-10">
          <Link href="/" className="mb-6 inline-flex items-center text-xl font-medium text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回首页
          </Link>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 md:text-8xl">
                内容管理
              </h1>
              <p className="mt-4 max-w-2xl text-xl text-gray-300">
                搜索、编辑、删除和添加您的内容。
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                className="flex items-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="h-4 w-4" />
                {showAddForm ? "隐藏表单" : "添加内容"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Add Content Form */}
      {showAddForm && (
        <section className="py-8">
          <div className="container">
            <h2 className="mb-6 text-2xl font-bold">添加新内容</h2>
            <AddContentForm />
          </div>
        </section>
      )}

      {/* Content Management */}
      <section className="py-8">
        <div className="container">
          <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 grid w-full grid-cols-5 bg-gray-900">
              <TabsTrigger value="search" className="data-[state=active]:bg-gray-800">
                搜索
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-gray-800">
                安排
              </TabsTrigger>
              <TabsTrigger value="articles" className="data-[state=active]:bg-gray-800">
                待看文章
              </TabsTrigger>
              <TabsTrigger value="ideas" className="data-[state=active]:bg-gray-800">
                想法
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="data-[state=active]:bg-gray-800">
                干货收藏
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="mt-0">
              <SearchContent />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <h2 className="mb-6 text-2xl font-bold">安排</h2>
              {isLoading ? (
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
                  <p className="text-gray-400">加载中...</p>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : tasks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {tasks.map((task) => (
                    <EditableContentItem
                      key={task.id}
                      id={task.id}
                      content={task.content}
                      category={task.category}
                      created_at={task.created_at}
                      updated_at={task.updated_at}
                      onUpdate={loadContent}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
                  <p className="text-gray-400">暂无安排</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="articles" className="mt-0">
              <h2 className="mb-6 text-2xl font-bold">待看文章</h2>
              {isLoading ? (
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
                  <p className="text-gray-400">加载中...</p>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : articles.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {articles.map((article) => (
                    <EditableContentItem
                      key={article.id}
                      id={article.id}
                      content={article.content}
                      category={article.category}
                      created_at={article.created_at}
                      updated_at={article.updated_at}
                      onUpdate={loadContent}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
                  <p className="text-gray-400">暂无待看文章</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ideas" className="mt-0">
              <h2 className="mb-6 text-2xl font-bold">想法</h2>
              {isLoading ? (
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
                  <p className="text-gray-400">加载中...</p>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : ideas.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {ideas.map((idea) => (
                    <EditableContentItem
                      key={idea.id}
                      id={idea.id}
                      content={idea.content}
                      category={idea.category}
                      created_at={idea.created_at}
                      updated_at={idea.updated_at}
                      onUpdate={loadContent}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
                  <p className="text-gray-400">暂无想法</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="knowledge" className="mt-0">
              <h2 className="mb-6 text-2xl font-bold">干货收藏</h2>
              {isLoading ? (
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
                  <p className="text-gray-400">加载中...</p>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : knowledge.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {knowledge.map((item) => (
                    <EditableContentItem
                      key={item.id}
                      id={item.id}
                      content={item.content}
                      category={item.category}
                      created_at={item.created_at}
                      updated_at={item.updated_at}
                      onUpdate={loadContent}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
                  <p className="text-gray-400">暂无干货收藏</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  )
}
