"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useSidebarState } from "@/hooks/use-sidebar-state"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet"
import {
  User,
  LogOut,
  CalendarClock,
  BookOpen,
  Lightbulb,
  Archive,
  Settings,
  Home,
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const categories = [
  {
    name: "安排",
    route: "/tasks",
    color: "bg-yellow-400",
    textColor: "text-yellow-400",
    hoverColor: "hover:bg-yellow-400/10",
    icon: CalendarClock
  },
  {
    name: "待看文章",
    route: "/read-later",
    color: "bg-fuchsia-500",
    textColor: "text-fuchsia-500",
    hoverColor: "hover:bg-fuchsia-500/10",
    icon: BookOpen
  },
  {
    name: "想法",
    route: "/thoughts",
    color: "bg-cyan-500",
    textColor: "text-cyan-500",
    hoverColor: "hover:bg-cyan-500/10",
    icon: Lightbulb
  },
  {
    name: "干货收藏",
    route: "/knowledge",
    color: "bg-green-400",
    textColor: "text-green-400",
    hoverColor: "hover:bg-green-400/10",
    icon: Archive
  },
]

export default function SidebarNavigation() {
  const pathname = usePathname()
  const [activeCategory, setActiveCategory] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isCollapsed, toggleSidebar } = useSidebarState(false)
  const { user, logout, loading } = useAuth()

  useEffect(() => {
    // Set active category based on current path
    const currentCategory = categories.find((cat) => pathname === cat.route)
    setActiveCategory(currentCategory ? currentCategory.name : pathname === "/" ? "" : "")
  }, [pathname])

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
              <span className="sr-only">打开菜单</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r border-gray-800 bg-black">
            <SidebarContent pathname={pathname} activeCategory={activeCategory} user={user} logout={logout} loading={loading} isMobile={true} onNavigate={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Hidden on small screens */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen border-r border-gray-800 bg-black/95 backdrop-blur-md transition-all duration-300 md:block",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent
          pathname={pathname}
          activeCategory={activeCategory}
          user={user}
          logout={logout}
          loading={loading}
          isMobile={false}
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </aside>
    </>
  )
}

// Extracted sidebar content component to reuse between mobile and desktop
function SidebarContent({
  pathname,
  activeCategory,
  user,
  logout,
  loading,
  isMobile,
  isCollapsed = false,
  toggleSidebar,
  onNavigate
}: {
  pathname: string;
  activeCategory: string;
  user: any;
  logout: () => void;
  loading: boolean;
  isMobile: boolean;
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo and collapse toggle */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-3">
        {!isCollapsed && (
          <Link href="/" className="text-2xl font-black tracking-tight" onClick={onNavigate}>
            知识
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-300">
              中心
            </span>
          </Link>
        )}

        {/* Collapse toggle button - only on desktop */}
        {!isMobile && toggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-gray-800"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <Link
          href="/"
          className={cn(
            "flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors",
            "text-white",
            "hover:bg-gray-800",
            pathname === "/" ? "bg-gray-800" : "",
            isCollapsed && "justify-center px-2"
          )}
          onClick={onNavigate}
        >
          <Home className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && "首页"}
        </Link>

        {/* Category divider */}
        {!isCollapsed && (
          <div className="my-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            分类
          </div>
        )}

        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.name}
              href={category.route}
              className={cn(
                "flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors",
                category.textColor,
                category.hoverColor,
                activeCategory === category.name || pathname === category.route ? "bg-gray-800" : "",
                isCollapsed && "justify-center px-2"
              )}
              onClick={onNavigate}
            >
              <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3", category.textColor)} />
              {!isCollapsed && category.name}
              {/* Active indicator */}
              {!isCollapsed && (activeCategory === category.name || pathname === category.route) && (
                <div className={cn("ml-auto h-2 w-2 rounded-full", category.color.replace('bg-', 'bg-'))}></div>
              )}
            </Link>
          );
        })}

        {/* Management section */}
        {!isCollapsed && (
          <div className="my-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            系统
          </div>
        )}

        <Link
          href="/manage"
          className={cn(
            "flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors",
            "text-purple-500",
            "hover:bg-purple-500/10",
            pathname === "/manage" ? "bg-gray-800" : "",
            isCollapsed && "justify-center px-2"
          )}
          onClick={onNavigate}
        >
          <Settings className={cn("h-5 w-5", !isCollapsed && "mr-3", "text-purple-500")} />
          {!isCollapsed && "管理"}
          {!isCollapsed && pathname === "/manage" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-purple-500"></div>
          )}
        </Link>
      </nav>

      {/* User section */}
      <div className={cn("border-t border-gray-800", isCollapsed ? "p-2" : "p-4")}>
        {!loading && (
          user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-lg bg-gray-800 hover:bg-gray-700",
                    isCollapsed ? "w-full justify-center px-2 py-2" : "w-full justify-start px-4 py-3 text-left"
                  )}
                >
                  <User className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span className="text-sm font-medium">{user.email}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
            <Button
              asChild
              variant="outline"
              className={cn(
                isCollapsed ? "w-full justify-center px-2 py-2" : "w-full justify-start"
              )}
            >
              <Link href="/login" className="flex items-center" onClick={onNavigate}>
                <User className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && "登录"}
              </Link>
            </Button>
          )
        )}
      </div>
    </div>
  )
}
