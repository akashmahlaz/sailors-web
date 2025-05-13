import { Suspense } from "react"
import { UserManagement } from "@/components/admin/user-management"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageHeader title="User Management" description="Manage user accounts, roles, and permissions" />

      <Suspense fallback={<div>Loading user management...</div>}>
        <UserManagement />
      </Suspense>
    </div>
  )
}
