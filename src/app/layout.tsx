import { QueryProvider } from "@/components/providers/QueryProvider";
import { ScrollRestorationDisabler } from "@/components/ScrollRestorationDisabler";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/sections/Header";
import { ReferralTracker } from "@/components/promo/ReferralTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/seo/site";
import { organizationSchema, websiteSchema } from "@/lib/seo/jsonLd";
import { Suspense } from "react";

// No `alternates.canonical` here on purpose: it would be inherited by every
// page that doesn't set its own, pointing them all at the homepage.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.legalName,
  category: "education",
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: SITE.title,
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage.path,
        width: SITE.ogImage.width,
        height: SITE.ogImage.height,
        alt: SITE.ogImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage.path],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Body copy font — preloaded so text paints in the brand face, not a fallback swap */}
        <link
          rel="preload"
          href="/fonts/plus-jakarta-sans-latin-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Header />
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        <ScrollRestorationDisabler />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
