"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
    deviceId: string;
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

    if (authLoading) return <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-full"></div>;

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`ml-auto px-6 py-3 rounded-lg transition-all font-bold text-sm flex items-center ${isFavorited
                ? 'text-white bg-red-600 hover:bg-red-700 shadow-md transform hover:-translate-y-0.5'
                : 'text-red-600 hover:bg-red-50 border border-red-100'
                }`}
        >
            <FontAwesomeIcon
                icon={isFavorited ? faHeartSolid : faHeartSolid}
                className={`mr-2 ${isLoading ? 'animate-pulse' : ''} ${!isFavorited ? 'opacity-50' : ''}`}
            />
            {isFavorited ? 'Fan' : 'Become a fan'}
        </button>
    );
}
