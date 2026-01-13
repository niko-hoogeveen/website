import { Metadata } from "next";
import AboutClient from "./AboutClient";

const BASE_URL = "https://nikohoogeveen.com";

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
  "@type": "ProfilePage",
  "@id": `${BASE_URL}/about`,
  mainEntity: {
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: "Niko Hoogeveen",
    givenName: "Niko",
    familyName: "Hoogeveen",
    url: BASE_URL,
    image: `${BASE_URL}/profile.jpg`,
    jobTitle: "Software Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Catalyst IT Canada",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Queen's University",
      department: "Stephen J.R. Smith Faculty of Engineering and Applied Science",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toronto",
      addressRegion: "Ontario",
      addressCountry: "Canada",
    },
    email: "mailto:niko.hoogeveen@gmail.com",
    sameAs: [
      "https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/",
      "https://github.com/niko-hoogeveen",
      "https://www.instagram.com/nikohoogeveen/",
      "https://cal.com/niko-hoogeveen",
    ],
    knowsAbout: [
      "Software Engineering",
      "Web Development",
      "React",
      "Next.js",
      "TypeScript",
      "PHP",
      "Equity Research",
      "Stock Analysis",
      "Moodle",
      "E-Learning",
    ],
    description:
      "Niko Hoogeveen is a software engineer based in Toronto, Canada. He holds a Bachelor of Applied Science in Computer Engineering from Queen's University and specializes in modern web applications, e-learning solutions, and equity research tools.",
  },
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
