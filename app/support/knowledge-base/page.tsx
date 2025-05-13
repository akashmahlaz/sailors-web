"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, LifeBuoy, Search, Tag } from "lucide-react"
import { knowledgeBaseArticles, searchArticles, getArticlesByCategory } from "@/lib/knowledge-base"

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(knowledgeBaseArticles)
  const [activeCategory, setActiveCategory] = useState("all")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (searchQuery.trim() === "") {
      setSearchResults(activeCategory === "all" ? knowledgeBaseArticles : getArticlesByCategory(activeCategory))
    } else {
      const results = searchArticles(searchQuery)
      setSearchResults(
        activeCategory === "all" ? results : results.filter((article) => article.category === activeCategory),
      )
    }
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)

    if (searchQuery.trim() === "") {
      setSearchResults(category === "all" ? knowledgeBaseArticles : getArticlesByCategory(category))
    } else {
      const results = searchArticles(searchQuery)
      setSearchResults(category === "all" ? results : results.filter((article) => article.category === category))
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-50 to-cyan-50 dark:from-slate-950 dark:to-cyan-950 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-900 dark:text-cyan-100 mb-2 flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-cyan-700 dark:text-cyan-300" />
            Sailor Support Knowledge Base
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find answers to common questions, learn about policies, and discover resources to help you navigate
            challenges at sea.
          </p>
        </div>

        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search the knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-cyan-200 dark:border-cyan-900"
            />
            <Button
              type="submit"
              className="absolute right-1 top-1 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600"
            >
              Search
            </Button>
          </form>
        </div>

        <Tabs defaultValue="all" onValueChange={handleCategoryChange}>
          <div className="border-b border-cyan-200 dark:border-cyan-900 mb-6">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger value="all" className="data-[state=active]:bg-cyan-100 dark:data-[state=active]:bg-cyan-900">
                All Articles
              </TabsTrigger>
              <TabsTrigger
                value="policies"
                className="data-[state=active]:bg-cyan-100 dark:data-[state=active]:bg-cyan-900"
              >
                Policies
              </TabsTrigger>
              <TabsTrigger
                value="guides"
                className="data-[state=active]:bg-cyan-100 dark:data-[state=active]:bg-cyan-900"
              >
                Guides
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="data-[state=active]:bg-cyan-100 dark:data-[state=active]:bg-cyan-900"
              >
                Resources
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid gap-6">
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No articles found</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Try adjusting your search or browse all articles.
                  </p>
                </div>
              ) : (
                renderArticleList(searchResults)
              )}
            </div>
          </TabsContent>

          <TabsContent value="policies" className="mt-0">
            <div className="grid gap-6">
              {searchResults.filter((article) => article.category === "policies").length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No policy articles found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Try adjusting your search or browse all articles.
                  </p>
                </div>
              ) : (
                renderArticleList(searchResults.filter((article) => article.category === "policies"))
              )}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="mt-0">
            <div className="grid gap-6">
              {searchResults.filter((article) => article.category === "guides").length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No guide articles found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Try adjusting your search or browse all articles.
                  </p>
                </div>
              ) : (
                renderArticleList(searchResults.filter((article) => article.category === "guides"))
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
            <div className="grid gap-6">
              {searchResults.filter((article) => article.category === "resources").length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No resource articles found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Try adjusting your search or browse all articles.
                  </p>
                </div>
              ) : (
                renderArticleList(searchResults.filter((article) => article.category === "resources"))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-cyan-200 dark:border-cyan-900 shadow-md">
            <h2 className="text-xl font-bold text-cyan-900 dark:text-cyan-100 mb-4 flex items-center justify-center gap-2">
              <LifeBuoy className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Need Additional Help?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              If you couldn't find what you're looking for, you can submit a support request for personalized
              assistance.
            </p>
            <Link href="/support">
              <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
                Submit Support Request
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  function renderArticleList(articles: typeof knowledgeBaseArticles) {
    return articles.map((article) => (
      <Card
        key={article.id}
        className="border-cyan-200 shadow-md hover:shadow-lg transition-shadow dark:border-cyan-900 dark:shadow-none"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-cyan-900 dark:text-cyan-100">{article.title}</CardTitle>
          <CardDescription>Updated {formatDate(article.updatedAt)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
            {article.content.split("\n").slice(1, 4).join(" ").substring(0, 200)}...
          </p>
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
        </CardContent>
        <CardFooter className="border-t border-cyan-100 dark:border-cyan-900 pt-4">
          <Link href={`/support/knowledge-base/${article.id}`}>
            <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
              Read Article
            </Button>
          </Link>
        </CardFooter>
      </Card>
    ))
  }
}
