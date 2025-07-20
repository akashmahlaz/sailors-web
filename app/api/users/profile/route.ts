import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserProfileByUserId, createUserProfile, updateUserProfile } from "@/lib/user-profiles"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const profile = await getUserProfileByUserId(userId)

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if profile already exists
    const existingProfile = await getUserProfileByUserId(userId)

    if (existingProfile) {
      return NextResponse.json({ error: "Profile already exists" }, { status: 400 })
    }

    const data = await request.json()

    const profile = {
      userId,
      name: session.user.name || "Sailor",
      email: session.user.email || "",
      bio: data.bio || "",
      location: data.location || "",
      profileImage: data.profileImage || session.user.image || "",
      role: session.user.role || "user",
      joinedAt: new Date(),
      updatedAt: new Date(),
      socialLinks: data.socialLinks || {},
      interests: data.interests || [],
      expertise: data.expertise || [],
    }

    const result = await createUserProfile(profile)

    return NextResponse.json({ success: true, profileId: result.insertedId })
  } catch (error) {
    console.error("Error creating user profile:", error)
    return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if profile exists
    const existingProfile = await getUserProfileByUserId(userId)

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const data = await request.json()

    // Only allow updating certain fields
    const updates = {
      name: data.name,
      bio: data.bio,
      location: data.location,
      profileImage: data.profileImage,
      coverImage: data.coverImage,
      socialLinks: data.socialLinks,
      interests: data.interests,
      expertise: data.expertise,
    }

    // Remove undefined values
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates]
      }
    })

    const result = await updateUserProfile(userId, updates)

    return NextResponse.json({ success: true, updated: result.modifiedCount > 0 })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
