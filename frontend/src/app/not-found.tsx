import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center px-space-md py-space-xl">
      <p className="font-label-sm text-label-sm font-bold text-outline uppercase tracking-widest mb-space-md">
        404 — Page not found
      </p>
      <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface mb-space-sm">
        This page doesn&apos;t exist
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-space-lg">
        The page you are looking for may have been moved, removed, or never existed.
      </p>
      <div className="flex flex-wrap justify-center gap-space-md">
        <Link
          href="/"
          className="inline-flex items-center gap-space-sm bg-primary-container hover:bg-inverse-primary text-on-primary-container px-space-lg py-3 rounded-lg font-label-md font-bold transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">home</span>
          Go Home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-space-sm border border-outline-variant text-on-surface hover:bg-surface-container px-space-lg py-3 rounded-lg font-label-md font-bold transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">search</span>
          Search Devices
        </Link>
      </div>
    </div>
  );
}
