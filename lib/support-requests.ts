import clientPromise from "@/lib/mongodb-server"

export interface SupportRequestComment {
  id: string
  message: string
  authorId: string
  authorName: string
  authorRole: "user" | "admin"
  createdAt: string
}

export interface SupportRequest {
  id: string
  title: string
  description: string
  category: string
  isAnonymous: boolean
  submitterId?: string | null
  submitterName?: string | null
  submitterEmail?: string | null
  status: "pending" | "in-review" | "resolved" | "dismissed"
  proofs: Array<{
    url: string
    publicId: string
    resourceType: string
    format: string
    name?: string
  }>
  createdAt: string
  updatedAt?: string
  adminNotes?: string
  adminId?: string
  resolution?: string
  comments?: SupportRequestComment[]
}

export async function getSupportRequestsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("support_requests")
}
