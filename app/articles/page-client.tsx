"use client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { getArticles } from "@/app/actions/articles"
import ArticlesList from "./articles-list"

export default async function ArticlesPageClient() {
  const articles = await getArticles()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="py-12 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Latest Articles</h1>
              <p className="mt-4 text-gray-500">
                Stay updated with our latest insights on home management and family care
              </p>
            </div>
            <ArticlesList initialArticles={articles} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

