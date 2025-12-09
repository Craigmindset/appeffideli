"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImagePlus, Loader2, Pencil, Plus, Play, Database } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createArticle, updateArticle, getArticles, deleteArticle } from "@/app/actions/articles"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { StoredImage } from "@/components/stored-image"
import { CheckCircle2 } from "lucide-react"
import { uploadImage } from "@/app/actions/upload"
import Link from "next/link"

const ACCESS_CODE = "823911"

type Article = {
  id: string
  title: string
  summary: string
  content: string
  imageUrl: string
  videoUrl?: string
  createdAt: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [summary, setSummary] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [activeTab, setActiveTab] = useState("list")
  const [articles, setArticles] = useState<Article[]>([])
  const router = useRouter()
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    const fetchArticles = async () => {
      const fetchedArticles = await getArticles()
      setArticles(fetchedArticles)
    }
    if (isAuthenticated) {
      fetchArticles()
    }
  }, [isAuthenticated])

  const handleAccessCode = () => {
    if (accessCode === ACCESS_CODE) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Invalid access code")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file")
        return
      }
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError("")
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const { url } = await uploadImage(formData)
      return url
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setTitle(article.title)
    setContent(article.content)
    setSummary(article.summary)
    setVideoUrl(article.videoUrl || "")
    setPreviewUrl(article.imageUrl)
    setActiveTab("edit")
  }

  const handleNewArticle = () => {
    setEditingArticle(null)
    setTitle("")
    setContent("")
    setSummary("")
    setVideoUrl("")
    setSelectedImage(null)
    setPreviewUrl("")
    setActiveTab("edit")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage && !editingArticle) {
      setError("Please select an image")
      return
    }
    setIsUploading(true)
    try {
      let imageUrl = editingArticle?.imageUrl || ""

      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage)
      }

      const articleData = {
        title,
        content,
        summary,
        videoUrl: videoUrl || undefined,
        imageUrl,
      }

      if (editingArticle) {
        const updatedArticle = await updateArticle(editingArticle.id, articleData)
        setArticles((prev) => prev.map((a) => (a.id === editingArticle.id ? updatedArticle! : a)))
      } else {
        const newArticle = await createArticle(articleData)
        setArticles((prev) => [newArticle, ...prev])
      }

      // Clear form
      setSelectedImage(null)
      setPreviewUrl("")
      setTitle("")
      setContent("")
      setSummary("")
      setVideoUrl("")
      setError("")
      setEditingArticle(null)
      setActiveTab("list")

      alert(editingArticle ? "Article updated successfully!" : "Article published successfully!")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to publish article")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteArticle = async (article: Article) => {
    setDeletingArticle(article)
  }

  const confirmDelete = async () => {
    if (!deletingArticle) return

    try {
      const updatedArticles = await deleteArticle(deletingArticle.id)
      setArticles(updatedArticles)
      setDeletingArticle(null)
    } catch (error) {
      setError("Failed to delete article")
    }
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article Image</CardTitle>
          <CardDescription>Upload an image for your article (max 2MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {previewUrl ? (
                    <div className="relative w-full h-full max-h-52">
                      <StoredImage src={previewUrl} alt="Preview" fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImagePlus className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600">Click or drag to upload image</p>
                    </div>
                  )}
                </div>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </Label>
            </div>
            {selectedImage && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)}MB)
              </p>
            )}
            {uploadSuccess && (
              <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-md flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Image uploaded successfully!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter article title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video URL (Optional)</Label>
        <Input
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube or video URL"
          type="url"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Enter article summary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter article content"
          className="min-h-[200px]"
          required
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => setActiveTab("list")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editingArticle ? "Updating..." : "Publishing..."}
            </>
          ) : editingArticle ? (
            "Update Article"
          ) : (
            "Publish Article"
          )}
        </Button>
      </div>
    </form>
  )

  const renderArticleList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Articles</h2>
        <Button onClick={handleNewArticle}>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="relative w-16 h-16">
                      <StoredImage
                        src={article.imageUrl || "/placeholder.svg"}
                        alt={article.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{article.summary}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {article.videoUrl ? (
                      <Play className="h-4 w-4 text-primary" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(article.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditArticle(article)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteArticle(article)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          {!isAuthenticated ? (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>Enter your access code to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessCode">Access Code</Label>
                    <Input
                      id="accessCode"
                      type="password"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={handleAccessCode} className="w-full">
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold tracking-tighter">Admin Dashboard</h1>

              {/* Order Management Card */}
              <div className="w-full">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Order Management
                    </CardTitle>
                    <CardDescription>View and manage customer orders</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Track orders, update statuses, and manage customer purchases.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            Payment Processing
                          </div>
                          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            Order Tracking
                          </div>
                          <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                            Customer Management
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild className="whitespace-nowrap">
                          <Link href="/admin/orders">View All Orders</Link>
                        </Button>
                        <Button asChild variant="outline" className="whitespace-nowrap">
                          <Link href="/admin/orders?status=pending">Pending Orders</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Articles Management Section */}
              <div id="articles" className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="list">Articles</TabsTrigger>
                    <TabsTrigger value="edit">{editingArticle ? "Edit Article" : "New Article"}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="list">{renderArticleList()}</TabsContent>
                  <TabsContent value="edit">{renderForm()}</TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <AlertDialog open={!!deletingArticle} onOpenChange={() => setDeletingArticle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article &quot;{deletingArticle?.title}
              &quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

