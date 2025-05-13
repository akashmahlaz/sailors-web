import { getAdminActivityLogsCollection } from "./mongodb-server"

type AdminActivityLogData = {
  adminId: string
  adminName?: string
  action: string
  resource: string
  resourceId?: string
  details: string
  ip?: string
}

export async function logAdminActivity(data: AdminActivityLogData) {
  try {
    const collection = await getAdminActivityLogsCollection()

    await collection.insertOne({
      adminId: data.adminId,
      adminName: data.adminName || "Unknown",
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      ip: data.ip || "Unknown",
      timestamp: new Date(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error logging admin activity:", error)
    return { success: false, error }
  }
}

export async function getAdminActivities(query = {}, limit = 100) {
  try {
    const collection = await getAdminActivityLogsCollection()

    const activities = await collection.find(query).sort({ timestamp: -1 }).limit(limit).toArray()

    return activities
  } catch (error) {
    console.error("Error getting admin activities:", error)
    throw error
  }
}
