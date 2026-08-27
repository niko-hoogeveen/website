import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import Technologies from "@/components/Technologies";
import NavCard from "@/components/NavCard";

const navLinks = [
  {
    href: "/about",
    title: "About Me",
    description: "Learn more about my background",
  },
  {
    href: "/contact",
    title: "Contact Me",
    description: "Set up a meeting at your convenience",
  },
  {
    href: "/dashboard",
    title: "Equity Research Dashboard",
    description: "View my financial reports",
  },
  {
    href: "/projects/calorie-prediction",
    title: "Calorie Prediction Demo",
    description: "See the model classify exercises live",
  }
];

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

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {navLinks.map((link) => (
          <NavCard key={link.href} {...link} />
        ))}
      </div>
      <div className="mt-8">
        <Technologies />
      </div>
    </header>
  );
}
