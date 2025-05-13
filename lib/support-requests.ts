import clientPromise from "@/lib/mongodb-server"

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
  proofs: any[]
  createdAt: string
  updatedAt?: string
  adminNotes?: string
  adminId?: string
  resolution?: string
}

export async function getSupportRequestsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("support_requests")
}
