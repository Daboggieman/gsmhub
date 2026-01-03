import React from 'react';
import { PriceHistory } from '../../../../../shared/src/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faTag, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface PriceComparisonProps {
    prices: PriceHistory[];
    deviceName: string;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ prices, deviceName }) => {
    if (!prices || prices.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-500 italic">No pricing information available for this device yet.</p>
            </div>
        );
    }

    // Sort prices by amount to find the best deal
    const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
    const bestPrice = sortedPrices[0];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wider">
                    <FontAwesomeIcon icon={faTag} className="mr-2 text-green-600" />
                    Price Comparison
                </h3>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                    Last updated: {new Date(bestPrice.date).toLocaleDateString()}
                </span>
            </div>

            <div className="p-0">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-4 py-3 font-bold">Retailer</th>
                            <th className="px-4 py-3 font-bold">Location</th>
                            <th className="px-4 py-3 font-bold">Price</th>
                            <th className="px-4 py-3 font-bold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedPrices.map((price) => {
                            const priceId = price._id || price.id;
                            const bestPriceId = bestPrice._id || bestPrice.id;
                            return (
                                <tr key={priceId} className={priceId === bestPriceId ? 'bg-green-50/30' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-gray-800">
                                            {price.retailer || 'Store'}
                                            {priceId === bestPriceId && (
                                                <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-black uppercase">
                                                    Best Deal
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-600 font-medium">{price.country}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-black text-gray-900">
                                            {price.currency} {price.price.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {price.affiliateUrl ? (
                                            <a
                                                href={price.affiliateUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded transition-colors"
                                            >
                                                Buy Now
                                                <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 text-[10px]" />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Out of Stock</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200">
                <p className="text-[10px] text-gray-500 flex items-start">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                    Disclosure: This site contains affiliate links. We may earn a small commission at no extra cost to you if you make a purchase through these links.
                </p>
            </div>
        </div>
    );
};

export default PriceComparison;
