import Link from "next/link"
import { Sailboat, Anchor, Compass, LifeBuoy, Mail, Github, Twitter, Facebook, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and About */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <Sailboat className="h-8 w-8 text-cyan-400 mr-2" />
              <span className="text-xl font-bold">Sailor's Voyage</span>
            </Link>
            <p className="text-slate-300 mb-4">
              Navigate the digital seas with your fellow sailors. Share stories, discover content, and connect with your
              maritime community.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/videos" className="text-slate-300 hover:text-white transition-colors flex items-center">
                  <Anchor className="h-4 w-4 mr-2 text-cyan-500" /> Videos
                </Link>
              </li>
              <li>
                <Link href="/photos" className="text-slate-300 hover:text-white transition-colors flex items-center">
                  <Anchor className="h-4 w-4 mr-2 text-cyan-500" /> Photos
                </Link>
              </li>
              <li>
                <Link href="/audio" className="text-slate-300 hover:text-white transition-colors flex items-center">
                  <Anchor className="h-4 w-4 mr-2 text-cyan-500" /> Audio
                </Link>
              </li>
              <li>
                <Link href="/podcasts" className="text-slate-300 hover:text-white transition-colors flex items-center">
                  <Anchor className="h-4 w-4 mr-2 text-cyan-500" /> Podcasts
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-300 hover:text-white transition-colors flex items-center">
                  <Anchor className="h-4 w-4 mr-2 text-cyan-500" /> Blog
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-slate-300 hover:text-white transition-colors flex items-center">
                  <Anchor className="h-4 w-4 mr-2 text-cyan-500" /> News
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-slate-300 hover:text-white transition-colors flex items-center">
                  <LifeBuoy className="h-4 w-4 mr-2 text-cyan-500" /> Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/support/knowledge-base"
                  className="text-slate-300 hover:text-white transition-colors flex items-center"
                >
                  <Compass className="h-4 w-4 mr-2 text-cyan-500" /> Knowledge Base
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-slate-300 hover:text-white transition-colors flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-cyan-500" /> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">Stay Updated</h3>
            <p className="text-slate-300 mb-4">Subscribe to our newsletter for the latest updates and features.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-slate-800 border border-slate-700 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-r-md transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 mt-8 text-center md:flex md:justify-between md:text-left">
          <p className="text-slate-400">© {currentYear} Sailor's Voyage. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <ul className="flex justify-center md:justify-end space-x-6">
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors">
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
