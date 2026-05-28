import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import "./globals.css";

const SITE_URL = "https://cruxly.dev";
const DESCRIPTION =
  "Search any news topic and instantly see how left, center, and right media frame it — what facts they share and what they leave out.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cruxly — One story. Every side.",
    template: "%s — Cruxly",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Cruxly — One story. Every side.",
    description: DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: "Cruxly",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Cruxly — One story. Every side." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cruxly — One story. Every side.",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased dark`}
    >
      <head>
        {/* Google AdSense — only loads when NEXT_PUBLIC_ADSENSE_ID is set */}
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
