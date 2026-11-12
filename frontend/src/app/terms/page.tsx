import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The terms that govern your use of GSMHub.',
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Acceptance of Terms',
    body: [
      'By accessing GSMHub you agree to these terms. If you do not agree, please do not use the site.',
    ],
  },
  {
    title: 'Use of the Site',
    body: [
      'GSMHub provides device specifications, price indications, and comparison tools for personal, non-commercial use. You may not scrape, republish, or resell the content in bulk without permission.',
    ],
  },
  {
    title: 'Accuracy of Information',
    body: [
      'Specifications and prices are aggregated from public sources and are provided "as is". Device details and prices may be incomplete, outdated, or incorrect. Always verify critical details with the retailer or manufacturer before purchasing.',
      'Prices shown are indicative and may differ from the retailer’s current price at the time you visit their site.',
    ],
  },
  {
    title: 'Trademarks',
    body: [
      'All device names, brand names, and images are trademarks of their respective owners (Apple, Samsung, Xiaomi, and others). GSMHub is an independent information service and is not affiliated with, endorsed by, or sponsored by any manufacturer or retailer.',
    ],
  },
  {
    title: 'Affiliate & Advertising Relationships',
    body: [
      'The site may display advertising and affiliate links. We may earn a commission when you purchase through affiliate links, at no extra cost to you. Commercial relationships do not influence the specification data or comparisons presented.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'To the maximum extent permitted by law, GSMHub is not liable for any damages arising from the use of, or inability to use, the site or its content, including decisions made based on specifications or prices shown.',
    ],
  },
  {
    title: 'Changes to These Terms',
    body: [
      'We may revise these terms at any time. Continued use of the site after changes constitutes acceptance of the revised terms.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-xl">
      <h1 className="mb-space-xs font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
        Terms of Use
      </h1>
      <p className="mb-space-xl font-label-sm text-label-sm font-bold tracking-widest text-outline uppercase">
        Last updated: October 2026
      </p>

      <div className="space-y-space-xl">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-space-md font-headline-lg text-headline-lg font-bold text-on-surface">
              {section.title}
            </h2>
            <div className="space-y-space-md">
              {section.body.map((paragraph, i) => (
                <p key={i} className="font-body-md leading-relaxed text-on-surface-variant">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-space-md font-headline-lg text-headline-lg font-bold text-on-surface">Contact</h2>
          <p className="font-body-md leading-relaxed text-on-surface-variant">
            Questions about these terms? Reach us at{' '}
            <a
              href="mailto:contact@gsmhub.com"
              className="font-bold text-secondary hover:text-secondary-container hover:underline"
            >
              contact@gsmhub.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
