import type { Metadata } from "next";
import "./globals.css";
import {
  BASE_URL,
  NAV_ITEMS,
  PERSON_NAME,
  PROFILE_IMAGE,
  WEBSITE_ID,
  ORG_ID,
  PERSON_ID,
  absoluteUrl,
  organizationSchema,
  personSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Niko Hoogeveen - Software Engineer in Toronto, Ontario",
    template: "%s | Niko Hoogeveen",
  },
  description:
    "Niko Hoogeveen is a software engineer in Toronto, Ontario. He builds custom Moodle and web applications at Catalyst IT Canada.",
  applicationName: PERSON_NAME,
  keywords: [
    "Niko Hoogeveen",
    "Niko Hoogeveen Consulting",
    "Niko Hoogeveen Toronto",
    "Niko Hoogeveen Software Engineer",
    "Software Engineer Toronto",
    "Moodle Developer Canada",
    "Software Consultant Ontario",
  ],
  authors: [{ name: PERSON_NAME, url: BASE_URL }],
  creator: PERSON_NAME,
  publisher: PERSON_NAME,
  // Google reads rel="icon" from the home page head; the URL must stay stable.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: BASE_URL,
    siteName: PERSON_NAME,
    title: "Niko Hoogeveen - Software Engineer in Toronto, Ontario",
    description:
      "Portfolio and consulting site of Niko Hoogeveen, a software engineer in Toronto building web applications, Moodle solutions, and equity research tools.",
    images: [{ url: PROFILE_IMAGE, width: 400, height: 400, alt: PERSON_NAME }],
  },
  twitter: {
    // profile.jpg is square, so the small-thumbnail card renders it uncropped.
    card: "summary",
    site: "@nikohoogeveen",
    creator: "@nikohoogeveen",
    title: "Niko Hoogeveen - Software Engineer",
    description:
      "Portfolio and consulting site of Niko Hoogeveen, software engineer in Toronto, Ontario.",
    images: [PROFILE_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

// JSON-LD structured data for sitelinks and rich search results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: BASE_URL,
      // Drives the site name shown above the title link in Google results.
      name: PERSON_NAME,
      alternateName: "Niko Hoogeveen Consulting",
      description: "Software engineer and consultant in Toronto, Ontario",
      inLanguage: "en-CA",
      publisher: { "@id": ORG_ID },
      about: { "@id": PERSON_ID },
    },
    personSchema,
    organizationSchema,
    {
      "@type": "SiteNavigationElement",
      "@id": `${BASE_URL}/#navigation`,
      name: NAV_ITEMS.map((item) => item.label),
      url: NAV_ITEMS.map((item) => absoluteUrl(item.href)),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
