import type { Metadata } from "next";
import { Geist } from "next/font/google"; // Removed Geist_Mono
import "./globals.css";
import Header from '@/components/layout/Header'; // Import Header component
import Footer from '@/components/layout/Footer'; // Import Footer component

// Font Awesome Configuration
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import Font Awesome CSS
config.autoAddCss = false; // Prevent Font Awesome from adding CSS automatically

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Removed geistMono import and variable

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased flex flex-col min-h-screen`} // Added flex-col and min-h-screen for sticky footer
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
