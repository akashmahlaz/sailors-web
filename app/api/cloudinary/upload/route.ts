import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Custom function to generate a Cloudinary signature
async function generateSignature(paramsToSign: Record<string, any>, apiSecret: string): Promise<string> {
  // Create a string of key=value pairs sorted by key
  const parameters = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&")

  // Append the API secret
  const stringToSign = parameters + apiSecret

  // Use the Web Crypto API
  const encoder = new TextEncoder()
  const data = encoder.encode(stringToSign)
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)

  // Convert the hash to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
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

    // Get the form data from the request
    const formData = await request.formData()

    // Extract the file from the form data
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get other parameters
    const folder = (formData.get("folder") as string) || "uploads"
    const resourceType = (formData.get("resourceType") as string) || "auto"

    // Create parameters to sign
    const timestamp = Math.round(new Date().getTime() / 1000)
    const uploadPreset = process.env.UPLOAD_PRESET || ""

    // Create a new FormData instance for the Cloudinary API
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append("file", file)
    cloudinaryFormData.append("api_key", process.env.CLOUDINARY_API_KEY)
    cloudinaryFormData.append("timestamp", timestamp.toString())
    cloudinaryFormData.append("folder", folder)

    if (uploadPreset) {
      cloudinaryFormData.append("upload_preset", uploadPreset)
    } else {
      // If no upload preset, generate and use signature
      const paramsToSign = { timestamp, folder }
      const signature = await generateSignature(paramsToSign, process.env.CLOUDINARY_API_SECRET)
      cloudinaryFormData.append("signature", signature)
    }

    // Upload to Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      },
    )

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json()
      console.error("Cloudinary upload error:", errorData)
      return NextResponse.json(
        {
          error: "Failed to upload to Cloudinary",
          details: errorData,
        },
        { status: 500 },
      )
    }

    const result = await cloudinaryResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in upload route:", error)
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
