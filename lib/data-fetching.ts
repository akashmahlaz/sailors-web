// Client-side data fetching utilities
// This file should not import any MongoDB modules

// User management
export async function fetchUsers(params = {}) {
  const queryString = new URLSearchParams(params as Record<string, string>).toString()
  const response = await fetch(`/api/admin/users?${queryString}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`)
  }
  return response.json()
}

export async function fetchUser(id: string) {
  const response = await fetch(`/api/admin/users/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`)
  }
  return response.json()
}

export async function updateUser(id: string, data: any) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`)
  }
  return response.json()
}

export async function updateUserRole(id: string, role: string) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update user role: ${response.statusText}`)
  }
  return response.json()
}

export async function updateUserStatus(id: string, status: string) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update user status: ${response.statusText}`)
  }
  return response.json()
}

export async function deleteUser(id: string) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`)
  }
  return response.json()
}

// Activity logs
export async function fetchActivityLogs(params = {}) {
  const queryString = new URLSearchParams(params as Record<string, string>).toString()
  const response = await fetch(`/api/admin/activity-logs?${queryString}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch activity logs: ${response.statusText}`)
  }
  return response.json()
}

// Notifications
export async function fetchNotifications(params = {}) {
  const queryString = new URLSearchParams(params as Record<string, string>).toString()
  const response = await fetch(`/api/admin/notifications?${queryString}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.statusText}`)
  }
  return response.json()
}

export async function markNotificationAsRead(id: string) {
  const response = await fetch(`/api/admin/notifications/${id}/read`, {
    method: "PUT",
  })
  if (!response.ok) {
    throw new Error(`Failed to mark notification as read: ${response.statusText}`)
  }
  return response.json()
}

export async function markAllNotificationsAsRead() {
  const response = await fetch("/api/admin/notifications/mark-all-read", {
    method: "PUT",
  })
  if (!response.ok) {
    throw new Error(`Failed to mark all notifications as read: ${response.statusText}`)
  }
  return response.json()
}

export async function deleteNotification(id: string) {
  const response = await fetch(`/api/admin/notifications/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(`Failed to delete notification: ${response.statusText}`)
  }
  return response.json()
}
