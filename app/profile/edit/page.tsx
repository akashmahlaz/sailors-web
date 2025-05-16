import type { Metadata } from "next"
import ProfileEditForm from "@/components/profile-edit-form"

export const metadata: Metadata = {
  title: "Edit Profile - Sailor's Media Voyage",
  description: "Update your sailor profile information",
}

export default function EditProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-cyan-50 dark:from-slate-950 dark:to-gray-700">
      <ProfileEditForm />
    </div>
  )
}
