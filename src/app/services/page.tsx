import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import {
  BASE_URL,
  BUSINESS_NAME,
  ORG_ID,
  PERSON_ID,
  TELEPHONE,
  EMAIL,
  organizationSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Niko Hoogeveen Consulting offers software engineering services in Toronto, Ontario: web application development, Moodle customization, technical oversight, and data automation.",
  keywords: [
    "Niko Hoogeveen Consulting",
    "Software Consultant Toronto",
    "Moodle Developer Ontario",
    "Web Application Development Toronto",
    "Technical Oversight Consultant",
  ],
  alternates: { canonical: `${BASE_URL}/services` },
  openGraph: {
    title: "Services | Niko Hoogeveen Consulting",
    description:
      "Software engineering, web application development, Moodle customization, and technical oversight services in Toronto, Ontario.",
    url: `${BASE_URL}/services`,
    type: "website",
  },
};

const services = [
  {
    name: "Web Application Development",
    description:
      "End-to-end design and build of responsive web applications using React, Next.js, TypeScript, and Tailwind CSS, deployed on modern static or serverless infrastructure.",
  },
  {
    name: "Moodle Development & Customization",
    description:
      "Custom Moodle plugins, theme work, integrations, and performance tuning for universities, colleges, and training organizations. Experience delivering through a Moodle Certified Partner.",
  },
  {
    name: "Technical Oversight & Code Review",
    description:
      "Independent review of work delivered by outsourced development partners: estimate validation, code and QA review, risk assessment, and stakeholder reporting.",
  },
  {
    name: "Backend & API Engineering",
    description:
      "PHP and Laravel backends, REST API design, relational schema modelling in PostgreSQL, and authentication and role-based access control.",
  },
  {
    name: "Data Pipelines & Automation",
    description:
      "Scheduled data collection, transformation, and publishing with Python and GitHub Actions, including financial and market data workflows.",
  },
  {
    name: "Mobile Application Development",
    description:
      "Cross-platform iOS and Android applications built with React Native, including customer-facing and business-facing app pairs.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      ...organizationSchema,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `${BUSINESS_NAME} Services`,
        itemListElement: services.map((service, index) => ({
          "@type": "Offer",
          position: index + 1,
          itemOffered: {
            "@type": "Service",
            name: service.name,
            description: service.description,
            provider: { "@id": ORG_ID },
            areaServed: {
              "@type": "AdministrativeArea",
              name: "Ontario, Canada",
            },
          },
        })),
      },
    },
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/services`,
      url: `${BASE_URL}/services`,
      name: `Services | ${BUSINESS_NAME}`,
      about: { "@id": PERSON_ID },
      isPartOf: { "@id": `${BASE_URL}/#website` },
    },
  ],
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageShell
        particlesId="services-particles"
        currentPath="/services"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
        ]}
        title="Services"
        subtitle="Niko Hoogeveen Consulting • Toronto, Ontario, Canada"
      >
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">
            How I work with clients
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              I&apos;m a software engineer based in Toronto, Ontario. Alongside my
              work at Catalyst IT Canada, I take on a small number of independent
              engagements through Niko Hoogeveen Consulting - typically scoped
              builds, platform customization, or oversight of an existing
              development team.
            </p>
            <p>
              Engagements start with a short scoping conversation, followed by a
              written proposal covering approach, timeline, and cost. Work is
              delivered in reviewable increments with source control and
              documentation handed over at the end.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Services offered
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((service) => (
              <article key={service.name}>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Service area and contact
          </h2>
          <dl className="space-y-2 text-gray-300">
            <div className="flex gap-2">
              <dt className="font-semibold text-white">Business:</dt>
              <dd>{BUSINESS_NAME}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-white">Service area:</dt>
              <dd>Toronto and the Greater Toronto Area, Ontario, Canada</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-white">Phone:</dt>
              <dd>
                <a
                  href={`tel:${TELEPHONE}`}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  (705) 220-5623
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-white">Email:</dt>
              <dd>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {EMAIL}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-white">Hours:</dt>
              <dd>Open 24 hours</dd>
            </div>
          </dl>
          <p className="mt-6 text-gray-300">
            See{" "}
            <Link
              href="/resume"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              my resume
            </Link>{" "}
            for full background, or{" "}
            <Link
              href="/contact"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              get in touch
            </Link>{" "}
            to discuss a project.
          </p>
        </section>
      </PageShell>
    </>
  );
}
