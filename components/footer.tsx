import Link from "next/link"
import { Sailboat, Anchor, Compass, LifeBuoy, Mail, Github, Twitter, Facebook, Instagram, Youtube, MailIcon, Linkedin, Globe2Icon, Globe } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-700 pt-20 pb-10 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          {/* Brand Section */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors dark:text-white dark:hover:text-gray-300"
              >
                <img
                  src="/d4.jpg"
                  alt="Sailor's Platform Logo"
                  className="h-14 w-14 object-contain rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
                  style={{ minWidth: 56, minHeight: 56 }}
                />
                <span className="ml-4 hidden sm:inline text-2xl">Sailor's Platform</span>
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-md">
              Navigate the digital seas with your fellow sailors. Share stories, discover content, and connect with your maritime community.
            </p>
            <div className="flex items-center space-x-6">
              <Link 
                href="https://www.instagram.com/dileep_14june" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </Link>
              <Link 
                href="mailto:cetusleader2009@gmail.com" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors transform hover:scale-110"
                aria-label="Email"
              >
                <MailIcon className="h-6 w-6" />
              </Link>
              <Link 
                href="https://github.com/akashmahlax" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors transform hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </Link>
              <Link 
                href="https://www.linkedin.com/in/akashmahlax/" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </Link>
              <Link 
                href="https://portfolio-blue-rho-93.vercel.app/" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors transform hover:scale-110"
                aria-label="Portfolio"
              >
                <Globe className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-8 text-gray-800 dark:text-gray-200 tracking-wide">Quick Links</h3>
            <ul className="space-y-5">
              <li>
                <Link href="/videos" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200 group">
                  <Anchor className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  <span className="text-base">Videos</span>
                </Link>
              </li>
              <li>
                <Link href="/photos" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200 group">
                  <Anchor className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  <span className="text-base">Photos</span>
                </Link>
              </li>
              <li>
                <Link href="/audio" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200 group">
                  <Anchor className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  <span className="text-base">Audio</span>
                </Link>
              </li>
              <li>
                <Link href="/podcasts" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200 group">
                  <Anchor className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  <span className="text-base">Podcasts</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200 group">
                  <Anchor className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  <span className="text-base">Blog</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-semibold mb-8 text-gray-800 dark:text-gray-200 tracking-wide">Support</h3>
            <ul className="space-y-5">
              <li>
                <Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200 group">
                  <LifeBuoy className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  <span className="text-base">Help Center</span>
                </Link>
              </li>
              <li>
                <Link href="/support/knowledge-base" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200 group">
                  <Compass className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  <span className="text-base">Knowledge Base</span>
                </Link>
              </li>
              <li>
                <Link href="mailto:cetusleader2009@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200 group">
                  <Mail className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  <span className="text-base">Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section - Commented Out
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200 tracking-wide">Stay Updated</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <form className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
          */}
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              © {currentYear} Sailor's Platform. All rights reserved.
            </p>
            <div className="flex items-center space-x-10">
              <Link 
                href="/terms" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors text-sm font-medium hover:underline"
              >
                Terms
              </Link>
              <Link 
                href="/privacy" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors text-sm font-medium hover:underline"
              >
                Privacy
              </Link>
              <Link 
                href="/cookies" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors text-sm font-medium hover:underline"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
