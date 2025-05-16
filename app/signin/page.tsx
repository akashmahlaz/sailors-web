"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Github } from "lucide-react"

export default function SignIn() {
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    // Check if user was redirected after registration
    const registered = searchParams.get("registered")
    if (registered === "true") {
      setShowSuccessMessage(true)
    }

    // If user is already logged in, redirect to dashboard
    if (session) {
      router.push("/dashboard")
    }
  }, [searchParams, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Redirect to dashboard on successful login
      router.push("/dashboard")
    } catch (error) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true)
    signIn(provider, { callbackUrl: "/dashboard" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-gray-200 shadow-lg dark:border-gray-700 dark:shadow-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 border-b border-gray-100 dark:border-gray-700">
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Board Your Ship</CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Enter your credentials to access your maritime journey
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {showSuccessMessage && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800">
              <AlertDescription>Account created successfully! Please sign in with your credentials.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Button
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/50"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/50"
              onClick={() => handleOAuthSignIn("github")}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with email</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gray-700 hover:bg-gray-800 text-white dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200" 
              disabled={isLoading}
            >
              {isLoading ? "Boarding..." : "Set Sail with Email"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have a ship yet?{" "}
            <Link href="/signup" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
              Hoist the Colors
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
