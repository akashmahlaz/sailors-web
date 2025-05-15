import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection, getAdminActivityLogsCollection } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { ObjectId } from "mongodb"
import { Session } from "next-auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const userData = await request.json()

    // Prevent updating sensitive fields directly
    const { password, _id, ...updateData } = userData

    const usersCollection = await getUsersCollection()

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    // Log admin activity
    const adminActivityLogsCollection = await getAdminActivityLogsCollection()
    await adminActivityLogsCollection.insertOne({
      adminId: session.user.id,
      adminName: session.user.name,
      action: "update_user",
      target: "user",
      targetId: userId,
      details: `Updated user: ${existingUser.name} (${existingUser.email})`,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: "User updated successfully",
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting the current admin
    if (existingUser._id.toString() === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) })

    // Log admin activity
    const adminActivityLogsCollection = await getAdminActivityLogsCollection()
    await adminActivityLogsCollection.insertOne({
      adminId: session.user.id,
      adminName: session.user.name,
      action: "delete_user",
      target: "user",
      targetId: userId,
      details: `Deleted user: ${existingUser.name} (${existingUser.email})`,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: "User deleted successfully",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
