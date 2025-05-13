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
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationPanel } from "./notification-panel"

export default function NavBar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const isAdmin = isAuthenticated && session?.user?.role === "admin"
  const { notifications, unreadCount, toggleNotificationPanel, isNotificationPanelOpen } = useNotifications()

  const mainDropdowns = [
    {
      label: "Sailor Chronicles",
      icon: Anchor,
      subLinks: [
        { href: "/videos", label: "Sea Shorts", icon: Film },
        { href: "/audio", label: "Sea Sounds", icon: Music },
        { href: "/photos", label: "Sea Snaps", icon: ImageIcon },
      ],
    },
    {
      label: "Sailor's Buzz",
      icon: Waves,
      subLinks: [
        { href: "/news", label: "Maritime Reports", icon: Newspaper },
        { href: "/blog", label: "Sea Blog", icon: FileText },
        { href: "/podcasts", label: "Sea Waves", icon: Mic },
      ],
    },
  ]

  return (
    <div className="border-b border-cyan-800/30 bg-slate-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/75 dark:bg-slate-950/90 dark:border-cyan-950/30 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="mr-4 flex flex-shrink-0 items-center">
          <Link
            href="/"
            className="flex items-center text-xl font-bold text-white hover:text-cyan-300 transition-colors"
          >
            <Sailboat className="mr-2 h-6 w-6 text-cyan-400 transition-transform hover:rotate-12 duration-300" />
            Sailor's Voyage
          </Link>
        </div>

        <nav className="flex items-center space-x-6">
          {mainDropdowns.map((dropdown) => (
            <div key={dropdown.label} className="group relative inline-block">
              <button className="flex items-center text-sm font-medium text-cyan-100 hover:text-white transition-all duration-300 hover:bg-slate-800/30 px-3 py-1.5 rounded-lg dark:text-cyan-200 dark:hover:bg-slate-900/50">
                <dropdown.icon className="mr-2 h-5 w-5 text-cyan-400 transition-transform group-hover:rotate-12 duration-300" />
                {dropdown.label}
                <ChevronDown className="ml-1 h-4 w-4 text-cyan-300 transform group-hover:rotate-180 transition-transform duration-300" />
              </button>
              {/* Added pointer-events-none by default and pointer-events-auto on hover */}
              <div className="absolute pt-2 top-full left-0 z-50 min-w-[240px] origin-top opacity-0 invisible group-hover:visible pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-out">
                <div className="bg-gradient-to-b from-cyan-50 to-white backdrop-blur-lg rounded-xl shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-100/50 p-2 space-y-1 dark:from-slate-800 dark:to-slate-900 dark:ring-cyan-900/50 dark:shadow-cyan-900/10">
                  {dropdown.subLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                        pathname.startsWith(link.href)
                          ? "bg-cyan-600 text-white shadow-md dark:bg-cyan-700"
                          : "text-slate-700 hover:bg-cyan-50 hover:text-cyan-900 hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-cyan-100"
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
                ? "bg-cyan-700 text-white shadow-md dark:bg-cyan-800"
                : "text-cyan-100 hover:text-white hover:bg-slate-800/30 dark:text-cyan-200 dark:hover:bg-slate-900/50"
            }`}
          >
            <LifeBuoy className="mr-2 h-5 w-5 text-cyan-400" />
            Support
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="relative text-cyan-100 hover:text-white hover:bg-slate-800/30"
              onClick={toggleNotificationPanel}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          )}

          <ThemeToggle />

          {isAuthenticated ? (
            <div className="group relative inline-block">
              <button className="flex items-center space-x-2 text-cyan-100 bg-slate-800/30 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-slate-800/50 hover:text-white dark:bg-slate-900/50 dark:hover:bg-slate-900/80">
                <div className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-cyan-400 transition-transform group-hover:rotate-12 duration-300" />
                  <span className="text-sm font-medium">
                    {session?.user?.name}
                    {isAdmin && (
                      <span className="ml-2 px-2 py-0.5 bg-cyan-100/80 text-cyan-800 text-xs rounded-full backdrop-blur-sm dark:bg-cyan-900/80 dark:text-cyan-200">
                        Captain
                      </span>
                    )}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-cyan-300 transform group-hover:rotate-180 transition-transform duration-300" />
              </button>
              {/* Added pointer-events-none by default and pointer-events-auto on hover */}
              <div className="absolute right-0 top-full pt-2 z-50 min-w-[200px] origin-top-right opacity-0 invisible group-hover:visible pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-out">
                <div className="bg-gradient-to-b from-cyan-50 to-white backdrop-blur-lg rounded-xl shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-100/50 p-2 space-y-1 dark:from-slate-800 dark:to-slate-900 dark:ring-cyan-900/50 dark:shadow-cyan-900/10">
                  {/* Profile Link */}
                  <Link
                    href={`/profile/${session?.user?.id}`}
                    className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-900 rounded-lg transition-all duration-200 transform hover:scale-[1.02] dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-cyan-100"
                  >
                    <UserCircle className="mr-3 h-4 w-4" />
                    My Profile
                    <span className="ml-auto opacity-0 group-hover:opacity-70 transition-opacity">↗</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                      pathname.startsWith("/dashboard")
                        ? "bg-cyan-600 text-white shadow-md dark:bg-cyan-700"
                        : "text-slate-700 hover:bg-cyan-50 hover:text-cyan-900 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-cyan-100"
                    }`}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Ship's Deck
                    <span className="ml-auto opacity-0 group-hover:opacity-70 transition-opacity">↗</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-900 rounded-lg transition-all duration-200 transform hover:scale-[1.02] dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-cyan-100"
                    >
                      <Shield className="mr-3 h-4 w-4" />
                      Captain's Quarters
                      <span className="ml-auto opacity-0 group-hover:opacity-70 transition-opacity">⚓</span>
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-900 rounded-lg transition-all duration-200 transform hover:scale-[1.02] dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-cyan-100"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Abandon Ship
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
                  className="text-cyan-100 hover:bg-cyan-800/50 hover:text-white
                    transition-all duration-300 hover:scale-105 shadow-sm dark:hover:bg-cyan-900/50"
                >
                  Board Ship
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20
                    transition-all duration-300 hover:scale-105 hover:shadow-cyan-600/40 dark:bg-cyan-700 dark:hover:bg-cyan-600 dark:shadow-cyan-900/20"
                >
                  Hoist the Colors
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
