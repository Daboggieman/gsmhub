"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, AuditLogEntry } from '@/lib/api';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Pagination from '@/components/ui/Pagination';

const LIMIT = 20;

function AuditLogsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL is the source of truth so the Pagination component's links
    // (which change ?page=&action=…) actually move the list.
    const page = Number(searchParams.get('page')) || 1;
    const filters = {
        action: searchParams.get('action') || '',
        targetType: searchParams.get('targetType') || '',
        userId: searchParams.get('userId') || ''
    };

    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    // Bumped by the manual refresh button to re-run the fetch effect.
    const [refreshTick, setRefreshTick] = useState(0);

    // Primitive filter values as deps — a `filters` object literal would
    // be a new identity every render and re-fire the effect endlessly.
    const action = searchParams.get('action') || '';
    const targetType = searchParams.get('targetType') || '';
    const userId = searchParams.get('userId') || '';

    useEffect(() => {
        let cancelled = false;
        const load = async (silent = false) => {
            if (!silent) setLoading(true);
            try {
                const data = await apiClient.getAuditLogs({
                    page,
                    limit: LIMIT,
                    action,
                    targetType,
                    userId
                });
                if (cancelled) return;
                setLogs(data.logs);
                setTotal(data.total);
            } catch (err) {
                console.error('Failed to fetch audit logs', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();

        // Auto-refresh logic (silent — no loading spinner).
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isAutoRefresh) {
            interval = setInterval(() => {
                load(true);
            }, 30000); // 30 seconds
        }
        return () => {
            cancelled = true;
            if (interval) clearInterval(interval);
        };
    }, [isAutoRefresh, page, refreshTick, action, targetType, userId]);

    /** Push a filter change into the URL, resetting to page 1. */
    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page');
        router.push(`/admin/audit-logs?${params.toString()}`);
    };

    const breadcrumbItems = [
        { name: 'Admin', href: '/admin/dashboard' },
        { name: 'Audit Logs', href: '/admin/audit-logs' },
    ];

    const totalPages = Math.ceil(total / LIMIT);

    const getActionColor = (action: string) => {
        if (action.includes('POST')) return 'bg-tertiary-container/15 text-tertiary';
        if (action.includes('PATCH')) return 'bg-secondary-container/15 text-secondary-container';
        if (action.includes('DELETE')) return 'bg-error-container/15 text-error';
        return 'bg-surface-container-highest text-on-surface-variant';
    };

    // Audit-log user references can be a populated object or a bare id string.
    const logUserName = (u: AuditLogEntry['user']) =>
        typeof u === 'object' && u ? u.name : undefined;
    const logUserEmail = (u: AuditLogEntry['user']) =>
        typeof u === 'object' && u ? u.email : undefined;

    return (
        <div className="max-w-7xl mx-auto">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mb-space-lg mt-space-md flex flex-wrap items-center justify-between gap-space-md">
                <div>
                    <h1 className="flex items-center gap-space-sm font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
                        <span className="material-symbols-outlined text-[24px] text-secondary" aria-hidden="true">history</span>
                        Audit Logs
                    </h1>
                    <p className="mt-1 font-body-md text-on-surface-variant">Track administrative actions and system modifications.</p>
                </div>
                <div className="flex items-center gap-space-md">
                    <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-space-md py-2 shadow-md md:shadow-none">
                        <div className={`h-2 w-2 rounded-full ${isAutoRefresh ? 'animate-pulse bg-tertiary' : 'bg-outline'}`}></div>
                        <span className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Live Updates</span>
                        <button
                            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                            className={`ml-2 font-label-xs text-label-xs font-bold uppercase tracking-widest ${isAutoRefresh ? 'text-secondary' : 'text-outline hover:text-on-surface'}`}
                        >
                            {isAutoRefresh ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                    <button
                        onClick={() => setRefreshTick((t) => t + 1)}
                        className="rounded-lg bg-surface-container-highest p-2.5 text-on-surface transition-colors hover:brightness-110"
                        aria-label="Refresh logs"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${loading ? 'progress_activity animate-spin' : ''}`} aria-hidden="true">{loading ? '' : 'refresh'}</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-space-lg grid grid-cols-1 gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-md md:shadow-none md:grid-cols-4">
                <div>
                    <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Action Type</label>
                    <select
                        className="w-full rounded-lg border border-outline-variant bg-surface-container p-2.5 font-label-md text-on-surface outline-none focus:border-transparent focus:ring-1 focus:ring-primary"
                        value={filters.action}
                        onChange={(e) => updateFilter('action', e.target.value)}
                    >
                        <option value="">All Actions</option>
                        <option value="POST_DEVICES">Create Device</option>
                        <option value="PATCH_DEVICES">Update Device</option>
                        <option value="DELETE_DEVICES">Delete Device</option>
                        <option value="POST_CATEGORIES">Create Category</option>
                        <option value="PATCH_CATEGORIES">Update Category</option>
                        <option value="DELETE_CATEGORIES">Delete Category</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Resource Type</label>
                    <select
                        className="w-full rounded-lg border border-outline-variant bg-surface-container p-2.5 font-label-md text-on-surface outline-none focus:border-transparent focus:ring-1 focus:ring-primary"
                        value={filters.targetType}
                        onChange={(e) => updateFilter('targetType', e.target.value)}
                    >
                        <option value="">All Resources</option>
                        <option value="devices">Devices</option>
                        <option value="categories">Categories</option>
                        <option value="brands">Brands</option>
                        <option value="prices">Prices</option>
                    </select>
                </div>
                <div className="flex items-end md:col-span-2">
                    <button
                        onClick={() => router.push('/admin/audit-logs')}
                        className="p-2.5 font-label-sm text-label-sm font-bold uppercase tracking-widest text-error hover:underline"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-outline-variant bg-surface-container">
                                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Time</th>
                                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Admin</th>
                                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Action</th>
                                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Target</th>
                                <th className="px-space-lg py-space-md text-right font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/40">
                            {loading && logs.length === 0 ? (
                                <tr key="loading-row">
                                    <td colSpan={5} className="px-space-lg py-space-xl text-center">
                                        <span className="material-symbols-outlined progress_activity animate-spin mx-auto block text-[32px] text-secondary" aria-hidden="true"></span>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr key="empty-row">
                                    <td colSpan={5} className="px-space-lg py-space-xl text-center font-label-md font-bold text-outline">No logs found matching your filters.</td>
                                </tr>
                            ) : logs.map((log) => (
                                <React.Fragment key={log._id}>
                                    <tr className="group cursor-pointer transition-colors hover:bg-surface-container" onClick={() => setExpandedId(expandedId === log._id ? null : log._id ?? null)}>
                                        <td className="px-space-lg py-space-md font-body-sm text-on-surface-variant tabular-nums">
                                            <div className="flex flex-col">
                                                <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                                <span className="font-label-xs text-label-xs font-bold uppercase text-outline">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-space-lg py-space-md">
                                            <div className="flex items-center gap-space-md">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container font-label-xs text-label-xs font-bold text-on-primary-container">
                                                    {logUserName(log.user)?.charAt(0) || <span className="material-symbols-outlined text-[14px]" aria-hidden="true">person</span>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-label-md font-bold text-on-surface">{logUserName(log.user) || 'Unknown'}</span>
                                                    <span className="font-label-xs text-outline">{logUserEmail(log.user)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-space-lg py-space-md">
                                            <span className={`rounded px-2 py-1 font-label-xs text-label-xs font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-space-lg py-space-md">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-surface-container-highest px-2 py-0.5 font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">{log.targetType}</span>
                                                <span className="max-w-[150px] truncate font-body-sm font-bold text-on-surface-variant">{log.targetId}</span>
                                            </div>
                                        </td>
                                        <td className="px-space-lg py-space-md text-right">
                                            <span className="material-symbols-outlined text-[20px] text-outline transition-colors group-hover:text-secondary" aria-hidden="true">
                                                {expandedId === log._id ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </td>
                                    </tr>
                                    {expandedId === log._id && (
                                        <tr className="bg-surface-container">
                                            <td colSpan={5} className="p-space-lg">
                                                <div className="overflow-x-auto rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-space-lg">
                                                    <h4 className="mb-space-md flex items-center gap-2 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                                                        <span className="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">info</span>
                                                        Change Details (Payload)
                                                    </h4>
                                                    <pre className="overflow-x-auto rounded-lg border border-outline-variant/50 bg-surface-container p-space-md font-body-sm text-on-surface">
                                                        {JSON.stringify(log.details || {}, null, 2)}
                                                    </pre>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center border-t border-outline-variant bg-surface-container p-space-lg">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            baseUrl="/admin/audit-logs"
                            searchParams={Object.fromEntries(searchParams.entries())}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AuditLogsPage() {
    return (
        <Suspense fallback={null}>
            <AuditLogsPageContent />
        </Suspense>
    );
}
