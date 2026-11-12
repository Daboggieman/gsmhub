import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How GSMHub collects, uses, and protects your data, including cookies, advertising partners, and affiliate relationships.',
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Overview',
    body: [
      'GSMHub ("we", "us") operates this website to provide mobile device specifications, price information, and comparison tools. This policy explains what information we collect, why, and the choices you have.',
      'Browsing the public site does not require an account and we do not ask for personal information to view device data.',
    ],
  },
  {
    title: 'Information We Collect',
    body: [
      'Accounts: administrator accounts store a name, email address, and a securely hashed password. Passwords are never stored in readable form.',
      'Usage data: we may collect standard server logs (IP address, browser type, pages visited) for security and performance monitoring.',
      'Search queries may be aggregated anonymously to improve the catalog and show trending devices.',
    ],
  },
  {
    title: 'Cookies',
    body: [
      'Essential cookies keep you signed in if you have an administrator account (a secure, HttpOnly session cookie). The public site works without cookies.',
      'Advertising cookies: when advertising is enabled, Google AdSense and its partners may set cookies to serve and measure ads, including personalized ads based on your visits to this and other sites. You can opt out of personalized advertising in Google Ads Settings (adssettings.google.com) or via www.aboutads.info.',
    ],
  },
  {
    title: 'Advertising & Affiliate Disclosure',
    body: [
      'This site may display ads served by Google AdSense.',
      'Some links to retailers ("Buy Now" buttons) are affiliate links. If you make a purchase through them, we may earn a commission at no additional cost to you. This never affects the specifications, prices, or rankings we display, and retailer prices shown are indicative and may differ from the retailer’s current price.',
    ],
  },
  {
    title: 'Third-Party Services',
    body: [
      'Device specification data is aggregated from public sources and retailer listings. We do not sell your personal information.',
      'We use third-party infrastructure providers (hosting, database, caching) to operate the site; they process data only on our instructions.',
    ],
  },
  {
    title: 'Data Retention & Your Choices',
    body: [
      'Server logs are retained for a limited period for security purposes. Administrator account data is kept while the account is active and deleted on request.',
      'You may contact us to request deletion of any personal data associated with you.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'We may update this policy as the site evolves. The latest version is always published on this page.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-xl">
      <h1 className="mb-space-xs font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
        Privacy Policy
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
            Questions about this policy? Reach us at{' '}
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
