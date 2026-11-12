'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Device } from '@shared/types'
import { formatPrice } from '@/lib/utils'
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
        const data = await apiClient.getPrices({ page, limit: PAGE_LIMIT, search })
        if (cancelled) return
        setPrices(data.prices)
        setTotal(data.total)
      } catch (error: unknown) {
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
    const t = setTimeout(async () => {
      if (!deviceQuery.trim()) {
        setDeviceResults([])
        setIsSearchingDevices(false)
        return
      }
      setIsSearchingDevices(true)
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
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Failed to save price')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this price entry?')) {
      setBusyId(id)
      try {
        await apiClient.deletePrice(id)
        setRefreshTick((t) => t + 1)
      } catch (error: unknown) {
        alert(error instanceof Error ? error.message : 'Failed to delete price entry')
      } finally {
        setBusyId(null)
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
            Price Management
          </h1>
          <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
            Manually update device prices across retailers and markets
          </p>
        </div>
        <button
          onClick={handleToggleForm}
          className="flex items-center gap-2 rounded-lg bg-primary-container px-space-md py-2.5 font-label-sm text-label-sm font-bold text-on-primary-container transition-colors hover:bg-inverse-primary"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{isFormOpen ? 'close' : 'add'}</span>
          {isFormOpen ? 'Cancel' : 'Add Price'}
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-md md:shadow-none md:grid-cols-3"
        >
          {editingId ? (
            <div>
              <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                Device
              </label>
              <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5">
                <span className="material-symbols-outlined text-[18px] text-outline" aria-hidden="true">sell</span>
                <span className="font-label-md font-bold text-on-surface">
                  {editingDeviceLabel}
                </span>
              </div>
              <p className="mt-1 font-label-xs text-label-xs text-outline">
                A price entry cannot be reassigned to another device
              </p>
            </div>
          ) : (
            <div className="relative">
              <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                Device
              </label>
              {selectedDevice ? (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-secondary-container/40 bg-secondary-container/15 px-4 py-2.5">
                  <span className="font-label-md font-bold text-on-surface">
                    {selectedDevice.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDevice(null)
                      setDeviceQuery('')
                      setDeviceResults([])
                    }}
                    className="text-outline transition-colors hover:text-error"
                    aria-label="Clear selected device"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Search devices by name or brand..."
                    className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                    value={deviceQuery}
                    onChange={(e) => setDeviceQuery(e.target.value)}
                  />
                  {(isSearchingDevices || deviceResults.length > 0) && (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
                      {isSearchingDevices ? (
                        <div className="flex items-center gap-2 px-4 py-2.5 font-label-sm font-bold text-outline">
                          <span className="material-symbols-outlined progress_activity animate-spin text-[16px] text-secondary" aria-hidden="true"></span>
                          Searching...
                        </div>
                      ) : (
                        deviceResults.map((d) => {
                          const deviceId = (d as { id?: string }).id || d._id
                          return (
                            <button
                              key={deviceId}
                              type="button"
                              onClick={() => {
                                setSelectedDevice({
                                  id: deviceId!,
                                  name: d.name,
                                })
                                setDeviceQuery('')
                                setDeviceResults([])
                              }}
                              className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-surface-container"
                            >
                              <p className="font-label-md font-bold text-on-surface">
                                {d.name}
                              </p>
                              <p className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-on-surface-variant">
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
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="699.99"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Currency
            </label>
            <input
              type="text"
              required
              list="currency-suggestions"
              placeholder="USD"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md font-bold uppercase text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
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
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Country
            </label>
            <input
              type="text"
              required
              list="country-suggestions"
              placeholder="USA"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
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
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Retailer
            </label>
            <input
              type="text"
              placeholder="Amazon (optional)"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              value={form.retailer}
              onChange={(e) => setForm((p) => ({ ...p, retailer: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
              Affiliate URL
            </label>
            <input
              type="url"
              placeholder="https://... (optional)"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              value={form.affiliateUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, affiliateUrl: e.target.value }))
              }
            />
          </div>

          <div className="flex items-end gap-space-md md:col-span-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-container px-space-lg py-2.5 font-label-sm text-label-sm font-bold text-on-primary-container transition-colors hover:bg-inverse-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : editingId ? 'Save Changes' : 'Add Price Entry'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-outline-variant px-space-lg py-2.5 font-label-sm text-label-sm font-bold text-on-surface-variant uppercase transition-colors hover:bg-surface-container"
              >
                Cancel Edit
              </button>
            )}
          </div>
          {formError && (
            <p className="font-body-sm font-bold text-error md:col-span-3">{formError}</p>
          )}
        </form>
      )}

      <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none">
        <div className="border-b border-outline-variant bg-surface-container p-space-lg">
          <form onSubmit={handleSearch} className="flex max-w-lg gap-space-sm">
            <input
              type="text"
              placeholder="Search by device, country or retailer..."
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
                  Device
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Price
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Country
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Retailer
                </th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Date
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
                    colSpan={6}
                    className="animate-pulse px-space-lg py-space-xl text-center font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline"
                  >
                    Loading Prices...
                  </td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-space-lg py-space-xl text-center font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline"
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
                      className="group transition-colors hover:bg-surface-container"
                    >
                      <td className="px-space-lg py-space-md">
                        <p className="font-label-md font-bold text-on-surface">
                          {p.device?.name || 'Unknown device'}
                        </p>
                        <p className="font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">
                          {p.device?.brand || ''}
                        </p>
                      </td>
                      <td className="px-space-lg py-space-md">
                        <p className="font-label-md font-bold text-tertiary tabular-nums">
                          {formatPriceCell(p.price, p.currency)}
                        </p>
                      </td>
                      <td className="px-space-lg py-space-md">
                        <span className="rounded bg-surface-container-highest px-2 py-1 font-label-xs text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">
                          {p.country}
                        </span>
                      </td>
                      <td className="px-space-lg py-space-md font-label-md font-bold text-on-surface-variant">
                        {p.retailer || '—'}
                      </td>
                      <td className="px-space-lg py-space-md font-body-sm font-bold text-on-surface-variant tabular-nums">
                        {p.date ? new Date(p.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-space-lg py-space-md text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            disabled={busyId === priceId}
                            className="rounded-lg bg-surface-container px-3 py-2 font-label-xs text-label-xs font-bold text-on-surface uppercase transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => priceId && handleDelete(priceId)}
                            disabled={busyId === priceId || !priceId}
                            className="rounded-lg bg-surface-container px-3 py-2 font-label-xs text-label-xs font-bold text-error uppercase transition-colors hover:bg-error-container/15 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {busyId === priceId ? '…' : 'Delete'}
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
