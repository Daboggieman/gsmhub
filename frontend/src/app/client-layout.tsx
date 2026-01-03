"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import AdUnit from '@/components/ads/AdUnit';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <AuthProvider>
      {!isAdmin && pathname === '/' && (
        <div className="container mx-auto px-4 mt-4">
          <AdUnit slot="homepage-top" format="horizontal" className="!my-0 mb-4" />
        </div>
      )}
      {!isAdmin && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </AuthProvider>
  );
}
