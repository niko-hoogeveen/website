import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import {
  BASE_URL,
  KNOWS_ABOUT,
  PERSON_ID,
  PERSON_NAME,
  personSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume of Niko Hoogeveen, software engineer in Toronto, Ontario: Catalyst IT Canada, MoveBuddy, Cactus Loyalty App, Canadian Coast Guard, and a BASc in Computer Engineering from Queen's University.",
  keywords: [
    "Niko Hoogeveen Resume",
    "Niko Hoogeveen CV",
    "Niko Hoogeveen Experience",
    "Software Engineer Resume Toronto",
    "Queen's University Computer Engineering",
  ],
  alternates: { canonical: `${BASE_URL}/resume` },
  openGraph: {
    title: "Resume | Niko Hoogeveen",
    description:
      "Full work experience, education, and technical skills for Niko Hoogeveen, software engineer in Toronto, Ontario.",
    url: `${BASE_URL}/resume`,
    type: "profile",
  },
};

interface Role {
  title: string;
  organization: string;
  period: string;
  location: string;
  skills: string;
  bullets: string[];
}

const roles: Role[] = [
  {
    title: "Software Developer",
    organization: "Catalyst IT Canada (Moodle Certified Partner)",
    period: "Present",
    location: "Toronto, Ontario, Canada",
    skills:
      "PHP, JavaScript, Git, Docker, Linux, Moodle, Client Communication",
    bullets: [
      "Design and implement custom Moodle solutions for university and college clients, adapting e-learning platforms to institution-specific requirements.",
      "Create project specifications and technical proposals by translating client requirements into scoped implementation plans.",
      "Develop and maintain user-facing features and backend functionality using PHP and JavaScript within client environments.",
      "Investigate and resolve client-reported issues through structured debugging and root-cause analysis.",
      "Implement Moodle and hosted-database optimization initiatives that reduce database load and lower infrastructure costs.",
    ],
  },
  {
    title: "Technical Oversight Consultant",
    organization: "MoveBuddy.com",
    period: "Contract",
    location: "Remote",
    skills:
      "Technical Oversight, Code Review, QA Processes, Stakeholder Communication, Risk Assessment",
    bullets: [
      "Oversaw work delivered by an external development partner, ensuring quality, timelines, and accountability met internal expectations.",
      "Reviewed JIRA tasks and development estimates prior to implementation, flagging scope, complexity, and execution risks early.",
      "Conducted regular code and QA reviews to assess performance, maintainability, and alignment with business requirements.",
      "Acted as a liaison between business stakeholders and developers, reporting on progress, blockers, and delivery risks.",
    ],
  },
  {
    title: "Tech Lead & Software Developer",
    organization: "Cactus Loyalty App",
    period: "Contract",
    location: "Remote",
    skills:
      "React Native, Laravel (PHP), REST APIs, PostgreSQL, Mobile Development, CI/CD",
    bullets: [
      "Architected a scalable loyalty rewards platform using Laravel, featuring an optimized relational schema and RESTful APIs.",
      "Led development of a full-stack platform consisting of separate customer and business-facing mobile applications.",
      "Developed two fully responsive mobile applications using React Native and Tailwind CSS, alongside a Vite.js web application.",
      "Built QR-based point collection, rewards management, user authentication, and role-based access controls.",
      "Established and maintained a CI/CD pipeline in a collaborative Scrum environment using GitHub Actions.",
    ],
  },
  {
    title: "Coxswain — Inshore Search and Rescue",
    organization: "Canadian Coast Guard",
    period: "Seasonal",
    location: "Canada",
    skills:
      "Leadership, Critical Thinking, Decision-Making Under Pressure, Team Coordination",
    bullets: [
      "Served as commanding officer of an Inshore Search and Rescue Boat station, responsible for vessel readiness, crew coordination, and operational response.",
      "Led marine emergency responses requiring rapid decision-making under uncertainty and evolving conditions.",
      "Coordinated with multiple agencies and communicated clearly during time-sensitive, safety-critical situations.",
    ],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      ...personSchema,
      hasOccupation: roles.map((role) => ({
        "@type": "OrganizationRole",
        roleName: role.title,
        namedPosition: role.title,
        memberOf: {
          "@type": "Organization",
          name: role.organization,
        },
      })),
    },
    {
      "@type": "ProfilePage",
      "@id": `${BASE_URL}/resume`,
      url: `${BASE_URL}/resume`,
      name: `Resume | ${PERSON_NAME}`,
      mainEntity: { "@id": PERSON_ID },
      isPartOf: { "@id": `${BASE_URL}/#website` },
    },
  ],
};

export default function ResumePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageShell
        particlesId="resume-particles"
        currentPath="/resume"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Resume", href: "/resume" },
        ]}
        title="Niko Hoogeveen — Resume"
        subtitle="Software Engineer • Toronto, Ontario, Canada"
      >
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Summary</h2>
          <p className="text-gray-300 leading-relaxed">
            Software engineer with a Bachelor of Applied Science in Computer
            Engineering from Queen&apos;s University. Currently building custom
            Moodle and web solutions for institutional clients at Catalyst IT
            Canada, with prior experience leading full-stack mobile product
            development and providing technical oversight for startups. Former
            Coxswain in the Canadian Coast Guard&apos;s Inshore Search and Rescue
            program.
          </p>
        </section>

        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-white">Work Experience</h2>
          <div className="space-y-8">
            {roles.map((role) => (
              <article key={`${role.title}-${role.organization}`}>
                <h3 className="text-lg font-semibold text-white">
                  {role.title}
                </h3>
                <p className="text-gray-400">{role.organization}</p>
                <p className="text-sm text-gray-500 mb-2">
                  {role.period} • {role.location}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  <strong className="text-gray-300">Skills:</strong>{" "}
                  {role.skills}
                </p>
                <ul className="list-disc ml-5 space-y-1 text-gray-300 text-sm">
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Education</h2>
          <h3 className="text-lg font-semibold text-white">
            Bachelor of Applied Science, Computer Engineering
          </h3>
          <p className="text-gray-400">
            Queen&apos;s University • Stephen J.R. Smith Faculty of Engineering
            and Applied Science
          </p>
          <p className="text-sm text-gray-500">Kingston, Ontario, Canada</p>
        </section>

        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Core Skills</h2>
          <div className="flex flex-wrap gap-3">
            {KNOWS_ABOUT.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-300 text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
          <p className="mt-6 text-gray-300">
            Related:{" "}
            <Link
              href="/projects"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              engineering projects
            </Link>
            ,{" "}
            <Link
              href="/services"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              consulting services
            </Link>
            , and{" "}
            <Link
              href="/about"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              background
            </Link>
            .
          </p>
        </section>
      </PageShell>
    </>
  );
}
