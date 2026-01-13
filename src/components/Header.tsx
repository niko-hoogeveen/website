import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import Technologies from "@/components/Technologies";
import ContactCard from "@/components/ContactCard";
import DashboardCard from "@/components/DashboardCard";
import AboutCard from "@/components/AboutCard";
import Link from "next/link";

export default function Header() {
  return (
    <header className="font-geist text-center mb-4">
      <h1 className="text-3xl font-bold">Niko Hoogeveen</h1>
      <p className="text-lg text-gray-400">Toronto, Ontario, Canada</p>
      <p className="text-lg text-gray-400">Software Engineer</p>
      <div className="flex justify-center gap-4 mt-4">
        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md transition-transform duration-300 hover:scale-105 group"
        >
          <FaLinkedin
            size={24}
            className="transition-transform duration-300 group-hover:rotate-180"
          />
        </a>

        {/* Email */}
        <a
          href="mailto:niko.hoogeveen@gmail.com"
          className="rounded-md transition-transform duration-300 hover:scale-105 group"
        >
          <HiOutlineMail
            size={24}
            className="transition-transform duration-300 group-hover:rotate-180"
          />
        </a>

        {/* GitHub */}
        <a
          href="https://github.com/niko-hoogeveen"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md transition-transform duration-300 hover:scale-105 group"
        >
          <FaGithub
            size={24}
            className="transition-transform duration-300 group-hover:rotate-180"
          />
        </a>
      </div>

      <div className="mt-8 w-full flex items-center justify-center">
        <div className="flex flex-column gap-3">
          <Link href="/about">
            <AboutCard />
          </Link>
          <Link href="/dashboard">
            <DashboardCard />
          </Link>
          <Link href="/contact">
            <ContactCard />
          </Link>
        </div>
      </div>
      <div className="mt-8">
        <Technologies />
      </div>
    </header>
  );
}
