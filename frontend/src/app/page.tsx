import React from 'react';
import DeviceCard from '@/components/devices/DeviceCard';
import { Device } from '@shared/types';

async function getDevices(): Promise<Device[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/devices`);
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch devices');
  }
  return res.json();
}

export default async function Home() {
  const devices = await getDevices();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to GSMHub</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {devices.map((device) => (
          <DeviceCard key={device._id} device={device} />
        ))}
      </div>
    </div>
  );
}
