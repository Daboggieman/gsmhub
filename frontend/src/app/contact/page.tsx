import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the GSMHub team: data corrections, feedback, partnerships, and support.',
};

const CHANNELS = [
  {
    icon: 'mail',
    title: 'Email',
    detail: 'contact@gsmhub.com',
    href: 'mailto:contact@gsmhub.com',
    note: 'Best for everything — corrections, feedback, partnerships.',
  },
];

const TOPICS = [
  'Data corrections — found a wrong spec or price? Tell us the device and field.',
  'Feature requests — what would make choosing a phone easier for you?',
  'Partnerships — retailers, affiliate programs, and advertising enquiries.',
];

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-xl">
      <h1 className="mb-space-xs font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
        Contact Us
      </h1>
      <p className="mb-space-xl font-label-sm text-label-sm font-bold tracking-widest text-outline uppercase">
        We read every message
      </p>

      <div className="space-y-space-lg">
        {CHANNELS.map((channel) => (
          <div
            key={channel.title}
            className="flex items-start gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-md md:shadow-none"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">{channel.icon}</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{channel.title}</h2>
              <a
                href={channel.href}
                className="font-label-md font-bold text-secondary hover:text-secondary-container hover:underline"
              >
                {channel.detail}
              </a>
              <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                {channel.note}
              </p>
            </div>
          </div>
        ))}

        <div className="rounded-xl bg-surface-container-low p-space-lg shadow-md md:shadow-none">
          <h2 className="mb-space-md flex items-center gap-space-sm font-label-sm text-label-sm font-bold tracking-widest text-on-surface uppercase">
            <span className="material-symbols-outlined text-[18px] text-secondary-container" aria-hidden="true">schedule</span>
            What to include
          </h2>
          <ul className="list-inside list-disc space-y-2 font-body-md leading-relaxed text-on-surface-variant">
            {TOPICS.map((topic, i) => (
              <li key={i}>{topic}</li>
            ))}
          </ul>
          <p className="mt-space-md font-label-sm text-label-sm font-bold text-outline">
            We typically reply within a few business days.
          </p>
        </div>
      </div>
    </div>
  );
}
