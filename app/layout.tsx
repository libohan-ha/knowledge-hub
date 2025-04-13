import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SidebarNavigation from "../components/sidebar-navigation"
import SidebarLayout from "../components/sidebar-layout"
import QuickCaptureShortcut from "../components/quick-capture-shortcut"

import BatchClassifyShortcut from "../components/batch-classify-shortcut"
import FloatingQuickCapture from "../components/floating-quick-capture"
import ShortcutHint from "../components/shortcut-hint"
import { ThemeProvider } from "../components/theme-provider"
import { Toaster } from "../components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { UncategorizedProvider } from "../contexts/UncategorizedContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MindHub - Personal Knowledge Management",
  description: "Your personal knowledge ecosystem with AI-powered organization",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <UncategorizedProvider>
              <div className="flex min-h-screen">
                <SidebarNavigation />
                <SidebarLayout>
                  {children}
                </SidebarLayout>
              </div>
              <QuickCaptureShortcut />

              <BatchClassifyShortcut />
              <FloatingQuickCapture />
              <ShortcutHint />
              <Toaster />
            </UncategorizedProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
