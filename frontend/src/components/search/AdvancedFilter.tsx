import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Category } from '../../../../shared/src/types';

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
    onUpdate: (newFilters: Record<string, any>) => void;
    onClear: () => void;
}

const FilterSection = ({ title, children, isOpenDefault = false }: { title: string, children: React.ReactNode, isOpenDefault?: boolean }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);
    return (
        <div className="border-b border-gray-100 last:border-0 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left font-bold text-gray-700 text-sm uppercase tracking-wider mb-2"
            >
                {title}
                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-gray-400 text-xs" />
            </button>
            {isOpen && <div className="mt-2 space-y-2 animate-fadeIn">{children}</div>}
        </div>
    );
};

const RangeInput = ({
    label,
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
        <div className="flex items-center space-x-2">
            <div className="relative flex-1">
                <input
                    type="number"
                    placeholder="Min"
                    value={minVal}
                    onChange={(e) => setMinVal(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500 transition-colors"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative flex-1">
                <input
                    type="number"
                    placeholder="Max"
                    value={maxVal}
                    onChange={(e) => setMaxVal(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500 transition-colors"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>
            </div>
        </div>
    );
};

export default function AdvancedFilter({ filters, categories, availableBrands, onUpdate, onClear }: FilterProps) {
    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <FontAwesomeIcon icon={faFilter} className="mr-2 text-blue-500" />
                    Filters
                </h2>
                {hasActiveFilters && (
                    <button
                        onClick={onClear}
                        className="text-xs text-red-500 font-bold hover:underline flex items-center"
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-1" /> Clear
                    </button>
                )}
            </div>

            <div className="divide-y divide-gray-100">
                <FilterSection title="Brand" isOpenDefault={true}>
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        {availableBrands.map(b => (
                            <label key={b} className="flex items-center group cursor-pointer py-1">
                                <input
                                    type="radio"
                                    name="brand"
                                    checked={filters.brand === b}
                                    onChange={() => onUpdate({ brand: b })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm text-gray-600 group-hover:text-blue-600 transition-colors truncate">
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
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.slug} value={(cat as any)._id || cat.id}>{cat.name}</option>
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
