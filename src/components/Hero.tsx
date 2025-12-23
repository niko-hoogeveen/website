import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

export default function Hero() {
  return (
    <header className="font-geist text-center mb-4">
      <div className="flex justify-center gap-4 mt-1">
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
    </header>
  );
}
