import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Custom function to generate a Cloudinary signature without using crypto directly
async function generateSignature(paramsToSign: Record<string, any>, apiSecret: string): Promise<string> {
  // Create a string of key=value pairs sorted by key
  const parameters = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&")

  // For debugging
  console.log("String to sign:", parameters)

  // Append the API secret
  const stringToSign = parameters + apiSecret

  // Use the Web Crypto API which is supported in Next.js
  const encoder = new TextEncoder()
  const data = encoder.encode(stringToSign)
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)

  // Convert the hash to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ error: "Missing cloud name configuration" }, { status: 500 })
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json({ error: "Missing API key configuration" }, { status: 500 })
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Missing API secret configuration" }, { status: 500 })
    }

    // Get parameters from query string
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get("folder")
    const resourceType = searchParams.get("resourceType")

    const timestamp = Math.round(new Date().getTime() / 1000)
    const paramsToSign: Record<string, any> = { timestamp }
    if (folder) {
      paramsToSign.folder = folder
    }
    const signature = await generateSignature(paramsToSign, process.env.CLOUDINARY_API_SECRET)

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      resourceType,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate upload signature",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if all required environment variables are set
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error("Missing CLOUDINARY_CLOUD_NAME environment variable")
      return NextResponse.json({ error: "Missing cloud name configuration" }, { status: 500 })
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      console.error("Missing CLOUDINARY_API_KEY environment variable")
      return NextResponse.json({ error: "Missing API key configuration" }, { status: 500 })
    }

    if (!process.env.CLOUDINARY_API_SECRET) {
      console.error("Missing CLOUDINARY_API_SECRET environment variable")
      return NextResponse.json({ error: "Missing API secret configuration" }, { status: 500 })
    }

    // Get parameters from request body
    const body = await request.json()
    const { folder, resourceType } = body

    // Create parameters to sign
    const timestamp = Math.round(new Date().getTime() / 1000)
    const paramsToSign: Record<string, any> = { timestamp }

    // Only add folder if it's provided
    if (folder) {
      paramsToSign.folder = folder
    }

    // Generate signature using our custom function
    const signature = await generateSignature(paramsToSign, process.env.CLOUDINARY_API_SECRET)

    console.log("Signature generated successfully:", {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp,
      folder,
      resourceType,
      signature,
    })

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      resourceType,
    })
  } catch (error) {
    console.error("Error generating signature:", error)
    return NextResponse.json(
      {
        error: "Failed to generate upload signature",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
