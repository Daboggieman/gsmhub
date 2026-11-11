import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";
import PWARegistration from "@/components/pwa/PWARegistration";

// Font Awesome Configuration (legacy icons — removed once all components are rebuilt)
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GSMHub - Mobile Phone Specifications & Reviews",
    template: "%s | GSMHub",
  },
  description: "The ultimate source for mobile phone specifications, reviews, and news. Find your next device with our comprehensive database.",
  keywords: ["mobile phone specs", "smartphone reviews", "compare phones", "GSMHub", "latest devices"],
  authors: [{ name: "GSMHub Team" }],
  creator: "GSMHub",
  publisher: "GSMHub",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GSMHub",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f131c",
};

// Runs before first paint: restores saved theme (default = dark)
const themeInitScript = `try{var t=localStorage.getItem('gsmhub-theme');if(t==='light'){document.documentElement.classList.replace('dark','light')}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="bg-background text-on-surface font-body-md antialiased flex flex-col min-h-screen">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
        <ClientLayout>
          {children}
        </ClientLayout>
        <PWARegistration />
      </body>
    </html>
  );
}
