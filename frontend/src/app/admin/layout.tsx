'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import AdminGlobalSearch from '@/components/admin/AdminGlobalSearch'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [user, isLoading, router, pathname])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Fixed Position */}
      <aside className="fixed top-0 left-0 z-50 h-screen w-64 overflow-y-auto bg-indigo-800 text-white shadow-xl">
        <div className="border-b border-indigo-700 p-6">
          <h1 className="text-2xl font-black tracking-tighter">
            GSMHub<span className="text-indigo-400">.</span>
          </h1>
          <p className="mt-1 text-[10px] tracking-widest text-indigo-300 uppercase">
            Admin Panel
          </p>
        </div>
        <nav className="mt-6 px-4 pb-20">
          <Link
            href="/admin/dashboard"
            className={`lock mb-2 flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition-all ${
              pathname === '/admin/dashboard'
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/devices"
            className={`mb-2 block flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition-all ${
              pathname.includes('/admin/devices')
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
            }`}
          >
            Devices
          </Link>
          <Link
            href="/admin/categories"
            className={`mb-2 block flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition-all ${
              pathname.includes('/admin/categories')
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
            }`}
          >
            Categories
          </Link>
          <Link
            href="/admin/brands"
            className={`mb-2 block flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition-all ${
              pathname.includes('/admin/brands')
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
            }`}
          >
            Brands
          </Link>
          <Link
            href="/admin/audit-logs"
            className={`mb-2 block flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition-all ${
              pathname.includes('/admin/audit-logs')
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
            }`}
          >
            Audit Logs
          </Link>
          <button
            onClick={logout}
            className="mt-8 block w-full rounded-xl bg-indigo-900/50 px-4 py-3 text-left font-bold text-indigo-200 transition-all hover:bg-red-600 hover:text-white"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content - Offset */}
      <main className="ml-64 max-w-[calc(100vw-16rem)] flex-1 p-8">
        <header className="mb-8 flex items-center justify-between gap-8">
          <div className="flex flex-1 items-center gap-8">
            <h2 className="shrink-0 text-3xl font-black tracking-tight text-gray-900">
              {pathname.split('/').pop()?.toUpperCase()}
            </h2>
            <AdminGlobalSearch />
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-bold text-gray-700">
              Welcome, {user.name || user.email}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-100 font-bold text-indigo-800 shadow-sm">
              {(user.name || user.email || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="rounded-lg bg-white p-6 shadow-sm">{children}</div>
      </main>
    </div>
  )
}
