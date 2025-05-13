"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, BookOpen, Calendar, Tag } from "lucide-react"
import { getArticleById, type KnowledgeArticle, searchArticles } from "@/lib/knowledge-base"
import ReactMarkdown from "react-markdown"

export default function KnowledgeArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [article, setArticle] = useState<KnowledgeArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<KnowledgeArticle[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = () => {
      const foundArticle = getArticleById(params.id)

      if (foundArticle) {
        setArticle(foundArticle)

        // Find related articles based on tags
        if (foundArticle.tags.length > 0) {
          const related = searchArticles(foundArticle.tags.join(" "))
            .filter((a) => a.id !== foundArticle.id)
            .slice(0, 3)
          setRelatedArticles(related)
        }
      } else {
        setError("Article not found")
      }
    }

    fetchArticle()
  }, [params.id])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/support/knowledge-base")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading article...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-50 to-cyan-50 dark:from-slate-950 dark:to-cyan-950 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/support/knowledge-base">
            <Button variant="outline" className="border-cyan-200 dark:border-cyan-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Base
            </Button>
          </Link>
        </div>

        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none mb-8">
          <CardHeader className="border-b border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-cyan-50 to-white dark:from-slate-900 dark:to-cyan-950">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <Badge
                variant="outline"
                className="bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-800 capitalize"
              >
                {article.category}
              </Badge>
            </div>
            <CardTitle className="text-2xl text-cyan-900 dark:text-cyan-100">{article.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Last updated: {formatDate(article.updatedAt)}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 prose dark:prose-invert max-w-none prose-headings:text-cyan-900 dark:prose-headings:text-cyan-100 prose-a:text-cyan-600 dark:prose-a:text-cyan-400">
            <ReactMarkdown>{article.content}</ReactMarkdown>

            <div className="mt-8 pt-4 border-t border-cyan-100 dark:border-cyan-900">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {relatedArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-cyan-900 dark:text-cyan-100 mb-4">Related Articles</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <Card
                  key={relatedArticle.id}
                  className="border-cyan-200 shadow-md hover:shadow-lg transition-shadow dark:border-cyan-900 dark:shadow-none"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-cyan-900 dark:text-cyan-100">{relatedArticle.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {relatedArticle.content.split("\n").slice(1, 2).join(" ").substring(0, 100)}...
                    </p>
                  </CardContent>
                  <div className="px-6 pb-4">
                    <Link href={`/support/knowledge-base/${relatedArticle.id}`}>
                      <Button variant="outline" className="w-full border-cyan-200 dark:border-cyan-900">
                        Read Article
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Didn't find what you were looking for?</p>
          <Link href="/support">
            <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
              Submit Support Request
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
