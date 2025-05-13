import type { Metadata } from "next"
import SupportRequestForm from "@/components/support-request-form"

export const metadata: Metadata = {
  title: "Sailor Support - Sailor's Media Voyage",
  description: "Submit a confidential support request to the ship's officers",
}

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-50 to-amber-50 dark:from-slate-950 dark:to-amber-950 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">Sailor Support</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Your well-being is our priority. Use this form to report any concerns, harassment, or issues you're
          experiencing. All reports are handled with the utmost confidentiality and care.
        </p>

        <SupportRequestForm />
      </div>
    </div>
  )
}
