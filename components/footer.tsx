import Link from "next/link"
import { Sailboat, Anchor, Compass, LifeBuoy, Mail, Github, Twitter, Facebook, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 text-gray-700 pt-16 pb-8 border-t border-gray-300 shadow-inner dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Logo and About */}
          <div>
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
            <p className="text-gray-500 mb-5 text-sm leading-relaxed dark:text-gray-400">
              Navigate the digital seas with your fellow sailors. Share stories, discover content, and connect with your maritime community.
            </p>
            <div className="flex space-x-4 mt-2">
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded dark:hover:text-gray-300 dark:focus:ring-gray-600">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded dark:hover:text-gray-300 dark:focus:ring-gray-600">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded dark:hover:text-gray-300 dark:focus:ring-gray-600">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded dark:hover:text-gray-300 dark:focus:ring-gray-600">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded dark:hover:text-gray-300 dark:focus:ring-gray-600">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 tracking-wide dark:text-gray-200">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/videos" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200">
                  <Anchor className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" /> Videos
                </Link>
              </li>
              <li>
                <Link href="/photos" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200">
                  <Anchor className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" /> Photos
                </Link>
              </li>
              <li>
                <Link href="/audio" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200">
                  <Anchor className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" /> Audio
                </Link>
              </li>
              <li>
                <Link href="/podcasts" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200">
                  <Anchor className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" /> Podcasts
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200">
                  <Anchor className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" /> Blog
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200">
                  <Anchor className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" /> News
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 tracking-wide dark:text-gray-200">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200">
                  <LifeBuoy className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" /> Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/knowledge-base" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200">
                  <Compass className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" /> Knowledge Base
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center font-medium dark:text-gray-400 dark:hover:text-gray-200">
                  <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" /> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 tracking-wide dark:text-gray-200">Stay Updated</h3>
            <p className="text-gray-500 mb-4 text-sm dark:text-gray-400">Subscribe to our newsletter for the latest updates and features.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-gray-200 border border-gray-300 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-700 placeholder:text-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-gray-500 dark:text-gray-200 dark:placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-r-md font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-500"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 pt-8 mt-8 text-center md:flex md:justify-between md:text-left dark:border-gray-700">
          <p className="text-gray-500 text-sm dark:text-gray-400">© {currentYear} Sailor's Platform. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <ul className="flex justify-center md:justify-end space-x-6">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-gray-700 transition-colors text-sm dark:text-gray-500 dark:hover:text-gray-300">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-gray-700 transition-colors text-sm dark:text-gray-500 dark:hover:text-gray-300">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-gray-700 transition-colors text-sm dark:text-gray-500 dark:hover:text-gray-300">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
