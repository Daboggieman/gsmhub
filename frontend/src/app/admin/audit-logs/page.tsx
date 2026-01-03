"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Pagination from '@/components/ui/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHistory,
    faFilter,
    faSearch,
    faInfoCircle,
    faUser,
    faCalendarAlt,
    faTag
} from '@fortawesome/free-solid-svg-icons';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    const [filters, setFilters] = useState({
        action: '',
        targetType: '',
        userId: ''
    });

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getAuditLogs({
                page,
                limit,
                ...filters
            });
            setLogs(data.logs);
            setTotal(data.total);
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbItems = [
        { name: 'Admin', href: '/admin/dashboard' },
        { name: 'Audit Logs', href: '/admin/audit-logs' },
    ];

    const totalPages = Math.ceil(total / limit);

    const getActionColor = (action: string) => {
        if (action.includes('POST')) return 'text-green-600 bg-green-50';
        if (action.includes('PATCH')) return 'text-blue-600 bg-blue-50';
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex justify-between items-center mb-8 mt-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FontAwesomeIcon icon={faHistory} className="text-blue-500" />
                        Audit Logs
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Track administrative actions and system modifications.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Action Type</label>
                    <select
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
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
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Resource Type</label>
                    <select
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={filters.targetType}
                        onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
                    >
                        <option value="">All Resources</option>
                        <option value="devices">Devices</option>
                        <option value="categories">Categories</option>
                        <option value="brands">Brands</option>
                        <option value="prices">Prices</option>
                    </select>
                </div>
                <div className="md:col-span-2 flex items-end">
                    <button
                        onClick={() => { setFilters({ action: '', targetType: '', userId: '' }); setPage(1); }}
                        className="p-3 text-red-500 font-black text-xs uppercase tracking-widest hover:underline"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-6 border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">Time</th>
                                <th className="p-6 border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">Admin</th>
                                <th className="p-6 border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">Action</th>
                                <th className="p-6 border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">Target</th>
                                <th className="p-6 border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500 font-bold">No logs found matching your filters.</td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6 text-sm font-medium text-gray-500">
                                        <div className="flex flex-col">
                                            <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] uppercase font-black text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-black">
                                                {log.user?.name?.charAt(0) || <FontAwesomeIcon icon={faUser} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{log.user?.name || 'Unknown'}</span>
                                                <span className="text-[10px] font-medium text-gray-400">{log.user?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                                            {log.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-black uppercase text-gray-500">{log.targetType}</span>
                                            <span className="text-sm font-bold text-gray-700 truncate max-w-[150px]">{log.targetId}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => console.log('Details:', log.details)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            title="View Payload"
                                        >
                                            <FontAwesomeIcon icon={faInfoCircle} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-gray-50 flex justify-center">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            baseUrl="/admin/audit-logs"
                            searchParams={{
                                action: filters.action,
                                targetType: filters.targetType,
                                userId: filters.userId
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
