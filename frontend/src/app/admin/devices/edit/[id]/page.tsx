"use client";

import { useEffect, useState, use } from 'react';
import DeviceForm from '@/components/admin/DeviceForm';
import { apiClient } from '@/lib/api';
import { Device } from '../../../../../../../shared/src/types';

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

  if (loading) return <div>Loading...</div>;
  if (!device) return <div>Device not found</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Device</h2>
      <DeviceForm initialData={device} isEdit />
    </div>
  );
}
