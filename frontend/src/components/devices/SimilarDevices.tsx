"use client";

import React, { useEffect, useState } from 'react';
import { Device } from '@shared/types';
import DeviceCard from './DeviceCard';
import { apiClient } from '@/lib/api';

interface SimilarDevicesProps {
    deviceId?: string;
}

const SimilarDevices: React.FC<SimilarDevicesProps> = ({ deviceId }) => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!deviceId) return;
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

        fetchSimilar();
    }, [deviceId]);

    if (loading) {
        return (
            <div className="mt-space-lg">
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-space-md">Similar Devices</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-md">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-surface-container-high h-64 rounded-xl" aria-hidden="true"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (devices.length === 0) return null;

    return (
        <div className="mt-space-lg">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-space-md pb-space-sm border-b border-outline-variant">Similar Devices</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {devices.map((device) => (
                    <DeviceCard key={device._id?.toString() || (device as { id?: string }).id} device={device} />
                ))}
            </div>
        </div>
    );
};

export default SimilarDevices;
