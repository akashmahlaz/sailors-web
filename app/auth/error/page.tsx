"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An error occurred during authentication."

  if (error === "OAuthSignin") errorMessage = "Error starting the OAuth sign in process."
  if (error === "OAuthCallback") errorMessage = "Error in the OAuth callback process."
  if (error === "OAuthCreateAccount") errorMessage = "Error creating a user in the database."
  if (error === "EmailCreateAccount") errorMessage = "Error creating a user in the database."
  if (error === "Callback") errorMessage = "Error in the OAuth callback handler."
  if (error === "OAuthAccountNotLinked") errorMessage = "Email already exists with a different provider."
  if (error === "EmailSignin") errorMessage = "Error sending the email for sign in."
  if (error === "CredentialsSignin") errorMessage = "Invalid credentials."
  if (error === "SessionRequired") errorMessage = "You must be signed in to access this page."
  if (error === "Default") errorMessage = "An unexpected error occurred."

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Authentication Error</CardTitle>
          <CardDescription className="text-center">There was a problem with your authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Link href="/signin">
            <Button variant="outline">Try Again</Button>
          </Link>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
