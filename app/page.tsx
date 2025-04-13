import { Plus, Sparkles } from "lucide-react"
import ContentCard from "../components/content-card"
import QuickCapture from "../components/quick-capture"
import { Button } from "../components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-fuchsia-600 opacity-30 blur-3xl"></div>
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-cyan-500 opacity-30 blur-3xl"></div>

        <div className="container relative z-10">
          <h1 className="mb-6 text-[120px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-300 md:text-[150px]">
            知识<span className="text-white">中心</span>
          </h1>
          <p className="mb-8 max-w-2xl text-2xl font-medium text-gray-300">
            您的个人知识生态系统，由AI驱动的组织助手
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="group relative overflow-hidden rounded-md bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-300 px-8 py-6 text-xl font-bold text-black transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-6 w-6" />
              添加新内容
            </Button>

            <Link href="/manage">
              <Button
                size="lg"
                className="group relative overflow-hidden rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-6 text-xl font-bold text-white transition-all hover:scale-105"
              >
                <Sparkles className="mr-2 h-6 w-6" />
                管理内容
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Management Section */}
      <section className="relative py-12">
        <div className="absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-yellow-400 opacity-30 blur-3xl"></div>
        <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-green-400 opacity-30 blur-3xl"></div>

        <div className="container relative z-10">
          <div>
            {/* 快速记录 */}
            <div>
              <h2 className="mb-4 text-3xl font-black tracking-tight">快速记录</h2>
              <p className="mb-4 text-lg text-gray-300">快速记录想法，稍后一次性分类</p>
              <QuickCapture />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Content Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-12 text-6xl font-black tracking-tight">最近内容</h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ContentCard
              title="AI在个人知识管理中的未来"
              category="READ LATER"
              excerpt="探索AI如何改变我们组织和检索个人知识的方式。"
              date="2小时前"
              color="bg-fuchsia-500"
            />

            <ContentCard
              title="应用创意：将任务管理与知识库结合"
              category="THOUGHTS"
              excerpt="如果我们能创建一个系统，自动将任务链接到相关知识？"
              date="昨天"
              color="bg-cyan-500"
            />

            <ContentCard
              title="研究现代UI设计趋势用于个人项目"
              category="TASKS"
              excerpt="研究大胆的排版，不对称布局和鲜艳的配色方案。"
              date="2天前"
              color="bg-yellow-400"
            />

            <ContentCard
              title="有效知识管理的10个原则"
              category="KNOWLEDGE"
              excerpt="专家关于有效组织和检索信息的关键见解。"
              date="3天前"
              color="bg-green-400"
            />

            <ContentCard
              title="UI设计中的色彩心理学"
              category="READ LATER"
              excerpt="不同颜色如何影响数字界面中的用户感知和行为。"
              date="4天前"
              color="bg-fuchsia-500"
            />

            <ContentCard
              title="集成间隔重复以增强知识保留"
              category="THOUGHTS"
              excerpt="我们能否添加一个功能，帮助用户在最佳时间间隔复习重要信息？"
              date="5天前"
              color="bg-cyan-500"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

