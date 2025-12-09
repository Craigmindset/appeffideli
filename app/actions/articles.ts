"use server"

import type { Article } from "@/types/article"
import {
  getStoredArticles,
  addStoredArticle,
  updateStoredArticle,
  deleteStoredArticle,
  setStoredArticles,
} from "@/lib/storage"
import { revalidatePath } from "next/cache"

// Initial articles data
const initialArticles: Article[] = [
  {
    id: "1",
    title: "10 Essential Home Management Tips",
    summary:
      "Discover the key strategies to keep your home organized and running smoothly. Learn about time-saving techniques and efficient household management.",
    content: "Full content here...",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/30286.jpg-vhmf07MH4i4JgOFTn71c3MUUWSC2UJ.jpeg",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Meal Planning Made Simple",
    summary:
      "Transform your weekly meal preparation with our comprehensive guide to meal planning. Save time and reduce stress with these practical tips.",
    content: "Full content here...",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/63326.jpg-NLSFxg9gkYBCAtPn6A80KDasclzgTs.jpeg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Creating Nutritious Baby Food at Home",
    summary:
      "Learn how to prepare healthy and delicious homemade baby food. Get expert tips on nutrition, preparation, and storage for your little one.",
    content: "Full content here...",
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2149125810.jpg-pl5CDhf6uIFzqamjRctTgZyUV9SoBI.jpeg",
    videoUrl: "https://www.youtube.com/watch?v=example3",
    createdAt: new Date().toISOString(),
  },
]

export async function getArticles() {
  try {
    // Get articles from localStorage or use initial data if empty
    const storedArticles = getStoredArticles()
    if (storedArticles.length === 0) {
      setStoredArticles(initialArticles)
      return initialArticles
    }
    return storedArticles
  } catch (error) {
    console.error("Error getting articles:", error)
    return initialArticles
  }
}

export async function createArticle(article: Omit<Article, "id" | "createdAt">) {
  try {
    const newArticle: Article = {
      ...article,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }

    const updatedArticles = addStoredArticle(newArticle)

    // Revalidate both the articles and admin pages
    revalidatePath("/articles")
    revalidatePath("/admin")

    return newArticle
  } catch (error) {
    console.error("Error creating article:", error)
    throw new Error("Failed to create article")
  }
}

export async function updateArticle(id: string, article: Partial<Article>) {
  try {
    const updatedArticles = updateStoredArticle(id, article)
    const updatedArticle = updatedArticles.find((a) => a.id === id)

    if (!updatedArticle) {
      throw new Error("Article not found")
    }

    // Revalidate both the articles and admin pages
    revalidatePath("/articles")
    revalidatePath("/admin")

    return updatedArticle
  } catch (error) {
    console.error("Error updating article:", error)
    throw new Error("Failed to update article")
  }
}

export async function deleteArticle(id: string) {
  try {
    const updatedArticles = deleteStoredArticle(id)

    // Revalidate both the articles and admin pages
    revalidatePath("/articles")
    revalidatePath("/admin")

    return updatedArticles
  } catch (error) {
    console.error("Error deleting article:", error)
    throw new Error("Failed to delete article")
  }
}

export async function getArticleById(id: string) {
  try {
    const articles = getStoredArticles()
    const article = articles.find((a) => a.id === id)

    if (!article) {
      throw new Error("Article not found")
    }

    return article
  } catch (error) {
    console.error("Error fetching article:", error)
    throw new Error("Failed to fetch article")
  }
}

