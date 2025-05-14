import Link from "next/link"
import { Sailboat, Anchor, Compass, LifeBuoy, Mail, Github, Twitter, Facebook, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 text-slate-100 pt-16 pb-8 border-t border-slate-800 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Logo and About */}
          <div>
            <Link href="/" className="flex items-center mb-5">
              <Sailboat className="h-9 w-9 text-green-400 mr-2 drop-shadow-lg" />
              <span className="text-2xl font-extrabold tracking-tight text-green-300">Sailor's Voyage</span>
            </Link>
            <p className="text-slate-400 mb-5 text-sm leading-relaxed">
              Navigate the digital seas with your fellow sailors. Share stories, discover content, and connect with your maritime community.
            </p>
            <div className="flex space-x-4 mt-2">
              <Link href="#" className="text-slate-400 hover:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-300 tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/videos" className="text-slate-300 hover:text-red-400 transition-colors flex items-center font-medium">
                  <Anchor className="h-4 w-4 mr-2 text-green-400" /> Videos
                </Link>
              </li>
              <li>
                <Link href="/photos" className="text-slate-300 hover:text-red-400 transition-colors flex items-center font-medium">
                  <Anchor className="h-4 w-4 mr-2 text-green-400" /> Photos
                </Link>
              </li>
              <li>
                <Link href="/audio" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center font-medium">
                  <Anchor className="h-4 w-4 mr-2 text-green-400" /> Audio
                </Link>
              </li>
              <li>
                <Link href="/podcasts" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center font-medium">
                  <Anchor className="h-4 w-4 mr-2 text-green-400" /> Podcasts
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center font-medium">
                  <Anchor className="h-4 w-4 mr-2 text-green-400" /> Blog
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center font-medium">
                  <Anchor className="h-4 w-4 mr-2 text-green-400" /> News
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-300 tracking-wide">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-slate-300 hover:text-green-300 transition-colors flex items-center font-medium">
                  <LifeBuoy className="h-4 w-4 mr-2 text-green-400" /> Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/knowledge-base" className="text-slate-300 hover:text-green-300 transition-colors flex items-center font-medium">
                  <Compass className="h-4 w-4 mr-2 text-green-400" /> Knowledge Base
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-slate-300 hover:text-green-300 transition-colors flex items-center font-medium">
                  <Mail className="h-4 w-4 mr-2 text-green-400" /> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-300 tracking-wide">Stay Updated</h3>
            <p className="text-slate-400 mb-4 text-sm">Subscribe to our newsletter for the latest updates and features.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-slate-800 border border-slate-700 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-100 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-r-md font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 mt-8 text-center md:flex md:justify-between md:text-left">
          <p className="text-slate-500 text-sm">© {currentYear} Sailor's Voyage. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <ul className="flex justify-center md:justify-end space-x-6">
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-cyan-300 transition-colors text-sm">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-cyan-300 transition-colors text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-400 hover:text-cyan-300 transition-colors text-sm">
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
