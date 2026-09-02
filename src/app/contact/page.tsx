import { Metadata } from "next";
import ContactClient from "./ContactClient";
import {
  BASE_URL,
  EMAIL,
  PERSON_ID,
  TELEPHONE,
  organizationSchema,
  personSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Niko Hoogeveen",
  description:
    "Get in touch with Niko Hoogeveen, a software engineer based in Toronto, Canada. Schedule a meeting, connect on LinkedIn, or send an email.",
  keywords: [
    "Contact Niko Hoogeveen",
    "Niko Hoogeveen Email",
    "Niko Hoogeveen LinkedIn",
    "Software Engineer Toronto Contact",
    "Hire Niko Hoogeveen",
  ],
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Niko Hoogeveen",
    description:
      "Get in touch with Niko Hoogeveen. Schedule a meeting, connect on LinkedIn, or send an email.",
    url: `${BASE_URL}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Niko Hoogeveen",
    description:
      "Get in touch with Niko Hoogeveen, software engineer based in Toronto, Canada.",
  },
};

// ContactPage schema for rich results
const contactJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${BASE_URL}/contact`,
      url: `${BASE_URL}/contact`,
      name: "Contact Niko Hoogeveen",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      mainEntity: { "@id": PERSON_ID },
    },
    {
      ...personSchema,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "professional inquiries",
        email: EMAIL,
        telephone: TELEPHONE,
        url: "https://cal.com/niko-hoogeveen",
        areaServed: "CA",
        availableLanguage: "English",
      },
    },
    organizationSchema,
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactClient />
    </>
  );
}
