"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Cookies Policy</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. What Are Cookies</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide a better user experience. Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device when you go offline, while session cookies are deleted as soon as you close your web browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use cookies for various purposes, including:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Authentication: To identify you when you log in to our Platform</li>
              <li>Preferences: To remember your settings and preferences</li>
              <li>Security: To protect your account and prevent fraud</li>
              <li>Analytics: To understand how you use our Platform</li>
              <li>Performance: To improve the speed and reliability of our services</li>
              <li>Personalization: To provide you with relevant content and features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Types of Cookies We Use</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the following types of cookies on our Platform:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for the website to function properly. These cookies enable core functionality such as security, network management, and accessibility.
              </li>
              <li>
                <strong>Performance Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your preferences and settings to provide enhanced, more personal features.
              </li>
              <li>
                <strong>Targeting Cookies:</strong> Used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Platform, deliver advertisements, and so on. These cookies are placed by third-party services that appear on our pages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Managing Cookies</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can negatively impact your user experience and parts of our website may no longer be fully accessible.
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Browser Settings: Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may impact your experience using our Platform.</li>
              <li>Cookie Consent: When you first visit our Platform, you will be presented with a cookie banner that allows you to accept or reject non-essential cookies.</li>
              <li>Third-Party Opt-Out: Some third-party services offer opt-out mechanisms for their cookies. You can find more information about these in their respective privacy policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Cookie Duration</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cookies can remain on your computer or mobile device for different periods of time:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Session Cookies: These cookies exist only while your browser is open and are automatically deleted when you close your browser.</li>
              <li>Persistent Cookies: These cookies survive after your browser is closed and can remain on your device for a set period of time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Changes to Cookie Policy</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              For any questions about our use of cookies, please contact us at:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Email: cetusleader2009@gmail.com</li>
              <li>Instagram: @dileep_14june</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Development Credits</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This platform was developed by:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Developer: Akashdeep Singh</li>
              <li>LinkedIn: <a href="https://www.linkedin.com/in/akashmahlax/" className="text-blue-600 hover:underline">akashmahlax</a></li>
              <li>GitHub: <a href="https://github.com/akashmahlax" className="text-blue-600 hover:underline">akashmahlax</a></li>
              <li>Contact: +91 7814002784</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  )
} 