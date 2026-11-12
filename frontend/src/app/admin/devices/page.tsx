'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Device } from '@shared/types'
import Link from 'next/link'
import Pagination from '@/components/ui/Pagination'

const PAGE_LIMIT = 10

function AdminDevicesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL is the single source of truth for page + search so the list
  // survives refresh, browser back/forward, and URL sharing.
  const page = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') || ''

  const [devices, setDevices] = useState<Device[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)
  const [isImporting, setIsImporting] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [isSyncingAll, setIsSyncingAll] = useState(false)
  const [importStatus, setImportStatus] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [syncOptions, setSyncOptions] = useState<{ forceUpdate: boolean }>({
    forceUpdate: false,
  })

  // Increment to re-fetch without changing page/search (after mutations).
  const [refreshTick, setRefreshTick] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

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
        const data = await apiClient.getDevices({ page, limit: PAGE_LIMIT, search })
        if (cancelled) return
        setDevices(data.devices)
        setTotal(data.total)
      } catch (error: unknown) {
        console.error('Error fetching devices:', error)
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
    router.push(`/admin/devices?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      try {
        await apiClient.deleteDevice(id)
        setRefreshTick((t) => t + 1)
      } catch {
        alert('Failed to delete device')
      }
    }
  }

  const handleSync = async (device: Device) => {
    const deviceId = (device as { id?: string }).id || device._id
    if (!deviceId) return

    setSyncingId(deviceId)
    try {
      await apiClient.syncDevice(device.brand, device.model, syncOptions)
      alert(`${device.name} synchronized successfully with External API`)
      setRefreshTick((t) => t + 1)
    } catch (error: unknown) {
      alert(`Sync Failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setSyncingId(null)
    }
  }

  const handleSyncByBrand = async () => {
    const brand = prompt(
      'Enter brand name to sync (e.g., Apple, Samsung):',
      'Apple',
    )
    if (!brand) return

    setIsSyncingAll(true)
    try {
      await apiClient.syncDevices(brand, syncOptions)
      alert(`Sync task for ${brand} started. New devices will appear shortly.`)
      setRefreshTick((t) => t + 1)
    } catch (error: unknown) {
      alert(`Bulk Sync Failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSyncingAll(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportStatus(null)
    try {
      const result = await apiClient.bulkImportDevices(file)
      setImportStatus(result)
      setRefreshTick((t) => t + 1)
    } catch (error: unknown) {
      alert((error instanceof Error ? error.message : String(error)) || 'Failed to import devices')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const totalPages = Math.ceil(total / PAGE_LIMIT)
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1
  const rangeEnd = Math.min(page * PAGE_LIMIT, total)

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
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Device Inventory
          </h1>
          <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
            Manage your catalog of smartphones and tablets
          </p>
        </div>
        <div className="flex flex-wrap gap-space-sm">
          <button
            onClick={handleSyncByBrand}
            disabled={isSyncingAll}
            className="flex items-center gap-2 rounded-lg border border-outline-variant px-space-md py-2.5 font-label-sm text-label-sm font-bold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isSyncingAll ? 'progress_activity animate-spin' : ''}`} aria-hidden="true">{isSyncingAll ? '' : 'sync'}</span>
            Sync Brand
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 rounded-lg border border-outline-variant px-space-md py-2.5 font-label-sm text-label-sm font-bold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isImporting ? 'progress_activity animate-spin' : ''}`} aria-hidden="true">{isImporting ? '' : 'upload'}</span>
            Bulk Import
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <Link
            href="/admin/devices/new"
            className="flex items-center gap-2 rounded-lg bg-primary-container px-space-md py-2.5 font-label-sm text-label-sm font-bold text-on-primary-container transition-colors hover:bg-inverse-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
            Add Device
          </Link>
        </div>
      </div>

      {importStatus && (
        <div
          className={`rounded-xl border p-space-lg ${importStatus.failed > 0 ? 'border-error-container/40 bg-error-container/15 text-error' : 'border-tertiary-container/40 bg-tertiary-container/15 text-tertiary'}`}
        >
          <div className="mb-2 flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {importStatus.failed > 0 ? 'error' : 'check_circle'}
            </span>
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest">
              Import Results
            </span>
          </div>
          <p className="font-label-md font-bold tabular-nums">
            Successfully imported: {importStatus.success} | Failed:{' '}
            {importStatus.failed}
          </p>
          {importStatus.errors.length > 0 && (
            <ul className="mt-space-md list-inside list-disc space-y-1 font-body-sm opacity-80">
              {importStatus.errors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {importStatus.errors.length > 5 && (
                <li>...and {importStatus.errors.length - 5} more</li>
              )}
            </ul>
          )}
          <button
            onClick={() => setImportStatus(null)}
            className="mt-space-md font-label-xs text-label-xs font-bold uppercase underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none">
        <div className="flex items-center justify-between gap-space-lg border-b border-outline-variant bg-surface-container p-space-lg">
          <form onSubmit={handleSearch} className="flex max-w-lg flex-1 gap-space-sm">
            <input
              type="text"
              placeholder="Search by brand, model or name..."
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
          <div className="hidden text-right md:block">
            <span className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Total Catalog
            </span>
            <p className="font-headline-md font-bold text-on-surface tabular-nums">
              {total.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Device
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Category
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Metrics
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
                <tr>
                  <td
                    colSpan={5}
                    className="animate-pulse px-space-lg py-space-xl text-center font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline"
                  >
                    Loading Inventory...
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-space-lg py-space-xl text-center font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline"
                  >
                    No devices found
                  </td>
                </tr>
              ) : (
                devices.map((device, index) => {
                  const deviceId = (device as { id?: string }).id || device._id
                  return (
                    <tr
                      key={deviceId || index}
                      className="group transition-colors hover:bg-surface-container"
                    >
                      <td className="px-space-lg py-space-md">
                        <div className="flex items-center gap-space-md">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-outline-variant/50 bg-surface-container p-2">
                            <img
                              src={device.imageUrl || '/placeholder-device.png'}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-label-md font-bold text-on-surface">
                              {device.name}
                            </p>
                            <p className="font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">
                              {device.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-space-lg py-space-md">
                        <span className="rounded bg-surface-container-highest px-2 py-1 font-label-xs text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">
                          {device.category &&
                          typeof device.category === 'object'
                            ? (device.category as { name: string }).name
                            : 'General'}
                        </span>
                      </td>
                      <td className="px-space-lg py-space-md">
                        <p className="font-label-md font-bold text-on-surface tabular-nums">
                          {device.views?.toLocaleString()}{' '}
                          <span className="font-label-xs text-label-xs uppercase text-outline">
                            Hits
                          </span>
                        </p>
                      </td>
                      <td className="px-space-lg py-space-md">
                        <div className="flex items-center gap-2 text-tertiary">
                          <div className="h-1.5 w-1.5 rounded-full bg-tertiary"></div>
                          <span className="font-label-xs text-label-xs font-bold uppercase tracking-widest">
                            Active
                          </span>
                        </div>
                      </td>
                      <td className="px-space-lg py-space-md text-right">
                        <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => handleSync(device)}
                            disabled={syncingId === deviceId}
                            className="rounded-lg bg-surface-container px-3 py-2 font-label-xs text-label-xs font-bold text-secondary uppercase transition-colors hover:bg-surface-container-high disabled:opacity-50"
                          >
                            {syncingId === deviceId ? '…' : 'Sync'}
                          </button>
                          <Link
                            href={`/admin/devices/edit/${deviceId}`}
                            className="rounded-lg bg-surface-container px-3 py-2 font-label-xs text-label-xs font-bold text-on-surface uppercase transition-colors hover:bg-surface-container-high"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(deviceId!)}
                            className="rounded-lg bg-surface-container px-3 py-2 font-label-xs text-label-xs font-bold text-error uppercase transition-colors hover:bg-error-container/15"
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
            {rangeEnd.toLocaleString()} of {total.toLocaleString()} devices
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/admin/devices"
            searchParams={{ search }}
          />
        </div>
      </div>
    </div>
  )
}

export default function AdminDevicesPage() {
  return (
    <Suspense fallback={null}>
      <AdminDevicesPageContent />
    </Suspense>
  )
}
