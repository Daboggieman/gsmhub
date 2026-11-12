"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
    deviceId?: string;
    initialIsFavorited?: boolean;
}

export default function FavoriteButton({ deviceId, initialIsFavorited = false }: FavoriteButtonProps) {
    const { user, isLoading: authLoading } = useAuth();
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Seed `isFavorited` from the user's favorites when the user or
    // device changes — adjusted during render (documented prop-change
    // pattern) so no cascading effect render is needed.
    const [prevUser, setPrevUser] = useState(user);
    const [prevDeviceId, setPrevDeviceId] = useState(deviceId);
    if (prevUser !== user || prevDeviceId !== deviceId) {
        setPrevUser(user);
        setPrevDeviceId(deviceId);
        const favorites = user
            ? (user as { favorites?: (string | { _id?: string })[] }).favorites
            : undefined;
        if (favorites) {
            setIsFavorited(
                favorites.some((f) => (typeof f === 'string' ? f : f._id) === deviceId),
            );
        }
    }

    const handleToggle = async () => {
        if (!deviceId) return;
        if (!user) {
            // Redirect to login or show modal
            router.push('/login'); // Assuming we have a login route, or we trigger auth modal
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.toggleFavorite(deviceId);
            setIsFavorited(response.isFavorited);

            // Optional: Refresh auth context/user to update local favorites list
            // await refreshUser();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return <div className="animate-pulse w-8 h-8 bg-surface-container rounded-full" aria-hidden="true" />;
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            aria-pressed={isFavorited}
            className={`px-space-lg py-2.5 rounded-lg font-label-md font-bold flex items-center gap-space-xs transition-colors active:scale-[0.98] disabled:opacity-60 ${isFavorited
                ? 'bg-error-container text-on-error-container hover:brightness-110'
                : 'border border-outline-variant text-error hover:bg-error-container/15'
                }`}
        >
            <span
                className={`material-symbols-outlined text-[20px] ${isLoading ? 'animate-pulse' : ''}`}
                style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : undefined}
                aria-hidden="true"
            >
                favorite
            </span>
            {isFavorited ? 'Fan' : 'Become a fan'}
        </button>
    );
}
