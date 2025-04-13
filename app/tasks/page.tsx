"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, CheckCircle2, Circle, Plus, X, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input" // 暂时不需要
import { Textarea } from "@/components/ui/textarea"
import DeletableTaskCard from "@/components/deletable-task-card"
import { useToast } from "@/hooks/use-toast"

// 定义任务类型
interface Task {
  id: string;
  content: string;
  category: string;
  created_at?: string;
  updated_at?: string;
  priority?: string;
  due_date?: string;
  tags?: string[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false) // 初始值设置为 false，避免首次加载被跳过
  const [error, setError] = useState<string | null>(null)
  const [showNewTaskInput, setShowNewTaskInput] = useState(false) // 控制新任务输入框的显示
  const [newTaskContent, setNewTaskContent] = useState('') // 新任务的内容
  const [refreshKey, setRefreshKey] = useState(0) // 用于强制刷新的key
  const { toast } = useToast()

  // 加载任务数据 - 使用 useCallback 优化
  const loadTasks = useCallback(async (forceRefresh = false) => {
    console.log('loadTasks called, forceRefresh:', forceRefresh);
    // 避免重复加载，如果已经在加载中且不是强制刷新
    if (isLoading && !forceRefresh) {
      console.log('Already loading, skipping');
      return;
    }

    setIsLoading(true)
    setError(null)
    console.log('Loading state set to true');

    try {
      console.log('Fetching tasks from API...');
      // 始终使用强制缓存控制标头，确保获取最新数据
      const timestamp = Date.now(); // 添加时间戳防止缓存
      const forceRefreshParam = forceRefresh ? '&forceRefresh=true' : '';
      const response = await fetch(`/api/content?category=tasks${forceRefreshParam}&_=${timestamp}&refreshKey=${refreshKey}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })

      console.log('API response received:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`)
      }

      console.log('Parsing JSON response...');
      const result = await response.json()
      console.log('API response received:', result);

      // 检查响应格式
      if (!result || !result.success) {
        console.error('API response indicates failure:', result);
        throw new Error('Failed to fetch tasks: API response indicates failure');
      }

      // 获取数据数组
      const tasksData = result.data;
      console.log('Tasks data extracted:', tasksData?.length || 0);

      // 如果没有数据，设置为空数组
      if (!tasksData || !Array.isArray(tasksData)) {
        console.log('No tasks data or invalid format, using empty arrays');
        setTasks([]);
        setCompletedTasks([]);
        setIsLoading(false);
        return;
      }

      // 这里我们可以添加一些逻辑来区分进行中和已完成的任务
      // 由于数据库中没有状态字段，我们可以根据内容来猜测状态
      console.log('Filtering tasks by completion status...');
      const completed = tasksData.filter(task =>
        task.content && (
          task.content.includes('✓') ||
          task.content.includes('√') ||
          task.content.includes('完成') ||
          task.content.includes('已完成')
        )
      )
      const inProgress = tasksData.filter(task =>
        task.content && (
          !task.content.includes('✓') &&
          !task.content.includes('√') &&
          !task.content.includes('完成') &&
          !task.content.includes('已完成')
        )
      )

      console.log(`Filtered tasks: ${inProgress.length} in progress, ${completed.length} completed`);
      setTasks(inProgress)
      setCompletedTasks(completed)
      console.log('State updated with filtered tasks');
    } catch (err) {
      console.error('Error loading tasks:', err)
      setError('加载任务时出错，请刷新页面重试。')
    } finally {
      console.log('Setting loading state to false');
      setIsLoading(false)
      console.log('Loading state set to false');
    }
  }, [toast])

  // 删除任务 - 使用 useCallback 优化
  const handleDeleteTask = useCallback(async (id: string) => {
    try {
      console.log(`Attempting to delete task with ID: ${id}`);

      if (!id) {
        console.error('Invalid ID provided for deletion:', id);
        toast({
          title: "删除失败",
          description: "无效的任务ID",
          variant: "destructive",
        });
        return;
      }

      // 先从前端状态中移除该任务，提供即时反馈
      // 检查任务是否在进行中或已完成的列表中
      const inProgressTask = tasks.find(task => task.id === id);
      const completedTask = completedTasks.find(task => task.id === id);

      if (inProgressTask) {
        setTasks(tasks.filter(task => task.id !== id));
      } else if (completedTask) {
        setCompletedTasks(completedTasks.filter(task => task.id !== id));
      }

      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Delete API error: ${response.status} ${errorData}`);
        // 如果删除失败，重新加载数据恢复状态
        await loadTasks();
        throw new Error(`Failed to delete task: ${response.status} ${errorData}`);
      }

      toast({
        title: "任务已删除",
        description: "任务已成功删除",
        variant: "default",
      })
    } catch (err) {
      console.error('Error deleting task:', err)
      toast({
        title: "删除失败",
        description: "删除任务时出错，请重试",
        variant: "destructive",
      })
    }
  }, [toast, loadTasks, tasks, completedTasks])

  // 更新任务状态 - 使用 useCallback 优化
  const handleTaskStatusChange = useCallback(async (id: string, newStatus: "in-progress" | "completed") => {
    // 找到要更新的任务
    const taskToUpdate = [...tasks, ...completedTasks].find(task => task.id === id);
    if (!taskToUpdate) {
      console.error(`Task with ID ${id} not found`);
      return;
    }

    // 创建任务的副本以便在出错时恢复
    const tasksCopy = [...tasks];
    const completedTasksCopy = [...completedTasks];

    // 准备更新后的内容
    let updatedContent = taskToUpdate.content;

    // 如果状态是已完成，添加完成标记（如果没有的话）
    if (newStatus === "completed" && !updatedContent.startsWith('✓')) {
      updatedContent = `✓ ${updatedContent}`;
    }
    // 如果状态是进行中，移除完成标记（如果有的话）
    else if (newStatus === "in-progress") {
      updatedContent = updatedContent.replace(/^✓\s*/, '');
    }

    // 乐观更新：先在前端更新状态
    if (newStatus === "completed") {
      // 将任务从进行中移动到已完成
      setTasks(tasks.filter(t => t.id !== id));
      setCompletedTasks([...completedTasks, {...taskToUpdate, content: updatedContent}]);
    } else {
      // 将任务从已完成移动到进行中
      setCompletedTasks(completedTasks.filter(t => t.id !== id));
      setTasks([...tasks, {...taskToUpdate, content: updatedContent}]);
    }

    try {
      // 异步发送状态更新到服务器
      const response = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          status: newStatus,
          content: updatedContent,
          category: 'tasks'
        }),
        cache: 'no-store'
      })

      // 解析响应为JSON
      const result = await response.json();
      console.log('Update task status API response:', result);

      // 检查响应状态和结果成功标志
      if (!response.ok || !result.success) {
        console.error(`Update task status API error: ${response.status}`, result);
        throw new Error(result.message || `Failed to update task status: ${response.status}`);
      }

      // 更新成功后，增加refreshKey并强制重新加载数据
      setRefreshKey(prev => prev + 1); // 增加refreshKey强制刷新
      await loadTasks(true); // 使用强制刷新参数
    } catch (err) {
      // 如果出错，恢复原始状态
      console.error('Error updating task status:', err)
      setTasks(tasksCopy);
      setCompletedTasks(completedTasksCopy);
      toast({
        title: "状态更新失败",
        description: "更新任务状态时出错，请重试",
        variant: "destructive",
      })
    }
  }, [tasks, completedTasks, toast])

  // 显示新任务输入框
  const handleShowNewTaskInput = useCallback(() => {
    setShowNewTaskInput(true);
  }, []);

  // 取消创建新任务
  const handleCancelNewTask = useCallback(() => {
    setShowNewTaskInput(false);
    setNewTaskContent('');
  }, []);

  // 创建新任务
  const handleCreateTask = useCallback(async () => {
    // 如果没有输入内容，则使用默认文本
    const content = newTaskContent.trim() || '新任务';

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          category: 'tasks'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Create task API error: ${response.status} ${errorData}`);
        throw new Error(`Failed to create task: ${response.status} ${errorData}`);
      }

      // 重新加载任务
      await loadTasks()

      // 重置输入框
      setNewTaskContent('');
      setShowNewTaskInput(false);

      toast({
        title: "任务已创建",
        description: "新任务已成功创建",
        variant: "default",
      })
    } catch (err) {
      console.error('Error creating task:', err)
      toast({
        title: "创建失败",
        description: "创建任务时出错，请重试",
        variant: "destructive",
      })
    }
  }, [loadTasks, toast, newTaskContent])

  // 编辑任务内容 - 使用 useCallback 优化
  const handleEditTask = useCallback(async (id: string, newContent: string) => {
    try {
      // 获取当前任务信息
      const taskToEdit = [...tasks, ...completedTasks].find(task => task.id === id)
      if (!taskToEdit) {
        throw new Error('Task not found')
      }

      // 创建任务的副本以便在出错时恢复
      const tasksCopy = [...tasks];
      const completedTasksCopy = [...completedTasks];

      // 乐观更新：先在前端更新内容
      if (tasks.some(t => t.id === id)) {
        setTasks(tasks.map(t => t.id === id ? {...t, content: newContent} : t));
      } else {
        setCompletedTasks(completedTasks.map(t => t.id === id ? {...t, content: newContent} : t));
      }

      try {
        // 异步发送更新到服务器
        const response = await fetch(`/api/content/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newContent,
            category: taskToEdit.category
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update task content')
        }
      } catch (err) {
        // 如果出错，恢复原始状态
        console.error('Error editing task:', err)
        setTasks(tasksCopy);
        setCompletedTasks(completedTasksCopy);
        toast({
          title: "编辑失败",
          description: "编辑任务时出错，请重试",
          variant: "destructive",
        })
        throw err
      }
    } catch (err) {
      console.error('Error in handleEditTask:', err)
      throw err
    }
  }, [tasks, completedTasks, toast])

  // 初始加载
  useEffect(() => {
    // 首次加载时强制刷新数据
    loadTasks(true);

    // 每 10 秒自动刷新一次，确保能快速看到新内容
    const intervalId = setInterval(() => loadTasks(true), 10000);

    // 添加页面可见性变化事件监听器
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 当页面变为可见时，强制刷新数据
        console.log('Page became visible, forcing refresh');
        loadTasks(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // 只在组件挂载时运行一次

  // 当refreshKey变化时重新加载数据
  useEffect(() => {
    if (refreshKey > 0) { // 跳过初始值
      console.log(`refreshKey changed to ${refreshKey}, reloading tasks...`);
      loadTasks(true);
    }
  }, [refreshKey, loadTasks]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-yellow-400 opacity-30 blur-3xl"></div>

        <div className="container relative z-10">
          <Link href="/" className="mb-6 inline-flex items-center text-xl font-medium text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回首页
          </Link>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-7xl font-black tracking-tighter md:text-8xl">安排</h1>
              <p className="mt-4 max-w-2xl text-xl text-gray-300">
                管理您的任务和待办事项，保持高效和有条理。
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                className="flex items-center gap-2 bg-yellow-400 text-black hover:bg-yellow-500"
                onClick={handleShowNewTaskInput}
              >
                <Plus className="h-4 w-4" />
                新任务
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Task Input */}
      {showNewTaskInput && (
        <section className="py-8">
          <div className="container">
            <div className="rounded-lg bg-gray-900 p-6">
              <h3 className="mb-4 text-xl font-bold text-white">创建新任务</h3>
              <Textarea
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                placeholder="输入任务内容..."
                className="mb-4 min-h-[100px] bg-gray-800 border-gray-700 text-white"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateTask}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelNewTask}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  <X className="mr-2 h-4 w-4" />
                  取消
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tasks Lists */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-8 text-3xl font-bold flex items-center">
            <Circle className="mr-3 h-5 w-5 text-yellow-400" />
            进行中
          </h2>

          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-lg bg-gray-900 p-8 text-center">
                <p className="text-gray-400">加载中...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <DeletableTaskCard
                  key={task.id}
                  id={task.id}
                  title={task.content}
                  priority={(task.priority as "High" | "Medium" | "Low") || "Medium"} // 假设中等优先级
                  dueDate={task.due_date || "未设置日期"} // 如果没有日期字段
                  tags={task.tags || ["任务"]} // 如果没有标签字段
                  status="in-progress"
                  onDelete={handleDeleteTask}
                  onStatusChange={handleTaskStatusChange}
                  onEdit={handleEditTask}
                />
              ))
            ) : (
              <div className="rounded-lg bg-gray-900 p-8 text-center">
                <p className="text-gray-400">暂无进行中的任务</p>
              </div>
            )}
          </div>

          <h2 className="mb-8 mt-16 text-3xl font-bold flex items-center">
            <CheckCircle2 className="mr-3 h-5 w-5 text-green-400" />
            已完成
          </h2>

          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-lg bg-gray-900 p-8 text-center">
                <p className="text-gray-400">加载中...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : completedTasks.length > 0 ? (
              completedTasks.map((task) => (
                <DeletableTaskCard
                  key={task.id}
                  id={task.id}
                  title={task.content}
                  priority={(task.priority as "High" | "Medium" | "Low") || "Medium"}
                  dueDate={task.due_date || "未设置日期"}
                  tags={task.tags || ["任务"]}
                  status="completed"
                  onDelete={handleDeleteTask}
                  onStatusChange={handleTaskStatusChange}
                  onEdit={handleEditTask}
                />
              ))
            ) : (
              <div className="rounded-lg bg-gray-900 p-8 text-center">
                <p className="text-gray-400">暂无已完成的任务</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
