"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              By accessing and using Sailors Platform ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing the Platform.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              These Terms of Service constitute a legally binding agreement between you and Sailors Platform regarding your use of the Platform and its services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. User Responsibilities</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              As a user of the Platform, you are responsible for:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your account information is accurate and up-to-date</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Complying with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Content Guidelines</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Users must not upload, post, or share content that:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Is illegal, harmful, threatening, abusive, or harassing</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains hate speech or discriminatory content</li>
              <li>Promotes violence or illegal activities</li>
              <li>Contains explicit or adult content</li>
              <li>Is spam or unauthorized commercial content</li>
              <li>Impersonates others or contains false information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              All content on the Platform, including but not limited to text, graphics, logos, images, and software, is the property of Sailors Platform or its content suppliers and is protected by international copyright laws.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              By posting content on the Platform, you:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Retain ownership of your content</li>
              <li>Grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content</li>
              <li>Warrant that you have all necessary rights to grant such license</li>
              <li>Agree not to infringe on the intellectual property rights of others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Account Termination</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We reserve the right to terminate or suspend your account at any time, without prior notice, for any reason, including but not limited to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Violation of these Terms of Service</li>
              <li>Fraudulent or illegal activities</li>
              <li>Abuse of the Platform or its users</li>
              <li>Extended periods of inactivity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To the maximum extent permitted by law, Sailors Platform shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the new Terms of Service on the Platform. Your continued use of the Platform after such modifications constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              For any questions regarding these terms, please contact us at:
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