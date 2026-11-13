'use client'

import { useState, useEffect } from 'react'
import { Device, Category, DeviceType, PriceHistory } from '@shared/types'
import { generateSlug } from '@shared/utils/slug'
import { apiClient } from '@/lib/api'
import { useRouter } from 'next/navigation'
import AffiliateLinkGenerator from '@/components/admin/AffiliateLinkGenerator'

interface DeviceFormProps {
  initialData?: Device
  isEdit?: boolean
}

type Tab =
  | 'general'
  | 'specs_key'
  | 'specs_all'
  | 'media'
  | 'seo_affiliates'
  | 'pricing'

// API responses may carry `id` (serialized JSON) or `_id` (document).
const getDeviceId = (d?: Device | null) =>
  (d as { id?: string } | null | undefined)?.id || d?._id

const TabButton = ({
  id,
  label,
  icon,
  activeTab,
  onSelect,
}: {
  id: Tab
  label: string
  icon: string
  activeTab: Tab
  onSelect: (id: Tab) => void
}) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-space-lg py-4 font-label-sm text-label-sm font-bold uppercase tracking-widest transition-colors ${
      activeTab === id
        ? 'border-secondary bg-secondary-container/10 text-secondary'
        : 'border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`}
  >
    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
      {icon}
    </span>
    {label}
  </button>
)

const SuggestionList = ({ id, items }: { id: string; items?: string[] }) => (
  <datalist id={id}>
    {items?.map((item) => (
      <option key={item} value={item} />
    ))}
  </datalist>
)

const SuggestibleInput = ({
  label,
  name,
  value,
  suggestions: items,
  placeholder,
  type = 'text',
  onChange,
}: {
  label: string
  name: string
  value: string
  suggestions?: string[]
  placeholder?: string
  type?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div>
    <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
      {label}
    </label>
    <input
      type={type}
      name={name}
      list={`${name}-list`}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
    />
    <SuggestionList id={`${name}-list`} items={items} />
  </div>
)

export default function DeviceForm({
  initialData,
  isEdit = false,
}: DeviceFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isAutoSlug, setIsAutoSlug] = useState(!isEdit)

  // Index of the affiliate link row whose generator panel is open (null = closed).
  const [generatorIndex, setGeneratorIndex] = useState<number | null>(null)
  const [prices, setPrices] = useState<PriceHistory[]>([])
  const [isPriceLoading, setIsPriceLoading] = useState(false)
  const [newPrice, setNewPrice] = useState({
    price: 0,
    currency: 'USD',
    country: 'USA',
    retailer: '',
    affiliateUrl: '',
  })

  const [formData, setFormData] = useState<Partial<Device>>(() => ({
    name: '',
    brand: '',
    model: '',
    slug: '',
    type: DeviceType.PHONE,
    imageUrl: '',
    images: [],
    description: '',
    isActive: true,
    specs: [],
    seoTitle: '',
    seoDescription: '',
    affiliateLinks: [],
    ...initialData,
    // Populated category objects arrive from the API on edit — flatten to
    // the id the select control expects before first render.
    category:
      initialData?.category && typeof initialData.category === 'object'
        ? String(
            (initialData.category as { id?: string }).id ??
              (initialData.category as { _id?: string })._id ??
              '',
          )
        : initialData?.category ?? '',
  }))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brnds, sug] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getBrands(),
          apiClient.getFieldSuggestions(),
        ])
        setCategories(cats)
        setBrands(brnds)
        setSuggestions(sug)
      } catch (err) {
        console.error('Failed to load form data', err)
      }
    }
    fetchData()

    if (isEdit && initialData?._id) {
      const deviceId = initialData._id
      const fetchPrices = async () => {
        setIsPriceLoading(true)
        try {
          const data = await apiClient.getDeviceCurrentPrices(
            deviceId,
          )
          setPrices(data)
        } catch (err) {
          console.error('Failed to load prices', err)
        } finally {
          setIsPriceLoading(false)
        }
      }
      fetchPrices()
    }
    // Mount-only: the edit page gates on the loaded device before
    // rendering this form, so isEdit/initialData are set at mount and
    // never change for a mounted instance.
  }, [isEdit, initialData?._id])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target
    const val =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => {
      const next = { ...prev, [name]: val }
      // Auto-slug derives from name/brand/model in the same update rather
      // than a follow-up effect (one render per keystroke, not two).
      if (
        isAutoSlug &&
        !isEdit &&
        (name === 'name' || name === 'brand' || name === 'model')
      ) {
        const source =
          next.name || `${next.brand || ''} ${next.model || ''}`.trim()
        if (source) next.slug = generateSlug(source)
      }
      return next
    })

    if (name === 'slug') {
      setIsAutoSlug(false)
    }
  }

  const handleSpecChange = (index: number, field: string, value: string) => {
    const newSpecs = [...(formData.specs || [])]
    newSpecs[index] = { ...newSpecs[index], [field]: value }
    setFormData({ ...formData, specs: newSpecs })
  }

  const addSpec = () => {
    setFormData({
      ...formData,
      specs: [...(formData.specs || []), { category: '', key: '', value: '' }],
    })
  }

  const removeSpec = (index: number) => {
    const newSpecs = [...(formData.specs || [])]
    newSpecs.splice(index, 1)
    setFormData({ ...formData, specs: newSpecs })
  }

  const handleImageArrayChange = (index: number, value: string) => {
    const newImages = [...(formData.images || [])]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const addImage = () => {
    setFormData({ ...formData, images: [...(formData.images || []), ''] })
  }

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })
  }

  const handleAffiliateChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newLinks = [...(formData.affiliateLinks || [])]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setFormData({ ...formData, affiliateLinks: newLinks })
  }

  const addAffiliateLink = () => {
    setFormData({
      ...formData,
      affiliateLinks: [
        ...(formData.affiliateLinks || []),
        { platform: '', url: '', price: 0 },
      ],
    })
  }

  const removeAffiliateLink = (index: number) => {
    const newLinks = [...(formData.affiliateLinks || [])]
    newLinks.splice(index, 1)
    setFormData({ ...formData, affiliateLinks: newLinks })
  }

  const handleAddPrice = async () => {
    const id = getDeviceId(initialData)
    if (!id) return

    try {
      await apiClient.createPrice({
        ...newPrice,
        device: id,
      })
      // Refresh prices
      const data = await apiClient.getDeviceCurrentPrices(id)
      setPrices(data)
      setNewPrice({
        price: 0,
        currency: 'USD',
        country: 'USA',
        retailer: '',
        affiliateUrl: '',
      })
    } catch (err) {
      alert(`Failed to add price: ${err instanceof Error ? err.message : err}`)
    }
  }

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm('Delete this price entry?')) return
    const id = getDeviceId(initialData)
    if (!id) return

    try {
      await apiClient.deletePrice(priceId)
      const data = await apiClient.getDeviceCurrentPrices(id)
      setPrices(data)
    } catch (err) {
      alert(
        `Failed to delete price: ${err instanceof Error ? err.message : err}`,
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Filter out internal fields and ensure payload is clean
    const rest: Record<string, unknown> = { ...(formData as Record<string, unknown>) }
    for (const key of ['_id', 'id', 'createdAt', 'updatedAt', 'views']) delete rest[key]

    try {
      const deviceId = getDeviceId(initialData)
      if (isEdit && deviceId) {
        await apiClient.updateDevice(deviceId, rest)
      } else {
        await apiClient.createDevice(rest)
      }
      router.push('/admin/devices')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save device',
      )
      setActiveTab('general') // Show where the error might be if it's validation
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none">
      <div className="no-scrollbar flex overflow-x-auto border-b border-outline-variant bg-surface-container">
        <TabButton id="general" label="General Info" icon="info" activeTab={activeTab} onSelect={setActiveTab} />
        <TabButton id="specs_key" label="Key Specs" icon="memory" activeTab={activeTab} onSelect={setActiveTab} />
        <TabButton id="specs_all" label="Detailed Specs" icon="list_alt" activeTab={activeTab} onSelect={setActiveTab} />
        <TabButton id="media" label="Media & Review" icon="photo_library" activeTab={activeTab} onSelect={setActiveTab} />
        <TabButton
          id="seo_affiliates"
          label="SEO & Affiliates"
          icon="public"
          activeTab={activeTab}
          onSelect={setActiveTab}
        />
        {isEdit && (
          <TabButton id="pricing" label="Retail Prices" icon="shopping_cart" activeTab={activeTab} onSelect={setActiveTab} />
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-space-xl">
        {error && (
          <div className="mb-space-xl flex items-center gap-space-md rounded-lg border border-error-container/40 bg-error-container/15 p-space-md font-label-md font-bold text-error">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Tab 6: Retail Prices (Manual Overrides) */}
        {isEdit && (
          <div
            className={activeTab === 'pricing' ? 'block space-y-space-xl' : 'hidden'}
          >
            <div className="grid grid-cols-1 gap-space-xl md:grid-cols-3">
              {/* Add New Price Form */}
              <div className="space-y-space-lg rounded-xl border border-tertiary-container/40 bg-tertiary-container/10 p-space-lg md:col-span-1">
                <h3 className="mb-space-md flex items-center gap-2 font-headline-md text-headline-md font-bold text-tertiary">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
                  Add Local Price
                </h3>
                <div className="space-y-space-lg">
                  <div>
                    <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                      Price
                    </label>
                    <input
                      type="number"
                      value={newPrice.price}
                      onChange={(e) =>
                        setNewPrice({
                          ...newPrice,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-label-md font-bold text-on-surface tabular-nums focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-space-md">
                    <div>
                      <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={newPrice.currency}
                        onChange={(e) =>
                          setNewPrice({ ...newPrice, currency: e.target.value })
                        }
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-label-md font-bold uppercase text-on-surface focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                        Country
                      </label>
                      <input
                        type="text"
                        value={newPrice.country}
                        onChange={(e) =>
                          setNewPrice({ ...newPrice, country: e.target.value })
                        }
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-label-md font-bold text-on-surface focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                      Retailer
                    </label>
                    <input
                      type="text"
                      value={newPrice.retailer}
                      onChange={(e) =>
                        setNewPrice({ ...newPrice, retailer: e.target.value })
                      }
                      placeholder="e.g. Slot, Jumia"
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                      Store URL
                    </label>
                    <input
                      type="text"
                      value={newPrice.affiliateUrl}
                      onChange={(e) =>
                        setNewPrice({ ...newPrice, affiliateUrl: e.target.value })
                      }
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPrice}
                    className="w-full rounded-lg bg-tertiary-container py-3 font-label-xs text-label-xs font-bold uppercase tracking-widest text-on-tertiary-container transition-all hover:brightness-110"
                  >
                    Add Price Entry
                  </button>
                </div>
              </div>

              {/* Price List */}
              <div className="space-y-space-md md:col-span-2">
                <h3 className="mb-space-md flex items-center gap-2 font-headline-md text-headline-md font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[20px] text-outline" aria-hidden="true">history</span>
                  Price Records
                </h3>
                {isPriceLoading ? (
                  <div className="animate-pulse py-12 text-center font-label-md font-bold uppercase tracking-widest text-outline">
                    Loading Price Data...
                  </div>
                ) : prices.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-outline-variant bg-surface-container py-12 text-center">
                    <p className="font-label-md font-bold uppercase tracking-widest text-outline">
                      No manual prices recorded
                    </p>
                  </div>
                ) : (
                  <div className="no-scrollbar max-h-[500px] space-y-space-md overflow-y-auto pr-2">
                    {prices.map((p: PriceHistory) => (
                      <div
                        key={p._id || p.id}
                        className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:border-secondary-container/40"
                      >
                        <div className="flex items-center gap-space-lg">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest font-label-md font-bold text-secondary tabular-nums">
                            {p.currency === 'USD' ? '$' : p.currency}
                          </div>
                          <div>
                            <p className="font-headline-md text-headline-md font-bold text-on-surface tabular-nums">
                              {p.price.toLocaleString()} {p.currency}
                            </p>
                            <p className="mt-0.5 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                              {p.retailer || 'Unknown Retailer'} • {p.country}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-md">
                          <span className="font-label-xs text-label-xs font-bold uppercase text-outline tabular-nums">
                            {(() => {
                              const shown =
                                p.date ||
                                (p as { createdAt?: string }).createdAt
                              return shown
                                ? new Date(shown).toLocaleDateString()
                                : '—'
                            })()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const priceId = p._id || p.id
                              if (priceId) handleDeletePrice(priceId)
                            }}
                            className="rounded-lg p-2 text-error transition-colors hover:bg-error-container/15"
                            aria-label="Delete price entry"
                          >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-space-lg font-label-xs text-label-xs font-bold text-outline italic">
                  * These prices appear in the &quot;Prices&quot; section of the public
                  device page and contribute to price history charts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: General Info */}
        <div className={activeTab === 'general' ? 'block space-y-space-xl' : 'hidden'}>
          <div className="grid grid-cols-1 gap-space-xl md:grid-cols-2">
            <div className="space-y-space-lg">
              <div>
                <label htmlFor="device-name" className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Display Name
                </label>
                <input
                  type="text"
                  id="device-name"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-space-md">
                <div>
                  <label htmlFor="device-brand" className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                    Brand
                  </label>
                  <select
                    name="brand"
                    id="device-brand"
                    required
                    value={formData.brand || ''}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Brand...</option>
                    {brands.sort().map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    {!brands.includes(formData.brand || '') &&
                      formData.brand && (
                        <option value={formData.brand}>{formData.brand}</option>
                      )}
                  </select>
                  <p className="mt-1 font-label-xs text-label-xs font-bold text-outline italic">
                    * Pick from existing or use Sync for new brands
                  </p>
                </div>
                <div>
                  <label htmlFor="device-model" className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    id="device-model"
                    required
                    value={formData.model || ''}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 font-body-sm text-on-surface-variant focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-space-lg">
              <div className="grid grid-cols-2 gap-space-md">
                <div>
                  <label htmlFor="device-category" className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                    Category
                  </label>
                  <select
                    name="category"
                    id="device-category"
                    required
                    value={
                      typeof formData.category === 'string'
                        ? formData.category
                        : ''
                    }
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option
                        key={c.id || (c as { _id?: string })._id}
                        value={c.id || (c as { _id?: string })._id}
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                    Device Type
                  </label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {Object.values(DeviceType).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Short Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-body-md text-on-surface-variant focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 rounded bg-surface-container-highest accent-secondary-container"
                />
                <label
                  htmlFor="isActive"
                  className="cursor-pointer font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-surface-variant"
                >
                  Active & Visible
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 2: Key Specs */}
        <div
          className={activeTab === 'specs_key' ? 'block space-y-space-xl' : 'hidden'}
        >
          <div className="grid grid-cols-1 gap-space-xl md:grid-cols-3">
            <div className="space-y-space-lg">
              <h3 className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-on-surface">
                <div className="h-8 w-2 rounded bg-primary-container"></div>
                Platform & OS
              </h3>
              <SuggestibleInput
                label="OS"
                name="os"
                value={formData.os!}
                suggestions={suggestions.os}
                placeholder="e.g. Android 14"
                onChange={handleChange}
              />
              <SuggestibleInput
                label="Chipset"
                name="chipset"
                value={formData.chipset!}
                suggestions={suggestions.chipset}
                onChange={handleChange}
              />
              <div>
                <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Release Date
                </label>
                <input
                  type="text"
                  name="releaseDate"
                  value={formData.releaseDate || ''}
                  onChange={handleChange}
                  placeholder="e.g. 2024, January"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-space-lg">
              <h3 className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-on-surface">
                <div className="h-8 w-2 rounded bg-tertiary-container"></div>
                Display & Body
              </h3>
              <SuggestibleInput
                label="Display Size"
                name="displaySize"
                value={formData.displaySize!}
                suggestions={suggestions.displaySize}
                placeholder="e.g. 6.8 inches"
                onChange={handleChange}
              />
              <div>
                <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <SuggestibleInput
                label="Dimensions"
                name="dimension"
                value={formData.dimension!}
                suggestions={suggestions.dimension}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-space-lg">
              <h3 className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-on-surface">
                <div className="h-8 w-2 rounded bg-secondary-container"></div>
                Storage & Features
              </h3>
              <div>
                <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  RAM / Storage
                </label>
                <div className="grid grid-cols-2 gap-space-md">
                  <input
                    type="text"
                    name="ram"
                    value={formData.ram || ''}
                    onChange={handleChange}
                    list="ram-list"
                    placeholder="RAM"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="storage"
                    value={formData.storage || ''}
                    onChange={handleChange}
                    list="storage-list"
                    placeholder="Storage"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <SuggestionList id="ram-list" items={suggestions.ram} />
                <SuggestionList id="storage-list" items={suggestions.storage} />
              </div>
              <SuggestibleInput
                label="Battery"
                name="battery"
                value={formData.battery!}
                suggestions={suggestions.battery}
                placeholder="e.g. 5000 mAh"
                onChange={handleChange}
              />
              <SuggestibleInput
                label="Colors"
                name="colors"
                value={formData.colors!}
                suggestions={suggestions.colors}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="border-t border-outline-variant pt-space-lg">
            <div className="grid grid-cols-1 gap-space-xl md:grid-cols-3">
              <SuggestibleInput
                label="Network Technology"
                name="networkTechnology"
                value={formData.networkTechnology!}
                suggestions={suggestions.networkTechnology}
                onChange={handleChange}
              />
              <SuggestibleInput
                label="Main Camera"
                name="mainCamera"
                value={formData.mainCamera!}
                suggestions={suggestions.mainCamera}
                onChange={handleChange}
              />
              <SuggestibleInput
                label="Selfie Camera"
                name="selfieCamera"
                value={formData.selfieCamera!}
                suggestions={suggestions.selfieCamera}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Tab 3: Detailed Specs */}
        <div className={activeTab === 'specs_all' ? 'block' : 'hidden'}>
          <div className="mb-space-lg flex items-center justify-between">
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              Technical Specifications
            </h3>
            <button
              type="button"
              onClick={addSpec}
              className="flex items-center gap-space-sm rounded-lg bg-primary-container px-4 py-2.5 font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-primary-container transition-colors hover:bg-inverse-primary"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
              Add Specification
            </button>
          </div>
          <div className="space-y-space-md">
            {formData.specs?.map((spec, index) => (
              <div
                key={index}
                className="group flex items-start gap-space-lg rounded-xl border border-outline-variant bg-surface-container p-4"
              >
                <div className="flex-1">
                  <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase text-outline">
                    Section
                  </label>
                  <input
                    placeholder="e.g. Display"
                    value={spec.category}
                    onChange={(e) =>
                      handleSpecChange(index, 'category', e.target.value)
                    }
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-body-sm font-bold text-on-surface placeholder-outline"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase text-outline">
                    Property
                  </label>
                  <input
                    placeholder="e.g. Type"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(index, 'key', e.target.value)
                    }
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-body-sm font-bold text-on-surface placeholder-outline"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase text-outline">
                    Value
                  </label>
                  <input
                    placeholder="e.g. LTPO AMOLED, 120Hz"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(index, 'value', e.target.value)
                    }
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-body-sm font-bold text-on-surface placeholder-outline"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="mt-6 rounded-lg p-2 text-error opacity-0 transition-opacity group-hover:opacity-100 hover:bg-error-container/15"
                  aria-label="Remove specification"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                </button>
              </div>
            ))}
            {(!formData.specs || formData.specs.length === 0) && (
              <div className="rounded-xl border-2 border-dashed border-outline-variant bg-surface-container py-12 text-center">
                <span className="material-symbols-outlined mb-space-md block text-[32px] text-outline" aria-hidden="true">memory</span>
                <p className="font-label-md font-bold uppercase tracking-widest text-outline">
                  No specifications added yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tab 4: Media & Review */}
        <div className={activeTab === 'media' ? 'block space-y-space-xl' : 'hidden'}>
          <div className="grid grid-cols-1 gap-space-xl md:grid-cols-2">
            <div className="space-y-space-lg">
              <div>
                <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Primary Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {formData.imageUrl && (
                <div className="mx-auto flex aspect-square max-w-sm items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-space-lg">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain drop-shadow-2xl"
                  />
                </div>
              )}
            </div>

            <div className="space-y-space-lg">
              <div className="flex items-center justify-between">
                <label className="block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Gallery Images
                </label>
                <button
                  type="button"
                  onClick={addImage}
                  className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-secondary hover:underline"
                >
                  + Add Image
                </button>
              </div>
              <div className="no-scrollbar max-h-[400px] space-y-space-md overflow-y-auto pr-2">
                {formData.images?.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={url}
                      onChange={(e) =>
                        handleImageArrayChange(index, e.target.value)
                      }
                      placeholder="Image URL"
                      className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-body-sm text-on-surface placeholder-outline"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="rounded-lg p-2 text-error transition-colors hover:bg-error-container/15"
                      aria-label="Remove image"
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant pt-space-lg">
                <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Review Teaser (Visible on Page)
                </label>
                <textarea
                  name="reviewTeaser"
                  rows={4}
                  value={formData.reviewTeaser || ''}
                  onChange={handleChange}
                  placeholder="The Samsung Galaxy S24 Ultra is a monster of a phone..."
                  className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-body-md text-on-surface-variant italic placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab 5: SEO & Affiliates */}
        <div
          className={
            activeTab === 'seo_affiliates' ? 'block space-y-space-xl' : 'hidden'
          }
        >
          <div className="grid grid-cols-1 gap-space-xl md:grid-cols-2">
            {/* SEO Section */}
            <div className="space-y-space-lg rounded-xl border border-outline-variant bg-surface-container p-space-lg">
              <h3 className="mb-space-md flex items-center gap-2 font-headline-md text-headline-md font-bold text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">public</span>
                SEO Metadata
              </h3>
              <div>
                <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle || ''}
                  onChange={handleChange}
                  placeholder="Custom SEO Title"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Meta Description
                </label>
                <textarea
                  name="seoDescription"
                  rows={4}
                  value={formData.seoDescription || ''}
                  onChange={handleChange}
                  placeholder="Custom Meta Description"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 font-body-md text-on-surface-variant placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Affiliates Section */}
            <div className="space-y-space-lg">
              <div className="mb-space-md flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[20px] text-tertiary" aria-hidden="true">shopping_cart</span>
                  Affiliate Links
                </h3>
                <button
                  type="button"
                  onClick={addAffiliateLink}
                  className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-secondary hover:underline"
                >
                  + Add Retailer
                </button>
              </div>
              <div className="no-scrollbar max-h-[400px] space-y-space-md overflow-y-auto pr-2">
                {formData.affiliateLinks?.map((link, index) => (
                  <div
                    key={index}
                    className="group relative space-y-space-md rounded-xl border border-outline-variant bg-surface-container p-4 shadow-md md:shadow-none"
                  >
                    <button
                      type="button"
                      onClick={() => removeAffiliateLink(index)}
                      className="absolute top-4 right-4 rounded-lg p-2 text-error opacity-0 transition-opacity group-hover:opacity-100 hover:bg-error-container/15"
                      aria-label="Remove retailer link"
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                    </button>
                    <div className="grid grid-cols-2 gap-space-md">
                      <div>
                        <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase text-outline">
                          Platform
                        </label>
                        <input
                          placeholder="Jumia, Amazon..."
                          value={link.platform}
                          onChange={(e) =>
                            handleAffiliateChange(
                              index,
                              'platform',
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-body-sm font-bold text-on-surface placeholder-outline"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase text-outline">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          placeholder="499.00"
                          value={link.price}
                          onChange={(e) =>
                            handleAffiliateChange(
                              index,
                              'price',
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-body-sm font-bold text-on-surface placeholder-outline tabular-nums"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <label className="block font-label-xs text-label-xs font-bold uppercase text-outline">
                          Affiliate URL
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setGeneratorIndex(
                              generatorIndex === index ? null : index,
                            )
                          }
                          className="flex items-center gap-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-secondary hover:underline"
                        >
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">auto_fix_high</span>
                          {generatorIndex === index ? 'Close' : 'Generate'}
                        </button>
                      </div>
                      <input
                        placeholder="https://retailer.com/product/..."
                        value={link.url}
                        onChange={(e) =>
                          handleAffiliateChange(index, 'url', e.target.value)
                        }
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-body-sm text-on-surface-variant placeholder-outline"
                      />
                    </div>
                    {generatorIndex === index && (
                      <AffiliateLinkGenerator
                        defaultQuery={
                          formData.name ||
                          `${formData.brand || ''} ${formData.model || ''}`.trim()
                        }
                        onApply={(url, platformLabel) => {
                          // Single combined update — two handleAffiliateChange
                          // calls would each derive from the same stale formData.
                          const newLinks = [...(formData.affiliateLinks || [])]
                          newLinks[index] = {
                            ...newLinks[index],
                            url,
                            platform: newLinks[index].platform || platformLabel,
                          }
                          setFormData({
                            ...formData,
                            affiliateLinks: newLinks,
                          })
                          setGeneratorIndex(null)
                        }}
                      />
                    )}
                  </div>
                ))}
                {(!formData.affiliateLinks ||
                  formData.affiliateLinks.length === 0) && (
                  <div className="rounded-xl border border-outline-variant bg-surface-container py-8 text-center">
                    <p className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                      No affiliate links added
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-space-xl flex justify-end gap-space-md border-t border-outline-variant pt-space-lg">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-space-lg py-3 font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-lg px-space-xl py-3 font-label-sm text-label-sm font-bold uppercase tracking-widest transition-colors ${
              isSubmitting
                ? 'bg-surface-container-highest text-outline'
                : 'bg-primary-container text-on-primary-container hover:bg-inverse-primary'
            }`}
          >
            {isSubmitting
              ? 'Syncing...'
              : isEdit
                ? 'Update Device'
                : 'Save & Publish Device'}
          </button>
        </div>
      </form>
    </div>
  )
}






