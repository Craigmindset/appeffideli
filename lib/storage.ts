const ARTICLES_STORAGE_KEY = "effideli-articles"

export function getStoredArticles() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedArticles = localStorage.getItem(ARTICLES_STORAGE_KEY)
    return storedArticles ? JSON.parse(storedArticles) : []
  } catch (error) {
    console.error("Error getting stored articles:", error)
    return []
  }
}

export function setStoredArticles(articles) {
  if (typeof window === "undefined") {
    return articles
  }

  try {
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles))
    return articles
  } catch (error) {
    console.error("Error setting stored articles:", error)
    return articles
  }
}

export function addStoredArticle(article) {
  const articles = getStoredArticles()
  const updatedArticles = [article, ...articles]
  return setStoredArticles(updatedArticles)
}

export function updateStoredArticle(id, articleUpdate) {
  const articles = getStoredArticles()
  const updatedArticles = articles.map((article) => (article.id === id ? { ...article, ...articleUpdate } : article))
  return setStoredArticles(updatedArticles)
}

export function deleteStoredArticle(id) {
  const articles = getStoredArticles()
  const updatedArticles = articles.filter((article) => article.id !== id)
  return setStoredArticles(updatedArticles)
}

