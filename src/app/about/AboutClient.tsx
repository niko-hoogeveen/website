"use client";

import React from "react";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import PageParticles from "@/components/Particles";
import Breadcrumbs from "@/components/Breadcrumbs";

const skills = [
  "PHP",
  "JavaScript",
  "React",
  "React Native",
  "Next.js",
  "Node.js",
  "Docker",
  "Git",
  "Linux",
  "Moodle",
  "Python",
  "PostgreSQL",
  "Tailwind CSS",
];

const interests = [
  "Recreational Sports (hockey, ultimate frisbee)",
  "Mountain Biking",
  "Road Biking",
  "Kitesurfing",
  "Software Engineering",
  "AI driven software development",
  "Financial Markets",
];

export default function AboutClient() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <PageParticles id="about-particles" />

      {/* Back Navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />

      {/* Header Section */}
      <div className="animate-slide-in-top mb-10">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          About Niko Hoogeveen
        </h1>
        <p className="text-xl text-gray-400">
          Software Engineer • Toronto, Ontario, Canada
        </p>
      </div>

      {/* Main Content */}
      <div className="animate-slide-in-bottom space-y-8">
        {/* Bio Section */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Background</h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              I&apos;m a software engineer with a Bachelor of Applied Science in Computer
              Engineering from Queen&apos;s University (Stephen J.R. Smith Faculty of
              Engineering and Applied Science). Based in Toronto, I specialize in
              building modern web applications and have a growing interest in
              financial analysis and equity research.
            </p>
            <p>
              My professional experience spans e-learning platform development at
              Catalyst IT Canada (a Moodle Certified Partner), where I build custom
              solutions for institutional clients, to technical oversight consulting
              for startups. I&apos;ve also served as a Coxswain in the Canadian Coast
              Guard&apos;s Inshore Search and Rescue program, leading emergency response
              operations in high-pressure environments.
            </p>
            <p>
              Outside of traditional software engineering, I&apos;ve been teaching myself
              equity research by building tools like my{" "}
              <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 underline">
                Stock Analysis Dashboard
              </Link>
              —a hands-on way to understand how analysts evaluate companies through
              price data, earnings metrics, and valuation multiples.
            </p>
          </div>
        </section>

        {/* Skills Section */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Technical Skills</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-300 text-sm font-medium hover:border-gray-600 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Interests Section */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Interests</h2>
          <ul className="space-y-2">
            {interests.map((interest) => (
              <li key={interest} className="flex items-center gap-3 text-gray-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {interest}
              </li>
            ))}
          </ul>
        </section>

        {/* Education Section */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Education</h2>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Bachelor of Applied Science in Computer Engineering
            </h3>
            <p className="text-gray-400">
              Queen&apos;s University • Stephen J.R. Smith Faculty of Engineering and
              Applied Science
            </p>
            <p className="text-gray-500 text-sm mt-1">Kingston, Ontario, Canada</p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Get in Touch</h2>
          <p className="text-gray-300 mb-6">
            I&apos;m always open to discussing new opportunities, interesting projects,
            or just connecting with fellow engineers and analysts.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              <FaLinkedin size={20} />
              LinkedIn
            </a>
            <a
              href="mailto:niko.hoogeveen@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <HiOutlineMail size={20} />
              Email
            </a>
            <a
              href="https://github.com/niko-hoogeveen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <FaGithub size={20} />
              GitHub
            </a>
            <a
              href="https://cal.com/niko-hoogeveen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <FaCalendarAlt size={20} />
              Schedule a Call
            </a>
          </div>
        </section>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            Back to Portfolio
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            View Stock Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
