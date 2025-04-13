"use client"

import { useState, useEffect } from 'react'

// Hook to manage sidebar collapsed state with localStorage persistence
export function useSidebarState(defaultCollapsed = false) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const storedState = localStorage.getItem('sidebar-collapsed')
    if (storedState !== null) {
      setIsCollapsed(storedState === 'true')
    }
    setIsLoaded(true)
  }, [])

  // Update localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed))
    }
  }, [isCollapsed, isLoaded])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return {
    isCollapsed,
    toggleSidebar,
    isLoaded
  }
}
