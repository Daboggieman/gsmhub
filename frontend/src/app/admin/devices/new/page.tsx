"use client";

import DeviceForm from '@/components/admin/DeviceForm';

export default function NewDevicePage() {
  return (
    <div>
      <div className="mb-space-lg">
        <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
          Add New Device
        </h1>
        <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
          Create a new catalog entry
        </p>
      </div>
      <DeviceForm />
    </div>
  );
}
