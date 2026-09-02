import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { POSTS } from "@/lib/posts";
import { BASE_URL, PERSON_ID, PERSON_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Articles by Niko Hoogeveen on Moodle performance work, equity research tooling, and technical oversight of outsourced software development.",
  keywords: [
    "Niko Hoogeveen articles",
    "Niko Hoogeveen blog",
    "Moodle performance",
    "technical oversight",
    "equity research tooling",
  ],
  alternates: { canonical: `${BASE_URL}/writing` },
  openGraph: {
    title: "Writing | Niko Hoogeveen",
    description:
      "Articles by Niko Hoogeveen on software engineering, Moodle development, and equity research tooling.",
    url: `${BASE_URL}/writing`,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Blog",
      "@id": `${BASE_URL}/writing`,
      url: `${BASE_URL}/writing`,
      name: `Writing | ${PERSON_NAME}`,
      description:
        "Articles by Niko Hoogeveen on software engineering, Moodle development, and equity research tooling.",
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      isPartOf: { "@id": `${BASE_URL}/#website` },
      blogPost: POSTS.map((post) => ({
        "@type": "BlogPosting",
        "@id": `${BASE_URL}/writing/${post.slug}`,
        headline: post.title,
        description: post.description,
        datePublished: post.datePublished,
        dateModified: post.dateModified,
        url: `${BASE_URL}/writing/${post.slug}`,
        author: { "@id": PERSON_ID },
      })),
    },
  ],
};

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default function WritingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageShell
        particlesId="writing-particles"
        currentPath="/writing"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Writing", href: "/writing" },
        ]}
        title="Writing"
        subtitle="Notes on software engineering, Moodle, and market data"
      >
        {POSTS.map((post) => (
          <article
            key={post.slug}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-2 text-white">
              <Link
                href={`/writing/${post.slug}`}
                className="hover:text-blue-300 transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              <time dateTime={post.datePublished}>
                {dateFormatter.format(new Date(post.datePublished))}
              </time>
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              {post.description}
            </p>
            <Link
              href={`/writing/${post.slug}`}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Read the article
            </Link>
          </article>
        ))}
      </PageShell>
    </>
  );
}
