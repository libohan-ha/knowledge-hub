"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Pencil, Trash2, Save, X, Check } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

// 类别映射
const categoryOptions = [
  { value: "tasks", label: "安排" },
  { value: "articles", label: "待看文章" },
  { value: "ideas", label: "想法" },
  { value: "knowledge", label: "干货收藏" }
]

// 获取类别显示名称
const getCategoryLabel = (value: string) => {
  const option = categoryOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

interface EditableContentItemProps {
  id: string
  content: string
  category: string
  created_at: string
  updated_at?: string
  onUpdate: () => void
}

export default function EditableContentItem({ 
  id, 
  content, 
  category, 
  created_at, 
  updated_at,
  onUpdate 
}: EditableContentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [editedCategory, setEditedCategory] = useState(category)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // 保存编辑
  const handleSave = async () => {
    if (!editedContent.trim()) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent,
          category: editedCategory
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update content')
      }
      
      setIsEditing(false)
      onUpdate() // 通知父组件更新
    } catch (err) {
      console.error('Error updating content:', err)
      setError('更新内容时出错，请重试。')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // 删除内容
  const handleDelete = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete content')
      }
      
      setIsDeleting(false)
      onUpdate() // 通知父组件更新
    } catch (err) {
      console.error('Error deleting content:', err)
      setError('删除内容时出错，请重试。')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // 取消编辑
  const handleCancel = () => {
    setEditedContent(content)
    setEditedCategory(category)
    setIsEditing(false)
    setError(null)
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition-all hover:border-gray-700">
      {error && (
        <div className="mb-4 rounded-md bg-red-900 p-3 text-white">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-gray-300">
          {getCategoryLabel(category)}
        </span>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white"
                onClick={() => setIsEditing(true)}
                disabled={isProcessing}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">编辑</span>
              </Button>
              
              <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">删除</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 text-white">
                  <DialogHeader>
                    <DialogTitle>确认删除</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      您确定要删除此内容吗？此操作无法撤销。
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
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
                      {isProcessing ? '处理中...' : '删除'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-green-500"
                onClick={handleSave}
                disabled={isProcessing}
              >
                <Save className="h-4 w-4" />
                <span className="sr-only">保存</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">取消</span>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[100px] border-gray-700 bg-gray-800 text-white"
            disabled={isProcessing}
          />
          
          <Select
            value={editedCategory}
            onValueChange={setEditedCategory}
            disabled={isProcessing}
          >
            <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
              <SelectValue placeholder="选择类别" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white">
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <p className="text-gray-200">{content}</p>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>创建于: {formatDate(created_at)}</p>
        {updated_at && updated_at !== created_at && (
          <p>更新于: {formatDate(updated_at)}</p>
        )}
      </div>
    </div>
  )
}
