"use client";

import React, { useState, useEffect } from 'react';
import { Device } from '@shared/types';

interface SpecsTableProps {
  device: Device;
}

const SpecsTable: React.FC<SpecsTableProps> = ({ device }) => {
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks must run before the "no specs" early return below, so hook
  // order stays stable when device.specs appears between renders.
  // Deferred via a local step so the effect body itself performs no
  // synchronous state updates.
  useEffect(() => {
    const initExpansion = () => {
      if (!device?.specs) return;
      const categories = Array.isArray(device.specs)
        ? Array.from(new Set(device.specs.map((spec) => spec.category)))
        : Object.keys(device.specs);
      const initialExpansionState: { [key: string]: boolean } = {};
      categories.forEach(category => {
        initialExpansionState[category] = true;
      });
      setExpandedCategories(initialExpansionState);
    };
    initExpansion();
  }, [device.specs]);

  if (!device || !device.specs) {
    return (
      <div className="bg-surface-container-low shadow-md md:shadow-none rounded-xl p-8 text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          No specifications available for this device.
        </p>
      </div>
    );
  }

  // Group specs by category
  const categorizedSpecs: { [category: string]: { [key: string]: string } } = {};

  let specsArray: { category: string; key: string; value: string }[] = [];
  if (Array.isArray(device.specs)) {
    specsArray = device.specs.map(s => ({ category: s.category, key: s.key, value: s.value }));
  } else if (typeof device.specs === 'object' && device.specs !== null) {
    specsArray = Object.keys(device.specs).map(key => ({
      category: 'General',
      key: key,
      value: String((device.specs as unknown as Record<string, string>)[key])
    }));
  }

  specsArray.forEach(spec => {
    if (!categorizedSpecs[spec.category]) {
      categorizedSpecs[spec.category] = {};
    }
    categorizedSpecs[spec.category][spec.key] = spec.value;
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSpecs = Object.fromEntries(
    Object.entries(categorizedSpecs)
      .map(([category, specs]) => [category, Object.fromEntries(
        Object.entries(specs).filter(([name, value]) =>
          !normalizedQuery || `${category} ${name} ${value}`.toLowerCase().includes(normalizedQuery)
        )
      )])
      .filter(([, specs]) => Object.keys(specs as object).length > 0)
  ) as typeof categorizedSpecs;

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prevState => ({
      ...prevState,
      [categoryName]: !prevState[categoryName],
    }));
  };

  const handleCopyToClipboard = () => {
    let specText = `${device.brand} ${device.model} Specifications:\n\n`;

    Object.keys(categorizedSpecs).forEach(categoryName => {
      specText += `--- ${categoryName} ---\n`;
      Object.keys(categorizedSpecs[categoryName]).forEach(specName => {
        specText += `${specName}: ${categorizedSpecs[categoryName][specName]}\n`;
      });
      specText += '\n';
    });

    navigator.clipboard.writeText(specText)
      .then(() => {
        setCopyFeedback('Copied!');
        setTimeout(() => setCopyFeedback(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        setCopyFeedback('Error!');
        setTimeout(() => setCopyFeedback(null), 2000);
      });
  };

  return (
    <div className="bg-surface-container-low shadow-md md:shadow-none rounded-xl overflow-hidden">
      <div className="p-space-lg border-b border-outline-variant flex justify-between items-center">
        <div className="flex items-center gap-space-md">
          <div className="w-9 h-9 rounded bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-on-primary-container" aria-hidden="true">
              checklist
            </span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Full Specifications</h2>
        </div>
        <button
          onClick={handleCopyToClipboard}
          className="h-9 px-space-md flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors active:scale-[0.98]"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${copyFeedback === 'Copied!' ? 'text-tertiary' : ''}`}
            aria-hidden="true"
          >
            {copyFeedback === 'Copied!' ? 'check' : 'content_copy'}
          </span>
          <span className={copyFeedback === 'Copied!' ? 'text-tertiary' : ''}>
            {copyFeedback || 'Copy Specs'}
          </span>
        </button>
      </div>

      <div className="p-2">
        <div className="px-2 pb-3">
          <input
            type="search"
            placeholder="Search specs"
            aria-label="Search specs"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full h-8 rounded-lg border border-outline-variant bg-surface-container px-3 font-body-md text-body-md text-on-surface placeholder-outline outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>
        {Object.keys(filteredSpecs).length > 0 ? (
          Object.keys(filteredSpecs).map((categoryName) => (
            <div key={categoryName} className="mb-2 last:mb-0">
              <button
                className={`sticky top-14 z-10 w-full flex justify-between items-center p-space-md rounded-lg transition-colors ${
                  expandedCategories[categoryName]
                    ? 'bg-surface-container text-on-surface'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                }`}
                onClick={() => toggleCategory(categoryName)}
                aria-expanded={expandedCategories[categoryName]}
              >
                <span className="font-label-sm text-label-sm uppercase tracking-wider">{categoryName}</span>
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant"
                  aria-hidden="true"
                >
                  {expandedCategories[categoryName] ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {expandedCategories[categoryName] && (
                <div className="px-space-md py-2">
                  <table className="w-full">
                    <tbody className="divide-y divide-outline-variant/50">
                      {Object.keys(filteredSpecs[categoryName]).map((specName) => (
                        <tr key={specName} className="group">
                          <td className="py-2.5 pr-4 font-label-xs text-label-xs text-outline uppercase tracking-wider w-24 md:w-[28%] align-top group-hover:text-secondary transition-colors">
                            {specName}
                          </td>
                          <td className="py-2.5 font-body-md text-body-md text-on-surface leading-relaxed tabular-nums">
                            {filteredSpecs[categoryName][specName]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center font-body-md text-body-md text-on-surface-variant">
            {normalizedQuery ? 'No matching specifications found.' : 'No detailed specifications available.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecsTable;
