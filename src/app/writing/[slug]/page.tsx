import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { POSTS, getPost } from "@/lib/posts";
import {
  BASE_URL,
  PERSON_ID,
  PERSON_NAME,
  PROFILE_IMAGE,
} from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: "Article not found" };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: PERSON_NAME, url: BASE_URL }],
    alternates: { canonical: `${BASE_URL}/writing/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${BASE_URL}/writing/${post.slug}`,
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [BASE_URL],
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${BASE_URL}/writing/${post.slug}`,
    mainEntityOfPage: `${BASE_URL}/writing/${post.slug}`,
    headline: post.title,
    description: post.description,
    image: PROFILE_IMAGE,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: "en-CA",
    keywords: post.keywords.join(", "),
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": `${BASE_URL}/writing` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageShell
        particlesId={`post-${post.slug}-particles`}
        currentPath="/writing"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Writing", href: "/writing" },
          { name: post.title, href: `/writing/${post.slug}` },
        ]}
        title={post.title}
        subtitle={`By ${PERSON_NAME} • ${dateFormatter.format(
          new Date(post.datePublished)
        )}`}
      >
        <article className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          {post.body.map((block, index) => {
            if (block.type === "h2") {
              return (
                <h2
                  key={index}
                  className="text-2xl font-bold text-white mt-8 first:mt-0 mb-3"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "ul") {
              return (
                <ul
                  key={index}
                  className="list-disc ml-5 space-y-2 text-gray-300 leading-relaxed mb-4"
                >
                  {block.items?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={index} className="text-gray-300 leading-relaxed mb-4">
                {block.text}
              </p>
            );
          })}
        </article>

        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">
            About the author
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Niko Hoogeveen is a software engineer based in Toronto, Ontario. He
            builds custom Moodle and web applications at Catalyst IT Canada and
            takes on independent engagements through Niko Hoogeveen Consulting.
            Read more{" "}
            <Link
              href="/about"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              about Niko Hoogeveen
            </Link>
            , browse{" "}
            <Link
              href="/writing"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              other articles
            </Link>
            , or{" "}
            <Link
              href="/contact"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              get in touch
            </Link>
            .
          </p>
        </section>
      </PageShell>
    </>
  );
}
