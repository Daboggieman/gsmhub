"use client";

import { useEffect } from 'react';

export default function PWARegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (reg) => console.log('SW registered:', reg),
                    (err) => console.log('SW registration failed:', err)
                );
            });
        } else if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
            // Optional: register in dev for testing if needed, but usually we skip
            console.log('Skipping SW registration in development');
        }
    }, []);

    return null;
}
