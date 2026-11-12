import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'GSMHub is an independent device specifications platform: comprehensive specs, price tracking, and side-by-side comparisons.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-xl">
      <h1 className="mb-space-xs font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
        About GSMHub
      </h1>
      <p className="mb-space-xl font-label-sm text-label-sm font-bold tracking-widest text-outline uppercase">
        Specifications, prices, and comparisons — without the noise
      </p>

      <div className="space-y-space-lg font-body-md leading-relaxed text-on-surface-variant">
        <p>
          GSMHub is an independent device specifications platform. We
          aggregate detailed technical data for smartphones and other devices,
          track prices across markets, and let you compare devices
          side-by-side with numeric difference highlighting.
        </p>
        <p>
          Our goal is simple: when you are choosing a phone, every fact you
          need should be one search away — display, chipset, RAM, battery,
          camera, and what it actually costs in your market today.
        </p>

        <h2 className="pt-space-md font-headline-lg text-headline-lg font-bold text-on-surface">How We Work</h2>
        <p>
          Specification data is aggregated from public sources and structured
          into a consistent, searchable database. Price entries are collected
          per country and retailer and refreshed over time, with the best
          current offer highlighted on each device page.
        </p>

        <h2 className="pt-space-md font-headline-lg text-headline-lg font-bold text-on-surface">
          How We Are Funded
        </h2>
        <p>
          GSMHub is funded through advertising and affiliate relationships.
          When you use a &quot;Buy Now&quot; link and make a purchase, we may
          earn a commission from the retailer at no additional cost to you.
          This never influences the specifications we publish or how devices
          compare — the data is the data.
        </p>

        <h2 className="pt-space-md font-headline-lg text-headline-lg font-bold text-on-surface">Get In Touch</h2>
        <p>
          Found a data error, want to suggest a feature, or interested in
          partnering? Email{' '}
          <a
            href="mailto:contact@gsmhub.com"
            className="font-bold text-secondary hover:text-secondary-container hover:underline"
          >
            contact@gsmhub.com
          </a>{' '}
          or visit our <Link href="/contact" className="font-bold text-secondary hover:text-secondary-container hover:underline">contact page</Link>.
        </p>
        <p>
          Read our{' '}
          <Link href="/privacy" className="font-bold text-secondary hover:text-secondary-container hover:underline">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/terms" className="font-bold text-secondary hover:text-secondary-container hover:underline">
            Terms of Use
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
