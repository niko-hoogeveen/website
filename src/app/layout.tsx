import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://nikohoogeveen.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Niko Hoogeveen - Software Engineer & Portfolio",
    template: "%s | Niko Hoogeveen",
  },
  description:
    "Niko Hoogeveen is a skilled software engineer specializing in modern web applications, equity research dashboards, and creative technology solutions.",
  keywords: [
    "Niko Hoogeveen",
    "Software Engineer",
    "Web Developer",
    "Portfolio",
    "Equity Research",
    "Stock Analysis",
    "React",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: "Niko Hoogeveen", url: BASE_URL }],
  creator: "Niko Hoogeveen",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Niko Hoogeveen",
    title: "Niko Hoogeveen - Software Engineer & Portfolio",
    description:
      "Discover the portfolio of Niko Hoogeveen, a software engineer specializing in web applications and equity research tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Niko Hoogeveen - Software Engineer",
    description:
      "Explore the work of Niko Hoogeveen, software engineer and creative technologist.",
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
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Niko Hoogeveen",
      description: "Software Engineer & Portfolio",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/dashboard/{search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Person",
      "@id": `${BASE_URL}/#person`,
      name: "Niko Hoogeveen",
      url: BASE_URL,
      sameAs: [
        "https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/",
        "https://github.com/niko-hoogeveen",
        "https://www.instagram.com/nikohoogeveen/?hl=en",
      ],
      jobTitle: "Software Engineer",
      description:
        "Niko Hoogeveen is a software engineer specializing in modern web applications and equity research dashboards.",
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${BASE_URL}/#navigation`,
      name: "Main Navigation",
      hasPart: [
        {
          "@type": "WebPage",
          name: "Home",
          url: BASE_URL,
        },
        {
          "@type": "WebPage",
          name: "About",
          url: `${BASE_URL}/about`,
        },
        {
          "@type": "WebPage",
          name: "Contact",
          url: `${BASE_URL}/contact`,
        },
        {
          "@type": "WebPage",
          name: "Stock Dashboard",
          url: `${BASE_URL}/dashboard`,
        },
        {
          "@type": "WebPage",
          name: "Amazon Analysis",
          url: `${BASE_URL}/dashboard/AMZN`,
        },
        {
          "@type": "WebPage",
          name: "Meta Analysis",
          url: `${BASE_URL}/dashboard/META`,
        },
        {
          "@type": "WebPage",
          name: "Nvidia Analysis",
          url: `${BASE_URL}/dashboard/NVDA`,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
