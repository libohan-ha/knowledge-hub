"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { User, LogOut } from "lucide-react"

const categories = [
  {
    name: "安排",
    route: "/tasks",
    color: "bg-yellow-400",
    textColor: "text-yellow-400",
    hoverColor: "hover:bg-yellow-400/10",
  },
  {
    name: "待看文章",
    route: "/read-later",
    color: "bg-fuchsia-500",
    textColor: "text-fuchsia-500",
    hoverColor: "hover:bg-fuchsia-500/10",
  },
  {
    name: "想法",
    route: "/thoughts",
    color: "bg-cyan-500",
    textColor: "text-cyan-500",
    hoverColor: "hover:bg-cyan-500/10",
  },
  {
    name: "干货收藏",
    route: "/knowledge",
    color: "bg-green-400",
    textColor: "text-green-400",
    hoverColor: "hover:bg-green-400/10",
  },
]

export default function MainNavigation() {
  const pathname = usePathname()
  const [activeCategory, setActiveCategory] = useState("")
  const { user, logout, loading } = useAuth()

  useEffect(() => {
    // Set active category based on current path
    const currentCategory = categories.find((cat) => pathname === cat.route)
    setActiveCategory(currentCategory ? currentCategory.name : pathname === "/" ? "" : "")
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tight">
          知识
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-300">
            中心
          </span>
        </Link>

        <nav className="flex items-center space-x-1">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.route}
              className={cn(
                "relative px-4 py-2 text-sm font-bold transition-colors",
                category.textColor,
                category.hoverColor,
                activeCategory === category.name || pathname === category.route
                  ? "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full"
                  : "",
                activeCategory === category.name || pathname === category.route ? `after:${category.color}` : "",
              )}
            >
              {category.name}
            </Link>
          ))}

          <Link
            href="/manage"
            className={cn(
              "relative px-4 py-2 text-sm font-bold transition-colors",
              "text-purple-500",
              "hover:bg-purple-500/10",
              pathname === "/manage"
                ? "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full"
                : "",
              pathname === "/manage" ? `after:bg-purple-500` : "",
            )}
          >
            管理
          </Link>

          {/* 用户菜单 */}
          {!loading && (
            <div className="ml-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-gray-700">
                      <User className="h-5 w-5" />
                      <span className="sr-only">用户菜单</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button
                        className="w-full flex items-center cursor-pointer text-red-500"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>退出登录</span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">登录</Link>
                </Button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

