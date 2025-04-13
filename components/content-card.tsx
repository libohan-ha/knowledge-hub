import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentCardProps {
  title: string
  category: string
  excerpt: string
  date: string
  color: string
}

export default function ContentCard({ title, category, excerpt, date, color }: ContentCardProps) {
  // 类别名称映射
  const categoryMap: {[key: string]: string} = {
    "READ LATER": "待看文章",
    "THOUGHTS": "想法",
    "TASKS": "安排",
    "KNOWLEDGE": "干货收藏"
  }

  // 如果类别存在于映射中，则转换为中文
  const displayCategory = categoryMap[category] || category

  return (
    <div className="group relative overflow-hidden rounded-lg bg-gray-900 p-6 transition-all hover:scale-105">
      <div
        className={cn(
          "absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-70 blur-xl transition-all group-hover:scale-150",
          color,
        )}
      ></div>

      <div className="relative z-10">
        <div className={cn("mb-4 inline-block rounded-md px-3 py-1 text-sm font-bold", color)}>{displayCategory}</div>

        <h3 className="mb-3 text-3xl font-black leading-tight">{title}</h3>

        <p className="mb-4 text-gray-300">{excerpt}</p>

        <div className="flex items-center text-sm text-gray-400">
          <CalendarDays className="mr-2 h-4 w-4" />
          {date}
        </div>
      </div>
    </div>
  )
}

