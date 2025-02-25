import React from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

export default function Footer() {
  return (
    <footer className="text-gray-300 py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="mb-4">
          © {new Date().getFullYear()} Niko Hoogeveen. All rights reserved.
        </p>
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
      </div>
    </footer>
  );
}
