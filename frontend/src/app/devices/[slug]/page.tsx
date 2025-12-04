import React from 'react';
import { notFound } from 'next/navigation';
import { Device } from '@shared/types';
import DeviceGallery from '@/components/devices/DeviceGallery';
import SpecsTable from '@/components/devices/SpecsTable';

interface DevicePageProps {
  params: {
    slug: string;
  };
}

async function getDevice(slug: string): Promise<Device | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/devices/slug/${slug}`);

    // The backend returns a 404 which `res.ok` will correctly handle as false
    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Failed to fetch device:', error);
    // Return null or handle the error as appropriate for your application
    return null;
  }
}


const DevicePage: React.FC<DevicePageProps> = async ({ params }) => {
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
};

export default DevicePage;
