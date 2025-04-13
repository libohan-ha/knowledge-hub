"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const categories = [
  { name: "所有分类", color: "bg-white" },
  { name: "待看文章", color: "bg-fuchsia-500" },
  { name: "想法", color: "bg-cyan-500" },
  { name: "安排", color: "bg-yellow-400" },
  { name: "干货收藏", color: "bg-green-400" },
]

export default function CategorySelector() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-2 border-gray-700 bg-transparent px-6 py-3 text-xl font-bold text-white hover:bg-gray-800"
        >
          <div className={cn("h-3 w-3 rounded-full", selectedCategory.color)}></div>
          {selectedCategory.name}
          <ChevronDown className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-900 text-white">
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.name}
            className={cn(
              "flex cursor-pointer items-center gap-2 py-3 text-lg font-medium hover:bg-gray-800",
              selectedCategory.name === category.name && "bg-gray-800",
            )}
            onClick={() => setSelectedCategory(category)}
          >
            <div className={cn("h-3 w-3 rounded-full", category.color)}></div>
            {category.name}
            {selectedCategory.name === category.name && <Check className="ml-auto h-5 w-5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

