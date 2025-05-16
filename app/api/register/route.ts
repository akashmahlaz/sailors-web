import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { getUsersCollection } from "@/lib/mongodb"
import { createUserProfile } from "@/lib/user-profiles"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Get users collection
    const usersCollection = await getUsersCollection()

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role
      createdAt: new Date(),
    })

    // Create user profile
    await createUserProfile({
      userId: result.insertedId.toString(),
      name,
      email,
      bio: "",
      location: "",
      profileImage: "",
      coverImage: "",
      role: "user",
      joinedAt: new Date(),
      updatedAt: new Date(),
      socialLinks: {},
      following: [],
      followers: [],
      interests: [],
      expertise: [],
    })

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Failed to register user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
