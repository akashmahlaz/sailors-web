import clientPromise from "@/lib/mongodb"

// Helper function to get the support requests collection
export async function getSupportRequestsCollection() {
  const client = await clientPromise
  const db = client.db("cloudinary_media")
  return db.collection("support_requests")
}

export interface SupportRequest {
  id?: string
  title: string
  description: string
  category: string
  isAnonymous: boolean
  submitterId?: string
  submitterName?: string
  submitterEmail?: string
  status: "pending" | "in-review" | "resolved" | "dismissed"
  proofs: Array<{
    url: string
    publicId: string
    resourceType: string
    format: string
    name?: string
  }>
  createdAt: Date
  updatedAt: Date
  adminNotes?: string
  adminId?: string
  resolution?: string
}
