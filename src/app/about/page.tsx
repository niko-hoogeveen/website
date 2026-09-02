import { Metadata } from "next";
import AboutClient from "./AboutClient";
import { BASE_URL, PERSON_ID, personSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Niko Hoogeveen - Software Engineer",
  description:
    "Learn more about Niko Hoogeveen, a software engineer based in Toronto, Canada. Background in computer engineering from Queen's University, experience in web development, equity research, and search and rescue operations.",
  keywords: [
    "Niko Hoogeveen",
    "About Niko Hoogeveen",
    "Software Engineer Toronto",
    "Queen's University Computer Engineering",
    "Web Developer Canada",
    "Niko Hoogeveen Bio",
  ],
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: "About Niko Hoogeveen - Software Engineer",
    description:
      "Learn more about Niko Hoogeveen, a software engineer based in Toronto with a background in computer engineering and equity research.",
    url: `${BASE_URL}/about`,
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Niko Hoogeveen",
    description:
      "Software engineer based in Toronto, Canada with experience in web development and equity research.",
  },
};

// Rich Person schema specifically for the about page
const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${BASE_URL}/about`,
      url: `${BASE_URL}/about`,
      name: "About Niko Hoogeveen",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      mainEntity: { "@id": PERSON_ID },
    },
    personSchema,
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <AboutClient />
    </>
  );
}
