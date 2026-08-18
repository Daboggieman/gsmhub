'use client'

import { useState, useEffect } from 'react'
import { Device, Category, DeviceType, PriceHistory } from '@shared/types'
import { generateSlug } from '@shared/utils/slug'
import { apiClient } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faInfoCircle,
  faMicrochip,
  faCamera,
  faImages,
  faPlus,
  faTrash,
  faEye,
  faCheckCircle,
  faTimesCircle,
  faGlobe,
  faShoppingCart,
  faHistory,
} from '@fortawesome/free-solid-svg-icons'

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
  const [prices, setPrices] = useState<PriceHistory[]>([])
  const [isPriceLoading, setIsPriceLoading] = useState(false)
  const [newPrice, setNewPrice] = useState({
    price: 0,
    currency: 'USD',
    country: 'USA',
    retailer: '',
    url: '',
  })

  const [formData, setFormData] = useState<Partial<Device>>({
    name: '',
    brand: '',
    model: '',
    slug: '',
    type: DeviceType.PHONE,
    imageUrl: '',
    images: [],
    category: '',
    description: '',
    isActive: true,
    specs: [],
    seoTitle: '',
    seoDescription: '',
    affiliateLinks: [],
    ...initialData,
  })

  // Handle auto-slug generation
  useEffect(() => {
    if (isAutoSlug && !isEdit) {
      const name = formData.name || `${formData.brand} ${formData.model}`.trim()
      if (name) {
        setFormData((prev) => ({ ...prev, slug: generateSlug(name) }))
      }
    }
  }, [formData.name, formData.brand, formData.model, isAutoSlug, isEdit])

  // Handle category object in initialData
  useEffect(() => {
    if (
      initialData &&
      initialData.category &&
      typeof initialData.category === 'object'
    ) {
      setFormData((prev) => ({
        ...prev,
        category:
          (initialData.category as any).id || (initialData.category as any)._id,
      }))
    }
  }, [initialData])

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
          const data = await apiClient.getDevicePriceHistory(
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
  }, [])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target as any
    const val =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => ({ ...prev, [name]: val }))

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

  const handleAffiliateChange = (index: number, field: string, value: any) => {
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
    const id = (initialData as any).id || (initialData as any)._id
    if (!id) return

    try {
      await apiClient.createPrice({
        ...newPrice,
        device: id,
      })
      // Refresh prices
      const data = await apiClient.getDevicePriceHistory(id)
      setPrices(data)
      setNewPrice({
        price: 0,
        currency: 'USD',
        country: 'USA',
        retailer: '',
        url: '',
      })
    } catch (err: any) {
      alert(`Failed to add price: ${err.message}`)
    }
  }

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm('Delete this price entry?')) return
    const id = (initialData as any).id || (initialData as any)._id

    try {
      await apiClient.deletePrice(priceId)
      const data = await apiClient.getDevicePriceHistory(id)
      setPrices(data)
    } catch (err: any) {
      alert(`Failed to delete price: ${err.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Filter out internal fields and ensure payload is clean
    const { _id, id, createdAt, updatedAt, views, ...rest } = formData as any

    try {
      const deviceId = (initialData as any)?.id || (initialData as any)?._id
      if (isEdit && deviceId) {
        await apiClient.updateDevice(deviceId, rest)
      } else {
        await apiClient.createDevice(rest)
      }
      router.push('/admin/devices')
    } catch (err: any) {
      setError(err.message || 'Failed to save device')
      setActiveTab('general') // Show where the error might be if it's validation
    } finally {
      setIsSubmitting(false)
    }
  }

  const TabButton = ({
    id,
    label,
    icon,
  }: {
    id: Tab
    label: string
    icon: any
  }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 border-b-2 px-6 py-4 font-bold whitespace-nowrap transition-all ${
        activeTab === id
          ? 'border-blue-600 bg-blue-50/50 text-blue-600'
          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      <FontAwesomeIcon
        icon={icon}
        className={activeTab === id ? 'text-blue-600' : 'text-gray-500'}
      />
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
  }: {
    label: string
    name: string
    value: string
    suggestions?: string[]
    placeholder?: string
    type?: string
  }) => (
    <div>
      <label className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
        {label}
      </label>
      <input
        type={type}
        name={name}
        list={`${name}-list`}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <SuggestionList id={`${name}-list`} items={items} />
    </div>
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
      <div className="no-scrollbar flex overflow-x-auto border-b border-gray-100 bg-gray-50/50">
        <TabButton id="general" label="General Info" icon={faInfoCircle} />
        <TabButton id="specs_key" label="Key Specs" icon={faMicrochip} />
        <TabButton id="specs_all" label="Detailed Specs" icon={faCamera} />
        <TabButton id="media" label="Media & Review" icon={faImages} />
        <TabButton
          id="seo_affiliates"
          label="SEO & Affiliates"
          icon={faGlobe}
        />
        {isEdit && (
          <TabButton id="pricing" label="Retail Prices" icon={faShoppingCart} />
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {error && (
          <div className="animate-shake mb-8 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
            <FontAwesomeIcon icon={faTimesCircle} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Tab 6: Retail Prices (Manual Overrides) */}
        {isEdit && (
          <div
            className={activeTab === 'pricing' ? 'block space-y-10' : 'hidden'}
          >
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {/* Add New Price Form */}
              <div className="space-y-6 rounded-3xl border border-blue-100 bg-blue-50/50 p-6 md:col-span-1">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-blue-900">
                  <FontAwesomeIcon icon={faPlus} className="text-blue-600" />
                  Add Local Price
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-black tracking-widest text-blue-500 uppercase">
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
                      className="w-full rounded-xl border p-2 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-black tracking-widest text-blue-500 uppercase">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={newPrice.currency}
                        onChange={(e) =>
                          setNewPrice({ ...newPrice, currency: e.target.value })
                        }
                        className="w-full rounded-xl border p-2 font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-black tracking-widest text-blue-500 uppercase">
                        Country
                      </label>
                      <input
                        type="text"
                        value={newPrice.country}
                        onChange={(e) =>
                          setNewPrice({ ...newPrice, country: e.target.value })
                        }
                        className="w-full rounded-xl border p-2 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-black tracking-widest text-blue-500 uppercase">
                      Retailer
                    </label>
                    <input
                      type="text"
                      value={newPrice.retailer}
                      onChange={(e) =>
                        setNewPrice({ ...newPrice, retailer: e.target.value })
                      }
                      placeholder="e.g. Slot, Jumia"
                      className="w-full rounded-xl border p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-black tracking-widest text-blue-500 uppercase">
                      Store URL
                    </label>
                    <input
                      type="text"
                      value={newPrice.url}
                      onChange={(e) =>
                        setNewPrice({ ...newPrice, url: e.target.value })
                      }
                      className="w-full rounded-xl border p-2 font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPrice}
                    className="w-full rounded-xl bg-blue-600 py-3 text-xs font-black tracking-widest text-white uppercase transition-all hover:bg-blue-700"
                  >
                    Add Price Entry
                  </button>
                </div>
              </div>

              {/* Price List */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
                  <FontAwesomeIcon icon={faHistory} className="text-gray-400" />
                  Price Records
                </h3>
                {isPriceLoading ? (
                  <div className="animate-pulse py-12 text-center font-bold tracking-widest text-gray-400 uppercase">
                    Loading Price Data...
                  </div>
                ) : prices.length === 0 ? (
                  <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                    <p className="font-bold tracking-widest text-gray-400 uppercase">
                      No manual prices recorded
                    </p>
                  </div>
                ) : (
                  <div className="no-scrollbar max-h-[500px] space-y-3 overflow-y-auto pr-2">
                    {prices.map((p: any) => (
                      <div
                        key={p._id || p.id}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 font-black text-blue-600">
                            {p.currency === 'USD' ? '$' : p.currency}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">
                              {p.price.toLocaleString()} {p.currency}
                            </p>
                            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                              {p.retailer || 'Unknown Retailer'} • {p.country}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gray-300 uppercase">
                            {new Date(
                              p.date || (p as any).createdAt,
                            ).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeletePrice(p._id || p.id)}
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-[10px] font-bold text-gray-400 italic">
                  * These prices appear in the "Prices" section of the public
                  device page and contribute to price history charts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: General Info */}
        <div className={activeTab === 'general' ? 'block space-y-8' : 'hidden'}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label htmlFor="device-name" className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
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
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="device-brand" className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
                    Brand
                  </label>
                  <select
                    name="brand"
                    id="device-brand"
                    required
                    value={formData.brand || ''}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  <p className="mt-1 text-[10px] font-bold text-gray-400 italic">
                    * Pick from existing or use Sync for new brands
                  </p>
                </div>
                <div>
                  <label htmlFor="device-model" className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    id="device-model"
                    required
                    value={formData.model || ''}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 font-mono text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="device-category" className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
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
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option
                        key={c.id || (c as any)._id}
                        value={c.id || (c as any)._id}
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
                    Device Type
                  </label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                <label className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
                  Short Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 font-medium text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="cursor-pointer text-sm font-black tracking-widest text-gray-800 uppercase"
                >
                  Active & Visible
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 2: Key Specs */}
        <div
          className={activeTab === 'specs_key' ? 'block space-y-8' : 'hidden'}
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                <div className="h-8 w-2 rounded-full bg-blue-500"></div>
                Platform & OS
              </h3>
              <SuggestibleInput
                label="OS"
                name="os"
                value={formData.os!}
                suggestions={suggestions.os}
                placeholder="e.g. Android 14"
              />
              <SuggestibleInput
                label="Chipset"
                name="chipset"
                value={formData.chipset!}
                suggestions={suggestions.chipset}
              />
              <div>
                <label className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
                  Release Date
                </label>
                <input
                  type="text"
                  name="releaseDate"
                  value={formData.releaseDate || ''}
                  onChange={handleChange}
                  placeholder="e.g. 2024, January"
                  className="w-full rounded-xl border bg-white p-3 font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                <div className="h-8 w-2 rounded-full bg-green-500"></div>
                Display & Body
              </h3>
              <SuggestibleInput
                label="Display Size"
                name="displaySize"
                value={formData.displaySize!}
                suggestions={suggestions.displaySize}
                placeholder="e.g. 6.8 inches"
              />
              <div>
                <label className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border bg-white p-3 font-bold text-gray-900"
                />
              </div>
              <SuggestibleInput
                label="Dimensions"
                name="dimension"
                value={formData.dimension!}
                suggestions={suggestions.dimension}
              />
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                <div className="h-8 w-2 rounded-full bg-purple-500"></div>
                Storage & Features
              </h3>
              <div>
                <label className="mb-2 block text-xs font-black tracking-widest text-gray-600 uppercase">
                  RAM / Storage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="ram"
                    value={formData.ram || ''}
                    onChange={handleChange}
                    list="ram-list"
                    placeholder="RAM"
                    className="w-full rounded-xl border bg-white p-3 font-bold text-gray-900"
                  />
                  <input
                    type="text"
                    name="storage"
                    value={formData.storage || ''}
                    onChange={handleChange}
                    list="storage-list"
                    placeholder="Storage"
                    className="w-full rounded-xl border bg-white p-3 font-bold text-gray-900"
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
              />
              <SuggestibleInput
                label="Colors"
                name="colors"
                value={formData.colors!}
                suggestions={suggestions.colors}
              />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <SuggestibleInput
                label="Network Technology"
                name="networkTechnology"
                value={formData.networkTechnology!}
                suggestions={suggestions.networkTechnology}
              />
              <SuggestibleInput
                label="Main Camera"
                name="mainCamera"
                value={formData.mainCamera!}
                suggestions={suggestions.mainCamera}
              />
              <SuggestibleInput
                label="Selfie Camera"
                name="selfieCamera"
                value={formData.selfieCamera!}
                suggestions={suggestions.selfieCamera}
              />
            </div>
          </div>
        </div>

        {/* Tab 3: Detailed Specs */}
        <div className={activeTab === 'specs_all' ? 'block' : 'hidden'}>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">
              Technical Specifications
            </h3>
            <button
              type="button"
              onClick={addSpec}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Specification
            </button>
          </div>
          <div className="space-y-3">
            {formData.specs?.map((spec, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
                    Section
                  </label>
                  <input
                    placeholder="e.g. Display"
                    value={spec.category}
                    onChange={(e) =>
                      handleSpecChange(index, 'category', e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm font-bold text-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
                    Property
                  </label>
                  <input
                    placeholder="e.g. Type"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(index, 'key', e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm font-bold text-gray-900"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
                    Value
                  </label>
                  <input
                    placeholder="e.g. LTPO AMOLED, 120Hz"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(index, 'value', e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm font-bold text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="mt-6 p-2 text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-600"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
            {(!formData.specs || formData.specs.length === 0) && (
              <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                <FontAwesomeIcon
                  icon={faMicrochip}
                  className="mb-4 text-4xl text-gray-200"
                />
                <p className="font-bold tracking-widest text-gray-400 uppercase">
                  No specifications added yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tab 4: Media & Review */}
        <div className={activeTab === 'media' ? 'block space-y-10' : 'hidden'}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-black tracking-widest text-gray-500 uppercase">
                  Primary Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-300 p-3 font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {formData.imageUrl && (
                <div className="group relative mx-auto flex aspect-square max-w-sm items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-8">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain drop-shadow-2xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40 opacity-0 transition-all group-hover:opacity-100">
                    <FontAwesomeIcon
                      icon={faEye}
                      className="text-3xl text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black tracking-widest text-gray-500 uppercase">
                  Gallery Images
                </label>
                <button
                  type="button"
                  onClick={addImage}
                  className="text-xs font-black text-blue-600 uppercase hover:underline"
                >
                  + Add Image
                </button>
              </div>
              <div className="no-scrollbar max-h-[400px] space-y-4 overflow-y-auto pr-2">
                {formData.images?.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={url}
                      onChange={(e) =>
                        handleImageArrayChange(index, e.target.value)
                      }
                      placeholder="Image URL"
                      className="flex-1 rounded-xl border border-gray-300 p-2 text-sm text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-6">
                <label className="mb-2 block text-xs font-black tracking-widest text-gray-500 uppercase">
                  Review Teaser (Visible on Page)
                </label>
                <textarea
                  name="reviewTeaser"
                  rows={4}
                  value={formData.reviewTeaser || ''}
                  onChange={handleChange}
                  placeholder="The Samsung Galaxy S24 Ultra is a monster of a phone..."
                  className="w-full rounded-xl border border-gray-300 p-3 font-medium text-gray-700 italic shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab 5: SEO & Affiliates */}
        <div
          className={
            activeTab === 'seo_affiliates' ? 'block space-y-10' : 'hidden'
          }
        >
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* SEO Section */}
            <div className="space-y-6 rounded-3xl border border-gray-100 bg-gray-50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
                <FontAwesomeIcon icon={faGlobe} className="text-blue-600" />
                SEO Metadata
              </h3>
              <div>
                <label className="mb-2 block text-xs font-black tracking-widest text-gray-500 uppercase">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle || ''}
                  onChange={handleChange}
                  placeholder="Custom SEO Title"
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black tracking-widest text-gray-500 uppercase">
                  Meta Description
                </label>
                <textarea
                  name="seoDescription"
                  rows={4}
                  value={formData.seoDescription || ''}
                  onChange={handleChange}
                  placeholder="Custom Meta Description"
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 font-medium text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Affiliates Section */}
            <div className="space-y-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="text-orange-500"
                  />
                  Affiliate Links
                </h3>
                <button
                  type="button"
                  onClick={addAffiliateLink}
                  className="text-xs font-black text-blue-600 uppercase hover:underline"
                >
                  + Add Retailer
                </button>
              </div>
              <div className="no-scrollbar max-h-[400px] space-y-4 overflow-y-auto pr-2">
                {formData.affiliateLinks?.map((link, index) => (
                  <div
                    key={index}
                    className="group relative space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => removeAffiliateLink(index)}
                      className="absolute top-4 right-4 text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-600"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
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
                          className="w-full rounded-lg border border-gray-300 p-2 text-sm font-bold text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
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
                          className="w-full rounded-lg border border-gray-300 p-2 text-sm font-bold text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black text-gray-500 uppercase">
                        Affiliate URL
                      </label>
                      <input
                        placeholder="https://retailer.com/product/..."
                        value={link.url}
                        onChange={(e) =>
                          handleAffiliateChange(index, 'url', e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm font-medium text-gray-700"
                      />
                    </div>
                  </div>
                ))}
                {(!formData.affiliateLinks ||
                  formData.affiliateLinks.length === 0) && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 py-8 text-center">
                    <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                      No affiliate links added
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end gap-4 border-t border-gray-100 pt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl px-8 py-4 text-sm font-black tracking-widest text-gray-500 uppercase transition-all hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`transform rounded-2xl px-12 py-4 font-black tracking-widest text-white uppercase shadow-xl transition-all hover:-translate-y-1 ${
              isSubmitting
                ? 'scale-95 cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700 active:scale-95'
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
