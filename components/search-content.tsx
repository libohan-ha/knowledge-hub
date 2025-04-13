"use client"

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search, X } from "lucide-react"
import EditableContentItem from "./editable-content-item"

export default function SearchContent() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // 当防抖查询变化时执行搜索
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      handleSearch()
    } else if (debouncedQuery === "") {
      setResults([])
    }
  }, [debouncedQuery])

  // 搜索处理
  const handleSearch = async () => {
    if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) return

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch(`/api/content/search?q=${encodeURIComponent(debouncedQuery)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "搜索失败")
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error("搜索错误:", err)
      setError("搜索时出错，请重试。")
    } finally {
      setIsSearching(false)
    }
  }

  // 清除搜索
  const clearSearch = () => {
    setQuery("")
    setResults([])
  }

  // 刷新搜索结果
  const refreshResults = () => {
    if (debouncedQuery.trim()) {
      handleSearch()
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索内容..."
            className="border-2 border-gray-800 bg-black pl-10 text-white placeholder:text-gray-500 focus:border-fuchsia-500"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-500 hover:text-white"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim() || query.trim().length < 2}
          className="bg-fuchsia-500 text-white hover:bg-fuchsia-600"
        >
          {isSearching ? "搜索中..." : "搜索"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-900 p-4 text-white">
          <p>{error}</p>
        </div>
      )}

      {results.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">搜索结果 ({results.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((item) => (
              <EditableContentItem
                key={item.id}
                id={item.id}
                content={item.content}
                category={item.category}
                created_at={item.created_at}
                updated_at={item.updated_at}
                onUpdate={refreshResults}
              />
            ))}
          </div>
        </div>
      ) : debouncedQuery.trim().length >= 2 && !isSearching ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">未找到匹配的内容</p>
        </div>
      ) : null}
    </div>
  )
}
