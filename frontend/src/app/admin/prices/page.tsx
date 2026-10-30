'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Device } from '@shared/types'
import { formatPrice } from '@/lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes, faSpinner, faTag } from '@fortawesome/free-solid-svg-icons'
import Pagination from '@/components/ui/Pagination'

const PAGE_LIMIT = 10

// Free-text fields, seeded with the currencies/countries that appear in the
// price dataset (seed-prices resolves launch prices to these markets).
const CURRENCY_SUGGESTIONS = [
  'USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'XOF', 'AED', 'CNY', 'INR',
]
const COUNTRY_SUGGESTIONS = [
  'USA', 'UK', 'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'UAE', 'India', 'China', 'EU',
]

interface PriceRow {
  id?: string
  _id?: string
  price: number
  currency: string
  country: string
  retailer?: string
  affiliateUrl?: string
  date: string
  device?: { name?: string; brand?: string; model?: string } | null
}

const EMPTY_FORM = {
  price: '',
  currency: 'USD',
  country: 'USA',
  retailer: '',
  affiliateUrl: '',
}

// Intl throws on an invalid currency code, which would crash the whole
// table render — fall back to a plain amount + code instead.
function formatPriceCell(price: number, currency: string) {
  try {
    return formatPrice(price, currency)
  } catch {
    return `${price} ${currency}`
  }
}

function AdminPricesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL is the single source of truth for page + search so the list
  // survives refresh, browser back/forward, and URL sharing.
  const page = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') || ''

  const [prices, setPrices] = useState<PriceRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  // null = create mode; a string = editing that price entry.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingDeviceLabel, setEditingDeviceLabel] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  // Device picker (create mode only — an entry cannot be reassigned later,
  // matching the backend UpdatePriceDto which has no device field).
  const [deviceQuery, setDeviceQuery] = useState('')
  const [deviceResults, setDeviceResults] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<{
    id: string
    name: string
  } | null>(null)
  const [isSearchingDevices, setIsSearchingDevices] = useState(false)

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
        const data = await apiClient.getPrices({ page, limit: PAGE_LIMIT, search })
        if (cancelled) return
        setPrices(data.prices)
        setTotal(data.total)
      } catch (error) {
        console.error('Error fetching prices:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [page, search, refreshTick])

  // Debounced device search for the create-form picker.
  useEffect(() => {
    if (!isFormOpen || editingId) return
    if (!deviceQuery.trim()) {
      setDeviceResults([])
      setIsSearchingDevices(false)
      return
    }
    setIsSearchingDevices(true)
    const t = setTimeout(async () => {
      try {
        const data = await apiClient.getDevices({ search: deviceQuery, limit: 5 })
        setDeviceResults(data.devices)
      } catch {
        setDeviceResults([])
      } finally {
        setIsSearchingDevices(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [deviceQuery, isFormOpen, editingId])

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
    router.push(`/admin/prices?${params.toString()}`)
  }

  const resetForm = () => {
    setEditingId(null)
    setEditingDeviceLabel('')
    setSelectedDevice(null)
    setDeviceQuery('')
    setDeviceResults([])
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleToggleForm = () => {
    if (isFormOpen) {
      resetForm()
      setIsFormOpen(false)
    } else {
      setIsFormOpen(true)
    }
  }

  const handleEdit = (row: PriceRow) => {
    setEditingId(row.id || row._id || null)
    setEditingDeviceLabel(row.device?.name || 'Unknown device')
    setForm({
      price: String(row.price),
      currency: row.currency,
      country: row.country,
      retailer: row.retailer || '',
      affiliateUrl: row.affiliateUrl || '',
    })
    setFormError('')
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsSubmitting(true)
    try {
      if (editingId) {
        await apiClient.updatePrice(editingId, {
          price: Number(form.price),
          currency: form.currency.toUpperCase(),
          country: form.country,
          retailer: form.retailer,
          affiliateUrl: form.affiliateUrl,
        })
      } else {
        if (!selectedDevice) {
          setFormError('Select a device for this price entry')
          setIsSubmitting(false)
          return
        }
        await apiClient.createPrice({
          device: selectedDevice.id,
          price: Number(form.price),
          currency: form.currency.toUpperCase(),
          country: form.country,
          retailer: form.retailer || undefined,
          affiliateUrl: form.affiliateUrl || undefined,
        })
      }
      setIsFormOpen(false)
      resetForm()
      setRefreshTick((t) => t + 1)
    } catch (error: any) {
      setFormError(error.message || 'Failed to save price')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this price entry?')) {
      try {
        await apiClient.deletePrice(id)
        setRefreshTick((t) => t + 1)
      } catch (error: any) {
        alert(error.message || 'Failed to delete price entry')
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
            Price Management
          </h1>
          <p className="mt-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Manually update device prices across retailers and markets
          </p>
        </div>
        <button
          onClick={handleToggleForm}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={isFormOpen ? faTimes : faPlus} />
          {isFormOpen ? 'Cancel' : 'Add Price'}
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:grid-cols-3"
        >
          {editingId ? (
            <div>
              <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                Device
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
                <FontAwesomeIcon icon={faTag} className="text-gray-400" />
                <span className="text-sm font-black text-gray-700">
                  {editingDeviceLabel}
                </span>
              </div>
              <p className="mt-1 text-[10px] font-bold text-gray-400">
                A price entry cannot be reassigned to another device
              </p>
            </div>
          ) : (
            <div className="relative">
              <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                Device
              </label>
              {selectedDevice ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3">
                  <span className="text-sm font-black text-gray-900">
                    {selectedDevice.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDevice(null)
                      setDeviceQuery('')
                      setDeviceResults([])
                    }}
                    className="text-gray-400 transition-colors hover:text-red-500"
                    aria-label="Clear selected device"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Search devices by name or brand..."
                    className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
                    value={deviceQuery}
                    onChange={(e) => setDeviceQuery(e.target.value)}
                  />
                  {(isSearchingDevices || deviceResults.length > 0) && (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                      {isSearchingDevices ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-gray-400">
                          <FontAwesomeIcon icon={faSpinner} spin />
                          Searching...
                        </div>
                      ) : (
                        deviceResults.map((d) => {
                          const deviceId = (d as any).id || d._id
                          return (
                            <button
                              key={deviceId}
                              type="button"
                              onClick={() => {
                                setSelectedDevice({
                                  id: deviceId,
                                  name: d.name,
                                })
                                setDeviceQuery('')
                                setDeviceResults([])
                              }}
                              className="block w-full px-4 py-3 text-left transition-colors hover:bg-blue-50"
                            >
                              <p className="text-sm font-black text-gray-900">
                                {d.name}
                              </p>
                              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                                {d.brand}
                              </p>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="699.99"
              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Currency
            </label>
            <input
              type="text"
              required
              list="currency-suggestions"
              placeholder="USD"
              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold uppercase text-gray-900 outline-none focus:border-blue-500"
              value={form.currency}
              onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
            />
            <datalist id="currency-suggestions">
              {CURRENCY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Country
            </label>
            <input
              type="text"
              required
              list="country-suggestions"
              placeholder="USA"
              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={form.country}
              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
            />
            <datalist id="country-suggestions">
              {COUNTRY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Retailer
            </label>
            <input
              type="text"
              placeholder="Amazon (optional)"
              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={form.retailer}
              onChange={(e) => setForm((p) => ({ ...p, retailer: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Affiliate URL
            </label>
            <input
              type="url"
              placeholder="https://... (optional)"
              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
              value={form.affiliateUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, affiliateUrl: e.target.value }))
              }
            />
          </div>

          <div className="flex items-end md:col-span-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gray-900 px-6 py-3 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : editingId ? (
                'Save Changes'
              ) : (
                'Add Price Entry'
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="ml-3 rounded-xl border-2 border-gray-200 px-6 py-3 text-[10px] font-black tracking-widest text-gray-600 uppercase transition-colors hover:border-gray-400"
              >
                Cancel Edit
              </button>
            )}
          </div>
          {formError && (
            <p className="text-xs font-bold text-red-500 md:col-span-3">{formError}</p>
          )}
        </form>
      )}

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 bg-gray-50/30 p-6">
          <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
            <input
              type="text"
              placeholder="Search by device, country or retailer..."
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
                  Device
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Price
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Country
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Retailer
                </th>
                <th className="px-6 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Date
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
                    colSpan={6}
                    className="animate-pulse px-6 py-12 text-center text-xs font-bold tracking-widest text-gray-400 uppercase"
                  >
                    Loading Prices...
                  </td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-xs font-bold tracking-widest text-gray-400 uppercase"
                  >
                    No price entries found
                  </td>
                </tr>
              ) : (
                prices.map((p, index) => {
                  const priceId = p.id || p._id
                  return (
                    <tr
                      key={priceId || index}
                      className="group transition-colors hover:bg-blue-50/30"
                    >
                      <td className="px-6 py-4">
                        <p className="font-black text-gray-900">
                          {p.device?.name || 'Unknown device'}
                        </p>
                        <p className="text-xs font-bold text-gray-500 uppercase">
                          {p.device?.brand || ''}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-gray-800">
                          {formatPriceCell(p.price, p.currency)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black tracking-wider text-gray-600 uppercase">
                          {p.country}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-600">
                        {p.retailer || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">
                        {p.date ? new Date(p.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            disabled={busyId === priceId}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black text-gray-700 uppercase transition-all hover:border-blue-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => priceId && handleDelete(priceId)}
                            disabled={busyId === priceId || !priceId}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black text-red-600 uppercase transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {busyId === priceId ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              'Delete'
                            )}
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
            {rangeEnd.toLocaleString()} of {total.toLocaleString()} price
            entries
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/admin/prices"
            searchParams={{ search }}
          />
        </div>
      </div>
    </div>
  )
}

export default function AdminPricesPage() {
  return (
    <Suspense fallback={null}>
      <AdminPricesPageContent />
    </Suspense>
  )
}
