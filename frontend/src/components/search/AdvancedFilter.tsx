import React, { useState } from 'react';
import { Category } from '@shared/types';

interface FilterProps {
    filters: {
        brand?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        minRam?: number;
        maxRam?: number;
        minStorage?: number;
        maxStorage?: number;
        minBattery?: number;
        maxBattery?: number;
        minDisplay?: number;
        maxDisplay?: number;
    };
    categories: Category[];
    availableBrands: string[];
    onUpdate: (newFilters: Record<string, unknown>) => void;
    onClear: () => void;
}

const FilterSection = ({ title, children, isOpenDefault = false }: { title: string, children: React.ReactNode, isOpenDefault?: boolean }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);
    return (
        <div className="border-b border-outline-variant/50 last:border-0 py-space-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="flex justify-between items-center w-full text-left font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider"
            >
                {title}
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>
            {isOpen && <div className="mt-space-sm space-y-1">{children}</div>}
        </div>
    );
};

const RangeInput = ({
    min,
    max,
    unit = '',
    onChange
}: {
    label: string,
    min?: number,
    max?: number,
    unit?: string,
    onChange: (min: number | undefined, max: number | undefined) => void
}) => {
    const [minVal, setMinVal] = useState(min?.toString() || '');
    const [maxVal, setMaxVal] = useState(max?.toString() || '');

    const handleBlur = () => {
        onChange(minVal ? Number(minVal) : undefined, maxVal ? Number(maxVal) : undefined);
    };

    return (
        <div className="flex items-center gap-space-sm">
            <div className="relative flex-1">
                <input
                    type="number"
                    placeholder="Min"
                    value={minVal}
                    onChange={(e) => setMinVal(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full p-2 pr-7 bg-surface-container border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder-outline outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors tabular-nums"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-label-xs text-label-xs text-outline">{unit}</span>
            </div>
            <span className="font-body-sm text-outline" aria-hidden="true">–</span>
            <div className="relative flex-1">
                <input
                    type="number"
                    placeholder="Max"
                    value={maxVal}
                    onChange={(e) => setMaxVal(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full p-2 pr-7 bg-surface-container border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder-outline outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors tabular-nums"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-label-xs text-label-xs text-outline">{unit}</span>
            </div>
        </div>
    );
};

export default function AdvancedFilter({ filters, categories, availableBrands, onUpdate, onClear }: FilterProps) {
    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

    return (
        <div className="bg-surface-container-low p-space-md md:p-space-lg rounded-xl shadow-md md:shadow-none">
            <div className="flex justify-between items-center mb-space-md">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-space-sm">
                    <span className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-on-primary-container" aria-hidden="true">filter_list</span>
                    </span>
                    Filters
                </h2>
                {hasActiveFilters && (
                    <button
                        onClick={onClear}
                        className="font-label-sm text-label-sm text-error font-bold hover:underline flex items-center gap-1 active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">close</span> Clear
                    </button>
                )}
            </div>

            <div className="divide-y divide-outline-variant/50">
                <FilterSection title="Brand" isOpenDefault={true}>
                    <div className="max-h-48 overflow-y-auto pr-space-sm space-y-1">
                        {availableBrands.map(b => (
                            <label key={b} className="flex items-center group cursor-pointer py-1">
                                <input
                                    type="radio"
                                    name="brand"
                                    checked={filters.brand === b}
                                    onChange={() => onUpdate({ brand: b })}
                                    className="w-3.5 h-3.5 rounded bg-surface-container-highest accent-secondary-container shrink-0"
                                />
                                <span className="ml-space-md font-body-sm text-body-sm text-on-surface-variant group-hover:text-secondary transition-colors truncate">
                                    {b}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection title="Category">
                    <select
                        value={filters.category || ''}
                        onChange={(e) => onUpdate({ category: e.target.value })}
                        className="w-full p-2 bg-surface-container border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.slug} value={(cat as { _id?: string })._id || cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </FilterSection>

                <FilterSection title="Price Range">
                    <RangeInput
                        label="Price"
                        unit="$"
                        min={filters.minPrice}
                        max={filters.maxPrice}
                        onChange={(min, max) => onUpdate({ minPrice: min, maxPrice: max })}
                    />
                </FilterSection>

                <FilterSection title="RAM (GB)">
                    <RangeInput
                        label="RAM"
                        unit="GB"
                        min={filters.minRam}
                        max={filters.maxRam}
                        onChange={(min, max) => onUpdate({ minRam: min, maxRam: max })}
                    />
                </FilterSection>

                <FilterSection title="Storage (GB)">
                    <RangeInput
                        label="Storage"
                        unit="GB"
                        min={filters.minStorage}
                        max={filters.maxStorage}
                        onChange={(min, max) => onUpdate({ minStorage: min, maxStorage: max })}
                    />
                </FilterSection>

                <FilterSection title="Battery (mAh)">
                    <RangeInput
                        label="Battery"
                        unit="mAh"
                        min={filters.minBattery}
                        max={filters.maxBattery}
                        onChange={(min, max) => onUpdate({ minBattery: min, maxBattery: max })}
                    />
                </FilterSection>

                <FilterSection title="Screen Size">
                    <RangeInput
                        label="Display"
                        unit='"'
                        min={filters.minDisplay}
                        max={filters.maxDisplay}
                        onChange={(min, max) => onUpdate({ minDisplay: min, maxDisplay: max })}
                    />
                </FilterSection>
            </div>
        </div>
    );
}
