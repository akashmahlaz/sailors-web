"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect several types of information from and about users of our Platform:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Personal Information: Name, email address, profile picture, and other information you provide during registration</li>
              <li>Usage Data: Information about how you use our Platform, including videos watched, content uploaded, and interactions</li>
              <li>Device Information: IP address, browser type, operating system, and device identifiers</li>
              <li>Location Data: General location information based on your IP address</li>
              <li>Cookies and Similar Technologies: Information collected through cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Providing and maintaining our services</li>
              <li>Personalizing your experience</li>
              <li>Processing your transactions</li>
              <li>Sending you important updates and notifications</li>
              <li>Analyzing and improving our Platform</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and property</li>
              <li>With service providers who assist in operating our Platform</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure data storage and backup procedures</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Access: Request a copy of your personal information</li>
              <li>Correction: Request correction of inaccurate information</li>
              <li>Deletion: Request deletion of your personal information</li>
              <li>Restriction: Request restriction of processing</li>
              <li>Data Portability: Request transfer of your data</li>
              <li>Objection: Object to processing of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Changes to Privacy Policy</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              For any privacy-related questions or concerns, please contact us at:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Email: cetusleader2009@gmail.com</li>
              <li>Instagram: @dileep_14june</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Development Credits</h2>
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