"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Plus, Save, Sparkles, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUncategorized } from "../contexts/UncategorizedContext"

export default function QuickCapture() {
  const [content, setContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { uncategorizedItems, addItem, deleteItem, clearItems } = useUncategorized()

  // 快速保存内容
  const handleQuickSave = () => {
    if (!content.trim()) return

    // 使用全局状态上下文中的添加方法
    addItem(content.trim())

    // 清空输入框
    setContent("")

    // 显示成功消息
    toast({
      title: "已保存",
      description: "内容已快速保存，稍后可以一次性分类",
      variant: "default",
    })
  }

  // 删除未分类项目
  const handleDeleteItem = (id: string) => {
    // 使用全局状态上下文中的删除方法
    deleteItem(id)
  }

  // 批量分类所有未分类内容
  const handleBatchClassify = async () => {
    if (uncategorizedItems.length === 0) return

    setIsProcessing(true)

    try {
      // 准备所有内容为一个字符串，每条之间用换行符分隔
      const allContent = uncategorizedItems.map(item => item.content).join("\n\n")

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

      // 清空未分类列表
      clearItems()

      // 显示成功消息
      toast({
        title: "分类完成",
        description: `已成功分类并保存 ${uncategorizedItems.length} 条内容`,
        variant: "default",
      })
    } catch (error) {
      console.error("批量分类错误:", error)
      toast({
        title: "分类失败",
        description: "处理内容时出错，请重试",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <div className="mb-4">
        <h3 className="mb-2 text-xl font-bold">快速记录</h3>
        <p className="text-sm text-gray-400">快速记录想法，按回车保存，Shift+回车换行</p>
      </div>

      {/* 输入区域 */}
      <div className="mb-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="输入任何内容，按回车保存，Shift+回车换行..."
          className="min-h-[100px] border-2 border-gray-700 bg-black text-white placeholder:text-gray-500 focus:border-fuchsia-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleQuickSave()
            }
          }}
        />
      </div>

      {/* 按钮区域 */}
      <div className="mb-6 flex gap-2">
        <Button
          onClick={handleQuickSave}
          disabled={!content.trim() || isProcessing}
          className="flex-1 bg-fuchsia-500 text-white hover:bg-fuchsia-600"
        >
          <Save className="mr-2 h-4 w-4" />
          快速保存
        </Button>

        <Button
          onClick={handleBatchClassify}
          disabled={uncategorizedItems.length === 0 || isProcessing}
          className="flex-1 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-300 text-black hover:opacity-90"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isProcessing ? "处理中..." : `一键分类 (${uncategorizedItems.length})`}
        </Button>
      </div>

      {/* 未分类内容列表 */}
      {uncategorizedItems.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-400">未分类内容 ({uncategorizedItems.length})</h4>
          <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-md border border-gray-800 bg-black/50 p-2">
            {uncategorizedItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between rounded-md border border-gray-800 bg-gray-900 p-3">
                <div className="flex-1 pr-2">
                  <p className="line-clamp-2 text-sm">{item.content}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatTimestamp(item.timestamp)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 rounded-full text-gray-500 hover:bg-red-900/20 hover:text-red-500"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
