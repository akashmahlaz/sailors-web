import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  const missingVars = []

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    missingVars.push("CLOUDINARY_CLOUD_NAME")
  }

  if (!process.env.CLOUDINARY_API_KEY) {
    missingVars.push("CLOUDINARY_API_KEY")
  }

  if (!process.env.CLOUDINARY_API_SECRET) {
    missingVars.push("CLOUDINARY_API_SECRET")
  }

  if (!process.env.MONGODB_URI) {
    missingVars.push("MONGODB_URI")
  }

  if (missingVars.length > 0) {
    return NextResponse.json({
      success: false,
      error: `Missing environment variables: ${missingVars.join(", ")}`,
    })
  }

  // Test MongoDB connection
  try {
    const client = await clientPromise
    await client.db("admin").command({ ping: 1 })

    return NextResponse.json({
      success: true,
      message: "All environment variables are set and MongoDB connection is working",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `MongoDB connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}
