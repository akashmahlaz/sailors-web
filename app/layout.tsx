import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import NavBar from "@/components/nav-bar"
import Footer from "@/components/footer"
import { SessionProvider } from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

// Update the metadata to reflect the sailing theme
export const metadata = {
  title: "Sailor's Media Voyage",
  description: "Navigate your media seas - videos, photos, podcasts and more",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="min-h-screen flex flex-col">
              <NavBar />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
