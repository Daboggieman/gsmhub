"use client";

import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div>
      <div className="mb-space-lg">
        <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
          Add New Category
        </h1>
        <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
          Organize your devices efficiently
        </p>
      </div>
      <CategoryForm />
    </div>
  );
}
