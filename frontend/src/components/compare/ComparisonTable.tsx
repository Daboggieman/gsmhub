"use client";

import React from 'react';
import { Device, DeviceSpec } from '@shared/types';
import Image from 'next/image';

interface ComparisonTableProps {
  devices: Device[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ devices }) => {
  if (!devices || devices.length === 0) return null;

  // Extract all unique categories and keys across all devices
  const allSpecs: { [category: string]: Set<string> } = {};
  
  devices.forEach(device => {
    if (device.specs) {
      device.specs.forEach((spec: DeviceSpec) => {
        if (!allSpecs[spec.category]) {
          allSpecs[spec.category] = new Set<string>();
        }
        allSpecs[spec.category].add(spec.key);
      });
    }
  });

  const categories = Object.keys(allSpecs).sort();

  const getSpecValue = (device: Device, category: string, key: string) => {
    const spec = device.specs?.find(s => s.category === category && s.key === key);
    return spec ? spec.value : '-';
  };

  // Check if values are different across devices for a given spec
  const isDifferent = (category: string, key: string) => {
    if (devices.length < 2) return false;
    const values = devices.map(d => getSpecValue(d, category, key));
    return !values.every(v => v === values[0]);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-4 text-left font-bold text-gray-500 border-b border-gray-200 min-w-[200px]">Specifications</th>
            {devices.map(device => (
              <th key={device._id} className="p-4 text-center border-b border-gray-200 min-w-[250px]">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-32 mb-2">
                    {device.imageUrl ? (
                      <Image src={device.imageUrl} alt={device.name} fill style={{ objectFit: 'contain' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded">No Img</div>
                    )}
                  </div>
                  <span className="text-lg font-bold text-gray-800">{device.name}</span>
                  <span className="text-sm text-gray-500">{device.brand}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Summary Specs */}
          <tr className="bg-blue-50">
            <td className="p-4 font-bold text-blue-700 border-b border-gray-200">Price (approx.)</td>
            {devices.map(device => (
              <td key={device._id} className="p-4 text-center font-bold text-green-600 border-b border-gray-200">
                {device.latestPrice ? `$${device.latestPrice.toFixed(2)}` : 'N/A'}
              </td>
            ))}
          </tr>

          {categories.map(category => (
            <React.Fragment key={category}>
              <tr className="bg-gray-100">
                <td colSpan={devices.length + 1} className="p-3 font-black text-gray-700 uppercase tracking-wider text-sm">
                  {category}
                </td>
              </tr>
              {Array.from(allSpecs[category]).sort().map(key => (
                <tr key={`${category}-${key}`} className="hover:bg-gray-50 transition-colors">
                  <td className={`p-4 border-b border-gray-100 text-sm font-semibold text-gray-600 ${isDifferent(category, key) ? 'bg-yellow-50' : ''}`}>
                    {key}
                  </td>
                  {devices.map(device => (
                    <td key={device._id} className={`p-4 border-b border-gray-100 text-sm text-gray-800 text-center ${isDifferent(category, key) ? 'bg-yellow-50' : ''}`}>
                      {getSpecValue(device, category, key)}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
