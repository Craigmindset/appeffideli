"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import Link from "next/link"
import { VideoModal } from "@/components/video-modal"
import { StoredImage } from "@/components/stored-image"
import type { Article } from "@/types/article"
import { getArticles } from "../actions/articles"

interface ArticlesListProps {
  initialArticles: Article[]
}

export default function ArticlesList({ initialArticles }: ArticlesListProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const refreshArticles = async () => {
      try {
        setIsLoading(true)
        const freshArticles = await getArticles()
        setArticles(freshArticles)
      } catch (error) {
        console.error("Error refreshing articles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Refresh articles every 30 seconds
    const interval = setInterval(refreshArticles, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleVideoClick = (videoUrl: string, e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedVideo(videoUrl)
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No articles available yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
              <StoredImage src={article.imageUrl} alt={article.title} fill className="object-cover" />
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

      {selectedVideo && (
        <VideoModal isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} videoUrl={selectedVideo} />
      )}
    </>
  )
}

