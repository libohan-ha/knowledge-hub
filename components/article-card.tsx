import { Clock, ExternalLink } from "lucide-react"
import Image from "next/image"

interface ArticleCardProps {
  title: string
  source: string
  readingTime: string
  progress: number
  date: string
  imageUrl: string
}

export default function ArticleCard({ title, source, readingTime, progress, date, imageUrl }: ArticleCardProps) {
  return (
    <div className="group overflow-hidden rounded-lg bg-gray-900 transition-all hover:scale-105">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 h-1 bg-fuchsia-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="p-6">
        <h3 className="mb-2 text-xl font-bold leading-tight">{title}</h3>

        <div className="mb-4 flex items-center text-sm text-gray-400">
          <span className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {readingTime}
          </span>
          <span className="mx-2">•</span>
          <span>{source}</span>
          <span className="mx-2">•</span>
          <span>{date}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-fuchsia-400">
            {progress > 0 ? `${progress}% read` : "Not started"}
          </div>
          <button className="flex items-center text-sm font-medium text-white hover:text-fuchsia-400">
            Read <ExternalLink className="ml-1 h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

