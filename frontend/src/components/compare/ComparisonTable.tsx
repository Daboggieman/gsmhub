"use client";

import React, { useState } from 'react';
import DeviceImage from '../devices/DeviceImage';
import { Device } from '@shared/types';
import Badge from '../ui/Badge';

interface ComparisonTableProps {
  comparisonData: {
    devices: Device[];
    comparison: {
      category: string;
      item: string;
      values: string[];
      difference?: string;
      betterIndex?: number;
    }[];
  };
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ comparisonData }) => {
  const { devices, comparison = [] } = comparisonData || {};
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>(() => {
    // Expand all by default
    const cats = [...new Set(comparison.map(c => c.category))];
    return Object.fromEntries(cats.map(c => [c, true]));
  });

  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);
  const [highlightDiffs, setHighlightDiffs] = useState(true);

  if (!comparison || comparison.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-container-low rounded-xl shadow-md md:shadow-none">
        <p className="font-body-md text-body-md font-bold text-on-surface">No comparison data available.</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Select at least two devices to compare their specifications.
        </p>
      </div>
    );
  }

  if (!devices || devices.length === 0) return null;

  // Helper to check if a row has differences
  const hasDifference = (row: { values: string[] }) => {
    if (row.values.length < 2) return false;
    const firstVal = row.values[0];
    return row.values.some((v: string) => v !== firstVal);
  };

  // Cheapest price across all devices that report one ("Best Price" badge)
  const prices = devices
    .map((d: { latestPrice?: number }) => (typeof d.latestPrice === 'number' ? d.latestPrice : null))
    .filter((p): p is number => p !== null);
  const bestPrice = prices.length >= 2 ? Math.min(...prices) : null;

  // Group comparison rows by category and apply filters
  type ComparisonRow = typeof comparison[number];
  const categorizedComparison: { [category: string]: ComparisonRow[] } = {};
  comparison.forEach(row => {
    if (showOnlyDiffs && !hasDifference(row)) return;

    if (!categorizedComparison[row.category]) {
      categorizedComparison[row.category] = [];
    }
    categorizedComparison[row.category].push(row);
  });

  const categories = Object.keys(categorizedComparison).sort();

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-space-lg bg-surface-container-low p-space-md rounded-xl">
        <label className="flex items-center gap-space-xs cursor-pointer group">
          <input
            type="checkbox"
            checked={highlightDiffs}
            onChange={(e) => setHighlightDiffs(e.target.checked)}
            className="w-3.5 h-3.5 rounded bg-surface-container-highest accent-secondary-container"
          />
          <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
            Highlight Differences
          </span>
        </label>

        <label className="flex items-center gap-space-xs cursor-pointer group">
          <input
            type="checkbox"
            checked={showOnlyDiffs}
            onChange={(e) => setShowOnlyDiffs(e.target.checked)}
            className="w-3.5 h-3.5 rounded bg-surface-container-highest accent-secondary-container"
          />
          <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
            Hide Similarities
          </span>
        </label>
      </div>

      <div className="bg-surface-container-low rounded-xl shadow-md md:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container">
                <th className="p-space-md text-left border-b border-outline-variant bg-surface-container-low sticky left-0 z-10 min-w-[104px] md:min-w-[200px]">
                  <div className="flex items-center gap-space-xs text-secondary-container">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">compare_arrows</span>
                    <span className="font-label-xs text-label-xs uppercase tracking-wider">Specifications</span>
                  </div>
                </th>
                {devices.map((device, idx) => (
                  <th key={device.slug} className="p-space-md text-center border-b border-outline-variant min-w-[240px] md:min-w-[280px]">
                    <div className="flex flex-col items-center">
                      <div className="relative w-28 h-40 mb-space-sm bg-surface-container rounded-lg p-2">
                        {device.imageUrl ? (
                          <DeviceImage
                            src={device.imageUrl}
                            alt={device.name || 'Device image'}
                            style={{ objectFit: 'contain' }}
                            className="p-2 transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-outline-variant bg-surface-container-lowest/60 rounded">
                            <span className="material-symbols-outlined text-[32px]" aria-hidden="true">image</span>
                          </div>
                        )}
                      </div>
                      <Badge variant={idx === 0 ? 'primary' : 'secondary'} size="xs" className="mb-2">
                        Device {idx + 1}
                      </Badge>
                      <span
                        className="font-headline-md text-headline-md text-on-surface leading-tight mb-1 line-clamp-2"
                        title={device.name || device.model}
                      >
                        {device.model}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        {device.brand}
                      </span>

                      {typeof device.latestPrice === 'number' && (
                        <div className="mt-space-md flex flex-col items-center gap-1">
                          <span className="font-label-md text-label-md text-tertiary font-bold tabular-nums">
                            ${device.latestPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                          {bestPrice !== null && device.latestPrice === bestPrice && (
                            <Badge variant="success" size="xs">Best Price</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <React.Fragment key={category}>
                  <tr
                    className="bg-surface-container cursor-pointer hover:bg-surface-container-high transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <td
                      colSpan={devices.length + 1}
                      className="p-space-md font-label-sm text-label-sm uppercase tracking-wider text-on-surface"
                    >
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden="true">
                          {expandedCategories[category] ? 'expand_less' : 'expand_more'}
                        </span>
                        {category}
                        <span className="font-label-xs text-label-xs font-bold text-outline normal-case ml-space-xs">
                          ({categorizedComparison[category].length} specs)
                        </span>
                      </div>
                    </td>
                  </tr>
                  {expandedCategories[category] && categorizedComparison[category].map((row, rowIdx) => (
                    <tr
                      key={`${category}-${row.item}`}
                      className={`group transition-colors ${rowIdx % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container-lowest/40'} hover:bg-surface-container/60`}
                    >
                      <td className="p-space-md border-b border-outline-variant/50 font-label-xs text-label-xs text-outline uppercase tracking-wider bg-surface-container-low sticky left-0 z-10 group-hover:text-on-surface transition-colors relative">
                        {row.item}
                        {highlightDiffs && hasDifference(row) && (
                          <div className="w-1 h-full bg-secondary-container absolute left-0 top-0" aria-hidden="true" />
                        )}
                      </td>
                      {row.values.map((val: string, idx: number) => {
                        const isWinner = row.betterIndex === idx;
                        const isLoser = row.betterIndex !== undefined && row.betterIndex !== idx;

                        return (
                          <td
                            key={idx}
                            className={`p-space-md border-b border-outline-variant/50 font-body-md text-body-md leading-relaxed text-center
                            ${isWinner ? 'bg-tertiary-container/15' : ''}
                            ${isLoser ? 'bg-error-container/10' : ''}
                            ${highlightDiffs && hasDifference(row) && !isWinner && !isLoser ? 'bg-secondary-container/5' : ''}
                          `}
                          >
                            <div className="flex flex-col items-center gap-1.5">
                              <span className={`${isWinner ? 'font-bold text-tertiary' : 'text-on-surface'}`}>
                                {val}
                              </span>

                              {isWinner && row.difference && (
                                <Badge variant="success" size="xs">
                                  {row.difference} Better
                                </Badge>
                              )}

                              {isWinner && (
                                <span className="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">
                                  check_circle
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-space-lg bg-surface-container border-t border-outline-variant text-center">
          <p className="font-label-xs text-label-xs text-outline">
            * Highlighting indicates the superior specification based on common industry standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
