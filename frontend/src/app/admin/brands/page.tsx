"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faImage } from '@fortawesome/free-solid-svg-icons';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAdminBrands();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await apiClient.deleteBrand(id);
        fetchBrands();
      } catch (error) {
        alert('Failed to delete brand');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-gray-900">Brand Management</h3>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage manufacturers and logos</p>
        </div>
        <Link 
          href="/admin/brands/new" 
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Brand
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Logo</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Slug</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Devices</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-8 py-10 text-center font-bold text-gray-400">Loading manufacturers...</td></tr>
              ) : brands.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-10 text-center font-bold text-gray-400 uppercase tracking-widest">No brands registered</td></tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden p-2 border border-gray-50">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <FontAwesomeIcon icon={faImage} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4 font-black text-gray-900">{brand.name}</td>
                    <td className="px-8 py-4 font-mono text-xs text-gray-500">{brand.slug}</td>
                    <td className="px-8 py-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black">
                        {brand.deviceCount} Devices
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${brand.isFeatured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {brand.isFeatured ? 'Featured' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/brands/edit/${brand.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                        <button onClick={() => handleDelete(brand.id)} className="text-red-400 hover:text-red-600 transition-colors">
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
  );
}
