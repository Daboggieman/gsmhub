"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Category } from '../../../../shared/src/types';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await apiClient.deleteCategory(id);
        fetchCategories();
      } catch (error) {
        alert('Failed to delete category');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Manage Categories</h3>
        <Link 
          href="/admin/categories/new" 
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Add New Category
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Slug</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center">No categories found.</td></tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-gray-600">{category.slug}</td>
                  <td className="px-6 py-4 space-x-3">
                    <Link href={`/admin/categories/edit/${category.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                    <button onClick={() => handleDelete(category.id!)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
