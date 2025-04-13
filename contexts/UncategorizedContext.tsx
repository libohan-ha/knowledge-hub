"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'

// 定义未分类内容的类型
export interface UncategorizedItem {
  id: string
  content: string
  timestamp: number
}

// 定义上下文类型
interface UncategorizedContextType {
  uncategorizedItems: UncategorizedItem[]
  addItem: (content: string) => void
  deleteItem: (id: string) => void
  clearItems: () => void
  refreshItems: () => void
}

// 创建上下文
const UncategorizedContext = createContext<UncategorizedContextType | undefined>(undefined)

// 上下文提供者组件
export function UncategorizedProvider({ children }: { children: ReactNode }) {
  const [uncategorizedItems, setUncategorizedItems] = useState<UncategorizedItem[]>([])

  // 初始加载本地存储的未分类内容
  useEffect(() => {
    refreshItems()
  }, [])

  // 从本地存储加载未分类内容
  const refreshItems = () => {
    console.log('刷新未分类内容列表')
    const storedItems = localStorage.getItem("uncategorized-items")
    if (storedItems) {
      try {
        setUncategorizedItems(JSON.parse(storedItems))
      } catch (e) {
        console.error("Error parsing stored items:", e)
      }
    } else {
      // 如果没有存储的数据，则设置为空数组
      setUncategorizedItems([])
      console.log('没有存储的未分类内容，设置为空数组')
    }
  }

  // 添加新的未分类内容
  const addItem = (content: string) => {
    if (!content.trim()) return

    // 创建新的未分类项目
    const newItem: UncategorizedItem = {
      id: uuidv4(),
      content: content.trim(),
      timestamp: Date.now()
    }

    // 获取现有的未分类项目
    const storedItems = localStorage.getItem("uncategorized-items")
    let items = []

    if (storedItems) {
      try {
        items = JSON.parse(storedItems)
      } catch (e) {
        console.error("Error parsing stored items:", e)
      }
    }

    // 添加到未分类列表
    items = [newItem, ...items]

    // 保存到本地存储
    localStorage.setItem("uncategorized-items", JSON.stringify(items))

    // 更新状态
    setUncategorizedItems(items)

    console.log('添加了新内容:', newItem.content.substring(0, 20))
  }

  // 删除未分类内容
  const deleteItem = (id: string) => {
    const updatedItems = uncategorizedItems.filter(item => item.id !== id)
    setUncategorizedItems(updatedItems)

    // 如果删除后列表为空，清除本地存储
    if (updatedItems.length === 0) {
      localStorage.removeItem("uncategorized-items")
    } else {
      localStorage.setItem("uncategorized-items", JSON.stringify(updatedItems))
    }

    console.log('删除了内容 ID:', id)
  }

  // 清空所有未分类内容
  const clearItems = () => {
    setUncategorizedItems([])
    localStorage.removeItem("uncategorized-items")
    console.log('清空了所有未分类内容')
  }

  return (
    <UncategorizedContext.Provider value={{
      uncategorizedItems,
      addItem,
      deleteItem,
      clearItems,
      refreshItems
    }}>
      {children}
    </UncategorizedContext.Provider>
  )
}

// 自定义钩子，用于访问上下文
export function useUncategorized() {
  const context = useContext(UncategorizedContext)
  if (context === undefined) {
    throw new Error('useUncategorized must be used within a UncategorizedProvider')
  }
  return context
}
