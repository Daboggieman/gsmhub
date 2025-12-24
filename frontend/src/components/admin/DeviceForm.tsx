"use client";

import { useState, useEffect } from 'react';
import { Device, Category, DeviceType } from '../../../../shared/src/types';
import { generateSlug } from '../../../../shared/src/utils/slug';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faMicrochip, 
  faCamera, 
  faImages, 
  faPlus, 
  faTrash, 
  faEye,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

interface DeviceFormProps {
  initialData?: Device;
  isEdit?: boolean;
}

type Tab = 'general' | 'specs_key' | 'specs_all' | 'media';

export default function DeviceForm({ initialData, isEdit = false }: DeviceFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAutoSlug, setIsAutoSlug] = useState(!isEdit);

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
    ...initialData,
  });

  // Handle auto-slug generation
  useEffect(() => {
    if (isAutoSlug && !isEdit) {
      const name = formData.name || `${formData.brand} ${formData.model}`.trim();
      if (name) {
        setFormData(prev => ({ ...prev, slug: generateSlug(name) }));
      }
    }
  }, [formData.name, formData.brand, formData.model, isAutoSlug, isEdit]);

  // Handle category object in initialData
  useEffect(() => {
    if (initialData && initialData.category && typeof initialData.category === 'object') {
      setFormData(prev => ({ ...prev, category: (initialData.category as any).id || (initialData.category as any)._id }));
    }
  }, [initialData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brnds, sug] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getBrands(),
          apiClient.getFieldSuggestions(),
        ]);
        setCategories(cats);
        setBrands(brnds);
        setSuggestions(sug);
      } catch (err) {
        console.error('Failed to load form data', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: val }));
    
    if (name === 'slug') {
      setIsAutoSlug(false);
    }
  };

  const handleSpecChange = (index: number, field: string, value: string) => {
    const newSpecs = [...(formData.specs || [])];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setFormData({ ...formData, specs: newSpecs });
  };

  const addSpec = () => {
    setFormData({
      ...formData,
      specs: [...(formData.specs || []), { category: '', key: '', value: '' }],
    });
  };

  const removeSpec = (index: number) => {
    const newSpecs = [...(formData.specs || [])];
    newSpecs.splice(index, 1);
    setFormData({ ...formData, specs: newSpecs });
  };

  const handleImageArrayChange = (index: number, value: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImage = () => {
    setFormData({ ...formData, images: [...(formData.images || []), ''] });
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Filter out internal fields and ensure payload is clean
    const { _id, id, createdAt, updatedAt, views, ...rest } = formData as any;
    
    try {
      const deviceId = initialData?.id || initialData?._id;
      if (isEdit && deviceId) {
        await apiClient.updateDevice(deviceId, rest);
      } else {
        await apiClient.createDevice(rest);
      }
      router.push('/admin/devices');
    } catch (err: any) {
      setError(err.message || 'Failed to save device');
      setActiveTab('general'); // Show where the error might be if it's validation
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabButton = ({ id, label, icon }: { id: Tab, label: string, icon: any }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold transition-all ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      <FontAwesomeIcon icon={icon} className={activeTab === id ? 'text-blue-600' : 'text-gray-500'} />
      {label}
    </button>
  );

  const SuggestionList = ({ id, items }: { id: string, items?: string[] }) => (
    <datalist id={id}>
      {items?.map((item) => <option key={item} value={item} />)}
    </datalist>
  );

  const SuggestibleInput = ({ 
    label, 
    name, 
    value, 
    suggestions: items, 
    placeholder,
    type = "text"
  }: { 
    label: string, 
    name: string, 
    value: string, 
    suggestions?: string[], 
    placeholder?: string,
    type?: string
  }) => (
    <div>
      <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">{label}</label>
      <input
        type={type}
        name={name}
        list={`${name}-list`}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold border p-3 text-gray-900 bg-white"
      />
      <SuggestionList id={`${name}-list`} items={items} />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="flex bg-gray-50/50 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <TabButton id="general" label="General Info" icon={faInfoCircle} />
        <TabButton id="specs_key" label="Key Specs" icon={faMicrochip} />
        <TabButton id="specs_all" label="Detailed Specs" icon={faCamera} />
        <TabButton id="media" label="Media & SEO" icon={faImages} />
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {error && (
          <div className="mb-8 flex items-center gap-3 bg-red-50 p-4 text-red-700 rounded-xl border border-red-100 animate-shake">
            <FontAwesomeIcon icon={faTimesCircle} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Tab 1: General Info */}
        <div className={activeTab === 'general' ? 'block space-y-8' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Display Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold border p-3 text-gray-900 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Brand</label>
                  <select
                    name="brand"
                    required
                    value={formData.brand || ''}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold border p-3 text-gray-900 bg-white"
                  >
                    <option value="">Select Brand...</option>
                    {brands.sort().map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    {!brands.includes(formData.brand || '') && formData.brand && (
                      <option value={formData.brand}>{formData.brand}</option>
                    )}
                  </select>
                  <p className="mt-1 text-[10px] text-gray-400 font-bold italic">* Pick from existing or use Sync for new brands</p>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Model</label>
                  <input
                    type="text"
                    name="model"
                    required
                    value={formData.model || ''}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold border p-3 text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Slug (URL)</label>
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-gray-50 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm border p-3 text-gray-800"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Category</label>
                  <select
                    name="category"
                    required
                    value={typeof formData.category === 'string' ? formData.category : ''}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold border p-3 text-gray-900 bg-white"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Device Type</label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold border p-3 text-gray-900 bg-white"
                  >
                    {Object.values(DeviceType).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Short Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium border p-3 text-gray-800 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-black text-gray-800 uppercase tracking-widest cursor-pointer">Active & Visible</label>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 2: Key Specs */}
        <div className={activeTab === 'specs_key' ? 'block space-y-8' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                Platform & OS
              </h3>
              <SuggestibleInput label="OS" name="os" value={formData.os!} suggestions={suggestions.os} placeholder="e.g. Android 14" />
              <SuggestibleInput label="Chipset" name="chipset" value={formData.chipset!} suggestions={suggestions.chipset} />
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Release Date</label>
                <input type="text" name="releaseDate" value={formData.releaseDate || ''} onChange={handleChange} placeholder="e.g. 2024, January" className="w-full rounded-xl border p-3 font-bold text-gray-900 bg-white" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                Display & Body
              </h3>
              <SuggestibleInput label="Display Size" name="displaySize" value={formData.displaySize!} suggestions={suggestions.displaySize} placeholder="e.g. 6.8 inches" />
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Weight</label>
                <input type="text" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full rounded-xl border p-3 font-bold text-gray-900 bg-white" />
              </div>
              <SuggestibleInput label="Dimensions" name="dimension" value={formData.dimension!} suggestions={suggestions.dimension} />
            </div>

            <div className="space-y-6">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                Storage & Features
              </h3>
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">RAM / Storage</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" name="ram" value={formData.ram || ''} onChange={handleChange} list="ram-list" placeholder="RAM" className="w-full rounded-xl border p-3 font-bold text-gray-900 bg-white" />
                  <input type="text" name="storage" value={formData.storage || ''} onChange={handleChange} list="storage-list" placeholder="Storage" className="w-full rounded-xl border p-3 font-bold text-gray-900 bg-white" />
                </div>
                <SuggestionList id="ram-list" items={suggestions.ram} />
                <SuggestionList id="storage-list" items={suggestions.storage} />
              </div>
              <SuggestibleInput label="Battery" name="battery" value={formData.battery!} suggestions={suggestions.battery} placeholder="e.g. 5000 mAh" />
              <SuggestibleInput label="Colors" name="colors" value={formData.colors!} suggestions={suggestions.colors} />
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SuggestibleInput label="Network Technology" name="networkTechnology" value={formData.networkTechnology!} suggestions={suggestions.networkTechnology} />
              <SuggestibleInput label="Main Camera" name="mainCamera" value={formData.mainCamera!} suggestions={suggestions.mainCamera} />
              <SuggestibleInput label="Selfie Camera" name="selfieCamera" value={formData.selfieCamera!} suggestions={suggestions.selfieCamera} />
            </div>
          </div>
        </div>

        {/* Tab 3: Detailed Specs */}
        <div className={activeTab === 'specs_all' ? 'block' : 'hidden'}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900">Technical Specifications</h3>
            <button
              type="button"
              onClick={addSpec}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Specification
            </button>
          </div>
          <div className="space-y-3">
            {formData.specs?.map((spec, index) => (
              <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Section</label>
                  <input
                    placeholder="e.g. Display"
                    value={spec.category}
                    onChange={(e) => handleSpecChange(index, 'category', e.target.value)}
                    className="w-full rounded-lg border-gray-300 text-sm font-bold border p-2 text-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Property</label>
                  <input
                    placeholder="e.g. Type"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    className="w-full rounded-lg border-gray-300 text-sm font-bold border p-2 text-gray-900"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Value</label>
                  <input
                    placeholder="e.g. LTPO AMOLED, 120Hz"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    className="w-full rounded-lg border-gray-300 text-sm font-bold border p-2 text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="mt-6 text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
            {(!formData.specs || formData.specs.length === 0) && (
              <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <FontAwesomeIcon icon={faMicrochip} className="text-4xl text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest">No specifications added yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Tab 4: Media & SEO */}
        <div className={activeTab === 'media' ? 'block space-y-10' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Primary Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium border p-3 text-gray-700"
                />
              </div>
              {formData.imageUrl && (
                <div className="relative group rounded-3xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-8 aspect-square max-w-sm mx-auto">
                  <img src={formData.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                  <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <FontAwesomeIcon icon={faEye} className="text-white text-3xl" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Gallery Images</label>
                <button type="button" onClick={addImage} className="text-blue-600 font-black text-xs uppercase hover:underline">
                  + Add Image
                </button>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {formData.images?.map((url, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      value={url}
                      onChange={(e) => handleImageArrayChange(index, e.target.value)}
                      placeholder="Image URL"
                      className="flex-1 rounded-xl border-gray-300 text-sm border p-2 text-gray-700"
                    />
                    <button type="button" onClick={() => removeImage(index)} className="text-red-400 hover:text-red-600">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-gray-100">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Review Teaser (SEO)</label>
                <textarea
                  name="reviewTeaser"
                  rows={4}
                  value={formData.reviewTeaser || ''}
                  onChange={handleChange}
                  placeholder="The Samsung Galaxy S24 Ultra is a monster of a phone..."
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium border p-3 italic text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end gap-4 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 rounded-2xl text-sm font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-12 py-4 rounded-2xl shadow-xl font-black text-white uppercase tracking-widest transition-all transform hover:-translate-y-1 ${
              isSubmitting ? 'bg-gray-400 scale-95 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200'
            }`}
          >
            {isSubmitting ? 'Syncing...' : isEdit ? 'Update Device' : 'Publish Device'}
          </button>
        </div>
      </form>
    </div>
  );
}

