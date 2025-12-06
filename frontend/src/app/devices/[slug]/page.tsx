import React from 'react';
import { notFound } from 'next/navigation';
import { Device } from '@shared/types';
import DeviceGallery from '@/components/devices/DeviceGallery';
import SpecsTable from '@/components/devices/SpecsTable';
import { apiClient } from '@/lib/api'; // Import apiClient

async function getDevice(slug: string): Promise<Device | null> {
  try {
    const device = await apiClient.getDevice(slug);
    return device;
  } catch (error) {
    console.error('Failed to fetch device:', error);
    return null;
  }
}

// Function to generate static params for SSG
export async function generateStaticParams() {
  // Fetch all devices from your API to get their slugs
  const { devices } = await apiClient.getDevices();
  
  // Return an array of objects, each containing a slug parameter
  return devices.map((device) => ({
    slug: device.slug,
  }));
}

// This is an async Server Component
async function DevicePage({ params: promiseParams }: { params: Promise<{ slug: string }> }) {
  const params = await promiseParams;
  const device = await getDevice(params.slug);

  if (!device) {
    notFound(); // Triggers the not-found.tsx page or a default 404
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <DeviceGallery imageUrls={[device.imageUrl].filter(Boolean) as string[]} deviceName={device.name} />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{device.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{device.description}</p>
          <SpecsTable device={device} />
        </div>
      </div>

      {/* Placeholder for similar devices, reviews, etc. */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Similar Devices</h2>
        {/* You can fetch and display similar devices here */}
        <p>Similar devices section coming soon.</p>
      </div>
    </div>
  );
}

export default DevicePage;
