import { Calendar, Tag } from "lucide-react"

interface ThoughtCardProps {
  content: string
  tags: string[]
  date: string
  color: string
}

export default function ThoughtCard({ content, tags, date, color }: ThoughtCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-lg p-6 text-white transition-all hover:scale-105 ${color}`}>
      <div className="mb-4 text-xl font-medium leading-relaxed">{content}</div>

      <div className="mt-auto flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-black/20 px-2 py-1 text-xs font-medium backdrop-blur-sm"
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center text-sm text-white/70">
          <Calendar className="mr-1 h-3 w-3" />
          {date}
        </div>
      </div>
    </div>
  )
}

