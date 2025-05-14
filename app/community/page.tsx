"use client"

import Link from "next/link"
import { Users, Anchor, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-2xl w-full text-center py-16">
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium text-sm">
            <Sparkles className="w-4 h-4 mr-1" /> Community
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
          Welcome to the Sailors Community
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Connect with fellow sailors, share your stories, ask questions, and explore the vibrant maritime community. Post updates, join discussions, and make new friends who share your passion for the sea!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              Join the Community <Users className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/support">
            <Button size="lg" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
              Need Help? <Anchor className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
