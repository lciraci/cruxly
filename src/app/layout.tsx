import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Oswald } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import "./globals.css";

// Condensed display face for bold-newsroom CTAs/headings
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const SITE_URL = "https://cruxly.dev";
const DESCRIPTION =
  "Search any news topic and instantly see how left, center, and right media frame it — what facts they share and what they leave out.";

// Site-wide structured data: Organization + WebSite (+ SearchAction so Google
// can show a Cruxly search box directly in the results).
const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Cruxly",
      url: SITE_URL,
      sameAs: ["https://twitter.com/cruxly"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Cruxly",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/story?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

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
  verification: {
    google: "googlef1e0b3b685b304e1",
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${oswald.variable} h-full antialiased dark`}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
