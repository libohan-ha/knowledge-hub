"use client"

import { useState, memo, useEffect, useCallback, useMemo } from "react"
import { CheckCircle2, Circle, Pencil, Save, Tag, Trash2, X } from "lucide-react"
import { Button } from "./ui/button"
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
import { Textarea } from "./ui/textarea"

interface DeletableTaskCardProps {
  id: string
  title: string
  priority: "High" | "Medium" | "Low"
  dueDate: string
  tags: string[]
  status: "in-progress" | "completed"
  onDelete: (id: string) => void
  onStatusChange?: (id: string, newStatus: "in-progress" | "completed") => void
  onEdit?: (id: string, newContent: string) => void
}

function DeletableTaskCard({
  id,
  title,
  priority,
  dueDate,
  tags,
  status,
  onDelete,
  onStatusChange,
  onEdit
}: DeletableTaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  // 对于新创建的任务（内容为"新任务"）自动进入编辑模式
  const [isEditing, setIsEditing] = useState(title === '新任务')
  const [editedContent, setEditedContent] = useState(title)

  // 监听 title 变化，更新编辑内容
  useEffect(() => {
    setEditedContent(title)
    // 如果是新任务，自动进入编辑模式
    if (title === '新任务') {
      setIsEditing(true)
    }
  }, [title])

  const priorityColors = {
    High: "bg-red-500",
    Medium: "bg-yellow-500",
    Low: "bg-blue-500",
  }

  // 使用 useCallback 缓存函数引用
  const handleDelete = useCallback(async () => {
    setIsProcessing(true)
    try {
      await onDelete(id)
      setIsDeleting(false)
    } catch (error) {
      console.error("Error deleting task:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [id, onDelete])

  // 使用状态来跟踪当前的本地状态，而不是仅依赖props
  const [localStatus, setLocalStatus] = useState(status);

  // 当props状态变化时更新本地状态
  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  // 使用 useCallback 缓存函数引用
  const handleStatusToggle = useCallback(async () => {
    if (!onStatusChange) return

    // 计算新状态
    const newStatus = localStatus === "completed" ? "in-progress" : "completed"
    console.log(`Toggling task status from ${localStatus} to ${newStatus}`);

    // 立即更新本地状态，提供即时反馈
    setLocalStatus(newStatus);

    try {
      // 异步发送状态更新到服务器
      await onStatusChange(id, newStatus)

      // 成功后显示通知
      toast({
        title: newStatus === "completed" ? "任务已完成" : "任务已恢复",
        description: newStatus === "completed" ? "任务已标记为已完成" : "任务已标记为进行中",
        variant: "default",
      })
    } catch (error) {
      // 如果出错，恢复本地状态
      console.error("Error updating task status:", error);
      setLocalStatus(status);
      toast({
        title: "状态更新失败",
        description: "更新任务状态时出错，请重试",
        variant: "destructive",
      })
    }
  }, [id, localStatus, onStatusChange, status])
  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditedContent(title)
  }, [title])

  const handleSaveEdit = useCallback(async () => {
    if (!onEdit || !editedContent.trim()) return

    try {
      await onEdit(id, editedContent)
      setIsEditing(false)
      toast({
        title: "任务已更新",
        description: "任务内容已成功更新",
        variant: "default",
      })
    } catch (error) {
      console.error("Error editing task:", error)
      toast({
        title: "编辑失败",
        description: "编辑任务时出错，请重试",
        variant: "destructive",
      })
    }
  }, [id, editedContent, onEdit])

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border-l-4 ${priorityColors[priority]} bg-gray-900 p-6 transition-all hover:bg-gray-800`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={handleStatusToggle}
            className="focus:outline-none transition-transform hover:scale-110"
            title={status === "completed" ? "标记为进行中" : "标记为已完成"}
          >
            {status === "completed" ? (
              <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
            ) : (
              <Circle className="mt-1 h-5 w-5 flex-shrink-0 text-yellow-400" />
            )}
          </button>

          <div>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[100px] border-gray-700 bg-gray-800 text-white"
                  placeholder="输入任务内容..."
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
              <>
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-xl font-bold ${localStatus === "completed" ? "text-gray-500 line-through" : "text-white"} cursor-pointer hover:text-blue-400`}
                    onClick={handleEdit}
                    title="点击编辑内容"
                  >
                    {title}
                  </h3>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300"
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${priorityColors[priority]} text-white`}
            >
              {priority}
            </span>

            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-gray-800 text-gray-400 hover:bg-red-900 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 text-white">
                <DialogHeader>
                  <DialogTitle>确认删除</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    您确定要删除此任务吗？此操作无法撤销。
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 p-4 bg-gray-800 rounded-md">
                  <p className="text-white font-medium">{title}</p>
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


        </div>
      </div>
    </div>
  )
}

// 使用 React.memo 包装组件，只有当 props 变化时才重新渲染
// 使用 useMemo 缓存渲染结果，减少不必要的重新渲染
export default memo(DeletableTaskCard, (prevProps, nextProps) => {
  // 自定义比较函数，返回 true 表示不需要重新渲染
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.status === nextProps.status &&
    prevProps.priority === nextProps.priority &&
    prevProps.dueDate === nextProps.dueDate &&
    // 对于数组和函数，我们可以简化比较
    // 对于 tags 数组，我们可以比较长度和内容
    prevProps.tags.length === nextProps.tags.length &&
    prevProps.tags.every((tag, index) => tag === nextProps.tags[index])
    // 注意：我们不比较回调函数，因为它们已经在组件内部使用 useCallback 缓存
  )
})
