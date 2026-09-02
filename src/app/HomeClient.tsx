"use client";
import Header from "@/components/Header";
import Experiences from "@/components/Experiences";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Footer from "@/components/Footer";
import SiteNav from "@/components/SiteNav";
import PageParticles from "@/components/Particles";

export default function HomeClient() {
  return (
    <main className="max-w-4xl mx-auto p-4 mt-5">
      <PageParticles />
      <SiteNav currentPath="/" />
      <div className="animate-slide-in-top">
        <Header />
      </div>
      <div className="animate-slide-in-bottom">
        <hr className="my-8" />
        <Experiences />
        <hr className="my-8" />
        <Education />
        <hr className="my-8" />
        <Projects />
        <Footer />
      </div>
    </main>
  );
}
