/**
 * Single source of truth for site-wide SEO values.
 *
 * Google consolidates a person/business into one entity by matching identical
 * name, URL, and profile links across every page. Keep these values byte-identical
 * with the Google Business Profile listing.
 */

export const BASE_URL = "https://nikohoogeveen.com";

export const PERSON_ID = `${BASE_URL}/#person`;
export const ORG_ID = `${BASE_URL}/#organization`;
export const WEBSITE_ID = `${BASE_URL}/#website`;

export const PERSON_NAME = "Niko Hoogeveen";
export const BUSINESS_NAME = "Niko Hoogeveen Consulting";
export const JOB_TITLE = "Software Engineer";
export const EMAIL = "niko.hoogeveen@gmail.com";
export const TELEPHONE = "+1-705-220-5623";
export const PROFILE_IMAGE = `${BASE_URL}/profile.jpg`;

/**
 * Every profile the site owner controls. Used in `sameAs` on both the Person and
 * Organization nodes so Google links these results back to one entity.
 */
export const SAME_AS = [
  "https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/",
  "https://github.com/niko-hoogeveen",
  "https://x.com/nikohoogeveen",
  "https://www.youtube.com/@nikohoogeveen2157",
  "https://www.instagram.com/nikohoogeveen/",
  "https://cal.com/niko-hoogeveen",
];

export const ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Toronto",
  addressRegion: "ON",
  addressCountry: "CA",
} as const;

export const KNOWS_ABOUT = [
  "Software Engineering",
  "Web Development",
  "Moodle Development",
  "React",
  "Next.js",
  "TypeScript",
  "PHP",
  "Equity Research",
  "Machine Learning",
];

/** Canonical site navigation. Drives the header nav, footer nav, and sitemap. */
export interface NavItem {
  href: string;
  /** Short anchor text. Google uses concise internal anchor text to pick sitelinks. */
  label: string;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/about",
    label: "About",
    description: "Background, education, and technical skills",
  },
  {
    href: "/services",
    label: "Services",
    description: "Software consulting and development services",
  },
  {
    href: "/resume",
    label: "Resume",
    description: "Full work experience and qualifications",
  },
  {
    href: "/projects",
    label: "Projects",
    description: "Engineering projects and case studies",
  },
  {
    href: "/dashboard",
    label: "Stock Dashboard",
    description: "Interactive equity research dashboard",
  },
  {
    href: "/writing",
    label: "Writing",
    description: "Articles on engineering and markets",
  },
  {
    href: "/contact",
    label: "Contact",
    description: "Get in touch or schedule a call",
  },
];

export function absoluteUrl(path: string): string {
  return path === "/" ? BASE_URL : `${BASE_URL}${path}`;
}

export const personSchema = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: PERSON_NAME,
  alternateName: BUSINESS_NAME,
  givenName: "Niko",
  familyName: "Hoogeveen",
  url: BASE_URL,
  image: PROFILE_IMAGE,
  jobTitle: JOB_TITLE,
  email: `mailto:${EMAIL}`,
  telephone: TELEPHONE,
  address: ADDRESS,
  nationality: { "@type": "Country", name: "Canada" },
  worksFor: { "@id": ORG_ID },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Queen's University",
    sameAs: "https://www.queensu.ca/",
  },
  knowsAbout: KNOWS_ABOUT,
  description:
    "Niko Hoogeveen is a software engineer based in Toronto, Ontario, Canada. He builds custom Moodle and web applications at Catalyst IT Canada and runs an independent software consulting practice.",
  sameAs: SAME_AS,
};

export const organizationSchema = {
  "@type": "ProfessionalService",
  "@id": ORG_ID,
  name: BUSINESS_NAME,
  alternateName: PERSON_NAME,
  url: BASE_URL,
  image: PROFILE_IMAGE,
  logo: `${BASE_URL}/icon.png`,
  telephone: TELEPHONE,
  email: `mailto:${EMAIL}`,
  founder: { "@id": PERSON_ID },
  address: ADDRESS,
  areaServed: [
    { "@type": "City", name: "Toronto" },
    { "@type": "AdministrativeArea", name: "Ontario" },
    { "@type": "Country", name: "Canada" },
  ],
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  description:
    "Niko Hoogeveen Consulting provides software engineering, web application development, Moodle customization, and technical oversight services to clients across Ontario and Canada.",
  sameAs: SAME_AS,
};
