"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight } from "lucide-react"
import Link from "next/link"

interface BlogCardProps {
  blog: {
    id: string
    title: string
    content: string
    cover_image_url?: string
    author: string
    tags: string[]
    created_at: string
  }
}

export default function BlogCard({ blog }: BlogCardProps) {
  // Format the date
  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Truncate content for preview
  const truncatedContent = blog.content.length > 150 ? blog.content.substring(0, 150) + "..." : blog.content

  return (
    <Card className="h-full flex flex-col">
      {blog.cover_image_url && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={blog.cover_image_url || "/placeholder.svg"}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {blog.author}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground">{truncatedContent}</p>
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {blog.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {blog.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{blog.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/blog/${blog.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Read More <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
