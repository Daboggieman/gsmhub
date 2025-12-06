// src/app/test-devices/page.tsx

import { apiClient } from '@/lib/api';

const TestDevicesPage = async () => {
  let devices = [];
  let error = null;

  try {
    const response = await apiClient.getDevices();
    console.log("API Response:", response);
    
    if (response && Array.isArray(response.devices)) {
      devices = response.devices;
    } else {
      // Handle cases where response or response.devices is not what we expect
      console.error("Received unexpected data structure:", response);
      error = "Received unexpected data structure from the API.";
    }
  } catch (e: any) {
    console.error("Failed to fetch devices:", e);
    error = e.message;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Device Slug Test Page</h1>
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <h2 className="text-xl font-bold mt-6 mb-2">Fetched Device Slugs:</h2>
      {devices.length > 0 ? (
        <ul>
          {devices.map((device) => (
            <li key={device.slug} className="font-mono">
              {device.slug}
            </li>
          ))}
        </ul>
      ) : (
        <p>No devices found or there was an error.</p>
      )}
    </div>
  );
};

export default TestDevicesPage;
