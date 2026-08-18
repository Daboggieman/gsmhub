"use client";

import React, { useState, useEffect } from 'react';
import { Device } from '@shared/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faCheck,
  faChevronDown,
  faChevronUp,
  faListCheck
} from '@fortawesome/free-solid-svg-icons';

interface SpecsTableProps {
  device: Device;
}

const SpecsTable: React.FC<SpecsTableProps> = ({ device }) => {
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!device || !device.specs) {
    return (
      <div className="bg-white shadow-sm rounded-2xl p-8 text-center border border-gray-100">
        <p className="text-gray-500 font-medium">No specifications available for this device.</p>
      </div>
    );
  }

  // Group specs by category
  const categorizedSpecs: { [category: string]: { [key: string]: string } } = {};

  let specsArray: any[] = [];
  if (Array.isArray(device.specs)) {
    specsArray = device.specs;
  } else if (typeof device.specs === 'object' && device.specs !== null) {
    specsArray = Object.keys(device.specs).map(key => ({
      category: 'General',
      key: key,
      value: (device.specs as any)[key]
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

  useEffect(() => {
    const initialExpansionState: { [key: string]: boolean } = {};
    Object.keys(categorizedSpecs).forEach(category => {
      initialExpansionState[category] = true;
    });
    setExpandedCategories(initialExpansionState);
  }, [device.specs]);

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
    <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
            <FontAwesomeIcon icon={faListCheck} />
          </div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Full Specifications</h2>
        </div>
        <button
          onClick={handleCopyToClipboard}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-xl border border-gray-200 transition-all shadow-sm active:scale-95 group"
        >
          <FontAwesomeIcon icon={copyFeedback === 'Copied!' ? faCheck : faCopy} className={copyFeedback === 'Copied!' ? 'text-green-500' : 'text-blue-500 group-hover:scale-110 transition-transform'} />
          <span className="text-xs uppercase tracking-wider">{copyFeedback || 'Copy Specs'}</span>
        </button>
      </div>

      <div className="p-2">
        <div className="px-4 pb-3">
          <input
            type="search"
            placeholder="Search specs"
            aria-label="Search specs"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {Object.keys(filteredSpecs).length > 0 ? (
          Object.keys(filteredSpecs).map((categoryName) => (
            <div key={categoryName} className="mb-2 last:mb-0">
              <button
                className={`w-full flex justify-between items-center p-4 rounded-xl transition-all ${expandedCategories[categoryName]
                  ? 'bg-blue-50/50 text-blue-700'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                onClick={() => toggleCategory(categoryName)}
              >
                <span className="text-sm font-black uppercase tracking-widest">{categoryName}</span>
                <FontAwesomeIcon icon={expandedCategories[categoryName] ? faChevronUp : faChevronDown} className="text-xs opacity-50" />
              </button>

              {expandedCategories[categoryName] && (
                <div className="px-4 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-50">
                      {Object.keys(filteredSpecs[categoryName]).map((specName) => (
                        <tr key={specName} className="group">
                          <td className="py-3 pr-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/3 align-top group-hover:text-blue-500 transition-colors">
                            {specName}
                          </td>
                          <td className="py-3 text-sm text-gray-700 w-2/3 leading-relaxed">
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
          <div className="p-8 text-center text-gray-500">
            {normalizedQuery ? 'No matching specifications found.' : 'No detailed specifications available.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecsTable;
