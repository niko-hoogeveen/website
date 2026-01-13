import { Metadata } from "next";
import ContactClient from "./ContactClient";

const BASE_URL = "https://nikohoogeveen.com";

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
  "@type": "ContactPage",
  "@id": `${BASE_URL}/contact`,
  mainEntity: {
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: "Niko Hoogeveen",
    email: "mailto:niko.hoogeveen@gmail.com",
    url: BASE_URL,
    sameAs: [
      "https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/",
      "https://github.com/niko-hoogeveen",
      "https://www.instagram.com/nikohoogeveen/",
      "https://cal.com/niko-hoogeveen",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "professional inquiries",
      email: "niko.hoogeveen@gmail.com",
      url: "https://cal.com/niko-hoogeveen",
    },
  },
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
