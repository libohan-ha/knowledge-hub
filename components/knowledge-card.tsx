import { BookOpen, Calendar, ExternalLink, Tag } from "lucide-react"

interface KnowledgeCardProps {
  title: string
  excerpt: string
  source: string
  tags: string[]
  date: string
}

export default function KnowledgeCard({ title, excerpt, source, tags, date }: KnowledgeCardProps) {
  return (
    <div className="group overflow-hidden rounded-lg border-2 border-green-400/20 bg-gray-900 p-6 transition-all hover:scale-105">
      <div className="mb-1 flex items-center text-sm font-medium text-green-400">
        <BookOpen className="mr-1 h-3 w-3" />
        {source}
      </div>

      <h3 className="mb-3 text-xl font-bold leading-tight">{title}</h3>

      <p className="mb-4 text-gray-300">{excerpt}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400"
          >
            <Tag className="mr-1 h-3 w-3" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-400">
          <Calendar className="mr-1 h-3 w-3" />
          {date}
        </div>

        <button className="flex items-center text-sm font-medium text-white hover:text-green-400">
          View <ExternalLink className="ml-1 h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

