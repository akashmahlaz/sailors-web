import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection, getAdminActivityLogsCollection } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    const query: any = {}

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    if (role) {
      query.role = role
    }

    if (status) {
      query.status = status
    }

    const usersCollection = await getUsersCollection()

    const [users, totalCount] = await Promise.all([
      usersCollection
        .find(query)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      usersCollection.countDocuments(query),
    ])

    // Remove sensitive information
    const sanitizedUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json({
      users: sanitizedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await request.json()

    // Validate required fields
    if (!userData.email || !userData.name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()

    // Check if user with email already exists
    const existingUser = await usersCollection.findOne({ email: userData.email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: userData.status || "active",
      role: userData.role || "user",
    }

    const result = await usersCollection.insertOne(newUser)

    // Log admin activity
    const adminActivityLogsCollection = await getAdminActivityLogsCollection()
    await adminActivityLogsCollection.insertOne({
      adminId: session.user.id,
      adminName: session.user.name,
      action: "create_user",
      target: "user",
      targetId: result.insertedId,
      details: `Created user: ${userData.name} (${userData.email})`,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "User created successfully", userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
