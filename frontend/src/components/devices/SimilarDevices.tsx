"use client";

import React, { useEffect, useState } from 'react';
import { Device } from '@shared/types';
import DeviceCard from './DeviceCard';
import { apiClient } from '@/lib/api';

interface SimilarDevicesProps {
    deviceId: string;
}

const SimilarDevices: React.FC<SimilarDevicesProps> = ({ deviceId }) => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                setLoading(true);
                const data = await apiClient.getSimilarDevices(deviceId);
                setDevices(data);
            } catch (error) {
                console.error('Failed to fetch similar devices:', error);
            } finally {
                setLoading(false);
            }
        };

        if (deviceId) {
            fetchSimilar();
        }
    }, [deviceId]);

    if (loading) {
        return (
            <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Similar Devices</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (devices.length === 0) return null;

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Similar Devices</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {devices.map((device) => (
                    <DeviceCard key={device._id?.toString() || (device as any).id} device={device} />
                ))}
            </div>
        </div>
    );
};

export default SimilarDevices;
