"use client"

import { ReactNode, useEffect, useState } from "react"
import { useSidebarState } from "@/hooks/use-sidebar-state"

interface SidebarLayoutProps {
  children: ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { isCollapsed, isLoaded } = useSidebarState()
  const [paddingClass, setPaddingClass] = useState("md:pl-16")

  // Update padding based on sidebar state
  useEffect(() => {
    if (isLoaded) {
      setPaddingClass(isCollapsed ? "md:pl-16" : "md:pl-64")
    }
  }, [isCollapsed, isLoaded])

  return (
    <div className={`flex-1 transition-all duration-300 ${paddingClass}`}>
      {children}
    </div>
  )
}
