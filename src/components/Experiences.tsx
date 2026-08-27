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
    shortDescription:
      "Built and supported custom e-learning solutions for institutional clients.",
    longDescription: (
      <>
        <strong>
          Skills: PHP, JavaScript, Git/Source Control, Docker, Linux, Moodle,
          Client Communication
        </strong>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            Design and implement custom Moodle solutions for university and college clients,
            adapting e-learning platforms to meet institution-specific requirements.
          </li>
          <li>
            Create project specifications and technical proposals by translating client requirements
            into scoped implementation plans for Moodle customizations and integrations.
          </li>
          <li>
            Develop and maintain user-facing features and backend functionality using PHP and JavaScript
            within client environments.
          </li>
          <li>
            Investigate and resolve client-reported issues through structured debugging and root-cause analysis.
          </li>
          <li>
            Implement Moodle and hosted-database optimization initiatives that reduce database load, improve
            resource utilization, and lower infrastructure costs for client sites.
          </li>
        </ul>
      </>
    ),
  },
  {
    role: "Technical Oversight Consultant",
    company: "MoveBuddy.com",
    shortDescription:
      "Provided technical oversight and delivery assurance for an external development team.",
    longDescription: (
      <>
        <strong>
          Skills: Technical Oversight, Code Review, QA Processes, Stakeholder
          Communication, Risk Assessment
        </strong>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            Oversaw work delivered by an external development partner, ensuring
            quality, timelines, and accountability met internal expectations.
          </li>
          <li>
            Reviewed JIRA tasks and development estimates prior to
            implementation, flagging scope, complexity, and execution risks
            early.
          </li>
          <li>
            Conducted regular code and QA reviews to assess performance,
            maintainability, and alignment with business requirements.
          </li>
          <li>
            Identified recurring delivery and process issues, recommending
            workflow and QA improvements to reduce risk and rework.
          </li>
          <li>
            Acted as a liaison between business stakeholders and developers,
            reporting on progress, blockers, and delivery risks.
          </li>
        </ul>
      </>
    ),
  },
  {
    role: "Tech Lead & Software Developer",
    company: "Cactus Loyalty App",
    shortDescription:
      "Custom loyalty and rewards platform for small-to-medium sized businesses.",
    longDescription: (
      <>
        <strong>
          Skills: React Native, Laravel (PHP), REST APIs, PostgreSQL, Mobile
          Development, CI/CD
        </strong>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
              Architected a scalable loyalty rewards platform using Laravel (PHP), 
              featuring an optimized relational database schema and RESTful APIs to support robust integrations.    
          </li>
          <li>
            Led development of a full-stack loyalty rewards platform consisting
            of separate customer and business-facing mobile applications.
          </li>
          <li>
            Developed two fully responsive mobile applications using React Native
            and Tailwind CSS, alongside a high-performance web application powered by Vite.js.
          </li>
          <li>
            Built core features including QR-based point collection, rewards
            management, user authentication, and role-based access controls.
          </li>
          <li>
            Established and maintained a CI/CD pipeline in a collaborative Scrum
            environment, enabling streamlined deployments and faster iteration cycles via GitHub Actions.
          </li>
        </ul>
        <div className="mt-3">
          <a
            href="https://cactusapp.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-300"
          >
            Learn More About Cactus
          </a>
        </div>
      </>
    ),
  },
  {
    role: "Coxswain - Search and Rescue",
    company: "Canadian Coast Guard / Garde côtière canadienne",
    shortDescription:
      "Led search and rescue operations in high-pressure, safety-critical environments.",
    longDescription: (
      <>
        <strong>
          Skills: Leadership, Critical Thinking, Decision-Making Under Pressure,
          Communication, Team Coordination
        </strong>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            Served as the commanding officer of an Inshore Search and Rescue
            Boat station, responsible for vessel readiness, crew coordination,
            and operational response.
          </li>
          <li>
            Led marine emergency responses requiring rapid decision-making under
            uncertainty and evolving conditions.
          </li>
          <li>
            Coordinated with multiple agencies and communicated clearly during
            time-sensitive, safety-critical situations.
          </li>
          <li>
            Developed strong leadership, situational awareness, and composure in
            high-stakes environments.
          </li>
        </ul>
        <div className="mt-3">
          <a
            href="https://www.ccg-gcc.gc.ca/search-rescue-recherche-sauvetage/irb-esc/student-prog-etudiant-eng.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-300"
          >
            Canadian Coast Guard – Search and Rescue
          </a>
        </div>
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
    ? `radial-gradient(circle 400px at ${hoverPos.x}px ${hoverPos.y}px, rgba(148, 163, 184, 0.12), transparent 80%)`
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
          ${isExpanded ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div>{exp.longDescription}</div>
      </div>
    </div>
  );
}
