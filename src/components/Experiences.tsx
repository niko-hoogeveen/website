"use client";

import React, { useState } from "react";

interface Experience {
  role: string;
  company: string;
  shortDescription: string;
  longDescription: React.ReactNode;
}

const experiences: Experience[] = [
  {
    role: "Software Developer",
    company: "Catalyst IT Canada | Moodle Certified Partner",
    shortDescription: "Developed custom e-learning solutions.",
    longDescription: (
      <>
        <strong>
          Skills: PHP, Javascript, Git/Source Control, Docker, Linux, Moodle
        </strong>{" "}
        <br></br>I worked on custom e-learning solutions for clients using
        Moodle, an open-source learning management system. I developed custom
        plugins, themes, and integrations to meet client requirements.
      </>
    ),
  },
  {
    role: "Coxswain - Search and Rescue",
    company: "Canadian Coast Guard/Garde côtière canadienne",
    shortDescription:
      "Commanding officer of an Inshore Search and Rescue Boat station",
    longDescription: (
      <>
        <strong>
          Skills: Critical Thinking, Problem Solving, Organization,
          Interpersonal Skills
        </strong>
        <br></br>
        Responsible for the station vessel, grounds, crew, assets, and the
        unit&aposs response to marine emergencies. Find out more on the official
        website: <br></br>
        <br></br>
        <a
          href="https://www.ccg-gcc.gc.ca/search-rescue-recherche-sauvetage/irb-esc/student-prog-etudiant-eng.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-300"
        >
          Canadian Coast Guard - Search and Rescue
        </a>
      </>
    ),
  },
];

export default function Experiences() {
  // Instead of a single index, store a boolean array for all items
  const [expanded, setExpanded] = useState<boolean[]>(
    experiences.map(() => false)
  );

  const handleToggle = (index: number) => {
    setExpanded((prev) =>
      prev.map((isExpanded, i) => (i === index ? !isExpanded : isExpanded))
    );
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Work Experience</h2>
      <div className="space-y-4">
        {experiences.map((exp, idx) => (
          <ExperienceCard
            key={idx}
            exp={exp}
            isExpanded={expanded[idx]}
            onToggle={() => handleToggle(idx)}
          />
        ))}
      </div>
    </section>
  );
}

function ExperienceCard({
  exp,
  isExpanded,
  onToggle,
}: {
  exp: Experience;
  isExpanded: boolean;
  onToggle: () => void;
}) {
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
    ? `radial-gradient(circle 400px at ${hoverPos.x}px ${hoverPos.y}px, rgba(200, 200, 200, 0.3), transparent 80%)`
    : "transparent";

  return (
    <div
      // The outer container: transparent + transform scale on hover
      className="border border-gray-700 rounded-lg bg-transparent
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
      <div className="p-4 flex justify-between items-center" onClick={onToggle}>
        <div>
          <h3 className="text-lg font-bold">{exp.role}</h3>
          <p className="text-sm text-gray-400">{exp.company}</p>
        </div>
        <span className="text-blue-500 size-4">{isExpanded ? "-" : "+"}</span>
      </div>

      {/* Smoothly animated content */}
      <div
        className={`
          mx-4 mb-4 text-gray-200
          overflow-hidden
          transition-all duration-500 ease-in-out
          ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <p>{exp.longDescription}</p>
      </div>
    </div>
  );
}
