import type { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the GSMHub team: data corrections, feedback, partnerships, and support.',
};

const CHANNELS = [
  {
    icon: faEnvelope,
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
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-black tracking-tight text-gray-900">
        Contact Us
      </h1>
      <p className="mb-10 text-xs font-bold tracking-widest text-gray-500 uppercase">
        We read every message
      </p>

      <div className="space-y-6">
        {CHANNELS.map((channel) => (
          <div
            key={channel.title}
            className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FontAwesomeIcon icon={channel.icon} />
            </div>
            <div>
              <h2 className="font-black text-gray-900">{channel.title}</h2>
              <a
                href={channel.href}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                {channel.detail}
              </a>
              <p className="mt-1 text-xs font-medium text-gray-500">
                {channel.note}
              </p>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-black tracking-widest text-gray-900 uppercase">
            <FontAwesomeIcon icon={faClock} className="text-blue-500" />
            What to include
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600">
            {TOPICS.map((topic, i) => (
              <li key={i}>{topic}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-bold text-gray-400">
            We typically reply within a few business days.
          </p>
        </div>
      </div>
    </div>
  );
}
