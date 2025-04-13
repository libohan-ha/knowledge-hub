"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUncategorized } from "../contexts/UncategorizedContext"

export default function BatchClassifyShortcut() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { uncategorizedItems, clearItems, refreshItems } = useUncategorized()

  // 批量分类所有未分类内容
  const handleBatchClassify = async () => {
    // 使用全局状态中的未分类内容
    if (!uncategorizedItems || uncategorizedItems.length === 0) {
      toast({
        title: "没有未分类内容",
        description: "当前没有需要分类的内容",
        variant: "default",
      })
      return
    }

    // 防止重复处理
    if (isProcessing) return
    setIsProcessing(true)

    // 显示开始分类的通知
    const startToastId = toast({
      title: "正在分类",
      description: `正在处理 ${uncategorizedItems.length} 条内容...`,
      variant: "default",
    })

    try {
      // 准备所有内容为一个字符串，每条之间用换行符分隔
      const allContent = uncategorizedItems.map((item: any) => item.content).join("\n\n")

      // 更新通知
      toast({
        id: startToastId,
        title: "正在分类",
        description: `正在调用 AI 分类服务...`,
        variant: "default",
      })

      // 调用批量分类API
      const response = await fetch('/api/classify-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: allContent }),
      })

      if (!response.ok) {
        throw new Error('分类失败')
      }

      const result = await response.json()

      // 输出分类结果的详细信息
      console.log('分类结果详情:')
      console.log('- 文章数量:', result.articles?.length || 0)
      console.log('- 想法数量:', result.ideas?.length || 0)
      console.log('- 安排数量:', result.tasks?.length || 0)
      console.log('- 干货收藏数量:', result.resources?.length || 0)

      // 更新通知
      toast({
        id: startToastId,
        title: "正在分类",
        description: `分类完成，正在保存结果...`,
        variant: "default",
      })

      // 保存分类结果
      const saveResponse = await fetch('/api/content/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      })

      if (!saveResponse.ok) {
        throw new Error('保存分类结果失败')
      }

      // 获取保存结果
      const saveResult = await saveResponse.json()
      console.log('保存结果详情:', saveResult)

      // 清空未分类列表
      console.log('分类前的未分类内容数量:', uncategorizedItems.length)

      // 使用 localStorage 直接清除数据
      localStorage.removeItem("uncategorized-items")

      // 延迟一下再刷新状态，确保数据已经清除
      setTimeout(() => {
        clearItems()
        refreshItems()
        console.log('分类后的未分类内容数量（延迟后）:', uncategorizedItems.length)
      }, 100)

      // 生成分类结果的摘要
      const articleCount = result.articles?.length || 0
      const ideasCount = result.ideas?.length || 0
      const tasksCount = result.tasks?.length || 0
      const resourcesCount = result.resources?.length || 0

      // 生成导航建议和链接
      let navigationLinks = []
      if (articleCount > 0) navigationLinks.push(`<a href="/read-later" style="color: #d946ef; text-decoration: underline;">待看文章(${articleCount})</a>`)
      if (ideasCount > 0) navigationLinks.push(`<a href="/thoughts" style="color: #06b6d4; text-decoration: underline;">想法(${ideasCount})</a>`)
      if (tasksCount > 0) navigationLinks.push(`<a href="/tasks" style="color: #eab308; text-decoration: underline;">安排(${tasksCount})</a>`)
      if (resourcesCount > 0) navigationLinks.push(`<a href="/resources" style="color: #22c55e; text-decoration: underline;">干货收藏(${resourcesCount})</a>`)

      const navigationHtml = navigationLinks.join(' | ')

      // 更新最终成功通知
      const descriptionHtml = `已成功分类并保存 ${uncategorizedItems.length} 条内容。点击查看：${navigationHtml}`

      toast({
        id: startToastId,
        title: "分类完成",
        description: {
          toString: () => descriptionHtml,
          __html: descriptionHtml
        },
        variant: "default",
        duration: 15000, // 显示时间更长，确保用户能看到
      })
    } catch (error) {
      console.error("批量分类错误:", error)

      // 更新错误通知
      toast({
        id: startToastId,
        title: "分类失败",
        description: "处理内容时出错，请重试",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // 监听键盘快捷键 (Ctrl+L)
  // 使用 useCallback 包装 handleBatchClassify 函数，确保它能访问最新的状态
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否是 Ctrl+L 组合键
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        // 防止默认行为（如斜体文本格式化）
        e.preventDefault()

        // 检查是否在输入框中
        const activeElement = document.activeElement as HTMLElement
        const isInInput = activeElement.tagName === 'INPUT' ||
                         activeElement.tagName === 'TEXTAREA' ||
                         activeElement.isContentEditable

        // 如果不在输入框中，或者明确按下了 Ctrl+Shift+L，则触发批量分类
        if (!isInInput || (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l')) {
          handleBatchClassify()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null // 这个组件不渲染任何UI，只监听快捷键
}
