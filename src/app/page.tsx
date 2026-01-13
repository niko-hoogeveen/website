import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Niko Hoogeveen - Software Engineer & Creative Technologist",
  description:
    "Niko Hoogeveen is a skilled software engineer specializing in modern web applications and creative technology solutions.",
  keywords: [
    "Niko Hoogeveen",
    "Software Engineer",
    "Web Developer",
    "Portfolio",
    "Hoogeveen",
    "Niko",
  ],
  alternates: {
    canonical: "https://nikohoogeveen.com/",
  },
  openGraph: {
    title: "Niko Hoogeveen - Software Engineer",
    description: "Discover the portfolio of Niko Hoogeveen, software engineer.",
    url: "https://nikohoogeveen.com/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Niko Hoogeveen - Software Engineer",
    description: "Explore the work of Niko Hoogeveen, software engineer.",
  },
};

export default function Home() {
  return <HomeClient />;
}
