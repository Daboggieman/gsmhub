'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminUser } from '@/lib/api'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
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

  const [users, setUsers] = useState<AdminUser[]>([])
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

  // Keep the search input in sync when the URL changes (back button) —
  // adjusted during render (documented prop-change pattern) so no
  // cascading effect render is needed.
  const [prevSearch, setPrevSearch] = useState(search)
  if (prevSearch !== search) {
    setPrevSearch(search)
    setSearchInput(search)
  }

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
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleChange = async (id: string, role: string) => {
    setBusyId(id)
    try {
      await apiClient.updateUser(id, { role })
      setRefreshTick((t) => t + 1)
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleActive = async (current: AdminUser) => {
    const id = current.id || current._id
    if (!id) return
    setBusyId(id)
    try {
      await apiClient.updateUser(id, { isActive: !current.isActive })
      setRefreshTick((t) => t + 1)
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.deleteUser(id)
        setRefreshTick((t) => t + 1)
      } catch (error: unknown) {
        alert(error instanceof Error ? error.message : 'Failed to delete user')
      }
    }
  }

  const totalPages = Math.ceil(total / PAGE_LIMIT)
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1
  const rangeEnd = Math.min(page * PAGE_LIMIT, total)

  return (
    <div className="space-y-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            User Management
          </h1>
          <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
            Add admins and manage account access
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg bg-primary-container px-space-md py-2.5 font-label-sm text-label-sm font-bold text-on-primary-container transition-colors hover:bg-inverse-primary"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{isFormOpen ? 'close' : 'add'}</span>
          {isFormOpen ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-md md:shadow-none md:grid-cols-5"
        >
          <div>
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Name
            </label>
            <input
              type="text"
              required
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              value={newUser.name}
              onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="jane@example.com"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              value={newUser.email}
              onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              value={newUser.password}
              onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Role
            </label>
            <select
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
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
              className="w-full rounded-lg bg-primary-container px-space-md py-2.5 font-label-sm text-label-sm font-bold text-on-primary-container transition-colors hover:bg-inverse-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : 'Create User'}
            </button>
          </div>
          {formError && (
            <p className="font-body-sm font-bold text-error md:col-span-5">{formError}</p>
          )}
        </form>
      )}

      <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none">
        <div className="border-b border-outline-variant bg-surface-container p-space-lg">
          <form onSubmit={handleSearch} className="flex max-w-lg gap-space-sm">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-surface-container-highest px-space-lg py-2.5 font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface transition-colors hover:brightness-110"
            >
              Filter
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  User
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Role
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Status
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Joined
                </th>
                <th className="px-space-lg py-space-md text-right font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="animate-pulse px-space-lg py-space-xl text-center font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline"
                  >
                    Loading Users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-space-lg py-space-xl text-center font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline"
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
                      className="transition-colors hover:bg-surface-container"
                    >
                      <td className="px-space-lg py-space-md">
                        <div className="flex items-center gap-space-md">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-label-md font-bold text-on-primary-container">
                            {u.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-label-md font-bold text-on-surface">
                              {u.name}{' '}
                              {isSelf && (
                                <span className="ml-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="font-body-sm font-bold text-on-surface-variant">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-space-lg py-space-md">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded px-2 py-1 font-label-xs text-label-xs font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-secondary-container/15 text-secondary-container'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
                            {u.role === 'admin' ? 'shield_person' : 'person'}
                          </span>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-space-lg py-space-md">
                        <div
                          className={`flex items-center gap-2 ${
                            u.isActive ? 'text-tertiary' : 'text-outline'
                          }`}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.isActive ? 'bg-tertiary' : 'bg-outline'
                            }`}
                          ></div>
                          <span className="font-label-xs text-label-xs font-bold uppercase tracking-widest">
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-space-lg py-space-md font-body-sm font-bold text-on-surface-variant tabular-nums">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-space-lg py-space-md text-right">
                        <div className="flex justify-end gap-2">
                          <select
                            value={u.role}
                            disabled={isSelf || busyId === u.id}
                            onChange={(e) => u.id && handleRoleChange(u.id, e.target.value)}
                            className="rounded-lg border border-outline-variant bg-surface-container px-2 py-2 font-label-xs text-label-xs font-bold uppercase text-on-surface outline-none transition-colors focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
                            title={isSelf ? 'You cannot change your own role' : 'Change role'}
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={isSelf || busyId === u.id}
                            className={`rounded-lg bg-surface-container px-3 py-2 font-label-xs text-label-xs font-bold uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              u.isActive
                                ? 'text-on-surface-variant hover:bg-surface-container-high'
                                : 'text-tertiary hover:bg-tertiary-container/15'
                            }`}
                            title={isSelf ? 'You cannot deactivate your own account' : undefined}
                          >
                            {busyId === u.id
                              ? '…'
                              : u.isActive
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>
                          <button
                            onClick={() => u.id && handleDelete(u.id)}
                            disabled={isSelf || busyId === u.id}
                            className="rounded-lg bg-surface-container px-3 py-2 font-label-xs text-label-xs font-bold text-error uppercase transition-colors hover:bg-error-container/15 disabled:cursor-not-allowed disabled:opacity-40"
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
        <div className="border-t border-outline-variant bg-surface-container p-space-lg">
          <div className="mb-space-sm text-center font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline tabular-nums">
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
