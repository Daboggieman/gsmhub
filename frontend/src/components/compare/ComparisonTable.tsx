"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronUp, 
  faCircleCheck, 
  faCircleMinus,
  faScaleBalanced,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons';
import Badge from '../ui/Badge';

interface ComparisonTableProps {
  comparisonData: {
    devices: any[];
    comparison: any[];
  };
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ comparisonData }) => {
  const { devices, comparison } = comparisonData;
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>(() => {
    // Expand all by default
    const cats = [...new Set(comparison.map(c => c.category))];
    return Object.fromEntries(cats.map(c => [c, true]));
  });

  if (!devices || devices.length === 0) return null;

  // Group comparison rows by category
  const categorizedComparison: { [category: string]: any[] } = {};
  comparison.forEach(row => {
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
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-8 text-left border-b border-gray-100 min-w-[200px] bg-white sticky left-0 z-10 shadow-[5px_0_10px_-5px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 text-blue-600">
                  <FontAwesomeIcon icon={faScaleBalanced} />
                  <span className="font-black uppercase tracking-widest text-xs">Specifications</span>
                </div>
              </th>
              {devices.map((device, idx) => (
                <th key={device.slug} className="p-8 text-center border-b border-gray-100 min-w-[280px]">
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-40 mb-4 bg-white rounded-2xl p-4 shadow-sm group hover:shadow-md transition-all border border-gray-50">
                      {device.imageUrl ? (
                        <Image 
                          src={device.imageUrl} 
                          alt={device.name || 'Device image'} 
                          fill 
                          style={{ objectFit: 'contain' }} 
                          className="p-2 transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 rounded-xl">
                          <FontAwesomeIcon icon={faCircleInfo} size="2x" />
                        </div>
                      )}
                    </div>
                    <Badge variant={idx === 0 ? 'primary' : 'secondary'} size="xs" className="mb-2">Device {idx + 1}</Badge>
                    <span className="text-xl font-black text-gray-900 leading-tight mb-1">{device.model}</span>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{device.brand}</span>
                    
                    {device.latestPrice && (
                      <div className="mt-4 font-black text-green-600 text-lg">
                        ${device.latestPrice.toFixed(2)}
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
                  className="bg-gray-100/80 cursor-pointer hover:bg-gray-200/80 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <td 
                    colSpan={devices.length + 1} 
                    className="p-4 font-black text-gray-800 uppercase tracking-widest text-xs flex items-center gap-3"
                  >
                    <FontAwesomeIcon icon={expandedCategories[category] ? faChevronUp : faChevronDown} className="opacity-30" />
                    {category}
                    <span className="text-[10px] font-bold text-gray-400 normal-case ml-2">({categorizedComparison[category].length} specs)</span>
                  </td>
                </tr>
                {expandedCategories[category] && categorizedComparison[category].map((row, rowIdx) => (
                  <tr key={`${category}-${row.item}`} className={`group hover:bg-blue-50/30 transition-colors ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="p-5 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest bg-white sticky left-0 z-10 shadow-[5px_0_10px_-5px_rgba(0,0,0,0.05)] group-hover:text-blue-600 transition-colors">
                      {row.item}
                    </td>
                    {row.values.map((val: string, idx: number) => {
                      const isWinner = row.betterIndex === idx;
                      const isLoser = row.betterIndex !== undefined && row.betterIndex !== idx;
                      
                      return (
                        <td 
                          key={idx} 
                          className={`p-5 border-b border-gray-100 text-sm leading-relaxed text-center ${isWinner ? 'bg-green-50/50' : ''} ${isLoser ? 'bg-red-50/20' : ''}`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className={`${isWinner ? 'font-bold text-green-700' : 'text-gray-700'}`}>
                              {val}
                            </span>
                            
                            {isWinner && row.difference && (
                              <Badge variant="success" size="xs" className="animate-in zoom-in-50 duration-300">
                                {row.difference} Better
                              </Badge>
                            )}
                            
                            {isWinner && (
                              <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-xs" />
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
      
      <div className="p-8 bg-gray-50/50 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400 font-medium">
          * Highlighting indicates the superior specification based on common industry standards.
        </p>
      </div>
    </div>
  );
};

export default ComparisonTable;