"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  User,
  Shield,
  Film,
  Music,
  ImageIcon,
  FileText,
  Mic,
  Newspaper,
  ChevronDown,
  Anchor,
  Waves,
  Sailboat,
  Bell,
  LifeBuoy,
  UserCircle,
  Search,
  Menu,
  HomeIcon,
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationPanel } from "./notification-panel"
import { useState } from "react"

export default function NavBar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const isAdmin = isAuthenticated && session?.user?.role === "admin"
  const { notifications, unreadCount, toggleNotificationPanel, isNotificationPanelOpen } = useNotifications()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const mainDropdowns = [
    {
      label: "Sailor Chronicles",
      icon: Anchor,
      subLinks: [
        { href: "/", label: "Home", icon: HomeIcon},
        { href: "/videos", label: "Shorts", icon: Film },
        { href: "/audio", label: "Sailor's Voice", icon: Music },
        { href: "/photos", label: "Moments", icon: ImageIcon },
      ],
    },
    {
      label: "Sailor's Buzz",
      icon: Waves,
      subLinks: [
        { href: "/news", label: "Maritime News", icon: Newspaper },
        { href: "/blog", label: "Blogs", icon: FileText },
        { href: "/podcasts", label: "Sailor's Podcast", icon: Mic },
      ],
    },
  ]

  return (
    <div className="bg-gray-200 border-b border-gray-500 sticky top-0 z-50 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="mr-4 flex flex-shrink-0 items-center">
          <Link
            href="/"
            className="flex items-center text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors dark:text-white dark:hover:text-gray-300"
          >
            {/* Logo image placeholder, replace src when image is provided */}
            <img
              src="/d4.jpg"
              alt="Logo"
              className="mr-2 h-10 w-10 object-contain rounded-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm"
              style={{ minWidth: 32, minHeight: 32 }}
            />
            <span className="hidden sm:inline">Sailor's Platform</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden ml-auto text-gray-700 p-2 rounded-full hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 transition-colors dark:text-gray-300 dark:hover:bg-gray-700 dark:focus-visible:ring-gray-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Open main menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center space-x-4 ml-6">
          {mainDropdowns.map((dropdown) => (
            <div key={dropdown.label} className="group relative inline-block">
              <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 hover:bg-gray-100 px-3 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 dark:focus-visible:ring-gray-500">
                <dropdown.icon className="mr-2 h-5 w-5 text-gray-500 transition-transform group-hover:rotate-12 duration-300 dark:text-gray-400" />
                {dropdown.label}
                <ChevronDown className="ml-1 h-4 w-4 text-gray-500 transform group-hover:rotate-180 transition-transform duration-300 dark:text-gray-400" />
              </button>
              {/* Dropdown menu */}
              <div className="absolute pt-2 top-full left-0 z-50 min-w-[240px] origin-top opacity-0 invisible group-hover:visible pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-out">
                <div className="bg-white backdrop-blur-lg rounded-xl shadow-lg ring-1 ring-gray-200 p-2 space-y-1 dark:bg-gray-800 dark:ring-gray-700">
                  {dropdown.subLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                        (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                          ? "bg-gray-800 text-white shadow-md dark:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      <link.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      {link.label}
                      <span className="ml-auto opacity-0 group-hover:opacity-70 transition-opacity">↗</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Support Link */}
          <Link
            href="/support"
            className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-300 ${
              pathname.startsWith("/support")
                ? "bg-gray-200 text-gray-900 shadow-md dark:bg-gray-700 dark:text-white"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
            }`}
          >
            <LifeBuoy className="mr-2 h-5 w-5" />
            Support
          </Link>

          {/* Theme Toggle */}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-16 bottom-0 bg-gray-50 border-t border-gray-200 sm:hidden shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-md overflow-y-auto">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Home Link */}
              <Link
                href="/"
                className="flex items-center py-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sailboat className="mr-2 h-4 w-4" />
                Home
              </Link>

              {/* Admin Dropdown for mobile (always visible, adapts to user role) */}
              {isAuthenticated && (
                <div className="space-y-2">
                  <div className="flex items-center text-gray-800 font-medium dark:text-white">
                    <User className="h-6 w-6 text-gray-500 transition-transform group-hover:rotate-12 duration-300 dark:text-gray-400" />
                    <span className="text-sm font-medium">
                      {session?.user?.name}
                      {isAdmin && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-800 text-white text-xs rounded-full dark:bg-gray-600">
                          Admin
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="pl-7 space-y-2">
                    <Link
                      href={`/profile/${session?.user?.id || 'me'}`}
                      className="flex items-center py-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center py-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center py-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Quarter's
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Main dropdowns (always show both) */}
              {mainDropdowns.map((dropdown) => (
                <div key={dropdown.label} className="space-y-2">
                  <div className="flex items-center text-gray-800 font-medium dark:text-white">
                    <dropdown.icon className="mr-2 h-5 w-5" />
                    {dropdown.label}
                  </div>
                  <div className="pl-7 space-y-2">
                    {dropdown.subLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center py-2 text-sm rounded-lg transition-colors ${
                          pathname.startsWith(link.href)
                            ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                            : "text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* Support Link */}
              <Link
                href="/support"
                className={`flex items-center py-2 text-sm rounded-lg transition-colors ${
                  pathname.startsWith("/support")
                    ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                    : "text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
              </Link>

              {/* Theme Toggle */}
              <div className="flex items-center py-2">
                <ThemeToggle />
              </div>

              {/* Logout Button */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center w-full py-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}

        <div className="hidden sm:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="group relative inline-block">
              <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 hover:bg-gray-100 px-3 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 dark:focus-visible:ring-gray-500">
                <User className="h-6 w-6 text-gray-500 transition-transform group-hover:rotate-12 duration-300 dark:text-gray-400" />
                <span className="text-sm font-medium">
                  {session?.user?.name}
                  {isAdmin && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-800 text-white text-xs rounded-full dark:bg-gray-600">
                      Admin
                    </span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500 transform group-hover:rotate-180 transition-transform duration-300 dark:text-gray-400" />
              </button>
              {/* Added pointer-events-none by default and pointer-events-auto on hover */}
              <div className="absolute right-0 top-full pt-2 z-50 min-w-[200px] origin-top-right opacity-0 invisible group-hover:visible pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-out">
                <div className="bg-white backdrop-blur-lg rounded-xl shadow-lg ring-1 ring-gray-200 p-2 space-y-1 dark:bg-gray-800 dark:ring-gray-700">
                  {/* Profile Link */}
                  <Link
                    href={`/profile/${session?.user?.id || 'me'}`}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 transform hover:scale-[1.02] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    <UserCircle className="mr-3 h-4 w-4" />
                    Profile
                    <span className="ml-auto opacity-0 group-hover:opacity-70 transition-opacity">↗</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                      pathname.startsWith("/dashboard")
                        ? "bg-gray-800 text-white shadow-md dark:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    }`}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Dashboard
                    <span className="ml-auto opacity-0 group-hover:opacity-70 transition-opacity">↗</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 transform hover:scale-[1.02] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      <Shield className="mr-3 h-4 w-4" />
                      Admin Quarter's
                      <span className="ml-auto opacity-0 group-hover:opacity-70 transition-opacity">⚓</span>
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 transform hover:scale-[1.02] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                    <span className="ml-auto opacity-0 group-hover:opacity-70 transition-opacity">↩</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/signin">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white dark:focus-visible:ring-gray-500"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  className="bg-gray-800 hover:bg-gray-700 text-white shadow-sm
                    transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus-visible:ring-gray-500"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Notification Panel */}
      {isNotificationPanelOpen && <NotificationPanel notifications={notifications} />}
    </div>
  )
}
