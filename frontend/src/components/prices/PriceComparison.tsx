import React from 'react';
import { PriceHistory } from '@shared/types';
import { formatPrice } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faTag, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface PriceComparisonProps {
    prices: PriceHistory[];
    deviceName: string;
}

interface CurrencyGroup {
    currency: string;
    rows: PriceHistory[];
    best: PriceHistory;
}

/**
 * Groups offers by currency and finds the cheapest offer within each group.
 * Amounts are never converted across currencies (no reliable FX data), so
 * "Best Deal" is only claimed within a currency.
 */
function buildCurrencyGroups(prices: PriceHistory[]): CurrencyGroup[] {
    const byCurrency = new Map<string, PriceHistory[]>();
    for (const price of prices) {
        const currency = (price.currency || 'USD').toUpperCase();
        const group = byCurrency.get(currency) ?? [];
        group.push(price);
        byCurrency.set(currency, group);
    }
    return [...byCurrency.entries()]
        .map(([currency, rows]) => {
            const sorted = [...rows].sort((a, b) => a.price - b.price);
            return { currency, rows: sorted, best: sorted[0] };
        })
        .sort((a, b) => {
            // USD first when present, then alphabetical for the rest.
            if (a.currency === 'USD') return -1;
            if (b.currency === 'USD') return 1;
            return a.currency.localeCompare(b.currency);
        });
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ prices, deviceName }) => {
    if (!prices || prices.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-500 italic">No pricing information available for {deviceName} yet.</p>
            </div>
        );
    }

    const groups = buildCurrencyGroups(prices);
    const showCurrencyHeadings = groups.length > 1;
    const mostRecent = [...prices].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wider">
                    <FontAwesomeIcon icon={faTag} className="mr-2 text-green-600" />
                    Price Comparison
                </h3>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                    Last updated: {new Date(mostRecent.date).toLocaleDateString()}
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
                        {groups.map((group) => (
                            <React.Fragment key={group.currency}>
                                {showCurrencyHeadings && (
                                    <tr className="bg-gray-50/50">
                                        <td
                                            colSpan={4}
                                            className="px-4 py-2 text-[10px] font-black tracking-widest text-gray-500 uppercase"
                                        >
                                            Prices in {group.currency}
                                        </td>
                                    </tr>
                                )}
                                {group.rows.map((price) => {
                                    const priceId = price._id || price.id;
                                    const isBest = (group.best._id || group.best.id) === priceId;
                                    return (
                                        <tr key={priceId} className={isBest ? 'bg-green-50/30' : 'hover:bg-gray-50'}>
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-gray-800">
                                                    {price.retailer || 'Store'}
                                                    {isBest && (
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
                                                    {formatPrice(price.price, group.currency)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                {price.affiliateUrl ? (
                                                    <a
                                                        href={price.affiliateUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer sponsored"
                                                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded transition-colors"
                                                    >
                                                        Buy Now
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 text-[10px]" />
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">No Link</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
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
