"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { Plus, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUncategorized } from "../contexts/UncategorizedContext"

export default function FloatingQuickCapture() {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")
  const { toast } = useToast()
  const { addItem } = useUncategorized()

  // 快速保存内容
  const handleQuickSave = () => {
    if (!content.trim()) return

    // 使用全局状态上下文中的添加方法
    addItem(content.trim())

    // 清空输入框并关闭对话框
    setContent("")
    setIsOpen(false)

    // 显示成功消息
    toast({
      title: "已保存",
      description: "内容已快速保存，稍后可以一次性分类",
      variant: "default",
    })
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <Button
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-fuchsia-500 p-0 shadow-lg hover:bg-fuchsia-600 md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">快速记录</span>
      </Button>

      {/* 快速记录对话框 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>快速记录</DialogTitle>
            <DialogDescription>
              快速记录想法，按回车保存，Shift+回车换行
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入任何内容，按回车保存，Shift+回车换行..."
              className="min-h-[150px] border-2 border-gray-700 bg-black text-white placeholder:text-gray-500 focus:border-fuchsia-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!e.shiftKey) {
                    e.preventDefault()
                    handleQuickSave()
                  }
                }
              }}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>

            <Button
              onClick={handleQuickSave}
              disabled={!content.trim()}
              className="bg-fuchsia-500 text-white hover:bg-fuchsia-600"
            >
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
