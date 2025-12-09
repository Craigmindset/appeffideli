"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"
import Link from "next/link"
import { getArticles } from "@/app/actions/articles"
import type { Article } from "@/types/article"
import { VideoModal } from "@/components/video-modal"
import { StoredImage } from "@/components/stored-image"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const fetchedArticles = await getArticles()
        // Sort articles by date, newest first
        const sortedArticles = [...fetchedArticles].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        setArticles(sortedArticles)
      } catch (error) {
        console.error("Error fetching articles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch articles immediately
    fetchArticles()

    // Set up an interval to check for updates every 30 seconds
    const interval = setInterval(fetchArticles, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleVideoClick = (videoUrl: string, e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedVideo(videoUrl)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-lg text-gray-500">Loading articles...</div>
        </main>
        <Footer />
      </div>
    )
  }

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

            {articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No articles available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden flex flex-col">
                    <div className="relative h-48 w-full">
                      <StoredImage
                        src={article.imageUrl || "/placeholder.svg"}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                      {article.videoUrl && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-colors hover:bg-black/40"
                          onClick={(e) => handleVideoClick(article.videoUrl!, e)}
                        >
                          <div className="rounded-full bg-white/90 p-3 transform transition-transform hover:scale-110">
                            <Play className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-500 line-clamp-3">{article.summary}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</span>
                      <Button asChild>
                        <Link href={`/articles/${article.id}`}>Read More</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {selectedVideo && (
        <VideoModal isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} videoUrl={selectedVideo} />
      )}
    </div>
  )
}

