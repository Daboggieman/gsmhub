import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";
import PWARegistration from "@/components/pwa/PWARegistration";

// Font Awesome Configuration
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GSMHub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased flex flex-col min-h-screen`}
      >
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