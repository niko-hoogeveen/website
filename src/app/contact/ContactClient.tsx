"use client";

import React from "react";
import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaArrowLeft,
  FaCalendarAlt,
  FaInstagram,
} from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import PageParticles from "@/components/Particles";
import Breadcrumbs from "@/components/Breadcrumbs";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";

const contactMethods = [
  {
    name: "Schedule a Call",
    description: "Book a time that works for you",
    href: "https://cal.com/niko-hoogeveen",
    icon: FaCalendarAlt,
    primary: true,
    external: true,
  },
  {
    name: "LinkedIn",
    description: "Connect professionally",
    href: "https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/",
    icon: FaLinkedin,
    primary: false,
    external: true,
  },
  {
    name: "Email",
    description: "niko.hoogeveen@gmail.com",
    href: "mailto:niko.hoogeveen@gmail.com",
    icon: HiOutlineMail,
    primary: false,
    external: false,
  },
  {
    name: "GitHub",
    description: "View my code and projects",
    href: "https://github.com/niko-hoogeveen",
    icon: FaGithub,
    primary: false,
    external: true,
  },
  {
    name: "Instagram",
    description: "@nikohoogeveen",
    href: "https://www.instagram.com/nikohoogeveen/",
    icon: FaInstagram,
    primary: false,
    external: true,
  },
];

export default function ContactClient() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <PageParticles id="contact-particles" />
      <SiteNav currentPath="/contact" />

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
          { name: "Contact", href: "/contact" },
        ]}
      />

      {/* Header Section */}
      <div className="animate-slide-in-top mb-10">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Contact Niko Hoogeveen
        </h1>
        <p className="text-xl text-gray-400">
          Let&apos;s connect • Toronto, Ontario, Canada
        </p>
      </div>

      {/* Main Content */}
      <div className="animate-slide-in-bottom space-y-8">
        {/* Intro Section */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Get in Touch</h2>
          <p className="text-gray-300 leading-relaxed">
            I&apos;m always interested in hearing about new opportunities,
            interesting projects, or just connecting with fellow engineers and
            analysts. Whether you want to discuss a potential collaboration,
            have a question about my work, or just want to say hello—feel free
            to reach out through any of the channels below.
          </p>
        </section>

        {/* Contact Methods */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Ways to Connect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <a
                  key={method.name}
                  href={method.href}
                  target={method.external ? "_blank" : undefined}
                  rel={method.external ? "noopener noreferrer" : undefined}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                    method.primary
                      ? "bg-blue-600 hover:bg-blue-700 border-blue-500"
                      : "bg-gray-800/80 hover:bg-gray-700/80 border-gray-700/50 hover:border-gray-600"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      method.primary ? "bg-blue-500" : "bg-gray-700"
                    }`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{method.name}</h3>
                    <p
                      className={`text-sm ${
                        method.primary ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {method.description}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Availability Section */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Availability</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              📍 Based in <strong>Toronto, Ontario, Canada</strong> (EST/EDT timezone)
            </p>
            <p>
              💼 Open to <strong>full-time opportunities</strong>, contract work, and
              consulting engagements
            </p>
            <p>
              🎯 Particularly interested in roles involving{" "}
              <strong>software engineering</strong> and <strong>financial technology</strong>
            </p>
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
            href="/about"
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            About Me
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            View Stock Dashboard
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
