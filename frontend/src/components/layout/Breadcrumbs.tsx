"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  name?: string;
  label?: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  // Hooks must run before any early return so hook order stays stable
  // when `items` goes from empty to populated between renders.
  const pathname = usePathname();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="font-label-sm text-label-sm text-on-surface-variant mb-4">
      <ol className="list-none p-0 inline-flex flex-wrap items-center">
        <li className="flex items-center">
          <Link href="/" className="text-secondary hover:text-secondary-container hover:underline transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = pathname === item.href; // Check if the current path matches the item's href

          return (
            <li key={item.href} className="flex items-center">
              <span className="mx-2 text-outline" aria-hidden="true">/</span>
              {isLast || isActive ? (
                <span className="text-on-surface font-medium">{item.name ?? item.label}</span>
              ) : (
                <Link href={item.href} className="text-secondary hover:text-secondary-container hover:underline transition-colors">
                  {item.name ?? item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
