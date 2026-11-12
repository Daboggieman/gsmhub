'use client'

import { useEffect, useState } from 'react'
import { AdminBrand } from '@/lib/api'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState<string | null>(null) // State to track which brand is syncing
  const [search, setSearch] = useState('')

  const [syncOptions, setSyncOptions] = useState<{ forceUpdate: boolean }>({
    forceUpdate: false,
  })

  // Increment to re-fetch without changing the search term (after
  // mutations and manual search submits).
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async (term: string) => {
      setIsLoading(true)
      try {
        const data = await apiClient.getAdminBrands(term)
        if (!cancelled) setBrands(data)
      } catch (error) {
        console.error('Error fetching brands:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load(search)
    return () => {
      cancelled = true
    }
    // `search` is read at trigger time: refetches are explicit (submit,
    // delete, sync) rather than per-keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setRefreshTick((t) => t + 1)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await apiClient.deleteBrand(id)
        setRefreshTick((t) => t + 1)
      } catch {
        alert('Failed to delete brand')
      }
    }
  }

  const handleSync = async (brandName?: string) => {
    setIsSyncing(brandName || 'all')
    try {
      const { message } = await apiClient.syncDevices(brandName, syncOptions)
      alert(message)
      if (brandName) setRefreshTick((t) => t + 1)
    } catch (error) {
      console.error('Sync failed:', error)
      alert('Sync failed. Please check the backend logs.')
    } finally {
      setIsSyncing(null)
    }
  }

  return (
    <div className="space-y-space-lg">
      {/* Sync Settings */}
      <div className="flex flex-wrap items-center gap-space-lg rounded-xl bg-surface-container-low p-space-lg shadow-md md:shadow-none">
        <div>
          <h4 className="mb-space-sm font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
            Conflict Policy
          </h4>
          <button
            onClick={() =>
              setSyncOptions((prev) => ({
                ...prev,
                forceUpdate: !prev.forceUpdate,
              }))
            }
            className={`flex items-center gap-2 rounded-lg px-space-md py-2 font-label-xs text-label-xs font-bold uppercase transition-colors ${
              syncOptions.forceUpdate
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[16px] ${syncOptions.forceUpdate ? '' : 'text-outline'}`}
              aria-hidden="true"
            >
              {syncOptions.forceUpdate ? 'toggle_on' : 'toggle_off'}
            </span>
            {syncOptions.forceUpdate ? 'Force Overwrite' : 'Fill Gaps Only'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h3 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Brand Management
          </h3>
          <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
            Manage manufacturers and logos
          </p>
        </div>
        <div className="flex flex-wrap gap-space-sm">
          <Link
            href="/admin/brands/new"
            className="flex items-center gap-2 rounded-lg bg-primary-container px-space-md py-2.5 font-label-sm text-label-sm font-bold text-on-primary-container transition-colors hover:bg-inverse-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
            Add Brand
          </Link>
          <button
            onClick={() => handleSync()}
            disabled={isSyncing === 'all'}
            className="flex items-center gap-2 rounded-lg bg-surface-container-highest px-space-md py-2.5 font-label-sm text-label-sm font-bold text-on-surface transition-colors hover:brightness-110 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isSyncing === 'all' ? 'progress_activity animate-spin' : ''}`} aria-hidden="true">{isSyncing === 'all' ? '' : 'sync'}</span>
            Sync All
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-space-sm">
        <input
          type="text"
          placeholder="Search brands..."
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-surface-container-highest px-space-lg py-2.5 font-label-sm font-bold text-on-surface transition-colors hover:brightness-110"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Logo
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Name
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Slug
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Devices
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Status
                </th>
                <th className="px-space-lg py-space-md text-right font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {isLoading ? (
                <tr key="loading-row">
                  <td
                    colSpan={6}
                    className="px-space-lg py-space-lg text-center font-label-md font-bold text-outline"
                  >
                    Loading manufacturers...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr key="empty-row">
                  <td
                    colSpan={6}
                    className="px-space-lg py-space-lg text-center font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline"
                  >
                    No brands registered
                  </td>
                </tr>
              ) : (
                brands.map((brand, index) => (
                  <tr
                    key={brand.id || brand._id || brand.slug || index}
                    className="group transition-colors hover:bg-surface-container"
                  >
                    <td className="px-space-lg py-space-md">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-outline-variant/50 bg-surface-container p-2">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-[20px] text-outline" aria-hidden="true">image</span>
                        )}
                      </div>
                    </td>
                    <td className="px-space-lg py-space-md font-label-md font-bold text-on-surface">
                      {brand.name}
                    </td>
                    <td className="px-space-lg py-space-md font-body-sm text-on-surface-variant">
                      {brand.slug}
                    </td>
                    <td className="px-space-lg py-space-md">
                      <span className="rounded bg-secondary-container/15 px-2 py-1 font-label-sm font-bold text-secondary-container tabular-nums">
                        {brand.deviceCount} Devices
                      </span>
                    </td>
                    <td className="px-space-lg py-space-md">
                      <span
                        className={`rounded px-2 py-1 font-label-xs text-label-xs font-bold uppercase tracking-widest ${brand.isFeatured ? 'bg-tertiary-container/15 text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'}`}
                      >
                        {brand.isFeatured ? 'Featured' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-space-lg py-space-md text-right">
                      <div className="flex justify-end gap-space-md opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          href={`/admin/brands/${brand.id}`}
                          className="text-secondary transition-colors hover:text-secondary-container"
                          title="Edit Brand"
                        >
                          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">edit</span>
                        </Link>
                        <button
                          onClick={() => handleSync(brand.name)}
                          disabled={!!isSyncing}
                          className="text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
                          title="Sync Devices"
                        >
                          <span
                            className={`material-symbols-outlined text-[20px] ${isSyncing === brand.name ? 'progress_activity animate-spin' : ''}`}
                            aria-hidden="true"
                          >
                            {isSyncing === brand.name ? '' : 'sync'}
                          </span>
                        </button>
                        <button
                          onClick={() => brand.id && handleDelete(brand.id)}
                          className="text-error transition-colors hover:text-error-container"
                        >
                          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
