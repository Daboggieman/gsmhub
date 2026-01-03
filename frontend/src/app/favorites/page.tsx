"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Device } from '../../../../shared/src/types';
import DeviceCard from '@/components/devices/DeviceCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/'); // Redirect if not logged in
            return;
        }

        if (user) {
            const fetchFavorites = async () => {
                try {
                    const data = await apiClient.getFavorites();
                    setFavorites(data);
                } catch (error) {
                    console.error('Failed to fetch favorites:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchFavorites();
        }
    }, [user, authLoading, router]);

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'My Favorites', href: '/favorites' },
    ];

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <main className="flex-grow container mx-auto px-4 py-8">
                <Breadcrumbs items={breadcrumbItems} />

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center">
                        <FontAwesomeIcon icon={faHeart} className="text-red-500 mr-3" />
                        My Favorites
                    </h1>
                    <p className="text-gray-600">
                        Devices you have marked as a fan of.
                    </p>
                </div>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {favorites.map((device) => (
                            <DeviceCard key={device._id} device={device} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faHeart} className="text-red-300 text-4xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No favorites yet</h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Start adding devices to your favorites list by clicking the "Become a fan" button on any device page.
                        </p>
                        <button
                            onClick={() => router.push('/search')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            Brows Devices
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
