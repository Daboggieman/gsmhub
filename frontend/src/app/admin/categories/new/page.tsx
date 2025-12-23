"use client";

import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Add New Category</h2>
      <CategoryForm />
    </div>
  );
}
