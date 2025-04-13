import { CheckCircle2, Circle, Tag } from "lucide-react"

interface TaskCardProps {
  title: string
  priority: "High" | "Medium" | "Low"
  dueDate: string
  tags: string[]
  status: "in-progress" | "completed"
}

export default function TaskCard({ title, priority, dueDate, tags, status }: TaskCardProps) {
  const priorityColors = {
    High: "bg-red-500",
    Medium: "bg-yellow-500",
    Low: "bg-blue-500",
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border-l-4 ${priorityColors[priority]} bg-gray-900 p-6 transition-all hover:bg-gray-800`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {status === "completed" ? (
            <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
          ) : (
            <Circle className="mt-1 h-5 w-5 flex-shrink-0 text-yellow-400" />
          )}

          <div>
            <h3 className={`text-xl font-bold ${status === "completed" ? "text-gray-500 line-through" : "text-white"}`}>
              {title}
            </h3>

            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300"
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${priorityColors[priority]} text-white`}
          >
            {priority}
          </span>


        </div>
      </div>
    </div>
  )
}

