"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from '../search/SearchBar';
import ThemeToggle from './ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/devices', label: 'Devices', icon: 'smartphone' },
  { href: '/categories', label: 'Categories', icon: 'category' },
  { href: '/brands', label: 'Brands', icon: 'apps' },
  { href: '/compare', label: 'Compare', icon: 'compare_arrows' },
];

const DRAWER_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Database',
    items: [
      { href: '/', label: 'Home', icon: 'home' },
      { href: '/devices', label: 'Devices', icon: 'smartphone' },
      { href: '/categories', label: 'Categories', icon: 'category' },
      { href: '/brands', label: 'Brands', icon: 'apps' },
      { href: '/compare', label: 'Compare', icon: 'compare_arrows' },
      { href: '/favorites', label: 'Saved', icon: 'bookmark' },
      { href: '/search', label: 'Search', icon: 'search' },
    ],
  },
  {
    title: 'Company',
    items: [
      { href: '/about', label: 'About', icon: 'info' },
      { href: '/contact', label: 'Contact', icon: 'mail' },
      { href: '/admin', label: 'Admin', icon: 'admin_panel_settings' },
    ],
  },
];

const Logo: React.FC<{ tileClass?: string }> = ({ tileClass = 'w-7 h-7' }) => (
  <span className={`${tileClass} rounded bg-primary-container flex items-center justify-center shrink-0`}>
    <span className="material-symbols-outlined text-on-primary-container text-[18px]" aria-hidden="true">
      developer_board
    </span>
  </span>
);

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
        <div className="h-14 max-w-[1440px] mx-auto px-space-md lg:px-space-lg flex items-center justify-between gap-space-sm lg:gap-space-md">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden w-11 h-11 -ml-space-sm flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors shrink-0 focus:outline-none"
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">menu</span>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-space-sm shrink-0" aria-label="GSMHub home">
            <Logo />
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface">
              GSM<span className="text-secondary-container">Hub</span>
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Mobile search shortcut */}
          <Link
            href="/search"
            className="md:hidden flex-1 flex items-center gap-space-xs h-10 px-space-sm bg-surface-container-highest/60 rounded text-on-surface-variant hover:text-on-surface transition-colors min-w-0"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">search</span>
            <span className="font-body-sm text-body-sm truncate text-outline">Search phones, specs...</span>
          </Link>

          {/* Desktop nav pills */}
          <nav className="hidden md:flex items-center gap-space-xs shrink-0" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`h-9 px-space-md flex items-center gap-space-xs rounded-lg font-label-md text-label-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-surface-container-highest text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-space-xs shrink-0">
            <ThemeToggle />
            <Link
              href="/favorites"
              className={`hidden sm:flex h-9 px-space-md items-center gap-space-xs rounded-lg font-label-md text-label-md transition-colors ${
                isActive('/favorites')
                  ? 'bg-surface-container-highest text-on-surface'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">bookmark</span>
              Saved
            </Link>
          </div>
        </div>
      </header>

      {/* Drawer backdrop */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile drawer */}
      <aside
        aria-hidden={!isMobileMenuOpen}
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-surface-container-low flex flex-col transition-transform duration-300 ease-in-out shadow-[0_20px_40px_-8px_rgba(0,0,0,0.8)] ${
          isMobileMenuOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        }`}
      >
        <div className="px-space-lg py-space-md flex items-center justify-between bg-surface-container">
          <div className="flex items-center gap-space-sm">
            <Logo tileClass="w-6 h-6" />
            <span className="font-headline-md text-headline-md text-on-surface font-bold">GSMHub</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">close</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-space-md py-space-sm space-y-space-xs" aria-label="Mobile">
          {DRAWER_GROUPS.map((group, gi) => (
            <React.Fragment key={group.title}>
              {gi > 0 && <div className="h-px bg-outline-variant my-space-sm" aria-hidden="true" />}
              <div className="px-space-sm py-space-xs font-label-xs text-label-xs text-outline uppercase tracking-wider">
                {group.title}
              </div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-space-md px-space-md py-space-sm rounded transition-colors ${
                    isActive(item.href)
                      ? 'bg-surface-container text-on-surface'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${isActive(item.href) ? 'text-secondary' : ''}`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md">{item.label}</span>
                </Link>
              ))}
            </React.Fragment>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Header;
