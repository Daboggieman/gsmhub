"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
    deviceId: string;
    initialIsFavorited?: boolean;
}

export default function FavoriteButton({ deviceId, initialIsFavorited = false }: FavoriteButtonProps) {
    const { user, loading } = useAuth();
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // If we wanted to double check status on mount, we could, 
        // but typically we trust the parent or just rely on user action.
        // Ideally, the parent passes correct initial state.
        // For now, if user is logged in, we might want to check?
        // Let's rely on simple toggling for now to save requests, 
        // or checks in a real app would be done via a bulk 'am I favoriting this?' or user profile load.
        if (user && user.favorites) {
            // user.favorites from context might be just IDs or Objects. 
            // Let's assume the auth context might need a refresh or we check against it if it's populated.
            // For simplicity in this MVP, we assume isFavorited starts false unless passed true,
            // OR we check against the user object if it contains favorites.
            const isFav = user.favorites.some((f: any) => (typeof f === 'string' ? f : f._id) === deviceId);
            setIsFavorited(isFav);
        }
    }, [user, deviceId]);

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

    if (loading) return <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-full"></div>;

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
                icon={isFavorited ? faHeartSolid : faHeartRegular}
                className={`mr-2 ${isLoading ? 'animate-pulse' : ''}`}
            />
            {isFavorited ? 'Fan' : 'Become a fan'}
        </button>
    );
}
