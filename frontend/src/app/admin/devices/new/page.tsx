"use client";

import DeviceForm from '@/components/admin/DeviceForm';

export default function NewDevicePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Add New Device</h2>
      <DeviceForm />
    </div>
  );
}
