import React from "react";
import { useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

export default function Header() {
  return (
    <header className="font-geist text-center mb-4">
      <h1 className="text-3xl font-bold">Niko Hoogeveen</h1>
      <p className="text-lg text-gray-400">Software Engineer</p>
      <div className="flex justify-center gap-4 mt-4">
        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md transition-transform duration-300 bg-blue-600 hover:bg-blue-800 hover:scale-105 group"
        >
          <FaLinkedin size={24} className="transition-transform duration-300 group-hover:rotate-180" />
        </a>

        {/* Email */}
        <a
          href="mailto:niko.hoogeveen@gmail.com"
          className="rounded-md transition-transform duration-300 bg-blue-600 hover:bg-blue-800 hover:scale-105 group"
        >
          <HiOutlineMail size={24} className="transition-transform duration-300 group-hover:rotate-180" />
        </a>

        {/* GitHub */}
        <a
          href="https://github.com/niko-hoogeveen"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md transition-transform duration-300 bg-blue-600 hover:bg-blue-800 hover:scale-105 group"
        >
          <FaGithub size={24} className="transition-transform duration-300 group-hover:rotate-180"/>
        </a>
      </div>

      <div className="mt-8 w-full flex items-center justify-center" >
        <a
        href="https://cal.com/niko-hoogeveen"
        target="_blank"
        rel="noopener noreferrer"
        >
          <ContactCard/>
        </a>
        
      </div>
    </header>
  );
}


function ContactCard() {
  // Track mouse position for radial highlight
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // When the mouse moves over this card, update local state
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoverPos({ x, y });
  };

  // Clear the highlight when the mouse leaves
  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  // If we're hovering, create a small radial gradient around the cursor
  const backgroundStyle = hoverPos
    ? `radial-gradient(circle 100px at ${hoverPos.x}px ${hoverPos.y}px, rgba(200, 200, 200, 0.3), transparent 80%)`
    : "transparent";

  return (
    <div
      // The outer container: transparent + transform scale on hover
      className="w-80 border border-gray-700 rounded-xl bg-transparent
                 transition-all duration-300 ease-out
                 hover:scale-105 hover:shadow-lg cursor-pointer"
      // Inline style for dynamic radial highlight
      style={{
        background: backgroundStyle,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Clickable header */}
      <div className="p-3 flex-row">
        <div>
          <h3 className="text-lg font-bold">Contact Me</h3>
          <p className="text-sm text-gray-400">Set up a meeting at your convenience</p>
        </div>
      </div>
    </div>
  );
}
