"use client";

import { useState, useEffect } from 'react';
import { Device, Category } from '../../../../shared/src/types';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DeviceFormProps {
  initialData?: Device;
  isEdit?: boolean;
}

export default function DeviceForm({ initialData, isEdit = false }: DeviceFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<Device>>({
    name: '',
    brand: '',
    model: '',
    slug: '',
    imageUrl: '',
    category: '',
    specs: [],
    ...initialData,
  });

  // Handle category object in initialData
  useEffect(() => {
    if (initialData && typeof initialData.category === 'object') {
      setFormData(prev => ({ ...prev, category: (initialData.category as any)._id }));
    }
  }, [initialData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brnds] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getBrands(),
        ]);
        setCategories(cats);
        setBrands(brnds);
      } catch (err) {
        console.error('Failed to load form data', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Prepare payload with only valid fields to avoid validation errors
    const payload = {
      name: formData.name,
      slug: formData.slug,
      brand: formData.brand,
      model: formData.model,
      category: formData.category, // This should be the ID string
      imageUrl: formData.imageUrl,
      specs: formData.specs?.map(s => ({
        category: s.category,
        key: s.key,
        value: s.value
      })),
      isActive: formData.isActive ?? true,
    };

    try {
      const deviceId = initialData?.id || initialData?._id;
      if (isEdit && deviceId) {
        await apiClient.updateDevice(deviceId, payload);
      } else {
        await apiClient.createDevice(payload);
      }
      router.push('/admin/devices');
    } catch (err: any) {
      setError(err.message || 'Failed to save device');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 p-4 text-red-700 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            name="slug"
            required
            value={formData.slug || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            name="brand"
            required
            list="brand-list"
            value={formData.brand || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
          <datalist id="brand-list">
            {brands.map((b) => <option key={b} value={b} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            name="model"
            required
            value={formData.model || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            required
            value={typeof formData.category === 'string' ? formData.category : ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
          <button
            type="button"
            onClick={addSpec}
            className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100"
          >
            Add Spec
          </button>
        </div>
        <div className="space-y-2">
          {formData.specs?.map((spec, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                placeholder="Category (e.g., Display)"
                value={spec.category}
                onChange={(e) => handleSpecChange(index, 'category', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm text-sm border p-2"
              />
              <input
                placeholder="Key (e.g., Size)"
                value={spec.key}
                onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm text-sm border p-2"
              />
              <input
                placeholder="Value (e.g., 6.1 inches)"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm text-sm border p-2"
              />
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="text-red-600 hover:text-red-800 p-2"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Device'}
        </button>
      </div>
    </form>
  );
}
