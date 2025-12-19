"use client";

import React, { useState, useEffect } from 'react';
import { Device } from '@shared/types'; // Import the shared Device type

interface SpecsTableProps {
  device: Device;
}

const SpecsTable: React.FC<SpecsTableProps> = ({ device }) => {
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!device || !device.specs) {
    return <p>No specifications available.</p>;
  }

  // Group specs by category (e.g., Display, Platform, Memory)
  const categorizedSpecs: { [category: string]: { [key: string]: string } } = {};

  let specsArray = [];
  if (Array.isArray(device.specs)) {
    specsArray = device.specs;
  } else if (typeof device.specs === 'object' && device.specs !== null) {
    // If it's an object, transform it into an array
    specsArray = Object.keys(device.specs).map(key => ({
      category: 'General', // Assign a default category
      key: key,
      value: device.specs[key as keyof typeof device.specs]
    }));
  }

  specsArray.forEach(spec => {
    if (!categorizedSpecs[spec.category]) {
      categorizedSpecs[spec.category] = {};
    }
    categorizedSpecs[spec.category][spec.key] = spec.value;
  });

  useEffect(() => {
    // Initially, expand all categories
    const initialExpansionState: { [key: string]: boolean } = {};
    Object.keys(categorizedSpecs).forEach(category => {
      initialExpansionState[category] = true;
    });
    setExpandedCategories(initialExpansionState);
  }, [device.specs]); // Re-run if specs change

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
        setCopyFeedback('Failed to copy!');
        setTimeout(() => setCopyFeedback(null), 2000);
      });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Specifications</h2>
        <button
          onClick={handleCopyToClipboard}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 relative"
        >
          Copy Specs
          {copyFeedback && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
              {copyFeedback}
            </span>
          )}
        </button>
      </div>
      {Object.keys(categorizedSpecs).length > 0 ? (
        Object.keys(categorizedSpecs).map((categoryName) => (
          <div key={categoryName} className="mb-6">
            <h3
              className="text-xl font-semibold bg-gray-100 p-2 rounded-t-md border-b border-gray-200 cursor-pointer flex justify-between items-center"
              onClick={() => toggleCategory(categoryName)}
            >
              <span>{categoryName}</span>
              <span>{expandedCategories[categoryName] ? '-' : '+'}</span>
            </h3>
            {expandedCategories[categoryName] && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.keys(categorizedSpecs[categoryName]).map((specName) => (
                      <tr key={specName}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">
                          {specName}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 w-2/3">
                          {categorizedSpecs[categoryName][specName]}
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
        <p>No detailed specifications available.</p>
      )}
    </div>
  );
};

export default SpecsTable;
