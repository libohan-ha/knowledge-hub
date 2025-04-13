"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import ClassificationConfirmation from "./classification-confirmation"
import { useToast } from "@/hooks/use-toast"

export default function AddContentForm() {
  const [content, setContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [classification, setClassification] = useState<any>(null)
  const { toast } = useToast()

  // 类别名称映射
  const categoryMap: {[key: string]: string} = {
    "articles": "待看文章",
    "ideas": "想法",
    "tasks": "安排",
    "resources": "干货收藏"
  }

  // 当用户输入内容时重置分类
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    // 如果内容变化，重置分类
    if (classification) {
      setClassification(null)
    }
  }

  // 分类内容
  const handleClassify = async () => {
    if (!content.trim()) return

    setIsProcessing(true)
    setError(null)

    try {
      console.log('Classifying content:', content.substring(0, 30) + '...')
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to classify content')
      }

      const result = await response.json()
      console.log('Classification result:', result)

      // 检查是否有内容被分类
      const hasContent = Object.values(result).some(
        (items: any) => Array.isArray(items) && items.length > 0
      )

      if (!hasContent) {
        console.error('No content classified')
        setError('无法分类内容，请重试。')
        setIsProcessing(false)
        return
      }

      // 设置分类结果，显示确认界面
      setClassification(result)
    } catch (err) {
      console.error('Error classifying content:', err)
      setError('分类内容时出错，请重试。')
    } finally {
      setIsProcessing(false)
    }
  }

  // 确认分类并保存
  const handleConfirmClassification = async (confirmedClassification: any) => {
    setIsProcessing(true)
    setError(null)

    try {
      console.log('Saving confirmed classification:', confirmedClassification)

      // 立即清空表单并显示成功消息，提高响应速度
      setContent('')
      setClassification(null)
      setSuccess(true)

      toast({
        title: "正在保存",
        description: "您的内容正在保存中",
        variant: "default",
      })

      // 开始保存请求
      const savePromise = fetch('/api/content/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmedClassification),
      })

      // 设置超时
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error('保存超时，但内容可能已保存')), 10000)
      })

      // 等待保存完成或超时
      const saveResponse: Response = await Promise.race([savePromise, timeoutPromise])

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        console.error('Save API error response:', errorData)
        throw new Error(errorData.error || 'Failed to save content')
      }

      // 异步获取保存结果，不阻塞界面
      saveResponse.json().then((saveResult: any) => {
        console.log('Save API success response:', saveResult)

        // 更新成功消息
        toast({
          title: "内容已保存",
          description: "您的内容已成功分类并保存",
          variant: "default",
        })
      })

      // 3秒后隐藏成功消息
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error saving content:', err)
      setError('保存内容时出错，请重试。')

      // 显示错误消息
      toast({
        title: "保存失败",
        description: err.message || '保存内容时出错，请重试。',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // 取消确认，返回编辑
  const handleCancelConfirmation = () => {
    setClassification(null)
  }

  // 如果有分类结果，显示确认界面
  if (classification) {
    return (
      <ClassificationConfirmation
        classification={classification}
        onConfirm={handleConfirmClassification}
        onCancel={handleCancelConfirmation}
      />
    )
  }

  return (
    <div className="rounded-lg bg-gray-900 p-8">
      {error && (
        <div className="mb-4 rounded-md bg-red-900 p-4 text-white">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-900 p-4 text-white">
          <p>内容已成功保存！</p>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="content" className="mb-2 block text-2xl font-bold">
          你的内容
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          placeholder="粘贴文章链接，写下你的想法，添加任务，或保存知识..."
          className="min-h-[200px] border-2 border-gray-700 bg-black text-xl text-white placeholder:text-gray-500 focus:border-fuchsia-500"
          disabled={isProcessing}
        />
      </div>

      <Button
        onClick={handleClassify}
        disabled={isProcessing || !content.trim()}
        className="w-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-300 py-6 text-xl font-bold text-black hover:opacity-90 disabled:opacity-50"
      >
        {isProcessing ? '处理中...' : '分类并保存'}
      </Button>
    </div>
  )
}
