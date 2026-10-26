'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes, faSpinner, faUserShield, faUser } from '@fortawesome/free-solid-svg-icons'
import Pagination from '@/components/ui/Pagination'

const PAGE_LIMIT = 10

function AdminUsersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: currentUser } = useAuth()

  // URL is the single source of truth for page + search so the list
  // survives refresh, browser back/forward, and URL sharing.
  const page = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') || ''

  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' })

  // Increment to re-fetch without changing page/search (after mutations).
  const [refreshTick, setRefreshTick] = useState(0)

  // Keep the search input in sync when the URL changes (back button).
  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await apiClient.getUsers({ page, limit: PAGE_LIMIT, search })
        if (cancelled) return
        setUsers(data.users)
        setTotal(data.total)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [page, search, refreshTick])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput) {
      params.set('search', searchInput)
    } else {
      params.delete('search')
    }
    // Reset to page 1 whenever the filter changes
    params.delete('page')
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsSubmitting(true)
    try {
      await apiClient.createUser(newUser)
      setIsFormOpen(false)
      setNewUser({ name: '', email: '', password: '', role: 'admin' })
      setRefreshTick((t) => t + 1)
    } catch (error: any) {
      setFormError(error.message || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleChange = async (id: string, role: string) => {
    setBusyId(id)
    try {
      await apiClient.updateUser(id, { role })
      setRefreshTick((t) => t + 1)
    } catch (error: any) {
      alert(error.message || 'Failed to update role')
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleActive = async (current: any) => {
    setBusyId(current.id)
    try {
      await apiClient.updateUser(current.id, { isActive: !current.isActive })
      setRefreshTick((t) => t + 1)
    } catch (error: any) {
      alert(error.message || 'Failed to update status')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.deleteUser(id)
        setRefreshTick((t) => t + 1)
      } catch (error: any) {
        alert(error.message || 'Failed to delete user')
      }
    }
  }

  const totalPages = Math.ceil(total / PAGE_LIMIT)
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1
  const rangeEnd = Math.min(page * PAGE_LIMIT, total)

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            User Management
          </h1>
          <p className="mt-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Add admins and manage account access
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen((o) => !o)}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={isFormOpen ? faTimes : faPlus} />
          {isFormOpen ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleCreate}
          className="mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:grid-cols-5"
        >
          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Name
            </label>
            <input
              type="text"
              required
              placeholder="Jane Doe"
              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={newUser.name}
              onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="jane@example.com"
              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={newUser.email}
              onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={newUser.password}
              onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Role
            </label>
            <select
              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={newUser.role}
              onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gray-900 px-6 py-3 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                'Create User'
              )}
            </button>
          </div>
          {formError && (
            <p className="text-xs font-bold text-red-500 md:col-span-5">{formError}</p>
          )}
        </form>
      )}

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 bg-gray-50/30 p-6">
          <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="flex-1 rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-6 py-3 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
            >
              Filter
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  User
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Role
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Joined
                </th>
                <th className="px-6 py-5 text-right text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="animate-pulse px-6 py-12 text-center text-xs font-bold tracking-widest text-gray-400 uppercase"
                  >
                    Loading Users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-xs font-bold tracking-widest text-gray-400 uppercase"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = currentUser?.email === u.email
                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-blue-50/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-600">
                            {u.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">
                              {u.name}{' '}
                              {isSelf && (
                                <span className="ml-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-xs font-bold text-gray-500">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase ${
                            u.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={u.role === 'admin' ? faUserShield : faUser}
                            className="text-[9px]"
                          />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`flex items-center gap-2 ${
                            u.isActive ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.isActive ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          ></div>
                          <span className="text-[10px] font-black tracking-widest uppercase">
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <select
                            value={u.role}
                            disabled={isSelf || busyId === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] font-black text-gray-700 uppercase outline-none transition-all hover:border-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title={isSelf ? 'You cannot change your own role' : 'Change role'}
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={isSelf || busyId === u.id}
                            className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black uppercase transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                              u.isActive
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={isSelf ? 'You cannot deactivate your own account' : undefined}
                          >
                            {busyId === u.id ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : u.isActive ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={isSelf || busyId === u.id}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black text-red-600 uppercase transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            title={isSelf ? 'You cannot delete your own account' : undefined}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-6">
          <div className="mb-4 text-center text-[10px] font-black tracking-widest text-gray-500 uppercase">
            Showing {rangeStart.toLocaleString()}&ndash;
            {rangeEnd.toLocaleString()} of {total.toLocaleString()} users
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/admin/users"
            searchParams={{ search }}
          />
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <AdminUsersPageContent />
    </Suspense>
  )
}
