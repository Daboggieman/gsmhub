import React from 'react';
import DeviceCard from '@/components/devices/DeviceCard';
import { Device } from '@shared/types';
import { apiClient } from '@/lib/api';

export default async function Home() {
  const trendingDevices = await apiClient.getTrendingDevices();
  const popularDevices = await apiClient.getPopularDevices();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to GSMHub</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Trending Devices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingDevices.map((device) => (
            <DeviceCard key={device._id?.toString() || device.slug} device={device} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Popular Devices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularDevices.map((device) => (
            <DeviceCard key={device._id?.toString() || device.slug} device={device} />
          ))}
        </div>
      </section>
    </div>
  );
}
