import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { BASE_URL, PERSON_ID, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Engineering projects and case studies by Niko Hoogeveen, including a ResNet-50 workout classifier, an equity research dashboard, and a full-stack loyalty rewards platform.",
  keywords: [
    "Niko Hoogeveen Projects",
    "Niko Hoogeveen Portfolio",
    "Machine Learning Project",
    "Equity Research Dashboard",
    "React Native Loyalty App",
  ],
  alternates: { canonical: `${BASE_URL}/projects` },
  openGraph: {
    title: "Projects | Niko Hoogeveen",
    description:
      "Engineering projects and case studies by Niko Hoogeveen: machine learning, equity research tooling, and full-stack product work.",
    url: `${BASE_URL}/projects`,
    type: "website",
  },
};

interface Project {
  name: string;
  href: string;
  external?: boolean;
  summary: string;
  stack: string;
}

const projects: Project[] = [
  {
    name: "Calorie Prediction Network",
    href: "/projects/calorie-prediction",
    summary:
      "A ResNet-50 transfer learning model that classifies workout video as deadlift, squat, or bench press and estimates calories burned from BMR and MET values. Fourth-year capstone project at Queen's University.",
    stack: "Python, TensorFlow, Keras, Computer Vision",
  },
  {
    name: "Equity Research & Market Dashboard",
    href: "/dashboard",
    summary:
      "An interactive dashboard tracking earnings, valuation, and market performance for Amazon, Meta, and Nvidia. Price charts carry earnings overlays, and data refreshes on a schedule via GitHub Actions.",
    stack: "Next.js, TypeScript, Python, GitHub Actions",
  },
  {
    name: "Cactus Loyalty App",
    href: "https://cactusapp.ca/",
    external: true,
    summary:
      "A loyalty rewards platform with separate customer and business mobile applications, QR-based point collection, rewards management, and role-based access control.",
    stack: "React Native, Laravel, PostgreSQL, CI/CD",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/projects`,
      url: `${BASE_URL}/projects`,
      name: "Projects | Niko Hoogeveen",
      about: { "@id": PERSON_ID },
      isPartOf: { "@id": `${BASE_URL}/#website` },
    },
    {
      "@type": "ItemList",
      "@id": `${BASE_URL}/projects#list`,
      name: "Engineering projects by Niko Hoogeveen",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.name,
        url: project.external ? project.href : absoluteUrl(project.href),
      })),
    },
  ],
};

export default function ProjectsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageShell
        particlesId="projects-particles"
        currentPath="/projects"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Projects", href: "/projects" },
        ]}
        title="Projects"
        subtitle="Case studies and engineering work by Niko Hoogeveen"
      >
        {projects.map((project) => (
          <article
            key={project.name}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-2 text-white">
              {project.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{project.stack}</p>
            <p className="text-gray-300 leading-relaxed mb-4">
              {project.summary}
            </p>
            {project.external ? (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Visit {project.name}
              </a>
            ) : (
              <Link
                href={project.href}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                View {project.name}
              </Link>
            )}
          </article>
        ))}
      </PageShell>
    </>
  );
}
