import React from 'react';
import Link from 'next/link';

interface FooterLink {
  href: string;
  label: string;
}

const BROWSE_LINKS: FooterLink[] = [
  { href: '/devices', label: 'All Devices' },
  { href: '/categories', label: 'Categories' },
  { href: '/brands', label: 'Brands' },
  { href: '/compare', label: 'Compare Devices' },
  { href: '/favorites', label: 'Saved Devices' },
];

const COMPANY_LINKS: FooterLink[] = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
];

const LEGAL_LINKS: FooterLink[] = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface-container-lowest mt-auto shadow-[0_-1px_12px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1440px] mx-auto px-space-lg py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-space-xl">
          {/* Brand block */}
          <div className="lg:col-span-2 space-y-space-md">
            <div className="flex items-center gap-space-xs">
              <div className="w-6 h-6 rounded bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-[16px]" aria-hidden="true">
                  developer_board
                </span>
              </div>
              <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-bold">
                GSM<span className="text-secondary-container">Hub</span>
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              High-fidelity technical specifications for smartphones, tablets,
              smartwatches and laptops — side-by-side comparisons and price
              tracking across the devices that matter.
            </p>
            <div className="flex items-center gap-space-sm">
              <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-xs text-label-xs font-bold uppercase">
                Spec Database
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-xs text-label-xs font-bold uppercase">
                Price Comparison
              </span>
            </div>
          </div>

          {/* Browse */}
          <div className="space-y-space-sm">
            <p className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-bold">
              Browse
            </p>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              {BROWSE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-secondary-container transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-space-sm">
            <p className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-bold">
              Company
            </p>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-secondary-container transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-space-sm">
            <p className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-bold">
              Legal
            </p>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-secondary-container transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="hover:text-secondary-container transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate disclosure */}
        <p className="pb-space-lg font-body-sm text-body-sm text-on-surface-variant max-w-3xl">
          Affiliate Disclosure: GSMHub contains affiliate links. We may earn a
          commission when you make a purchase through them, at no extra cost to
          you. GSMHub is not affiliated with any device manufacturer or
          retailer.
        </p>

        {/* Bottom bar */}
        <div className="border-t border-outline-variant pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-space-md">
            <span className="font-label-xs text-label-xs text-outline uppercase">GSMHub</span>
            <span>&copy; {currentYear} GSMHub. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-space-lg">
            <Link href="/privacy" className="hover:text-on-surface transition-colors font-label-sm text-label-sm">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-on-surface transition-colors font-label-sm text-label-sm">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-on-surface transition-colors font-label-sm text-label-sm">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
