"use client"

import { useState, memo, useEffect } from "react"
import { Pencil, Save, Trash2, X, CheckCircle, Circle } from "lucide-react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "./ui/dialog"
import { toast } from "@/hooks/use-toast"

interface DeletableContentCardProps {
  id: string
  content: string
  category: string
  created_at: string
  updated_at?: string
  is_read?: boolean // 添加已看状态
  onDelete: (id: string) => void
  onEdit?: (id: string, newContent: string) => void
  onToggleRead?: (id: string, isRead: boolean) => void // 添加切换已看状态的处理函数
}

function DeletableContentCard({
  id,
  content,
  category,
  created_at,
  updated_at,
  is_read = false,
  onDelete,
  onEdit,
  onToggleRead
}: DeletableContentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEditing, setIsEditing] = useState(content === '新内容')
  const [editedContent, setEditedContent] = useState(content)
  const [localIsRead, setLocalIsRead] = useState(is_read) // 本地已看状态

  // 监听 content 变化，更新编辑内容
  useEffect(() => {
    setEditedContent(content)
    // 如果是新内容，自动进入编辑模式
    if (content === '新内容') {
      setIsEditing(true)
    }
  }, [content])

  // 监听 is_read 变化，更新本地已看状态
  useEffect(() => {
    setLocalIsRead(is_read)
  }, [is_read])

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDelete = async () => {
    setIsProcessing(true)
    try {
      // 调用父组件的删除函数
      await onDelete(id)
      // 关闭删除对话框
      setIsDeleting(false)
    } catch (error) {
      console.error("Error deleting content:", error)
      toast({
        title: "删除失败",
        description: "删除内容时出错，请重试",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(content)
  }

  const handleSaveEdit = async () => {
    if (!onEdit || !editedContent.trim()) return

    try {
      await onEdit(id, editedContent)
      setIsEditing(false)
      toast({
        title: "内容已更新",
        description: "内容已成功更新",
        variant: "default",
      })
    } catch (error) {
      console.error("Error editing content:", error)
      toast({
        title: "编辑失败",
        description: "编辑内容时出错，请重试",
        variant: "destructive",
      })
    }
  }

  // 切换已看状态
  const handleToggleRead = async () => {
    if (!onToggleRead) return

    // 先更新本地状态，提供即时反馈
    const newReadStatus = !localIsRead
    setLocalIsRead(newReadStatus)

    try {
      // 调用父组件的处理函数
      await onToggleRead(id, newReadStatus)

      // 成功后显示通知
      toast({
        title: newReadStatus ? "文章已标记为已看" : "文章已标记为未看",
        description: newReadStatus ? "文章已标记为已阅读" : "文章已标记为未阅读",
        variant: "default",
      })
    } catch (error) {
      // 如果出错，恢复本地状态
      setLocalIsRead(!newReadStatus)
      console.error("Error toggling read status:", error)
      toast({
        title: "状态更新失败",
        description: "更新文章状态时出错，请重试",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition-all hover:border-gray-700 relative group">
      {/* 删除按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 opacity-0 text-gray-400 hover:text-red-500 hover:bg-transparent group-hover:opacity-100 transition-opacity"
        onClick={() => setIsDeleting(true)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">删除</span>
      </Button>

      {/* 已看按钮 - 只在文章类别且有onToggleRead函数时显示 */}
      {category === 'articles' && onToggleRead && (
        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-12 top-2 h-8 w-8 opacity-0 ${localIsRead ? 'text-green-500' : 'text-gray-400'} hover:text-green-500 hover:bg-transparent group-hover:opacity-100 transition-opacity`}
          onClick={handleToggleRead}
          title={localIsRead ? '标记为未看' : '标记为已看'}
        >
          {localIsRead ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
          <span className="sr-only">{localIsRead ? '标记为未看' : '标记为已看'}</span>
        </Button>
      )}

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[100px] border-gray-700 bg-gray-800 text-white"
            placeholder="输入内容..."
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSaveEdit}
            >
              <Save className="mr-1 h-3 w-3" />
              保存
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
              onClick={handleCancelEdit}
            >
              <X className="mr-1 h-3 w-3" />
              取消
            </Button>
          </div>
        </div>
      ) : (
        <p
          className={`pr-8 cursor-pointer hover:text-blue-400 ${category === 'articles' && localIsRead ? 'text-gray-500 line-through' : 'text-gray-200'}`}
          onClick={handleEdit}
          title="点击编辑内容"
        >
          {category === 'articles' && localIsRead && <span className="text-green-500 mr-2">✓</span>}
          {content}
        </p>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>创建于: {formatDate(created_at)}</p>
        {updated_at && updated_at !== created_at && (
          <p>更新于: {formatDate(updated_at)}</p>
        )}
      </div>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription className="text-gray-400">
              您确定要删除此内容吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-gray-800 rounded-md">
            <p className="text-white font-medium">{content}</p>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-700 bg-transparent text-white hover:bg-gray-800">
                取消
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 使用 React.memo 包装组件，只有当 props 变化时才重新渲染
export default memo(DeletableContentCard, (prevProps, nextProps) => {
  // 自定义比较函数，返回 true 表示不需要重新渲染
  return (
    prevProps.id === nextProps.id &&
    prevProps.content === nextProps.content &&
    prevProps.category === nextProps.category &&
    prevProps.created_at === nextProps.created_at &&
    prevProps.updated_at === nextProps.updated_at &&
    prevProps.is_read === nextProps.is_read
    // 对于回调函数，我们假设它们是稳定的引用（通常由父组件使用 useCallback 创建）
  )
})
