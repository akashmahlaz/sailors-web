import { MongoClient, ServerApiVersion } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Helper functions for collections
export async function getPhotosCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("photos")
}

export async function getBlogsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("blogs")
}

export async function getVideosCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("videos")
}

export async function getAudioCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("audio")
}

export async function getPlaylistsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("playlists")
}

export async function getPodcastsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("podcasts")
}

export async function getNewsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("news")
}

export async function getUsersCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("users")
}

export async function getSupportRequestsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("support_requests")
}

export async function getKnowledgeBaseCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("knowledge_base")
}

export async function getUserProfilesCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("user_profiles")
}

export async function getFollowsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("follows")
}

export async function getCollection(name: string) {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection(name)
}

export async function getAdminActivityLogsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("admin_activity_logs")
}

export async function getAdminNotificationsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("admin_notifications")
}

export async function getPostsCollection() {
  const client = await clientPromise;
  const db = client.db("sailor_platform");
  return db.collection("posts");
}
