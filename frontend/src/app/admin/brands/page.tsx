'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faEdit,
  faTrash,
  faImage,
  faSync,
} from '@fortawesome/free-solid-svg-icons'

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState<string | null>(null) // State to track which brand is syncing
  const [search, setSearch] = useState('')

  const [syncOptions, setSyncOptions] = useState<{
    providers: string[]
    forceUpdate: boolean
  }>({
    providers: ['primary', 'secondary', 'tertiary'],
    forceUpdate: false,
  })

  const fetchBrands = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.getAdminBrands(search)
      setBrands(data)
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBrands()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await apiClient.deleteBrand(id)
        fetchBrands()
      } catch (error) {
        alert('Failed to delete brand')
      }
    }
  }

  const handleSync = async (brandName?: string) => {
    setIsSyncing(brandName || 'all')
    try {
      const { message } = await apiClient.syncDevices(brandName, syncOptions)
      alert(message)
      if (brandName) fetchBrands()
    } catch (error) {
      console.error('Sync failed:', error)
      alert('Sync failed. Please check the backend logs.')
    } finally {
      setIsSyncing(null)
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

  return (
    <div className="space-y-8">
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

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black text-gray-900">
            Brand Management
          </h3>
          <p className="mt-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Manage manufacturers and logos
          </p>
        </div>
        <Link
          href="/admin/brands/new"
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Brand
        </Link>
        <button
          onClick={() => handleSync()}
          disabled={isSyncing === 'all'}
          className="flex items-center gap-2 rounded-2xl bg-gray-800 px-6 py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg transition-all hover:bg-gray-900 disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faSync}
            className={isSyncing === 'all' ? 'fa-spin' : ''}
          />
          Sync All
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search brands..."
          className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-2xl bg-gray-800 px-6 py-2 font-bold text-white transition-colors hover:bg-gray-700"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Logo
                </th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Name
                </th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Slug
                </th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Devices
                </th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr key="loading-row">
                  <td
                    colSpan={6}
                    className="px-8 py-10 text-center font-bold text-gray-400"
                  >
                    Loading manufacturers...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr key="empty-row">
                  <td
                    colSpan={6}
                    className="px-8 py-10 text-center font-bold tracking-widest text-gray-400 uppercase"
                  >
                    No brands registered
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr
                    key={brand.id || brand._id}
                    className="group transition-colors hover:bg-blue-50/30"
                  >
                    <td className="px-8 py-4">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-gray-50 bg-gray-100 p-2">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faImage}
                            className="text-gray-300"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4 font-black text-gray-900">
                      {brand.name}
                    </td>
                    <td className="px-8 py-4 font-mono text-xs text-gray-500">
                      {brand.slug}
                    </td>
                    <td className="px-8 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        {brand.deviceCount} Devices
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${brand.isFeatured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {brand.isFeatured ? 'Featured' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          href={`/admin/brands/${brand.id}`}
                          className="text-blue-500 transition-colors hover:text-blue-700"
                          title="Edit Brand"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                        <button
                          onClick={() => handleSync(brand.name)}
                          disabled={!!isSyncing}
                          className="text-amber-500 transition-colors hover:text-amber-700"
                          title="Sync Devices"
                        >
                          <FontAwesomeIcon
                            icon={faSync}
                            className={
                              isSyncing === brand.name ? 'fa-spin' : ''
                            }
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="text-red-400 transition-colors hover:text-red-600"
                        >
                          <FontAwesomeIcon icon={faTrash} />
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
