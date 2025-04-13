"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Keyboard } from "lucide-react"

export default function ShortcutHint() {
  const [isVisible, setIsVisible] = useState(true)
  const [hasShownBefore, setHasShownBefore] = useState(false)

  // 检查是否之前已经显示过提示
  useEffect(() => {
    const hasShown = localStorage.getItem("shortcut-hint-shown")
    if (hasShown === "true") {
      setHasShownBefore(true)
      setIsVisible(false)
    }
  }, [])

  // 关闭提示并记住状态
  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("shortcut-hint-shown", "true")
  }

  // 如果已经显示过，不再显示
  if (hasShownBefore || !isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Keyboard className="h-5 w-5 text-fuchsia-400" />
          <span className="text-sm">
            <kbd className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd>+
            <kbd className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-xs">K</kbd>
            <span className="ml-1">快速记录想法</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Keyboard className="h-5 w-5 text-yellow-400" />
          <span className="text-sm">
            <kbd className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd>+
            <kbd className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-xs">L</kbd>
            <span className="ml-1">一键分类所有未分类内容</span>
          </span>
        </div>
        <div className="flex justify-center mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 rounded-md px-2 text-xs hover:bg-gray-800"
            onClick={handleDismiss}
          >
            知道了
          </Button>
        </div>
      </div>
    </div>
  )
}
