"use client";
import Header from "@/components/Header";
import Experiences from "@/components/Experiences";
import Projects from "@/components/Projects";
import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import Head from "next/head";
import Education from "@/components/Education";
import Footer from "@/components/Footer";

export default function Home() {
  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: {
        enable: true,
        zIndex: -1,
      },
      background: {
        color: {
          value: "#0c0c0c",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: false,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 8,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.1,
          width: 1,
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: {
            default: OutMode.out,
          },
          random: true,
          speed: 4,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 150,
        },
        opacity: {
          value: 0.1,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (init) {
    return (
      <>
        <Head>
          <title>
            Niko Hoogeveen - Software Engineer & Creative Technologist
          </title>
          <meta
            name="description"
            content="Niko Hoogeveen is a skilled software engineer specializing in modern web applications and creative technology solutions."
          />
          <meta
            name="keywords"
            content="Niko Hoogeveen, Software Engineer, Web Developer, Portfolio, Hoogeveen, Niko"
          />
          <meta name="author" content="Niko Hoogeveen" />
          <link rel="canonical" href="https://nikohoogeveen.com/" />

          {/* Open Graph tags */}
          <meta
            property="og:title"
            content="Niko Hoogeveen - Software Engineer"
          />
          <meta
            property="og:description"
            content="Discover the portfolio of Niko Hoogeveen, software engineer."
          />
          <meta property="og:url" content="https://nikohoogeveen.com/" />
          <meta property="og:type" content="website" />

          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Niko Hoogeveen - Software Engineer"
          />
          <meta
            name="twitter:description"
            content="Explore the work of Niko Hoogeveen, software engineer."
          />
          <meta name="twitter:image" content="https://nikohoogeveen.com/" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Niko Hoogeveen",
                url: "https://nikohoogeveen.com/",
                sameAs: [
                  "https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/",
                  "https://github.com/niko-hoogeveen",
                ],
                jobTitle: "Software Engineer",
                description:
                  "Niko Hoogeveen is a software engineer specializing in modern web applications and creative technology solutions.",
              }),
            }}
          />
        </Head>
        <main className="max-w-4xl mx-auto p-4 mt-5">
          <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={options}
          />
          <Header />
          <hr className="my-8" />
          <Experiences />
          <hr className="my-8" />
          <Education/>
          <hr className="my-8" />
          <Projects />
          <Footer />
        </main>
      </>
    );
  }
  return <></>;
}
