"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const pathname = usePathname();

  return (
    <nav className="text-sm text-gray-500 mb-4">
      <ol className="list-none p-0 inline-flex flex-wrap">
        <li className="flex items-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = pathname === item.href; // Check if the current path matches the item's href

          return (
            <li key={item.href} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast || isActive ? (
                <span className="text-gray-700 font-medium">{item.name}</span>
              ) : (
                <Link href={item.href} className="text-blue-600 hover:underline">
                  {item.name}
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
