"use client";

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import AdminGlobalSearch from '@/components/admin/AdminGlobalSearch';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isLoading, router, pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-800 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">GSMHub Admin</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/admin/dashboard"
            className={`block px-6 py-3 transition-colors hover:bg-indigo-700 ${
              pathname === '/admin/dashboard' ? 'bg-indigo-900 border-l-4 border-white' : ''
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/devices"
            className={`block px-6 py-3 transition-colors hover:bg-indigo-700 ${
              pathname.includes('/admin/devices') ? 'bg-indigo-900 border-l-4 border-white' : ''
            }`}
          >
            Devices
          </Link>
          <Link
            href="/admin/categories"
            className={`block px-6 py-3 transition-colors hover:bg-indigo-700 ${
              pathname.includes('/admin/categories') ? 'bg-indigo-900 border-l-4 border-white' : ''
            }`}
          >
            Categories
          </Link>
          <Link
            href="/admin/brands"
            className={`block px-6 py-3 transition-colors hover:bg-indigo-700 ${
              pathname.includes('/admin/brands') ? 'bg-indigo-900 border-l-4 border-white' : ''
            }`}
          >
            Brands
          </Link>
          <button
            onClick={logout}
            className="mt-10 block w-full px-6 py-3 text-left transition-colors hover:bg-red-600"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="mb-8 flex items-center justify-between gap-8">
          <div className="flex items-center gap-8 flex-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight shrink-0">
              {pathname.split('/').pop()?.toUpperCase()}
            </h2>
            <AdminGlobalSearch />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-bold">Welcome, {user.name}</span>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold border-2 border-white shadow-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
