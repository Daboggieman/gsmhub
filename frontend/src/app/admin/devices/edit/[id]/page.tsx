"use client";

import { useEffect, useState, use } from 'react';
import DeviceForm from '@/components/admin/DeviceForm';
import { apiClient } from '@/lib/api';
import { Device } from '@shared/types';

export default function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const data = await apiClient.getDeviceById(id);
        setDevice(data);
      } catch (error) {
        console.error('Failed to fetch device', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-48 items-center justify-center gap-space-md font-label-md font-bold text-outline">
        <span className="material-symbols-outlined progress_activity animate-spin text-[24px] text-secondary" aria-hidden="true"></span>
        Loading...
      </div>
    );
  if (!device)
    return (
      <div className="rounded-xl border border-error-container/40 bg-error-container/15 p-space-lg font-label-md font-bold text-error">
        Device not found
      </div>
    );

  return (
    <div>
      <div className="mb-space-lg">
        <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
          Edit Device
        </h1>
        <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
          Update device information and specifications
        </p>
      </div>
      <DeviceForm initialData={device} isEdit />
    </div>
  );
}
