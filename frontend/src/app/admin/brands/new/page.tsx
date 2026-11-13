"use client";

import BrandForm from '@/components/admin/BrandForm';

export default function NewBrandPage() {
  return (
    <div>
      <div className="mb-space-lg">
        <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
          Add New Brand
        </h1>
        <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
          Register a manufacturer profile
        </p>
      </div>
      <BrandForm />
    </div>
  );
}
