import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ContentClassifier from "../../components/ContentClassifier"
import ClassifiedContentDisplay from "../../components/ClassifiedContentDisplay"

export default function ClassifyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600 opacity-30 blur-3xl"></div>
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-blue-500 opacity-30 blur-3xl"></div>

        <div className="container relative z-10">
          <Link href="/" className="mb-6 inline-flex items-center text-xl font-medium text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回首页
          </Link>
          <h1 className="mb-6 text-6xl font-black tracking-tight">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">内容分类</span>
          </h1>
          <p className="mb-8 max-w-2xl text-xl text-gray-300">
            输入任何内容，AI将自动分类为待看文章、想法、安排或干货收藏
          </p>
        </div>
      </section>

      {/* Content Classifier Section */}
      <section className="py-12">
        <div className="container">
          <ContentClassifier />
        </div>
      </section>

      {/* Classified Content Display Section */}
      <section className="py-12 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
        <div className="container">
          <ClassifiedContentDisplay />
        </div>
      </section>
    </main>
  )
}
