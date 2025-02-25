import React, { useState } from "react";

interface Project {
  title: string;
  shortDescription: string;
  longDescription: React.ReactNode;
}

const projects: Project[] = [
  {
    title: "Cactus Loyalty App",
    shortDescription:
      "A custom rewards program application for small-medium sized businesses",
    longDescription: (
      <>
        <strong>
          Skills: React Native, Laravel Forge, RESTful APIs, Mobile Development
        </strong>
        <br></br>
        The project entails two full stack applications built with React-Native
        and Laravel Forge. One app for consumers to track their rewards, and
        another for businesses to manage their loyalty program.<br></br>
        <br></br>
        <a
          href="https://cactusapp.ca/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-300"
        >
          Learn More About Cactus
        </a>
      </>
    ),
  },
  {
    title: "Calorie Prediction Network",
    shortDescription: "Machine Learning Model for Calorie Prediction",
    longDescription: (
      <>
        <strong>
          Skills: Python, Tensorflow, Machine Learning, Data Science
        </strong>
        <br></br>
        Project was carried out with a group, using a convolutional neural
        network (CNN) for image classification. Using the model&aposs output, an
        estimate of exercise type and duration was generated, and eventually an
        estimate of calories burned.<br></br>
        <br></br>
        <a
          href="https://github.com/niko-hoogeveen/capstoneWebsite"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-300"
        >
          Website Repository
        </a>
        {" | "}
        <a
          href="https://github.com/niko-hoogeveen/498-Capstone-Project"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-300"
        >
          Image Classification Model Repository
        </a>
      </>
    ),
  }
];

export default function Projects() {
  const [expanded, setExpanded] = useState<boolean[]>(
    projects.map(() => false)
  );

  const handleToggle = (index: number) => {
    setExpanded((prev) =>
      prev.map((isExpanded, i) => (i === index ? !isExpanded : isExpanded))
    );
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>
      <div className="space-y-4">
        {projects.map((exp, idx) => (
          <ProjectCard
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

function ProjectCard({
  exp,
  isExpanded,
  onToggle,
}: {
  exp: Project;
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
          <h3 className="text-lg font-bold">{exp.title}</h3>
          <p className="text-sm text-gray-400">{exp.shortDescription}</p>
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
