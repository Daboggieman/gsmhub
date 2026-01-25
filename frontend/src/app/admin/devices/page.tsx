'use client'

import { useEffect, useState, useRef } from 'react'
import { apiClient } from '@/lib/api'
import { Device, Category } from '@shared/types'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faUpload,
  faFileCsv,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faSync,
} from '@fortawesome/free-solid-svg-icons'

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [isSyncingAll, setIsSyncingAll] = useState(false)
  const [importStatus, setImportStatus] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [syncOptions, setSyncOptions] = useState<{
    providers: string[]
    forceUpdate: boolean
  }>({
    providers: ['primary', 'secondary', 'tertiary'],
    forceUpdate: false,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDevices = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.getDevices({ page, limit: 10, search })
      setDevices(data.devices)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching devices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchDevices()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      try {
        await apiClient.deleteDevice(id)
        fetchDevices()
      } catch (error) {
        alert('Failed to delete brand')
      }
    }
  }

  const handleSync = async (device: Device) => {
    const deviceId = (device as any).id || device._id
    if (!deviceId) return

    setSyncingId(deviceId)
    try {
      await apiClient.syncDevice(device.brand, device.model, syncOptions)
      alert(`${device.name} synchronized successfully with External API`)
      fetchDevices()
    } catch (error: any) {
      alert(`Sync Failed: ${error.message}`)
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
      fetchDevices()
    } catch (error: any) {
      alert(`Bulk Sync Failed: ${error.message}`)
    } finally {
      setIsSyncingAll(false)
    }
  }

  const toggleProvider = (provider: string) => {
    setSyncOptions((prev) => ({
      ...prev,
      providers: prev.providers.includes(provider)
        ? prev.providers.filter((p) => p !== provider)
        : [...prev.providers, provider],
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportStatus(null)
    try {
      const result = await apiClient.bulkImportDevices(file)
      setImportStatus(result)
      fetchDevices()
    } catch (error: any) {
      alert(error.message || 'Failed to import devices')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Sync Settings */}
      <div className="mb-8 flex flex-wrap items-center gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h4 className="mb-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">
            Sync Providers
          </h4>
          <div className="flex gap-2">
            {['primary', 'secondary', 'tertiary'].map((p) => (
              <button
                key={p}
                onClick={() => toggleProvider(p)}
                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase transition-all ${
                  syncOptions.providers.includes(p)
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden h-10 w-px bg-gray-100 md:block"></div>

        <div>
          <h4 className="mb-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">
            Conflict Policy
          </h4>
          <button
            onClick={() =>
              setSyncOptions((prev) => ({
                ...prev,
                forceUpdate: !prev.forceUpdate,
              }))
            }
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase transition-all ${
              syncOptions.forceUpdate
                ? 'bg-orange-500 text-white shadow-md shadow-orange-100'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <div
              className={`h-3 w-3 rounded-full border-2 ${
                syncOptions.forceUpdate
                  ? 'border-orange-400 bg-white'
                  : 'border-gray-300'
              }`}
            ></div>
            {syncOptions.forceUpdate ? 'Force Overwrite' : 'Fill Gaps Only'}
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Device Inventory
          </h1>
          <p className="mt-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Manage your catalog of smartphones and tablets
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSyncByBrand}
            disabled={isSyncingAll}
            className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 text-xs font-black tracking-widest text-gray-700 uppercase shadow-sm transition-all hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50"
          >
            {isSyncingAll ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faSync} />
            )}
            Sync Brand
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 text-xs font-black tracking-widest text-gray-700 uppercase shadow-sm transition-all hover:border-blue-600 hover:text-blue-600 disabled:opacity-50"
          >
            {isImporting ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faUpload} />
            )}
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
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Device
          </Link>
        </div>
      </div>

      {importStatus && (
        <div
          className={`mb-8 rounded-3xl border p-6 ${importStatus.failed > 0 ? 'border-orange-200 bg-orange-50 text-orange-800' : 'border-green-200 bg-green-50 text-green-800'}`}
        >
          <div className="mb-2 flex items-center gap-3">
            <FontAwesomeIcon
              icon={importStatus.failed > 0 ? faTimesCircle : faCheckCircle}
              className="text-xl"
            />
            <span className="text-sm font-black tracking-widest uppercase">
              Import Results
            </span>
          </div>
          <p className="font-bold">
            Successfully imported: {importStatus.success} | Failed:{' '}
            {importStatus.failed}
          </p>
          {importStatus.errors.length > 0 && (
            <ul className="mt-3 list-inside list-disc space-y-1 text-xs font-medium opacity-80">
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
            className="mt-4 text-[10px] font-black uppercase underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/30 p-6">
          <form onSubmit={handleSearch} className="flex max-w-lg flex-1 gap-2">
            <input
              type="text"
              placeholder="Search by brand, model or name..."
              className="flex-1 rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-6 py-3 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
            >
              Filter
            </button>
          </form>
          <div className="hidden text-right md:block">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Total Catalog
            </span>
            <p className="text-2xl font-black text-gray-900">
              {total.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Device
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Category
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Metrics
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Status
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
                    Loading Inventory...
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-xs font-bold tracking-widest text-gray-400 uppercase"
                  >
                    No devices found
                  </td>
                </tr>
              ) : (
                devices.map((device, index) => {
                  const deviceId = (device as any).id || device._id
                  return (
                    <tr
                      key={deviceId || index}
                      className="group transition-colors hover:bg-blue-50/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-2">
                            <img
                              src={device.imageUrl || '/placeholder-device.png'}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-black text-gray-900">
                              {device.name}
                            </p>
                            <p className="text-xs font-bold text-gray-500 uppercase">
                              {device.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black tracking-wider text-gray-600 uppercase">
                          {device.category &&
                          typeof device.category === 'object'
                            ? (device.category as any).name
                            : 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-gray-800">
                          {device.views?.toLocaleString()}{' '}
                          <span className="text-[10px] text-gray-400 uppercase">
                            Hits
                          </span>
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          <span className="text-[10px] font-black tracking-widest uppercase">
                            Active
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 transition-all group-hover:opacity-100">
                          <button
                            onClick={() => handleSync(device)}
                            disabled={syncingId === deviceId}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black text-indigo-600 uppercase transition-all hover:bg-indigo-50 disabled:opacity-50"
                          >
                            {syncingId === deviceId ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              'Sync'
                            )}
                          </button>
                          <Link
                            href={`/admin/devices/edit/${deviceId}`}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black text-gray-700 uppercase transition-all hover:border-blue-600 hover:text-blue-600"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(deviceId!)}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black text-red-600 uppercase transition-all hover:bg-red-50"
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

        {/* Improved Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-6">
          <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
            Showing {devices.length} of {total} devices
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border-2 border-gray-100 bg-white px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-all hover:border-blue-600 disabled:border-gray-100 disabled:opacity-30"
            >
              Prev
            </button>
            <button
              disabled={page * 10 >= total}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border-2 border-gray-100 bg-white px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-all hover:border-blue-600 disabled:border-gray-100 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
