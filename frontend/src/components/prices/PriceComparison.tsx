import React from 'react';
import { PriceHistory } from '@shared/types';
import { formatPrice } from '@/lib/utils';

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
            <div className="bg-surface-container-low rounded-xl shadow-md md:shadow-none p-space-lg text-center">
                <p className="font-body-md text-body-md text-on-surface-variant italic">
                    No pricing information available for {deviceName} yet.
                </p>
            </div>
        );
    }

    const groups = buildCurrencyGroups(prices);
    const showCurrencyHeadings = groups.length > 1;
    const mostRecent = [...prices].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return (
        <div className="bg-surface-container-low rounded-xl shadow-md md:shadow-none overflow-hidden">
            <div className="p-space-md border-b border-outline-variant flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[20px] text-tertiary" aria-hidden="true">sell</span>
                    Price Comparison
                </h3>
                <span className="font-label-xs text-label-xs text-outline bg-surface-container px-2 py-1 rounded tabular-nums">
                    Last updated: {new Date(mostRecent.date).toLocaleDateString()}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-surface-container text-outline uppercase">
                        <tr>
                            <th className="px-space-md py-2.5 font-label-xs text-label-xs font-bold text-left">Retailer</th>
                            <th className="px-space-md py-2.5 font-label-xs text-label-xs font-bold text-left">Location</th>
                            <th className="px-space-md py-2.5 font-label-xs text-label-xs font-bold text-left">Price</th>
                            <th className="px-space-md py-2.5 font-label-xs text-label-xs font-bold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/50">
                        {groups.map((group) => (
                            <React.Fragment key={group.currency}>
                                {showCurrencyHeadings && (
                                    <tr className="bg-surface-container/60">
                                        <td
                                            colSpan={4}
                                            className="px-space-md py-1.5 font-label-xs text-label-xs tracking-widest text-outline uppercase font-bold"
                                        >
                                            Prices in {group.currency}
                                        </td>
                                    </tr>
                                )}
                                {group.rows.map((price) => {
                                    const priceId = price._id || price.id;
                                    const isBest = (group.best._id || group.best.id) === priceId;
                                    return (
                                        <tr key={priceId} className={isBest ? 'bg-tertiary-container/15' : 'hover:bg-surface-container'}>
                                            <td className="px-space-md py-3">
                                                <div className="font-body-md text-body-md font-bold text-on-surface flex items-center">
                                                    {price.retailer || 'Store'}
                                                    {isBest && (
                                                        <span className="ml-2 px-1.5 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-label-xs text-label-xs font-bold uppercase">
                                                            Best Deal
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-space-md py-3">
                                                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                                                    {price.country}
                                                </span>
                                            </td>
                                            <td className="px-space-md py-3">
                                                <div className="font-headline-md text-headline-md text-on-surface font-bold tabular-nums">
                                                    {formatPrice(price.price, group.currency)}
                                                </div>
                                            </td>
                                            <td className="px-space-md py-3 text-right">
                                                {price.affiliateUrl ? (
                                                    <a
                                                        href={price.affiliateUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer sponsored"
                                                        className="inline-flex items-center gap-1 bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-sm text-label-sm font-bold px-space-md py-2 rounded transition-colors"
                                                    >
                                                        Buy Now
                                                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">open_in_new</span>
                                                    </a>
                                                ) : (
                                                    <span className="font-label-xs text-label-xs text-outline font-bold uppercase">No Link</span>
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

            <div className="p-space-md bg-surface-container border-t border-outline-variant">
                <p className="font-label-xs text-label-xs text-on-surface-variant flex items-start gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary mt-0.5 shrink-0" aria-hidden="true">info</span>
                    Disclosure: This site contains affiliate links. We may earn a small commission at no extra cost to you if you make a purchase through these links.
                </p>
            </div>
        </div>
    );
};

export default PriceComparison;
