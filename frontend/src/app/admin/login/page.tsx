"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from '@/lib/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.user.role !== 'admin') {
        throw new Error('Unauthorized access');
      }

      login(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-space-md py-space-xl">
      <div className="w-full max-w-md rounded-xl bg-surface-container-low p-space-xl shadow-md md:shadow-none">
        <div className="mb-space-lg flex flex-col items-center text-center">
          <div className="mb-space-md flex h-14 w-14 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">admin_panel_settings</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            GSMHub Admin Login
          </h2>
        </div>
        <form className="space-y-space-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-error-container bg-error-container/15 p-space-md font-body-sm text-error">
              {error}
            </div>
          )}
          <div className="space-y-space-md">
            <div>
              <label htmlFor="email-address" className="mb-1 block font-label-sm text-label-sm font-bold text-on-surface-variant">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 font-body-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block font-label-sm text-label-sm font-bold text-on-surface-variant">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 font-body-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-lg bg-primary-container px-space-md py-3 font-label-md font-bold text-on-primary-container transition-colors hover:bg-inverse-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
