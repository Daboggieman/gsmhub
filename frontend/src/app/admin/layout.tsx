'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import AdminGlobalSearch from '@/components/admin/AdminGlobalSearch'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/devices', label: 'Devices', icon: 'smartphone', exact: false },
  { href: '/admin/prices', label: 'Prices', icon: 'sell', exact: false },
  { href: '/admin/categories', label: 'Categories', icon: 'category', exact: false },
  { href: '/admin/brands', label: 'Brands', icon: 'apps', exact: false },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: 'history', exact: false },
  { href: '/admin/users', label: 'Users', icon: 'group', exact: false },
]

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
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined progress_activity animate-spin text-[48px] text-secondary" aria-hidden="true"></span>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Fixed Position */}
      <aside className="fixed top-0 left-0 z-50 h-screen w-64 overflow-y-auto border-r border-outline-variant bg-surface-container">
        <div className="border-b border-outline-variant p-space-lg">
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            GSMHub<span className="text-secondary-container">.</span>
          </h1>
          <p className="mt-1 font-label-xs text-label-xs font-bold tracking-widest text-outline uppercase">
            Admin Panel
          </p>
        </div>
        <nav className="mt-space-lg px-space-md pb-20">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.includes(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-space-md rounded-lg px-space-md py-2.5 font-label-md transition-colors ${
                  active
                    ? 'bg-surface-container-highest font-bold text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={logout}
            className="mt-space-lg flex w-full items-center gap-space-md rounded-lg px-space-md py-2.5 text-left font-label-md font-bold text-error transition-colors hover:bg-error-container/15"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content - Offset */}
      <main className="ml-64 max-w-[calc(100vw-16rem)] flex-1 p-space-lg">
        <header className="mb-space-lg flex items-center justify-between gap-space-lg">
          <div className="flex flex-1 items-center gap-space-lg">
            <h2 className="shrink-0 font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
              {pathname.split('/').pop()?.toUpperCase()}
            </h2>
            <AdminGlobalSearch />
          </div>
          <div className="flex items-center gap-space-md">
            <span className="font-label-md font-bold text-on-surface-variant">
              Welcome, {user.name || user.email}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-label-md font-bold text-on-primary-container">
              {(user.name || user.email || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
