"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Device } from '@shared/types';
import DeviceCard from '@/components/devices/DeviceCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
    const { user, isLoading: authLoading } = useAuth();
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
        { name: 'Home', href: '/' },
        { name: 'My Favorites', href: '/favorites' },
    ];

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-secondary animate-spin" aria-hidden="true">progress_activity</span>
            </div>
        );
    }

    return (
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-space-md lg:px-space-lg py-space-lg">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mb-space-lg">
                <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface mb-space-xs flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[28px] text-error" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">favorite</span>
                    My Favorites
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                    Devices you have marked as a fan of.
                </p>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-lg">
                    {favorites.map((device) => (
                        <DeviceCard key={device._id} device={device} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface-container-low rounded-xl shadow-md md:shadow-none">
                    <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mx-auto mb-space-lg">
                        <span className="material-symbols-outlined text-[40px] text-error opacity-60" aria-hidden="true">favorite</span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">No favorites yet</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-space-lg">
                        Start adding devices to your favorites list by clicking the &quot;Become a fan&quot; button on any device page.
                    </p>
                    <button
                        onClick={() => router.push('/search')}
                        className="bg-primary-container hover:bg-inverse-primary text-on-primary-container px-space-xl py-3 rounded-lg font-label-md font-bold transition-colors active:scale-[0.98]"
                    >
                        Browse Devices
                    </button>
                </div>
            )}
        </main>
    );
}
