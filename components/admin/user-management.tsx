"use client"

import { useState, useEffect } from "react"
import { fetchUsers, updateUserRole, updateUserStatus, deleteUser } from "@/lib/data-fetching"

export function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [search, roleFilter, statusFilter, page])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const queryParams = {}
      if (search) queryParams.search = search
      if (roleFilter) queryParams.role = roleFilter
      if (statusFilter) queryParams.status = statusFilter
      queryParams.page = page.toString()

      const data = await fetchUsers(queryParams)
      setUsers(data.users)
      setTotalPages(data.pagination.pages)
    } catch (err) {
      setError("An error occurred while loading users")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      // Update the user in the local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (err) {
      console.error("Failed to update user role:", err)
      alert("Failed to update user role")
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus)
      // Update the user in the local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    } catch (err) {
      console.error("Failed to update user status:", err)
      alert("Failed to update user status")
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await deleteUser(userToDelete.id)
      // Remove the user from the local state
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
    } catch (err) {
      console.error("Failed to delete user:", err)
      alert("Failed to delete user")
    }
  }

  const confirmDeleteUser = (user) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user.id))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full md:w-64 px-4 py-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <select
            className="px-4 py-2 border rounded-lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={() => {
              setSearch("")
              setRoleFilter("")
              setStatusFilter("")
              setPage(1)
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedUsers.length > 0 && (
        <div className="mb-4 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
          <span>{selectedUsers.length} users selected</span>
          <div className="flex gap-2">
            <select
              className="px-3 py-1 border rounded"
              onChange={(e) => {
                if (e.target.value) {
                  // Apply bulk role change
                  const newRole = e.target.value
                  Promise.all(selectedUsers.map((userId) => updateUserRole(userId, newRole)))
                    .then(() => {
                      loadUsers()
                      setSelectedUsers([])
                    })
                    .catch((err) => {
                      console.error("Failed to update roles:", err)
                      alert("Failed to update roles")
                    })
                }
              }}
            >
              <option value="">Change Role</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>

            <select
              className="px-3 py-1 border rounded"
              onChange={(e) => {
                if (e.target.value) {
                  // Apply bulk status change
                  const newStatus = e.target.value
                  Promise.all(selectedUsers.map((userId) => updateUserStatus(userId, newStatus)))
                    .then(() => {
                      loadUsers()
                      setSelectedUsers([])
                    })
                    .catch((err) => {
                      console.error("Failed to update statuses:", err)
                      alert("Failed to update statuses")
                    })
                }
              }}
            >
              <option value="">Change Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-4 border-b text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAllUsers}
                />
              </th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-4 text-center">
                  Loading users...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="user">User</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => confirmDeleteUser(user)} className="text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg ${page === 1 ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white"}`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg ${
                page === totalPages ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the user <strong>{userToDelete?.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setUserToDelete(null)
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
